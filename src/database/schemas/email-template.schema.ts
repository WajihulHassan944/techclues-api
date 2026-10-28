import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** A reusable, admin-authored email — used for one-off campaigns sent to the newsletter list.
 *  Separate from the code-defined transactional emails (booking confirmations, etc.), which
 *  stay as they are. */
@Schema({ timestamps: true })
export class EmailTemplate extends Document {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  subject!: string;

  @Prop({ required: true })
  bodyHtml!: string;

  @Prop()
  lastSentAt?: Date;

  @Prop({ default: 0 })
  lastSentCount!: number;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
