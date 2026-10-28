import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const BACKLINK_STATUSES = ['prospecting', 'requested', 'live', 'lost'] as const;
export type BacklinkStatus = (typeof BACKLINK_STATUSES)[number];

export const BACKLINK_TYPES = ['guest-post', 'directory', 'press', 'partner', 'resource-page', 'other'] as const;
export type BacklinkType = (typeof BACKLINK_TYPES)[number];

/** A single inbound link being tracked for the site's backlink/off-page SEO profile. */
@Schema({ timestamps: true })
export class Backlink extends Document {
  /** The domain or page linking to us, e.g. "techcrunch.com" or the full article URL. */
  @Prop({ required: true, trim: true })
  sourceUrl!: string;

  /** The page on our own site being linked to, e.g. "/" or "/services/mvp-development". */
  @Prop({ required: true, trim: true, default: '/' })
  targetPath!: string;

  @Prop({ trim: true })
  anchorText?: string;

  @Prop({ required: true, enum: BACKLINK_TYPES, default: 'other' })
  type!: BacklinkType;

  @Prop({ required: true, enum: BACKLINK_STATUSES, default: 'prospecting' })
  status!: BacklinkStatus;

  /** Optional manual DA/DR estimate the admin can fill in from a third-party tool. */
  @Prop()
  domainRating?: number;

  @Prop({ default: false })
  nofollow!: boolean;

  @Prop()
  lastCheckedAt?: Date;

  @Prop()
  notes?: string;
}

export const BacklinkSchema = SchemaFactory.createForClass(Backlink);
BacklinkSchema.index({ status: 1 });
