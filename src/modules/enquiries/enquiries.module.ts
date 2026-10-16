import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enquiry, EnquirySchema } from '../../database/schemas/enquiry.schema';
import { BlockedSender, BlockedSenderSchema } from '../../database/schemas/blocked-sender.schema';
import { ActivityModule } from '../activity/activity.module';
import { SettingsModule } from '../settings/settings.module';
import { EmailModule } from '../email/email.module';
import { PusherModule } from '../pusher/pusher.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { EnquiriesService } from './enquiries.service';
import { PublicEnquiriesController } from './public-enquiries.controller';
import { AdminEnquiriesController } from './admin-enquiries.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enquiry.name, schema: EnquirySchema },
      { name: BlockedSender.name, schema: BlockedSenderSchema },
    ]),
    ActivityModule,
    SettingsModule,
    EmailModule,
    PusherModule,
    NotificationsModule,
    NewsletterModule,
  ],
  providers: [EnquiriesService],
  controllers: [PublicEnquiriesController, AdminEnquiriesController],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
