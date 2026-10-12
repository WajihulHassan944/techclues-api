import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Faq extends Document {
  /** Which page/section this belongs to — e.g. "mvp-development", "faq-pricing", "home". */
  @Prop({ required: true, trim: true })
  group!: string;

  @Prop({ required: true, trim: true })
  question!: string;

  @Prop({ required: true })
  answer!: string;

  /** Sort order within the group, ascending. */
  @Prop({ required: true, default: 0 })
  order!: number;

  /** Lets an admin hide a question from the public site without deleting it. */
  @Prop({ required: true, default: true })
  published!: boolean;
}
export const FaqSchema = SchemaFactory.createForClass(Faq);
FaqSchema.index({ group: 1, order: 1 });
