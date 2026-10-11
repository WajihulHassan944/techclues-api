import { Controller, Delete, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { BookingsService } from '../bookings/bookings.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import { ActivityService } from '../activity/activity.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/privacy')
export class PrivacyController {
  constructor(
    private readonly enquiries: EnquiriesService,
    private readonly bookings: BookingsService,
    private readonly newsletter: NewsletterService,
    private readonly activity: ActivityService,
  ) {}

  @Get('find')
  async find(@Query('email') email: string) {
    const [enquiries, bookings, subscriptions] = await Promise.all([
      this.enquiries.findByEmail(email),
      this.bookings.findByEmail(email),
      this.newsletter.findByEmail(email),
    ]);
    return { enquiries, bookings, subscriptions };
  }

  @Delete('erase')
  async erase(@Query('email') email: string) {
    const [enquiries, bookings, subscriptions] = await Promise.all([
      this.enquiries.deleteByEmail(email),
      this.bookings.deleteByEmail(email),
      this.newsletter.deleteByEmail(email),
    ]);
    await this.activity.log('security', `Erased all data for ${email} (privacy request)`);
    return {
      enquiriesDeleted: enquiries,
      bookingsDeleted: bookings,
      subscriptionsDeleted: subscriptions,
    };
  }
}
