import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** Services map 1:1 to the fixed set of /services/* routes the frontend ships — there is no
 *  add/remove here, only editing the copy for an existing page. */
@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true, unique: true, trim: true })
  slug!: string;

  /** Sort order on the /services grid. */
  @Prop({ required: true, default: 0 })
  order!: number;

  // --- /services grid card ---
  @Prop({ required: true, trim: true })
  cardTitle!: string;

  @Prop({ required: true })
  cardDescription!: string;

  @Prop({ type: [String], default: [] })
  features!: string[];

  // --- the service's own page hero ---
  @Prop({ required: true, trim: true })
  heroEyebrow!: string;

  @Prop({ required: true })
  heroHeadline!: string;

  @Prop({ required: true })
  heroSubheading!: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
ServiceSchema.index({ order: 1 });
