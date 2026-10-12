import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false })
export class Session extends Document {
  @Prop({ required: true })
  adminId!: string;

  @Prop({ required: true })
  device!: string;

  @Prop()
  ip?: string;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;

  @Prop({ required: true, default: () => new Date() })
  lastUsedAt!: Date;

  @Prop({ required: true, default: false })
  revoked!: boolean;
}
export const SessionSchema = SchemaFactory.createForClass(Session);
