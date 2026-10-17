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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilitySchema = exports.Availability = exports.AvailabilityBlocked = exports.AvailabilityDay = exports.BookingSchema = exports.Booking = exports.BOOKING_VIAS = exports.BOOKING_STATUSES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.BOOKING_STATUSES = ['confirmed', 'completed', 'cancelled', 'no-show'];
exports.BOOKING_VIAS = ['Book a call', 'BUILD.ONE brief', 'ZERO.ONE brief'];
let Note = class Note {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: () => new Date() }),
    __metadata("design:type", Date)
], Note.prototype, "at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Note.prototype, "body", void 0);
Note = __decorate([
    (0, mongoose_1.Schema)({ _id: true, timestamps: false })
], Note);
let HistoryEntry = class HistoryEntry {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: () => new Date() }),
    __metadata("design:type", Date)
], HistoryEntry.prototype, "at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], HistoryEntry.prototype, "text", void 0);
HistoryEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: true, timestamps: false })
], HistoryEntry);
let Booking = class Booking extends mongoose_2.Document {
};
exports.Booking = Booking;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Booking.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Booking.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Booking.prototype, "start", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 30 }),
    __metadata("design:type", Number)
], Booking.prototype, "minutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Booking.prototype, "topic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'Book a call' }),
    __metadata("design:type", String)
], Booking.prototype, "via", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: exports.BOOKING_STATUSES, default: 'confirmed' }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "meetingLink", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "cancelReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Note], default: [] }),
    __metadata("design:type", Array)
], Booking.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [HistoryEntry], default: [] }),
    __metadata("design:type", Array)
], Booking.prototype, "history", void 0);
exports.Booking = Booking = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Booking);
exports.BookingSchema = mongoose_1.SchemaFactory.createForClass(Booking);
exports.BookingSchema.index({ start: 1 });
exports.BookingSchema.index({ email: 1 });
exports.BookingSchema.index({ start: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'confirmed' } });
let AvailabilityDay = class AvailabilityDay {
};
exports.AvailabilityDay = AvailabilityDay;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], AvailabilityDay.prototype, "on", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AvailabilityDay.prototype, "from", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AvailabilityDay.prototype, "to", void 0);
exports.AvailabilityDay = AvailabilityDay = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AvailabilityDay);
let AvailabilityBlocked = class AvailabilityBlocked {
};
exports.AvailabilityBlocked = AvailabilityBlocked;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AvailabilityBlocked.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AvailabilityBlocked.prototype, "reason", void 0);
exports.AvailabilityBlocked = AvailabilityBlocked = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AvailabilityBlocked);
let Availability = class Availability extends mongoose_2.Document {
};
exports.Availability = Availability;
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 30 }),
    __metadata("design:type", Number)
], Availability.prototype, "slotMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Availability.prototype, "bufferMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 4 }),
    __metadata("design:type", Number)
], Availability.prototype, "noticeHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 21 }),
    __metadata("design:type", Number)
], Availability.prototype, "windowDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'https://meet.google.com/techclues-calls' }),
    __metadata("design:type", String)
], Availability.prototype, "meetingLink", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [AvailabilityDay], required: true }),
    __metadata("design:type", Array)
], Availability.prototype, "days", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [AvailabilityBlocked], default: [] }),
    __metadata("design:type", Array)
], Availability.prototype, "blocked", void 0);
exports.Availability = Availability = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Availability);
exports.AvailabilitySchema = mongoose_1.SchemaFactory.createForClass(Availability);
//# sourceMappingURL=booking.schema.js.map