import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailTemplate } from '../../database/schemas/email-template.schema';
import { Subscriber } from '../../database/schemas/subscriber.schema';
import { EmailService } from '../email/email.service';
import { ActivityService } from '../activity/activity.service';
import { renderEmail } from '../email/templates';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto';

const API_URL = 'https://techclues-api.vercel.app';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectModel(EmailTemplate.name) private readonly model: Model<EmailTemplate>,
    @InjectModel(Subscriber.name) private readonly subscriberModel: Model<Subscriber>,
    private readonly email: EmailService,
    private readonly activity: ActivityService,
  ) {}

  async list() {
    return this.model.find().sort({ updatedAt: -1 }).lean();
  }

  async get(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Template not found');
    return doc;
  }

  async create(dto: CreateEmailTemplateDto) {
    const doc = await this.model.create(dto);
    await this.activity.log('newsletter', `Created the email template "${dto.name}"`);
    return doc;
  }

  async update(id: string, dto: UpdateEmailTemplateDto) {
    const doc = await this.get(id);
    Object.assign(doc, dto);
    await doc.save();
    await this.activity.log('newsletter', `Updated the email template "${doc.name}"`);
    return doc;
  }

  async remove(id: string) {
    const doc = await this.get(id);
    await doc.deleteOne();
    await this.activity.log('newsletter', `Deleted the email template "${doc.name}"`);
    return { ok: true };
  }

  async previewRecipientCount() {
    return this.subscriberModel.countDocuments({ status: 'subscribed' });
  }

  /** Sends to every currently-subscribed address. Runs synchronously within the request, so a
   *  very large list can take a while — fine for the list sizes a new site expects to have. */
  async sendCampaign(id: string) {
    const template = await this.get(id);
    const subscribers = await this.subscriberModel.find({ status: 'subscribed' }).lean();

    let sent = 0;
    let failed = 0;
    for (const sub of subscribers) {
      try {
        const { html, text } = renderEmail({
          previewText: template.subject,
          heading: template.subject,
          bodyHtml: template.bodyHtml,
          bodyText: template.bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
          unsubscribeUrl: `${API_URL}/api/public/unsubscribe?token=${sub.unsubscribeToken}`,
          reason: "You're receiving this because you're subscribed to TechClues updates.",
        });
        await this.email.send({
          to: [{ email: sub.email, name: sub.name }],
          subject: template.subject,
          htmlContent: html,
          textContent: text,
        });
        sent += 1;
      } catch {
        failed += 1;
      }
    }

    template.lastSentAt = new Date();
    template.lastSentCount = sent;
    await template.save();
    await this.activity.log('newsletter', `Sent "${template.name}" to ${sent} subscriber(s)${failed ? ` (${failed} failed)` : ''}`);
    return { sent, failed, total: subscribers.length };
  }
}
