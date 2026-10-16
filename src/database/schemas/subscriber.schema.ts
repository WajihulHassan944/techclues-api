import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const SUB_STATUSES = ['subscribed', 'unsubscribed', 'bounced'] as const;
export type SubStatus = (typeof SUB_STATUSES)[number];

export const SUB_SOURCES = ['footer', 'blog', 'manual', 'import', 'contact', 'booking'] as const;
export type SubSource = (typeof SUB_SOURCES)[number];

@Schema({ timestamps: true })
export class Subscriber extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop()
  name?: string;

  @Prop({ required: true, enum: SUB_SOURCES })
  source!: SubSource;

  @Prop({ required: true, enum: SUB_STATUSES, default: 'subscribed' })
  status!: SubStatus;

  @Prop({ required: true, default: () => new Date() })
  at!: Date;

  @Prop()
  endedAt?: Date;

  @Prop({ required: true })
  unsubscribeToken!: string;

  @Prop({ default: false })
  confirmed!: boolean;

  @Prop()
  brevoContactId?: string;
}
export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
SubscriberSchema.index({ status: 1 });
