import { Module } from '@nestjs/common';
import { EnquiriesModule } from '../enquiries/enquiries.module';
import { BookingsModule } from '../bookings/bookings.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { ActivityModule } from '../activity/activity.module';
import { EmailModule } from '../email/email.module';
import { PrivacyController } from './privacy.controller';

@Module({
  imports: [EnquiriesModule, BookingsModule, NewsletterModule, ActivityModule, EmailModule],
  controllers: [PrivacyController],
})
export class PrivacyModule {}
