import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SourceKey } from './enquiry.schema';

@Schema({ _id: false })
class NotificationEvents {
  @Prop({ default: true })
  enquiry!: boolean;

  @Prop({ default: true })
  booking!: boolean;

  @Prop({ default: true })
  cancelled!: boolean;

  @Prop({ default: false })
  subscriber!: boolean;

  @Prop({ default: true })
  summary!: boolean;
}

@Schema({ _id: false })
export class ReplyTemplate {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  body!: string;

  // Mongoose defaults array paths to `[]` even with no explicit `default`, which would turn an
  // "every enquiry" template (sources left unset) into one that matches nothing — `[]` is a
  // false "only these sources" rather than "no restriction". `default: undefined` opts out.
  @Prop({ type: [String], default: undefined })
  sources?: SourceKey[];
}

@Schema({ _id: false })
class Retention {
  @Prop({ default: 30 })
  spamDays!: number;

  @Prop({ default: 0 })
  enquiryMonths!: number;
}

/** Singleton document — there is always exactly one Settings row. */
@Schema({ timestamps: true })
export class Settings extends Document {
  @Prop({ type: [String], default: ['techcluesltd@gmail.com'] })
  recipients!: string[];

  @Prop({ type: NotificationEvents, default: {} })
  events!: NotificationEvents;

  @Prop({ default: '08:00' })
  summaryTime!: string;

  @Prop({ default: 'TechClues' })
  fromName!: string;

  @Prop({ default: '' })
  signature!: string;

  @Prop({ type: [ReplyTemplate], default: [] })
  templates!: ReplyTemplate[];

  @Prop({ type: Retention, default: {} })
  retention!: Retention;

  @Prop()
  passwordChangedAt?: Date;
}
export const SettingsSchema = SchemaFactory.createForClass(Settings);
