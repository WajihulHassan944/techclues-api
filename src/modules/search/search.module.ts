import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enquiry, EnquirySchema } from '../../database/schemas/enquiry.schema';
import { Booking, BookingSchema } from '../../database/schemas/booking.schema';
import { Subscriber, SubscriberSchema } from '../../database/schemas/subscriber.schema';
import { BlogPost, BlogPostSchema } from '../../database/schemas/blog.schema';
import { CaseStudy, CaseStudySchema } from '../../database/schemas/case-study.schema';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enquiry.name, schema: EnquirySchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: CaseStudy.name, schema: CaseStudySchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
