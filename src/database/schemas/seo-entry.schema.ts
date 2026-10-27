import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const SCHEMA_TYPES = ['none', 'Organization', 'LocalBusiness', 'Service', 'FAQPage', 'Article', 'BreadcrumbList'] as const;
export type SchemaType = (typeof SCHEMA_TYPES)[number];

@Schema({ timestamps: true })
export class SeoEntry extends Document {
  /** The site-relative path this entry describes, e.g. "/", "/services/mvp-development". */
  @Prop({ required: true, unique: true, trim: true })
  path!: string;

  @Prop({ trim: true })
  title?: string;

  @Prop()
  description?: string;

  @Prop({ trim: true })
  canonical?: string;

  @Prop({ trim: true })
  ogTitle?: string;

  @Prop()
  ogDescription?: string;

  @Prop({ trim: true })
  ogImage?: string;

  @Prop({ trim: true })
  twitterCard?: string;

  @Prop({ required: true, default: false })
  noindex!: boolean;

  @Prop({ required: true, enum: SCHEMA_TYPES, default: 'none' })
  schemaType!: SchemaType;

  /** Raw JSON-LD override — used verbatim when set, instead of auto-building one from schemaType. */
  @Prop()
  schemaJson?: string;

  @Prop({ required: true, default: true })
  includeInSitemap!: boolean;
}

export const SeoEntrySchema = SchemaFactory.createForClass(SeoEntry);
