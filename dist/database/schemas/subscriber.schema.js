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
exports.SubscriberSchema = exports.Subscriber = exports.SUB_SOURCES = exports.SUB_STATUSES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.SUB_STATUSES = ['subscribed', 'unsubscribed', 'bounced'];
exports.SUB_SOURCES = ['footer', 'blog', 'manual', 'import', 'contact', 'booking'];
let Subscriber = class Subscriber extends mongoose_2.Document {
};
exports.Subscriber = Subscriber;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Subscriber.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: exports.SUB_SOURCES }),
    __metadata("design:type", String)
], Subscriber.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: exports.SUB_STATUSES, default: 'subscribed' }),
    __metadata("design:type", String)
], Subscriber.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: () => new Date() }),
    __metadata("design:type", Date)
], Subscriber.prototype, "at", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Subscriber.prototype, "endedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "unsubscribeToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Subscriber.prototype, "confirmed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Subscriber.prototype, "brevoContactId", void 0);
exports.Subscriber = Subscriber = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Subscriber);
exports.SubscriberSchema = mongoose_1.SchemaFactory.createForClass(Subscriber);
exports.SubscriberSchema.index({ status: 1 });
//# sourceMappingURL=subscriber.schema.js.map