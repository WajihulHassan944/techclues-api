"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiriesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const enquiry_schema_1 = require("../../database/schemas/enquiry.schema");
const blocked_sender_schema_1 = require("../../database/schemas/blocked-sender.schema");
const activity_module_1 = require("../activity/activity.module");
const settings_module_1 = require("../settings/settings.module");
const email_module_1 = require("../email/email.module");
const pusher_module_1 = require("../pusher/pusher.module");
const notifications_module_1 = require("../notifications/notifications.module");
const newsletter_module_1 = require("../newsletter/newsletter.module");
const enquiries_service_1 = require("./enquiries.service");
const public_enquiries_controller_1 = require("./public-enquiries.controller");
const admin_enquiries_controller_1 = require("./admin-enquiries.controller");
let EnquiriesModule = class EnquiriesModule {
};
exports.EnquiriesModule = EnquiriesModule;
exports.EnquiriesModule = EnquiriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: enquiry_schema_1.Enquiry.name, schema: enquiry_schema_1.EnquirySchema },
                { name: blocked_sender_schema_1.BlockedSender.name, schema: blocked_sender_schema_1.BlockedSenderSchema },
            ]),
            activity_module_1.ActivityModule,
            settings_module_1.SettingsModule,
            email_module_1.EmailModule,
            pusher_module_1.PusherModule,
            notifications_module_1.NotificationsModule,
            newsletter_module_1.NewsletterModule,
        ],
        providers: [enquiries_service_1.EnquiriesService],
        controllers: [public_enquiries_controller_1.PublicEnquiriesController, admin_enquiries_controller_1.AdminEnquiriesController],
        exports: [enquiries_service_1.EnquiriesService],
    })
], EnquiriesModule);
//# sourceMappingURL=enquiries.module.js.map