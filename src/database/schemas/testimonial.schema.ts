import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Testimonial extends Document {
  @Prop({ required: true, trim: true })
  quote!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  role!: string;

  /** Two-letter initials shown in the avatar badge when no photo is set. */
  @Prop({ trim: true })
  initials?: string;

  @Prop()
  photo?: string;

  /** Sort order, ascending. */
  @Prop({ required: true, default: 0 })
  order!: number;

  /** Lets an admin hide a testimonial from the public site without deleting it. */
  @Prop({ required: true, default: true })
  published!: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
TestimonialSchema.index({ order: 1 });
