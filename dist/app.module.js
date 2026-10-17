"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const dev_skip_throttle_guard_1 = require("./common/guards/dev-skip-throttle.guard");
const configuration_1 = __importDefault(require("./config/configuration"));
const env_validation_1 = require("./config/env.validation");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const activity_module_1 = require("./modules/activity/activity.module");
const settings_module_1 = require("./modules/settings/settings.module");
const enquiries_module_1 = require("./modules/enquiries/enquiries.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const blog_module_1 = require("./modules/blog/blog.module");
const faq_module_1 = require("./modules/faq/faq.module");
const newsletter_module_1 = require("./modules/newsletter/newsletter.module");
const pusher_module_1 = require("./modules/pusher/pusher.module");
const cloudinary_module_1 = require("./modules/cloudinary/cloudinary.module");
const email_module_1 = require("./modules/email/email.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const privacy_module_1 = require("./modules/privacy/privacy.module");
const cron_module_1 = require("./modules/cron/cron.module");
const search_module_1 = require("./modules/search/search.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [configuration_1.default], validate: env_validation_1.validate }),
            throttler_1.ThrottlerModule.forRootAsync({
                useFactory: () => ({
                    throttlers: [{ ttl: 60_000, limit: 100 }],
                }),
            }),
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    uri: config.get('mongo.uri'),
                    family: 4,
                    maxPoolSize: 5,
                }),
            }),
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            activity_module_1.ActivityModule,
            settings_module_1.SettingsModule,
            enquiries_module_1.EnquiriesModule,
            bookings_module_1.BookingsModule,
            blog_module_1.BlogModule,
            faq_module_1.FaqModule,
            newsletter_module_1.NewsletterModule,
            pusher_module_1.PusherModule,
            cloudinary_module_1.CloudinaryModule,
            email_module_1.EmailModule,
            dashboard_module_1.DashboardModule,
            privacy_module_1.PrivacyModule,
            cron_module_1.CronModule,
            search_module_1.SearchModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: dev_skip_throttle_guard_1.DevSkipThrottleGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map