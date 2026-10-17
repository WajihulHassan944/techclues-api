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
exports.PublicBookingsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const honeypot_1 = require("../../common/utils/honeypot");
const bookings_service_1 = require("./bookings.service");
const public_availability_dto_1 = require("./dto/public-availability.dto");
const public_booking_dto_1 = require("./dto/public-booking.dto");
let PublicBookingsController = class PublicBookingsController {
    constructor(bookings) {
        this.bookings = bookings;
    }
    availability(query) {
        return this.bookings.availabilitySlots(query.from, query.to);
    }
    async create(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        void req;
        const booking = await this.bookings.createBooking(dto);
        return {
            id: String(booking._id),
            start: booking.start,
            minutes: booking.minutes,
            meetingLink: booking.meetingLink,
        };
    }
};
exports.PublicBookingsController = PublicBookingsController;
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_availability_dto_1.PublicAvailabilityQueryDto]),
    __metadata("design:returntype", void 0)
], PublicBookingsController.prototype, "availability", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 6, ttl: 60_000 } }),
    (0, common_1.Post)('bookings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_booking_dto_1.PublicCreateBookingDto, Object]),
    __metadata("design:returntype", Promise)
], PublicBookingsController.prototype, "create", null);
exports.PublicBookingsController = PublicBookingsController = __decorate([
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], PublicBookingsController);
//# sourceMappingURL=public-bookings.controller.js.map