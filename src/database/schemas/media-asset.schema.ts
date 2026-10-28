import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** One uploaded image, tracked centrally so the admin panel has a single library to browse and
 *  reuse across pages instead of uploading the same picture twice. */
@Schema({ timestamps: true })
export class MediaAsset extends Document {
  @Prop({ required: true })
  url!: string;

  @Prop({ required: true, unique: true })
  publicId!: string;

  @Prop({ required: true, trim: true })
  filename!: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  bytes?: number;

  @Prop()
  format?: string;

  @Prop({ default: '' })
  altText!: string;

  @Prop()
  uploadedBy?: string;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
MediaAssetSchema.index({ createdAt: -1 });
