import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoEntry, SeoEntrySchema } from '../../database/schemas/seo-entry.schema';
import { Redirect, RedirectSchema } from '../../database/schemas/redirect.schema';
import { NotFoundHit, NotFoundHitSchema } from '../../database/schemas/not-found-hit.schema';
import { BlogPost, BlogPostSchema } from '../../database/schemas/blog.schema';
import { CaseStudy, CaseStudySchema } from '../../database/schemas/case-study.schema';
import { ActivityModule } from '../activity/activity.module';
import { SeoService } from './seo.service';
import { AdminSeoController } from './admin-seo.controller';
import { PublicSeoController } from './public-seo.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SeoEntry.name, schema: SeoEntrySchema },
      { name: Redirect.name, schema: RedirectSchema },
      { name: NotFoundHit.name, schema: NotFoundHitSchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: CaseStudy.name, schema: CaseStudySchema },
    ]),
    ActivityModule,
  ],
  providers: [SeoService],
  controllers: [AdminSeoController, PublicSeoController],
})
export class SeoModule {}
