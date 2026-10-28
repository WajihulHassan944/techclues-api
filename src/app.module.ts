import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DevSkipThrottleGuard } from './common/guards/dev-skip-throttle.guard';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActivityModule } from './modules/activity/activity.module';
import { SettingsModule } from './modules/settings/settings.module';
import { EnquiriesModule } from './modules/enquiries/enquiries.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { BlogModule } from './modules/blog/blog.module';
import { CaseStudyModule } from './modules/case-studies/case-study.module';
import { FooterLinkModule } from './modules/footer-links/footer-link.module';
import { FaqModule } from './modules/faq/faq.module';
import { TestimonialModule } from './modules/testimonials/testimonial.module';
import { SeoModule } from './modules/seo/seo.module';
import { UsersModule } from './modules/users/users.module';
import { ServiceModule } from './modules/services/service.module';
import { PageContentModule } from './modules/page-content/page-content.module';
import { MediaModule } from './modules/media/media.module';
import { EmailTemplateModule } from './modules/email-templates/email-template.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { PusherModule } from './modules/pusher/pusher.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { EmailModule } from './modules/email/email.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { CronModule } from './modules/cron/cron.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [{ ttl: 60_000, limit: 100 }],
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
        // Serverless cold starts commonly stall for several seconds on IPv6 happy-eyeballs
        // fallback before trying IPv4 — forcing IPv4 skips that wait entirely. A small pool
        // is enough for one Lambda instance and keeps the initial connect itself cheaper.
        family: 4,
        maxPoolSize: 5,
      }),
    }),
    HealthModule,
    AuthModule,
    ActivityModule,
    SettingsModule,
    EnquiriesModule,
    BookingsModule,
    BlogModule,
    CaseStudyModule,
    FooterLinkModule,
    FaqModule,
    TestimonialModule,
    SeoModule,
    UsersModule,
    ServiceModule,
    PageContentModule,
    MediaModule,
    EmailTemplateModule,
    NewsletterModule,
    PusherModule,
    CloudinaryModule,
    EmailModule,
    DashboardModule,
    PrivacyModule,
    CronModule,
    SearchModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: DevSkipThrottleGuard }],
})
export class AppModule {}
