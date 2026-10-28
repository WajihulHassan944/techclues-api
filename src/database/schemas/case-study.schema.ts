import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CASE_STUDY_STATUSES = ['draft', 'published'] as const;
export type CaseStudyStatus = (typeof CASE_STUDY_STATUSES)[number];

@Schema({ _id: false })
export class CaseStudyResult {
  /** e.g. "3x", "40%", "8 weeks" — shown as a stat chip on the case study. */
  @Prop({ required: true })
  value!: string;

  @Prop({ required: true })
  label!: string;
}
export const CaseStudyResultSchema = SchemaFactory.createForClass(CaseStudyResult);

@Schema({ _id: false })
export class CaseStudyTestimonial {
  @Prop({ default: '' })
  quote?: string;

  @Prop({ default: '' })
  author?: string;

  @Prop({ default: '' })
  role?: string;
}
export const CaseStudyTestimonialSchema = SchemaFactory.createForClass(CaseStudyTestimonial);

@Schema({ timestamps: true })
export class CaseStudy extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '' })
  title!: string;

  @Prop({ default: '' })
  client!: string;

  /** Free text, but the admin UI suggests the site's existing industry list for consistency with /industries/*. */
  @Prop({ default: '' })
  industry!: string;

  /** Service slugs, matching /services/* (e.g. "mvp-development", "ai-enablement"). */
  @Prop({ type: [String], default: [] })
  services!: string[];

  @Prop({ default: '' })
  excerpt!: string;

  /** Case study narrative as HTML from the visual editor, same as blog posts. */
  @Prop({ default: '' })
  body!: string;

  @Prop({ default: '' })
  cover!: string;

  @Prop()
  coverAlt?: string;

  /** Extra gallery images beyond the cover. */
  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [CaseStudyResultSchema], default: [] })
  results!: CaseStudyResult[];

  @Prop({ type: CaseStudyTestimonial, default: {} })
  testimonial!: CaseStudyTestimonial;

  @Prop({ required: true, enum: CASE_STUDY_STATUSES, default: 'draft' })
  status!: CaseStudyStatus;

  @Prop({ default: false })
  featured!: boolean;

  @Prop()
  publishedAt?: Date;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;
}
export const CaseStudySchema = SchemaFactory.createForClass(CaseStudy);
CaseStudySchema.index({ status: 1, publishedAt: -1 });
CaseStudySchema.index({ industry: 1 });
CaseStudySchema.index({ services: 1 });
