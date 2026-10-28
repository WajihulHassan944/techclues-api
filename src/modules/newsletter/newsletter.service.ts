import { randomBytes } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import { Subscriber, SubSource, SubStatus } from '../../database/schemas/subscriber.schema';
import { ActivityService } from '../activity/activity.service';
import { EmailService } from '../email/email.service';
import { PusherService } from '../pusher/pusher.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import {
  newsletterUnsubscribeEmail,
  newsletterWelcomeEmail,
  subscriberAdminEmail,
} from '../email/templates';
import { TransactionalEmailService } from '../transactional-email/transactional-email.service';

/** Ported verbatim from the frontend's `lib/admin/newsletter.ts`. */
export const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

const SOURCE_LABELS: Record<SubSource, string> = {
  footer: 'Footer',
  blog: 'Blog',
  manual: 'Manual',
  import: 'Import',
  contact: 'Contact form',
  booking: 'Booking',
};
const STATUS_LABELS: Record<SubStatus, string> = {
  subscribed: 'Subscribed',
  unsubscribed: 'Unsubscribed',
  bounced: 'Bounced',
};

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Subscriber.name) private readonly model: Model<Subscriber>,
    private readonly activity: ActivityService,
    private readonly email: EmailService,
    private readonly pusher: PusherService,
    private readonly settings: SettingsService,
    private readonly notifications: NotificationsService,
    private readonly transactionalEmail: TransactionalEmailService,
  ) {}

  /** Mirrors the frontend's `add(email,name,source) -> error string | ""`. */
  async add(email: string, name: string | undefined, source: SubSource): Promise<string> {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) return 'Enter a valid email address';

    const existing = await this.model.findOne({ email: normalized });
    let unsubscribeToken: string;
    if (existing) {
      if (existing.status === 'subscribed') return 'That email is already subscribed';
      existing.status = 'subscribed';
      existing.endedAt = undefined;
      existing.name = name ?? existing.name;
      await existing.save();
      unsubscribeToken = existing.unsubscribeToken;
    } else {
      unsubscribeToken = randomBytes(24).toString('hex');
      await this.model.create({
        email: normalized,
        name,
        source,
        status: 'subscribed',
        at: new Date(),
        unsubscribeToken,
      });
    }

    await this.email.upsertContact(normalized, { FIRSTNAME: name });

    const settings = await this.settings.get();
    await this.pusher.trigger('subscriber.created', { email: normalized });
    await this.notifications.create(
      'subscriber',
      `New subscriber: ${normalized}`,
      '/admin/newsletter',
    );
    if (settings.events.subscriber) {
      const mail = subscriberAdminEmail(`${normalized} subscribed via ${source}.`);
      await this.email.send({
        to: settings.recipients.map((e) => ({ email: e })),
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      });
    }
    const welcomeOverride = await this.transactionalEmail.getOverride('newsletter-welcome');
    const welcome = newsletterWelcomeEmail(normalized, unsubscribeToken, settings, welcomeOverride);
    await this.email.send({
      to: [{ email: normalized, name }],
      subject: welcome.subject,
      htmlContent: welcome.html,
      textContent: welcome.text,
    });
    await this.activity.log('newsletter', `${normalized} subscribed via ${source}`);
    return '';
  }

  /**
   * Quietly adds someone who contacted us (an enquiry or a booking) to the newsletter so we can share
   * updates later. Never re-subscribes anyone who has unsubscribed, and sends no email or admin alert.
   */
  async autoAdd(email: string, name: string | undefined, source: SubSource): Promise<void> {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) return;
    const existing = await this.model.findOne({ email: normalized });
    if (existing) return;
    await this.model.create({
      email: normalized,
      name,
      source,
      status: 'subscribed',
      at: new Date(),
      unsubscribeToken: randomBytes(24).toString('hex'),
    });
    await this.email.upsertContact(normalized, { FIRSTNAME: name });
    await this.activity.log(
      'newsletter',
      `${normalized} added to the newsletter after contacting us`,
    );
  }

  async addMany(emails: string[], source: SubSource) {
    let added = 0;
    let existingCount = 0;
    let invalid = 0;
    for (const raw of emails) {
      const normalized = raw.trim().toLowerCase();
      if (!EMAIL_RE.test(normalized)) {
        invalid += 1;
        continue;
      }
      const existing = await this.model.findOne({ email: normalized });
      if (existing) {
        existingCount += 1;
        continue;
      }
      await this.model.create({
        email: normalized,
        source,
        status: 'subscribed',
        at: new Date(),
        unsubscribeToken: randomBytes(24).toString('hex'),
      });
      await this.email.upsertContact(normalized);
      added += 1;
    }
    if (added > 0) {
      await this.pusher.trigger('subscriber.created', { email: `${added} imported` });
      await this.notifications.create(
        'subscriber',
        `${added} subscriber(s) imported`,
        '/admin/newsletter',
      );
    }
    await this.activity.log('newsletter', `Imported ${added} new subscriber(s)`);
    return { added, existing: existingCount, invalid };
  }

  async importCsv(buffer: Buffer, source: SubSource) {
    const records: Record<string, string>[] = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    const emails = records
      .map((r) => r.Email ?? r.email ?? Object.values(r)[0])
      .filter((v): v is string => Boolean(v));
    return this.addMany(emails, source);
  }

  async exportCsv(
    query: { status?: SubStatus; source?: SubSource; search?: string } = {},
  ): Promise<string> {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.source) filter.source = query.source;
    if (query.search) filter.email = { $regex: query.search, $options: 'i' };
    const rows = await this.model.find(filter).sort({ at: -1 }).lean();
    const data = rows.map((r) => [
      r.email,
      r.name ?? '',
      SOURCE_LABELS[r.source],
      STATUS_LABELS[r.status],
      new Date(r.at).toISOString().slice(0, 10),
      r.endedAt ? new Date(r.endedAt).toISOString().slice(0, 10) : '',
    ]);
    return stringify([['Email', 'Name', 'Source', 'Status', 'Subscribed on', 'Ended on'], ...data]);
  }

  async list(query: { status?: SubStatus; search?: string; page?: number; pageSize?: number }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.search) filter.email = { $regex: query.search, $options: 'i' };
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ at: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }

  async setStatus(ids: string[], status: SubStatus) {
    const patch: Record<string, unknown> = { status };
    if (status !== 'subscribed') patch.endedAt = new Date();
    else patch.endedAt = undefined;
    await this.model.updateMany({ _id: { $in: ids } }, patch);
    await this.activity.log('newsletter', `Marked ${ids.length} subscriber(s) as ${status}`);
  }

  async remove(ids: string[]) {
    await this.model.deleteMany({ _id: { $in: ids } });
    await this.activity.log('newsletter', `Removed ${ids.length} subscriber(s)`);
  }

  async deleteByEmail(email: string) {
    const result = await this.model.deleteMany({ email: email.toLowerCase() });
    await this.email.removeFromList(email.toLowerCase());
    return result.deletedCount ?? 0;
  }

  async findByEmail(email: string) {
    return this.model.find({ email: email.toLowerCase() }).lean();
  }

  async unsubscribeByToken(token: string) {
    const sub = await this.model.findOne({ unsubscribeToken: token });
    if (!sub) throw new NotFoundException('Invalid or expired unsubscribe link');
    sub.status = 'unsubscribed';
    sub.endedAt = new Date();
    await sub.save();
    await this.email.removeFromList(sub.email);
    const settings = await this.settings.get();
    const mail = newsletterUnsubscribeEmail(sub.email, settings);
    await this.email.send({
      to: [{ email: sub.email, name: sub.name }],
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
    });
    await this.activity.log('newsletter', `${sub.email} unsubscribed`);
    return sub;
  }

  async growthStats() {
    const subs = await this.model.find().sort({ at: 1 }).lean();
    const byMonth = new Map<string, number>();
    for (const s of subs) {
      const month = new Date(s.at).toISOString().slice(0, 7);
      byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
    }
    return {
      total: subs.length,
      subscribed: subs.filter((s) => s.status === 'subscribed').length,
      unsubscribed: subs.filter((s) => s.status === 'unsubscribed').length,
      bounced: subs.filter((s) => s.status === 'bounced').length,
      bySource: Object.fromEntries(
        (['footer', 'blog', 'manual', 'import'] as SubSource[]).map((src) => [
          src,
          subs.filter((s) => s.source === src).length,
        ]),
      ),
      signupsByMonth: Object.fromEntries(byMonth),
    };
  }
}
