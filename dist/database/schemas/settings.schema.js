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
exports.SettingsSchema = exports.Settings = exports.ReplyTemplate = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let NotificationEvents = class NotificationEvents {
};
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationEvents.prototype, "enquiry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationEvents.prototype, "booking", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationEvents.prototype, "cancelled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationEvents.prototype, "subscriber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationEvents.prototype, "summary", void 0);
NotificationEvents = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], NotificationEvents);
let ReplyTemplate = class ReplyTemplate {
};
exports.ReplyTemplate = ReplyTemplate;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReplyTemplate.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReplyTemplate.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReplyTemplate.prototype, "body", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: undefined }),
    __metadata("design:type", Array)
], ReplyTemplate.prototype, "sources", void 0);
exports.ReplyTemplate = ReplyTemplate = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ReplyTemplate);
let Retention = class Retention {
};
__decorate([
    (0, mongoose_1.Prop)({ default: 30 }),
    __metadata("design:type", Number)
], Retention.prototype, "spamDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Retention.prototype, "enquiryMonths", void 0);
Retention = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Retention);
let Settings = class Settings extends mongoose_2.Document {
};
exports.Settings = Settings;
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: ['info@techclues.co.uk'] }),
    __metadata("design:type", Array)
], Settings.prototype, "recipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: NotificationEvents, default: {} }),
    __metadata("design:type", NotificationEvents)
], Settings.prototype, "events", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '08:00' }),
    __metadata("design:type", String)
], Settings.prototype, "summaryTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'TechClues' }),
    __metadata("design:type", String)
], Settings.prototype, "fromName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Settings.prototype, "signature", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ReplyTemplate], default: [] }),
    __metadata("design:type", Array)
], Settings.prototype, "templates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Retention, default: {} }),
    __metadata("design:type", Retention)
], Settings.prototype, "retention", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Settings.prototype, "passwordChangedAt", void 0);
exports.Settings = Settings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Settings);
exports.SettingsSchema = mongoose_1.SchemaFactory.createForClass(Settings);
//# sourceMappingURL=settings.schema.js.map