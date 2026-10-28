import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const SOURCE_KEYS = [
  'contact',
  'calculator',
  'kill-my-idea',
  'grant',
  'partner-refer',
  'partner-join',
  'zero-one',
  'careers',
  'chat',
  'staff-augmentation',
  'game-development',
  'ai-enablement',
] as const;
export type SourceKey = (typeof SOURCE_KEYS)[number];

export const STATUS_KEYS = ['new', 'replied', 'qualified', 'won', 'lost'] as const;
export type StatusKey = (typeof STATUS_KEYS)[number];

export const FOLDERS = ['inbox', 'spam', 'trash'] as const;
export type Folder = (typeof FOLDERS)[number];

@Schema({ _id: false })
class DetailItem {
  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  value!: string;
}

@Schema({ _id: false })
class ResultCard {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  headline!: string;

  @Prop({ type: [String], default: [] })
  lines!: string[];
}

@Schema({ _id: false })
class Attachment {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  size!: string;
}

@Schema({ _id: true, timestamps: false })
class ThreadMessage {
  @Prop({ required: true, enum: ['them', 'us'] })
  from!: 'them' | 'us';

  @Prop({ required: true, default: () => new Date() })
  at!: Date;

  @Prop({ required: true })
  body!: string;

  @Prop({ enum: ['sent', 'failed', 'pending'], default: 'sent' })
  deliveryStatus?: string;
}

@Schema({ _id: true, timestamps: false })
class Note {
  @Prop({ required: true, default: () => new Date() })
  at!: Date;

  @Prop({ required: true })
  body!: string;
}

@Schema({ timestamps: true })
export class Enquiry extends Document {
  @Prop({ required: true, enum: SOURCE_KEYS })
  source!: SourceKey;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop()
  phone?: string;

  @Prop()
  company?: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: [DetailItem], default: [] })
  details!: DetailItem[];

  @Prop({ type: ResultCard })
  result?: ResultCard;

  @Prop({ type: [Attachment], default: [] })
  attachments!: Attachment[];

  @Prop({ required: true, default: () => new Date() })
  received!: Date;

  @Prop({ required: true, enum: STATUS_KEYS, default: 'new' })
  status!: StatusKey;

  @Prop({ required: true, enum: FOLDERS, default: 'inbox' })
  folder!: Folder;

  @Prop({ default: false })
  read!: boolean;

  @Prop({ default: false })
  starred!: boolean;

  @Prop({ type: [ThreadMessage], default: [] })
  thread!: ThreadMessage[];

  @Prop({ type: [Note], default: [] })
  notes!: Note[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  draft?: string;

  @Prop({ type: Object })
  utm?: Record<string, string>;

  @Prop()
  referrer?: string;

  @Prop()
  ip?: string;

  /** When the item last entered the spam or trash folder — drives retention purge. */
  @Prop({ default: Date.now })
  folderSince?: Date;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ folder: 1, status: 1, received: -1 });
EnquirySchema.index({ subject: 'text', message: 'text', name: 'text', email: 'text' });
