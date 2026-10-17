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
exports.AdminBookingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const bookings_service_1 = require("./bookings.service");
const admin_booking_dto_1 = require("./dto/admin-booking.dto");
let AdminBookingsController = class AdminBookingsController {
    constructor(bookings) {
        this.bookings = bookings;
    }
    list(status, from, to, page, pageSize) {
        return this.bookings.list({
            status,
            from,
            to,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        });
    }
    getAvailability() {
        return this.bookings.getAvailability();
    }
    saveAvailability(dto) {
        return this.bookings.saveAvailability(dto);
    }
    blockDay(dto) {
        return this.bookings.blockDay(dto.date, dto.reason);
    }
    unblockDay(dto) {
        return this.bookings.unblockDay(dto.date);
    }
    deleteByEmail(dto) {
        return this.bookings.deleteByEmail(dto.email).then((count) => ({ count }));
    }
    get(id) {
        return this.bookings.findOne(id);
    }
    reschedule(id, dto) {
        return this.bookings.reschedule(id, dto.start, dto.notify ?? true);
    }
    cancel(id, dto) {
        return this.bookings.cancel(id, dto.reason, dto.notify ?? true);
    }
    setStatus(id, dto) {
        return this.bookings.setStatus(id, dto.status);
    }
    addNote(id, dto) {
        return this.bookings.addNote(id, dto.body);
    }
};
exports.AdminBookingsController = AdminBookingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('availability'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Patch)('availability'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_booking_dto_1.SaveAvailabilityDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "saveAvailability", null);
__decorate([
    (0, common_1.Post)('availability/block'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_booking_dto_1.BlockDayDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "blockDay", null);
__decorate([
    (0, common_1.Post)('availability/unblock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_booking_dto_1.UnblockDayDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "unblockDay", null);
__decorate([
    (0, common_1.Post)('delete-by-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_booking_dto_1.DeleteByEmailDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "deleteByEmail", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id/reschedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_booking_dto_1.RescheduleDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_booking_dto_1.CancelBookingDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_booking_dto_1.SetBookingStatusDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "setStatus", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_booking_dto_1.AddBookingNoteDto]),
    __metadata("design:returntype", void 0)
], AdminBookingsController.prototype, "addNote", null);
exports.AdminBookingsController = AdminBookingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], AdminBookingsController);
//# sourceMappingURL=admin-bookings.controller.js.map