import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Availability, Booking, BookingStatus } from '../../database/schemas/booking.schema';
import { DEFAULT_AVAILABILITY, slotsInRange } from '../../common/utils/availability';
import { dateKey } from '../../common/utils/tz';
import { ActivityService } from '../activity/activity.service';
import { SettingsService } from '../settings/settings.service';
import { EmailService } from '../email/email.service';
import { PusherService } from '../pusher/pusher.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildBookingIcs } from '../../common/utils/ics';
import { bookingAdminEmail, bookingVisitorEmail } from '../email/templates';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Availability.name) private readonly availabilityModel: Model<Availability>,
    private readonly activity: ActivityService,
    private readonly settings: SettingsService,
    private readonly email: EmailService,
    private readonly pusher: PusherService,
    private readonly notifications: NotificationsService,
  ) {}

  async getAvailability(): Promise<Availability> {
    let av = await this.availabilityModel.findOne();
    if (!av) {
      av = await this.availabilityModel.create(DEFAULT_AVAILABILITY);
    }
    return av;
  }

  async saveAvailability(patch: Partial<Availability>) {
    const av = await this.getAvailability();
    Object.assign(av, patch);
    await av.save();
    await this.activity.log('bookings', 'Updated call availability settings');
    return av;
  }

  async blockDay(date: string, reason: string) {
    const av = await this.getAvailability();
    if (!av.blocked.find((b) => b.date === date)) {
      av.blocked.push({ date, reason } as never);
      await av.save();
    }
    await this.activity.log('bookings', `Blocked ${date} on the booking calendar`);
    return av;
  }

  async unblockDay(date: string) {
    const av = await this.getAvailability();
    av.blocked = av.blocked.filter((b) => b.date !== date) as never;
    await av.save();
    await this.activity.log('bookings', `Unblocked ${date} on the booking calendar`);
    return av;
  }

  private async confirmedBookings(excludeId?: string) {
    const filter: Record<string, unknown> = { status: 'confirmed' };
    if (excludeId) filter._id = { $ne: excludeId };
    const docs = await this.bookingModel.find(filter).select('_id start minutes status').lean();
    return docs.map((d) => ({
      id: String(d._id),
      status: 'confirmed',
      start: d.start,
      minutes: d.minutes,
    }));
  }

  async availabilitySlots(fromIso: string, toIso: string) {
    const av = await this.getAvailability();
    const bookings = await this.confirmedBookings();
    const now = Date.now();
    const slots = slotsInRange(av, bookings, now, fromIso, toIso);
    return {
      slots,
      duration: av.slotMinutes,
      horizonEnd: new Date(now + av.windowDays * 86_400_000).toISOString(),
    };
  }

  async createBooking(input: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    start: string;
    topic: string;
    via?: string;
  }) {
    const av = await this.getAvailability();
    const startDate = new Date(input.start);
    if (Number.isNaN(startDate.getTime())) throw new BadRequestException('Invalid start time');

    const bookings = await this.confirmedBookings();
    const now = Date.now();
    const key = dateKey(startDate);
    const daySlots = new Set(
      slotsInRange(av, bookings, now, `${key}T00:00:00.000Z`, `${key}T23:59:59.999Z`),
    );
    if (!daySlots.has(startDate.toISOString())) {
      throw new BadRequestException('That time is no longer available — please pick another slot');
    }

    let booking: Booking;
    try {
      booking = await this.bookingModel.create({
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        company: input.company,
        start: startDate,
        minutes: av.slotMinutes,
        topic: input.topic,
        via: input.via ?? 'Book a call',
        status: 'confirmed',
        meetingLink: av.meetingLink,
        history: [{ at: new Date(), text: 'Booking confirmed' }],
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new BadRequestException(
          'That time is no longer available — please pick another slot',
        );
      }
      throw err;
    }

    const settings = await this.settings.get();

    await this.pusher.trigger('booking.created', {
      id: String(booking._id),
      name: booking.name,
      start: booking.start,
    });
    await this.notifications.create(
      'booking',
      `New booking from ${booking.name}`,
      '/admin/bookings',
    );

    if (settings.events.booking) {
      const mail = bookingAdminEmail(booking, 'created');
      await this.email.send({
        to: settings.recipients.map((e) => ({ email: e })),
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      });
    }

    try {
      const ics = buildBookingIcs({
        start: booking.start,
        minutes: booking.minutes,
        title: 'Call with TechClues',
        description: `Topic: ${booking.topic}\nMeeting link: ${booking.meetingLink}`,
        location: booking.meetingLink ?? av.meetingLink,
        organizerEmail: settings.recipients[0],
        attendeeEmail: booking.email,
        attendeeName: booking.name,
      });
      const mail = bookingVisitorEmail(booking, 'confirmed', settings);
      await this.email.send({
        to: [{ email: booking.email, name: booking.name }],
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
        attachments: [{ name: 'invite.ics', content: Buffer.from(ics).toString('base64') }],
      });
    } catch {
      // Booking itself already succeeded; email delivery issues shouldn't fail the request.
    }

    await this.activity.log(
      'bookings',
      `New booking from ${booking.name} for ${booking.start.toUTCString()}`,
    );
    return booking;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Booking not found');
    const doc = await this.bookingModel.findById(id);
    if (!doc) throw new NotFoundException('Booking not found');
    return doc;
  }

  async list(query: {
    status?: BookingStatus;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.start = {};
      if (query.from) (filter.start as Record<string, unknown>).$gte = new Date(query.from);
      if (query.to) (filter.start as Record<string, unknown>).$lte = new Date(query.to);
    }
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .sort({ start: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.bookingModel.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }

  async reschedule(id: string, startIso: string, notify = true) {
    const booking = await this.findOne(id);
    const av = await this.getAvailability();
    const bookings = await this.confirmedBookings(id);
    const now = Date.now();
    const newStart = new Date(startIso);
    const key = dateKey(newStart);
    const daySlots = new Set(
      slotsInRange(av, bookings, now, `${key}T00:00:00.000Z`, `${key}T23:59:59.999Z`),
    );
    if (!daySlots.has(newStart.toISOString())) {
      throw new BadRequestException('That time is no longer available');
    }
    booking.start = newStart;
    booking.history.push({
      at: new Date(),
      text: `Rescheduled to ${newStart.toUTCString()}`,
    } as never);
    await booking.save();

    await this.pusher.trigger('booking.updated', { id: String(booking._id), start: booking.start });

    if (notify) {
      const settings = await this.settings.get();
      const mail = bookingVisitorEmail(booking, 'rescheduled', settings);
      await this.email.send({
        to: [{ email: booking.email, name: booking.name }],
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      });
    }
    await this.activity.log(
      'bookings',
      `Rescheduled ${booking.name}'s call to ${booking.start.toUTCString()}`,
    );
    return booking;
  }

  async cancel(id: string, reason: string, notify = true) {
    const booking = await this.findOne(id);
    booking.status = 'cancelled';
    booking.cancelReason = reason;
    booking.history.push({ at: new Date(), text: `Cancelled: ${reason}` } as never);
    await booking.save();

    await this.pusher.trigger('booking.updated', { id: String(booking._id), status: 'cancelled' });

    const settings = await this.settings.get();
    if (notify) {
      const mail = bookingVisitorEmail(booking, 'cancelled', settings, reason);
      await this.email.send({
        to: [{ email: booking.email, name: booking.name }],
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      });
    }
    if (settings.events.cancelled) {
      const mail = bookingAdminEmail(booking, 'cancelled', reason);
      await this.email.send({
        to: settings.recipients.map((e) => ({ email: e })),
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      });
    }
    await this.activity.log('bookings', `Cancelled ${booking.name}'s call`);
    return booking;
  }

  async setStatus(id: string, status: BookingStatus) {
    const booking = await this.findOne(id);
    booking.status = status;
    booking.history.push({ at: new Date(), text: `Marked as ${status}` } as never);
    await booking.save();
    await this.activity.log('bookings', `Marked ${booking.name}'s call as ${status}`);
    return booking;
  }

  async addNote(id: string, body: string) {
    const booking = await this.findOne(id);
    booking.notes.push({ at: new Date(), body } as never);
    await booking.save();
    return booking;
  }

  async deleteByEmail(email: string) {
    const result = await this.bookingModel.deleteMany({ email: email.toLowerCase() });
    return result.deletedCount ?? 0;
  }

  async findByEmail(email: string) {
    return this.bookingModel.find({ email: email.toLowerCase() }).lean();
  }
}
