"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const booking_schema_1 = require("../../database/schemas/booking.schema");
const activity_module_1 = require("../activity/activity.module");
const settings_module_1 = require("../settings/settings.module");
const email_module_1 = require("../email/email.module");
const pusher_module_1 = require("../pusher/pusher.module");
const notifications_module_1 = require("../notifications/notifications.module");
const newsletter_module_1 = require("../newsletter/newsletter.module");
const bookings_service_1 = require("./bookings.service");
const public_bookings_controller_1 = require("./public-bookings.controller");
const admin_bookings_controller_1 = require("./admin-bookings.controller");
let BookingsModule = class BookingsModule {
};
exports.BookingsModule = BookingsModule;
exports.BookingsModule = BookingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: booking_schema_1.Booking.name, schema: booking_schema_1.BookingSchema },
                { name: booking_schema_1.Availability.name, schema: booking_schema_1.AvailabilitySchema },
            ]),
            activity_module_1.ActivityModule,
            settings_module_1.SettingsModule,
            email_module_1.EmailModule,
            pusher_module_1.PusherModule,
            notifications_module_1.NotificationsModule,
            newsletter_module_1.NewsletterModule,
        ],
        providers: [bookings_service_1.BookingsService],
        controllers: [public_bookings_controller_1.PublicBookingsController, admin_bookings_controller_1.AdminBookingsController],
        exports: [bookings_service_1.BookingsService],
    })
], BookingsModule);
//# sourceMappingURL=bookings.module.js.map