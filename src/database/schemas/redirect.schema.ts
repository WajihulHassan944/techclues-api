import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Redirect extends Document {
  @Prop({ required: true, unique: true, trim: true })
  from!: string;

  @Prop({ required: true, trim: true })
  to!: string;

  @Prop({ required: true, enum: [301, 302], default: 301 })
  statusCode!: number;

  @Prop({ required: true, default: 0 })
  hits!: number;
}

export const RedirectSchema = SchemaFactory.createForClass(Redirect);
