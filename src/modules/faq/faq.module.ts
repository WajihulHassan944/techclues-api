import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from '../../database/schemas/faq.schema';
import { ActivityModule } from '../activity/activity.module';
import { FaqService } from './faq.service';
import { AdminFaqController } from './admin-faq.controller';
import { PublicFaqController } from './public-faq.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }]), ActivityModule],
  providers: [FaqService],
  controllers: [AdminFaqController, PublicFaqController],
})
export class FaqModule {}
