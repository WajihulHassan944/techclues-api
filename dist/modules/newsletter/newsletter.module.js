"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const subscriber_schema_1 = require("../../database/schemas/subscriber.schema");
const activity_module_1 = require("../activity/activity.module");
const email_module_1 = require("../email/email.module");
const pusher_module_1 = require("../pusher/pusher.module");
const settings_module_1 = require("../settings/settings.module");
const notifications_module_1 = require("../notifications/notifications.module");
const newsletter_service_1 = require("./newsletter.service");
const public_newsletter_controller_1 = require("./public-newsletter.controller");
const admin_newsletter_controller_1 = require("./admin-newsletter.controller");
let NewsletterModule = class NewsletterModule {
};
exports.NewsletterModule = NewsletterModule;
exports.NewsletterModule = NewsletterModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: subscriber_schema_1.Subscriber.name, schema: subscriber_schema_1.SubscriberSchema }]),
            activity_module_1.ActivityModule,
            email_module_1.EmailModule,
            pusher_module_1.PusherModule,
            settings_module_1.SettingsModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [newsletter_service_1.NewsletterService],
        controllers: [public_newsletter_controller_1.PublicNewsletterController, admin_newsletter_controller_1.AdminNewsletterController],
        exports: [newsletter_service_1.NewsletterService],
    })
], NewsletterModule);
//# sourceMappingURL=newsletter.module.js.map