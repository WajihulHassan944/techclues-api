import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const POST_STATUSES = ['draft', 'scheduled', 'published'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

@Schema({ timestamps: true })
export class BlogAuthor extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  role!: string;
}
export const BlogAuthorSchema = SchemaFactory.createForClass(BlogAuthor);

@Schema({ timestamps: true })
export class BlogCategory extends Document {
  @Prop({ required: true, unique: true })
  name!: string;
}
export const BlogCategorySchema = SchemaFactory.createForClass(BlogCategory);

@Schema({ timestamps: true })
export class BlogPost extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  excerpt!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  authorId!: string;

  @Prop({ default: '' })
  cover!: string;

  @Prop()
  coverAlt?: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ required: true, enum: POST_STATUSES, default: 'draft' })
  status!: PostStatus;

  @Prop()
  publishedAt?: Date;

  @Prop()
  scheduledFor?: Date;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;
}
export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
BlogPostSchema.index({ status: 1, publishedAt: -1 });
