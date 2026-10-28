import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** The fixed set of code-defined transactional emails an admin can override the copy of.
 *  Structure (buttons, booking details, unsubscribe link) stays code-controlled — only the
 *  subject/heading/body prose is editable, with {{mergeTag}} placeholders substituted at send
 *  time. One document per key; no document means "use the built-in default". */
export const TRANSACTIONAL_EMAIL_KEYS = ['enquiry-auto-reply', 'booking-confirmed', 'newsletter-welcome'] as const;
export type TransactionalEmailKey = (typeof TRANSACTIONAL_EMAIL_KEYS)[number];

@Schema({ timestamps: true })
export class TransactionalEmailOverride extends Document {
  @Prop({ required: true, unique: true, enum: TRANSACTIONAL_EMAIL_KEYS })
  key!: TransactionalEmailKey;

  @Prop()
  subject?: string;

  @Prop()
  heading?: string;

  @Prop()
  bodyText?: string;
}

export const TransactionalEmailOverrideSchema = SchemaFactory.createForClass(TransactionalEmailOverride);
