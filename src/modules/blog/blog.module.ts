import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BlogAuthor,
  BlogAuthorSchema,
  BlogCategory,
  BlogCategorySchema,
  BlogPost,
  BlogPostSchema,
} from '../../database/schemas/blog.schema';
import { ActivityModule } from '../activity/activity.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MediaModule } from '../media/media.module';
import { BlogService } from './blog.service';
import { AdminBlogController } from './admin-blog.controller';
import { PublicBlogController } from './public-blog.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: BlogCategory.name, schema: BlogCategorySchema },
      { name: BlogAuthor.name, schema: BlogAuthorSchema },
    ]),
    ActivityModule,
    CloudinaryModule,
    MediaModule,
  ],
  providers: [BlogService],
  controllers: [AdminBlogController, PublicBlogController],
  exports: [BlogService],
})
export class BlogModule {}
