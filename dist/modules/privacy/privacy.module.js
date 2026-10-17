"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyModule = void 0;
const common_1 = require("@nestjs/common");
const enquiries_module_1 = require("../enquiries/enquiries.module");
const bookings_module_1 = require("../bookings/bookings.module");
const newsletter_module_1 = require("../newsletter/newsletter.module");
const activity_module_1 = require("../activity/activity.module");
const email_module_1 = require("../email/email.module");
const privacy_controller_1 = require("./privacy.controller");
let PrivacyModule = class PrivacyModule {
};
exports.PrivacyModule = PrivacyModule;
exports.PrivacyModule = PrivacyModule = __decorate([
    (0, common_1.Module)({
        imports: [enquiries_module_1.EnquiriesModule, bookings_module_1.BookingsModule, newsletter_module_1.NewsletterModule, activity_module_1.ActivityModule, email_module_1.EmailModule],
        controllers: [privacy_controller_1.PrivacyController],
    })
], PrivacyModule);
//# sourceMappingURL=privacy.module.js.map