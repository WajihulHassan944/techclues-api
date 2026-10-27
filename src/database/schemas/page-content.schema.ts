import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** Generic editable-text store for a static page: one document per page key ("home", later
 *  others), holding a flat map of named text blocks ("hero.eyebrow", "section1.heading", …).
 *  Keeps content management from needing a bespoke schema per page. */
@Schema({ timestamps: true })
export class PageContent extends Document {
  @Prop({ required: true, unique: true, trim: true })
  page!: string;

  @Prop({ type: Map, of: String, default: {} })
  blocks!: Map<string, string>;
}

export const PageContentSchema = SchemaFactory.createForClass(PageContent);
