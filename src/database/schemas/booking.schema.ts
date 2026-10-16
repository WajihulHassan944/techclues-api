import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const BOOKING_STATUSES = ['confirmed', 'completed', 'cancelled', 'no-show'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_VIAS = ['Book a call', 'BUILD.ONE brief', 'ZERO.ONE brief'] as const;

@Schema({ _id: true, timestamps: false })
class Note {
  @Prop({ required: true, default: () => new Date() })
  at!: Date;

  @Prop({ required: true })
  body!: string;
}

@Schema({ _id: true, timestamps: false })
class HistoryEntry {
  @Prop({ required: true, default: () => new Date() })
  at!: Date;

  @Prop({ required: true })
  text!: string;
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop()
  phone?: string;

  @Prop()
  company?: string;

  @Prop({ required: true })
  start!: Date;

  @Prop({ required: true, default: 30 })
  minutes!: number;

  @Prop({ required: true })
  topic!: string;

  @Prop({ required: true, default: 'Book a call' })
  via!: string;

  @Prop({ required: true, enum: BOOKING_STATUSES, default: 'confirmed' })
  status!: BookingStatus;

  @Prop()
  meetingLink?: string;

  @Prop()
  cancelReason?: string;

  @Prop({ type: [Note], default: [] })
  notes!: Note[];

  @Prop({ type: [HistoryEntry], default: [] })
  history!: HistoryEntry[];
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ start: 1 });
BookingSchema.index({ email: 1 });
// Guards against the exact-same-instant race; the richer overlap/buffer check happens in application logic.
BookingSchema.index(
  { start: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } },
);

@Schema({ _id: false })
export class AvailabilityDay {
  @Prop({ required: true })
  on!: boolean;

  @Prop({ required: true })
  from!: string;

  @Prop({ required: true })
  to!: string;
}

@Schema({ _id: false })
export class AvailabilityBlocked {
  @Prop({ required: true })
  date!: string;

  @Prop({ required: true })
  reason!: string;
}

@Schema({ timestamps: true })
export class Availability extends Document {
  @Prop({ required: true, default: 30 })
  slotMinutes!: number;

  @Prop({ required: true, default: 0 })
  bufferMinutes!: number;

  @Prop({ required: true, default: 4 })
  noticeHours!: number;

  @Prop({ required: true, default: 21 })
  windowDays!: number;

  @Prop({ required: true, default: 'https://meet.google.com/techclues-calls' })
  meetingLink!: string;

  @Prop({ type: [AvailabilityDay], required: true })
  days!: AvailabilityDay[];

  @Prop({ type: [AvailabilityBlocked], default: [] })
  blocked!: AvailabilityBlocked[];
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
