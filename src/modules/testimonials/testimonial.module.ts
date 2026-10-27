import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Testimonial, TestimonialSchema } from '../../database/schemas/testimonial.schema';
import { ActivityModule } from '../activity/activity.module';
import { TestimonialService } from './testimonial.service';
import { AdminTestimonialController } from './admin-testimonial.controller';
import { PublicTestimonialController } from './public-testimonial.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Testimonial.name, schema: TestimonialSchema }]), ActivityModule],
  providers: [TestimonialService],
  controllers: [AdminTestimonialController, PublicTestimonialController],
  exports: [TestimonialService],
})
export class TestimonialModule {}
