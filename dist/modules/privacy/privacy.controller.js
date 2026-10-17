"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const enquiries_service_1 = require("../enquiries/enquiries.service");
const bookings_service_1 = require("../bookings/bookings.service");
const newsletter_service_1 = require("../newsletter/newsletter.service");
const activity_service_1 = require("../activity/activity.service");
const email_service_1 = require("../email/email.service");
let PrivacyController = class PrivacyController {
    constructor(enquiries, bookings, newsletter, activity, email) {
        this.enquiries = enquiries;
        this.bookings = bookings;
        this.newsletter = newsletter;
        this.activity = activity;
        this.email = email;
    }
    async find(email) {
        const [enquiries, bookings, subscriptions] = await Promise.all([
            this.enquiries.findByEmail(email),
            this.bookings.findByEmail(email),
            this.newsletter.findByEmail(email),
        ]);
        return { enquiries, bookings, subscriptions };
    }
    async erase(email) {
        const [enquiries, bookings, subscriptions] = await Promise.all([
            this.enquiries.deleteByEmail(email),
            this.bookings.deleteByEmail(email),
            this.newsletter.deleteByEmail(email),
            this.email.deleteContact(email),
        ]);
        await this.activity.log('security', `Erased all data for ${email} (privacy request)`);
        return {
            enquiriesDeleted: enquiries,
            bookingsDeleted: bookings,
            subscriptionsDeleted: subscriptions,
        };
    }
};
exports.PrivacyController = PrivacyController;
__decorate([
    (0, common_1.Get)('find'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "find", null);
__decorate([
    (0, common_1.Delete)('erase'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrivacyController.prototype, "erase", null);
exports.PrivacyController = PrivacyController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/privacy'),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService,
        bookings_service_1.BookingsService,
        newsletter_service_1.NewsletterService,
        activity_service_1.ActivityService,
        email_service_1.EmailService])
], PrivacyController);
//# sourceMappingURL=privacy.controller.js.map