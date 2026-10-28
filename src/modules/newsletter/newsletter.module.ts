import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscriber, SubscriberSchema } from '../../database/schemas/subscriber.schema';
import { ActivityModule } from '../activity/activity.module';
import { EmailModule } from '../email/email.module';
import { PusherModule } from '../pusher/pusher.module';
import { SettingsModule } from '../settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TransactionalEmailModule } from '../transactional-email/transactional-email.module';
import { NewsletterService } from './newsletter.service';
import { PublicNewsletterController } from './public-newsletter.controller';
import { AdminNewsletterController } from './admin-newsletter.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Subscriber.name, schema: SubscriberSchema }]),
    ActivityModule,
    EmailModule,
    PusherModule,
    SettingsModule,
    NotificationsModule,
    TransactionalEmailModule,
  ],
  providers: [NewsletterService],
  controllers: [PublicNewsletterController, AdminNewsletterController],
  exports: [NewsletterService],
})
export class NewsletterModule {}
