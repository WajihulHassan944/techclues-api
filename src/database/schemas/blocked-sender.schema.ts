import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false })
export class BlockedSender extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, default: () => new Date() })
  at!: Date;
}
export const BlockedSenderSchema = SchemaFactory.createForClass(BlockedSender);
