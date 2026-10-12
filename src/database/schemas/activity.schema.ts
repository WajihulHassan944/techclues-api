import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const ACTIVITY_KINDS = [
  'inbox',
  'bookings',
  'blog',
  'faq',
  'newsletter',
  'settings',
  'security',
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

@Schema({ timestamps: false })
export class Activity extends Document {
  @Prop({ required: true, default: () => new Date() })
  at!: Date;

  @Prop({ required: true, enum: ACTIVITY_KINDS })
  kind!: ActivityKind;

  @Prop({ required: true })
  text!: string;
}
export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ at: -1 });
