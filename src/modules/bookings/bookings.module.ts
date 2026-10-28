import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Availability,
  AvailabilitySchema,
  Booking,
  BookingSchema,
} from '../../database/schemas/booking.schema';
import { ActivityModule } from '../activity/activity.module';
import { SettingsModule } from '../settings/settings.module';
import { EmailModule } from '../email/email.module';
import { PusherModule } from '../pusher/pusher.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { TransactionalEmailModule } from '../transactional-email/transactional-email.module';
import { BookingsService } from './bookings.service';
import { PublicBookingsController } from './public-bookings.controller';
import { AdminBookingsController } from './admin-bookings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Availability.name, schema: AvailabilitySchema },
    ]),
    ActivityModule,
    SettingsModule,
    EmailModule,
    PusherModule,
    NotificationsModule,
    NewsletterModule,
    TransactionalEmailModule,
  ],
  providers: [BookingsService],
  controllers: [PublicBookingsController, AdminBookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
