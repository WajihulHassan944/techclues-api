import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NotFoundHit extends Document {
  @Prop({ required: true, unique: true, trim: true })
  path!: string;

  @Prop({ required: true, default: 1 })
  hits!: number;

  @Prop()
  lastReferrer?: string;

  @Prop({ required: true, default: () => new Date() })
  lastSeenAt!: Date;

  /** Lets an admin mark a 404 as handled (e.g. after adding a redirect) without deleting its history. */
  @Prop({ required: true, default: false })
  resolved!: boolean;
}

export const NotFoundHitSchema = SchemaFactory.createForClass(NotFoundHit);
