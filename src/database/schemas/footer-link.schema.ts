import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const FOOTER_GROUPS = ['services', 'company', 'sectors', 'legal'] as const;
export type FooterGroup = (typeof FOOTER_GROUPS)[number];

@Schema({ timestamps: true })
export class FooterLink extends Document {
  /** Which footer column this belongs to. "legal" is the bottom-row strip (privacy, terms, ...). */
  @Prop({ required: true, enum: FOOTER_GROUPS })
  group!: FooterGroup;

  @Prop({ required: true, trim: true })
  label!: string;

  @Prop({ required: true, trim: true })
  href!: string;

  /** Sort order within the group, ascending. */
  @Prop({ required: true, default: 0 })
  order!: number;

  @Prop({ default: false })
  newTab!: boolean;

  /** Lets an admin hide a link from the public site without deleting it. */
  @Prop({ required: true, default: true })
  published!: boolean;
}
export const FooterLinkSchema = SchemaFactory.createForClass(FooterLink);
FooterLinkSchema.index({ group: 1, order: 1 });
