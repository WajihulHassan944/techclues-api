import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enquiry, Folder, SourceKey, StatusKey } from '../../database/schemas/enquiry.schema';
import { BlockedSender } from '../../database/schemas/blocked-sender.schema';
import { ActivityService } from '../activity/activity.service';
import { SettingsService } from '../settings/settings.service';
import { EmailService } from '../email/email.service';
import { PusherService } from '../pusher/pusher.service';
import { NotificationsService } from '../notifications/notifications.service';
import { fillTemplate, firstName } from '../../common/constants/defaults';
import { autoReplyEmail, enquiryAdminEmail, enquiryReplyEmail } from '../email/templates';

export interface CreatePublicEnquiryInput {
  source: SourceKey;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  details?: { label: string; value: string }[];
  result?: { title: string; headline: string; lines: string[] };
  utm?: Record<string, string>;
  referrer?: string;
  ip?: string;
}

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(Enquiry.name) private readonly model: Model<Enquiry>,
    @InjectModel(BlockedSender.name) private readonly blockedModel: Model<BlockedSender>,
    private readonly activity: ActivityService,
    private readonly settings: SettingsService,
    private readonly email: EmailService,
    private readonly pusher: PusherService,
    private readonly notifications: NotificationsService,
  ) {}

  async createPublic(input: CreatePublicEnquiryInput) {
    const blocked = await this.blockedModel.findOne({ email: input.email.toLowerCase() });

    const enquiry = await this.model.create({
      ...input,
      email: input.email.toLowerCase(),
      received: new Date(),
      status: 'new',
      folder: blocked ? 'spam' : 'inbox',
    });

    const settings = await this.settings.get();

    if (!blocked) {
      await this.pusher.trigger('enquiry.created', {
        id: String(enquiry._id),
        name: enquiry.name,
        subject: enquiry.subject,
        source: enquiry.source,
      });
      await this.notifications.create(
        'enquiry',
        `New enquiry from ${enquiry.name}: ${enquiry.subject}`,
        `/admin/inbox/${enquiry._id}`,
      );

      if (settings.events.enquiry) {
        const mail = enquiryAdminEmail(enquiry);
        await this.email.send({
          to: settings.recipients.map((email) => ({ email })),
          subject: mail.subject,
          htmlContent: mail.html,
          textContent: mail.text,
        });
      }

      const autoReplyTemplate = settings.templates.find((t) => t.sources?.includes(input.source));
      if (autoReplyTemplate) {
        const mail = autoReplyEmail(
          firstName(enquiry.name),
          fillTemplate(autoReplyTemplate.body, enquiry.name),
          settings,
        );
        await this.email.send({
          to: [{ email: enquiry.email, name: enquiry.name }],
          subject: mail.subject,
          htmlContent: mail.html,
          textContent: mail.text,
          replyTo: { email: settings.recipients[0] },
        });
      }
    }

    await this.activity.log('inbox', `New ${input.source} enquiry from ${input.name}`);
    return enquiry;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Enquiry not found');
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Enquiry not found');
    return doc;
  }

  async list(query: {
    folder?: Folder;
    status?: StatusKey;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.folder) filter.folder = query.folder;
    if (query.status) filter.status = query.status;
    if (query.search) filter.$text = { $search: query.search };

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ received: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, pageSize };
  }

  async unreadCount() {
    return this.model.countDocuments({ folder: 'inbox', read: false });
  }

  async setRead(ids: string[], read: boolean) {
    await this.model.updateMany({ _id: { $in: ids } }, { read });
  }

  async toggleStar(id: string) {
    const doc = await this.findOne(id);
    doc.starred = !doc.starred;
    await doc.save();
    return doc;
  }

  async setStatus(ids: string[], status: StatusKey) {
    await this.model.updateMany({ _id: { $in: ids } }, { status });
    await this.activity.log('inbox', `Marked ${ids.length} enquiry(ies) as ${status}`);
  }

  async moveTo(ids: string[], folder: Folder) {
    const patch: Record<string, unknown> = { folder };
    if (folder === 'trash' || folder === 'spam') patch.folderSince = new Date();
    await this.model.updateMany({ _id: { $in: ids } }, patch);
    await this.activity.log('inbox', `Moved ${ids.length} enquiry(ies) to ${folder}`);
  }

  async deleteForever(ids: string[]) {
    await this.model.deleteMany({ _id: { $in: ids } });
    await this.activity.log('inbox', `Permanently deleted ${ids.length} enquiry(ies)`);
  }

  async addNote(id: string, body: string) {
    const doc = await this.findOne(id);
    doc.notes.push({ at: new Date(), body } as never);
    await doc.save();
    await this.activity.log('inbox', `Added a note to ${doc.name}'s enquiry`);
    return doc;
  }

  async saveDraft(id: string, draft: string) {
    const doc = await this.findOne(id);
    doc.draft = draft;
    await doc.save();
    return doc;
  }

  async sendReply(id: string, body: string) {
    const doc = await this.findOne(id);
    const settings = await this.settings.get();
    const mail = enquiryReplyEmail(
      firstName(doc.name),
      body,
      { name: doc.name, message: doc.message },
      settings,
    );
    const originalMessageId = `<enquiry-${doc._id}@techclues.co.uk>`;
    const replyMessageId = `<enquiry-${doc._id}-${doc.thread.length}@techclues.co.uk>`;

    try {
      await this.email.send({
        to: [{ email: doc.email, name: doc.name }],
        subject: `Re: ${doc.subject}`,
        htmlContent: mail.html,
        textContent: mail.text,
        replyTo: { email: settings.recipients[0], name: settings.fromName },
        headers: {
          'Message-ID': replyMessageId,
          'In-Reply-To': originalMessageId,
          References: originalMessageId,
        },
      });
      doc.thread.push({ from: 'us', at: new Date(), body, deliveryStatus: 'sent' } as never);
      doc.status = 'replied';
      doc.draft = undefined;
    } catch {
      doc.thread.push({ from: 'us', at: new Date(), body, deliveryStatus: 'failed' } as never);
      await doc.save();
      await this.notifications.create(
        'reply-failed',
        `Reply to ${doc.name} failed to send`,
        `/admin/inbox/${doc._id}`,
      );
      throw new BadRequestException('Failed to send reply email');
    }

    await doc.save();
    await this.pusher.trigger('reply.sent', { id: String(doc._id) });
    await this.activity.log('inbox', `Replied to ${doc.name}'s enquiry`);
    return doc;
  }

  async listBlocked() {
    return this.blockedModel.find().sort({ at: -1 }).lean();
  }

  async block(email: string) {
    await this.blockedModel.updateOne(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), at: new Date() },
      { upsert: true },
    );
    await this.activity.log('inbox', `Blocked sender ${email}`);
  }

  async unblock(email: string) {
    await this.blockedModel.deleteOne({ email: email.toLowerCase() });
    await this.activity.log('inbox', `Unblocked sender ${email}`);
  }

  async deleteByEmail(email: string) {
    const result = await this.model.deleteMany({ email: email.toLowerCase() });
    return result.deletedCount ?? 0;
  }

  async findByEmail(email: string) {
    return this.model.find({ email: email.toLowerCase() }).lean();
  }

  /** Permanently purges spam older than the configured retention period. Called by the cron job. */
  async purgeOldSpam() {
    const settings = await this.settings.get();
    const days = settings.retention.spamDays;
    if (!days || days <= 0) return 0;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.model.deleteMany({ folder: 'spam', folderSince: { $lte: cutoff } });
    return result.deletedCount ?? 0;
  }
}
