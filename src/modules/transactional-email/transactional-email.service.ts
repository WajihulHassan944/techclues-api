import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TRANSACTIONAL_EMAIL_KEYS,
  TransactionalEmailKey,
  TransactionalEmailOverride,
} from '../../database/schemas/transactional-email.schema';
import { EmailCopyOverride } from '../email/templates';
import { ActivityService } from '../activity/activity.service';
import { UpdateTransactionalEmailDto } from './dto/transactional-email.dto';

export const TRANSACTIONAL_EMAIL_META: Record<
  TransactionalEmailKey,
  { label: string; description: string; tags: string[]; defaultSubject: string; defaultHeading: string; defaultBodyText: string }
> = {
  'enquiry-auto-reply': {
    label: 'Enquiry auto-reply',
    description: 'Sent automatically to anyone who submits a form on the site (contact, calculator, careers, etc.).',
    tags: ['firstName'],
    defaultSubject: 'Thanks for getting in touch — TechClues',
    defaultHeading: 'Thanks, {{firstName}}',
    defaultBodyText: "We've received your message and will get back to you shortly.",
  },
  'booking-confirmed': {
    label: 'Booking confirmation',
    description: 'Sent when a call is booked and confirmed. Reschedule/cancellation emails always use the built-in copy.',
    tags: ['firstName', 'name', 'when'],
    defaultSubject: 'Your call with TechClues is confirmed',
    defaultHeading: 'Your call is confirmed',
    defaultBodyText: 'Your call is confirmed for {{when}} (UK time).',
  },
  'newsletter-welcome': {
    label: 'Newsletter welcome',
    description: 'Sent to a visitor immediately after they subscribe to the newsletter.',
    tags: ['email'],
    defaultSubject: "You're subscribed to the TechClues newsletter",
    defaultHeading: 'Welcome aboard',
    defaultBodyText: "Thanks for subscribing to the TechClues newsletter. We'll send you occasional updates — no spam, unsubscribe any time.",
  },
};

@Injectable()
export class TransactionalEmailService {
  constructor(
    @InjectModel(TransactionalEmailOverride.name) private readonly model: Model<TransactionalEmailOverride>,
    private readonly activity: ActivityService,
  ) {}

  async listAll() {
    const overrides = await this.model.find().lean();
    const byKey = new Map(overrides.map((o) => [o.key, o]));
    return TRANSACTIONAL_EMAIL_KEYS.map((key) => {
      const meta = TRANSACTIONAL_EMAIL_META[key];
      const o = byKey.get(key);
      return {
        key,
        label: meta.label,
        description: meta.description,
        tags: meta.tags,
        defaultSubject: meta.defaultSubject,
        defaultHeading: meta.defaultHeading,
        defaultBodyText: meta.defaultBodyText,
        customized: !!o,
        subject: o?.subject,
        heading: o?.heading,
        bodyText: o?.bodyText,
      };
    });
  }

  /** Used by the actual send paths — returns undefined (use built-in copy) if never customized. */
  async getOverride(key: TransactionalEmailKey): Promise<EmailCopyOverride | undefined> {
    const o = await this.model.findOne({ key }).lean();
    if (!o) return undefined;
    return { subject: o.subject, heading: o.heading, bodyText: o.bodyText };
  }

  async update(dto: UpdateTransactionalEmailDto) {
    const doc = await this.model.findOneAndUpdate(
      { key: dto.key },
      { $set: { subject: dto.subject, heading: dto.heading, bodyText: dto.bodyText } },
      { upsert: true, new: true },
    );
    await this.activity.log('settings', `Customised the "${TRANSACTIONAL_EMAIL_META[dto.key].label}" email`);
    return doc;
  }

  async resetToDefault(key: TransactionalEmailKey) {
    await this.model.deleteOne({ key });
    await this.activity.log('settings', `Reset the "${TRANSACTIONAL_EMAIL_META[key].label}" email to its default`);
    return { ok: true };
  }
}
