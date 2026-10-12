import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const NOTIFICATION_TYPES = ['enquiry', 'booking', 'subscriber', 'reply-failed'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

@Schema({ timestamps: false })
export class Notification extends Document {
  @Prop({ required: true, enum: NOTIFICATION_TYPES })
  type!: NotificationType;

  @Prop({ required: true })
  message!: string;

  @Prop()
  link?: string;

  @Prop({ required: true, default: false })
  read!: boolean;

  @Prop({ required: true, default: () => new Date() })
  at!: Date;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
