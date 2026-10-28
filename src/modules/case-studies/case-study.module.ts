import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaseStudy, CaseStudySchema } from '../../database/schemas/case-study.schema';
import { ActivityModule } from '../activity/activity.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MediaModule } from '../media/media.module';
import { CaseStudyService } from './case-study.service';
import { AdminCaseStudyController } from './admin-case-study.controller';
import { PublicCaseStudyController } from './public-case-study.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CaseStudy.name, schema: CaseStudySchema }]),
    ActivityModule,
    CloudinaryModule,
    MediaModule,
  ],
  providers: [CaseStudyService],
  controllers: [AdminCaseStudyController, PublicCaseStudyController],
  exports: [CaseStudyService],
})
export class CaseStudyModule {}
