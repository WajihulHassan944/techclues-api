import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageContent, PageContentSchema } from '../../database/schemas/page-content.schema';
import { ActivityModule } from '../activity/activity.module';
import { PageContentService } from './page-content.service';
import { AdminPageContentController } from './admin-page-content.controller';
import { PublicPageContentController } from './public-page-content.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: PageContent.name, schema: PageContentSchema }]), ActivityModule],
  providers: [PageContentService],
  controllers: [AdminPageContentController, PublicPageContentController],
})
export class PageContentModule {}
