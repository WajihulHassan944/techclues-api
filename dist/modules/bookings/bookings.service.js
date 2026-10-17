"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_schema_1 = require("../../database/schemas/booking.schema");
const availability_1 = require("../../common/utils/availability");
const tz_1 = require("../../common/utils/tz");
const activity_service_1 = require("../activity/activity.service");
const settings_service_1 = require("../settings/settings.service");
const email_service_1 = require("../email/email.service");
const pusher_service_1 = require("../pusher/pusher.service");
const notifications_service_1 = require("../notifications/notifications.service");
const newsletter_service_1 = require("../newsletter/newsletter.service");
const ics_1 = require("../../common/utils/ics");
const templates_1 = require("../email/templates");
let BookingsService = class BookingsService {
    constructor(bookingModel, availabilityModel, activity, settings, email, pusher, notifications, newsletter) {
        this.bookingModel = bookingModel;
        this.availabilityModel = availabilityModel;
        this.activity = activity;
        this.settings = settings;
        this.email = email;
        this.pusher = pusher;
        this.notifications = notifications;
        this.newsletter = newsletter;
    }
    async getAvailability() {
        let av = await this.availabilityModel.findOne();
        if (!av) {
            av = await this.availabilityModel.create(availability_1.DEFAULT_AVAILABILITY);
        }
        return av;
    }
    async saveAvailability(patch) {
        const av = await this.getAvailability();
        Object.assign(av, patch);
        await av.save();
        await this.activity.log('bookings', 'Updated call availability settings');
        return av;
    }
    async blockDay(date, reason) {
        const av = await this.getAvailability();
        if (!av.blocked.find((b) => b.date === date)) {
            av.blocked.push({ date, reason });
            await av.save();
        }
        await this.activity.log('bookings', `Blocked ${date} on the booking calendar`);
        return av;
    }
    async unblockDay(date) {
        const av = await this.getAvailability();
        av.blocked = av.blocked.filter((b) => b.date !== date);
        await av.save();
        await this.activity.log('bookings', `Unblocked ${date} on the booking calendar`);
        return av;
    }
    async confirmedBookings(excludeId) {
        const filter = { status: 'confirmed' };
        if (excludeId)
            filter._id = { $ne: excludeId };
        const docs = await this.bookingModel.find(filter).select('_id start minutes status').lean();
        return docs.map((d) => ({
            id: String(d._id),
            status: 'confirmed',
            start: d.start,
            minutes: d.minutes,
        }));
    }
    async availabilitySlots(fromIso, toIso) {
        const av = await this.getAvailability();
        const bookings = await this.confirmedBookings();
        const now = Date.now();
        const slots = (0, availability_1.slotsInRange)(av, bookings, now, fromIso, toIso);
        return {
            slots,
            duration: av.slotMinutes,
            horizonEnd: new Date(now + av.windowDays * 86_400_000).toISOString(),
        };
    }
    async createBooking(input) {
        const av = await this.getAvailability();
        const startDate = new Date(input.start);
        if (Number.isNaN(startDate.getTime()))
            throw new common_1.BadRequestException('Invalid start time');
        const bookings = await this.confirmedBookings();
        const now = Date.now();
        const key = (0, tz_1.dateKey)(startDate);
        const daySlots = new Set((0, availability_1.slotsInRange)(av, bookings, now, `${key}T00:00:00.000Z`, `${key}T23:59:59.999Z`));
        if (!daySlots.has(startDate.toISOString())) {
            throw new common_1.BadRequestException('That time is no longer available — please pick another slot');
        }
        let booking;
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
        }
        catch (err) {
            if (err.code === 11000) {
                throw new common_1.BadRequestException('That time is no longer available — please pick another slot');
            }
            throw err;
        }
        this.newsletter
            .autoAdd(booking.email, booking.name.split(' ')[0], 'booking')
            .catch(() => undefined);
        const settings = await this.settings.get();
        await this.pusher.trigger('booking.created', {
            id: String(booking._id),
            name: booking.name,
            start: booking.start,
        });
        await this.notifications.create('booking', `New booking from ${booking.name}`, '/admin/bookings');
        if (settings.events.booking) {
            const mail = (0, templates_1.bookingAdminEmail)(booking, 'created');
            await this.email.send({
                to: settings.recipients.map((e) => ({ email: e })),
                subject: mail.subject,
                htmlContent: mail.html,
                textContent: mail.text,
            });
        }
        try {
            const ics = (0, ics_1.buildBookingIcs)({
                start: booking.start,
                minutes: booking.minutes,
                title: 'Call with TechClues',
                description: `Topic: ${booking.topic}\nMeeting link: ${booking.meetingLink}`,
                location: booking.meetingLink ?? av.meetingLink,
                organizerEmail: settings.recipients[0],
                attendeeEmail: booking.email,
                attendeeName: booking.name,
            });
            const mail = (0, templates_1.bookingVisitorEmail)(booking, 'confirmed', settings);
            await this.email.send({
                to: [{ email: booking.email, name: booking.name }],
                subject: mail.subject,
                htmlContent: mail.html,
                textContent: mail.text,
                attachments: [{ name: 'invite.ics', content: Buffer.from(ics).toString('base64') }],
            });
        }
        catch {
        }
        await this.activity.log('bookings', `New booking from ${booking.name} for ${booking.start.toUTCString()}`);
        return booking;
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('Booking not found');
        const doc = await this.bookingModel.findById(id);
        if (!doc)
            throw new common_1.NotFoundException('Booking not found');
        return doc;
    }
    async list(query) {
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.from || query.to) {
            filter.start = {};
            if (query.from)
                filter.start.$gte = new Date(query.from);
            if (query.to)
                filter.start.$lte = new Date(query.to);
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
    async reschedule(id, startIso, notify = true) {
        const booking = await this.findOne(id);
        const av = await this.getAvailability();
        const bookings = await this.confirmedBookings(id);
        const now = Date.now();
        const newStart = new Date(startIso);
        const key = (0, tz_1.dateKey)(newStart);
        const daySlots = new Set((0, availability_1.slotsInRange)(av, bookings, now, `${key}T00:00:00.000Z`, `${key}T23:59:59.999Z`));
        if (!daySlots.has(newStart.toISOString())) {
            throw new common_1.BadRequestException('That time is no longer available');
        }
        booking.start = newStart;
        booking.history.push({
            at: new Date(),
            text: `Rescheduled to ${newStart.toUTCString()}`,
        });
        await booking.save();
        await this.pusher.trigger('booking.updated', { id: String(booking._id), start: booking.start });
        if (notify) {
            const settings = await this.settings.get();
            const mail = (0, templates_1.bookingVisitorEmail)(booking, 'rescheduled', settings);
            await this.email.send({
                to: [{ email: booking.email, name: booking.name }],
                subject: mail.subject,
                htmlContent: mail.html,
                textContent: mail.text,
            });
        }
        await this.activity.log('bookings', `Rescheduled ${booking.name}'s call to ${booking.start.toUTCString()}`);
        return booking;
    }
    async cancel(id, reason, notify = true) {
        const booking = await this.findOne(id);
        booking.status = 'cancelled';
        booking.cancelReason = reason;
        booking.history.push({ at: new Date(), text: `Cancelled: ${reason}` });
        await booking.save();
        await this.pusher.trigger('booking.updated', { id: String(booking._id), status: 'cancelled' });
        const settings = await this.settings.get();
        if (notify) {
            const mail = (0, templates_1.bookingVisitorEmail)(booking, 'cancelled', settings, reason);
            await this.email.send({
                to: [{ email: booking.email, name: booking.name }],
                subject: mail.subject,
                htmlContent: mail.html,
                textContent: mail.text,
            });
        }
        if (settings.events.cancelled) {
            const mail = (0, templates_1.bookingAdminEmail)(booking, 'cancelled', reason);
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
    async setStatus(id, status) {
        const booking = await this.findOne(id);
        booking.status = status;
        booking.history.push({ at: new Date(), text: `Marked as ${status}` });
        await booking.save();
        await this.activity.log('bookings', `Marked ${booking.name}'s call as ${status}`);
        return booking;
    }
    async addNote(id, body) {
        const booking = await this.findOne(id);
        booking.notes.push({ at: new Date(), body });
        await booking.save();
        return booking;
    }
    async deleteByEmail(email) {
        const result = await this.bookingModel.deleteMany({ email: email.toLowerCase() });
        return result.deletedCount ?? 0;
    }
    async findByEmail(email) {
        return this.bookingModel.find({ email: email.toLowerCase() }).lean();
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Availability.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        activity_service_1.ActivityService,
        settings_service_1.SettingsService,
        email_service_1.EmailService,
        pusher_service_1.PusherService,
        notifications_service_1.NotificationsService,
        newsletter_service_1.NewsletterService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map