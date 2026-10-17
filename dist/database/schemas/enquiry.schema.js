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
exports.EnquirySchema = exports.Enquiry = exports.FOLDERS = exports.STATUS_KEYS = exports.SOURCE_KEYS = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.SOURCE_KEYS = [
    'contact',
    'calculator',
    'kill-my-idea',
    'grant',
    'partner-refer',
    'partner-join',
    'zero-one',
    'careers',
    'chat',
    'staff-augmentation',
    'game-development',
];
exports.STATUS_KEYS = ['new', 'replied', 'qualified', 'won', 'lost'];
exports.FOLDERS = ['inbox', 'spam', 'trash'];
let DetailItem = class DetailItem {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DetailItem.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DetailItem.prototype, "value", void 0);
DetailItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], DetailItem);
let ResultCard = class ResultCard {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResultCard.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResultCard.prototype, "headline", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ResultCard.prototype, "lines", void 0);
ResultCard = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ResultCard);
let Attachment = class Attachment {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "size", void 0);
Attachment = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Attachment);
let ThreadMessage = class ThreadMessage {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['them', 'us'] }),
    __metadata("design:type", String)
], ThreadMessage.prototype, "from", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: () => new Date() }),
    __metadata("design:type", Date)
], ThreadMessage.prototype, "at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ThreadMessage.prototype, "body", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['sent', 'failed', 'pending'], default: 'sent' }),
    __metadata("design:type", String)
], ThreadMessage.prototype, "deliveryStatus", void 0);
ThreadMessage = __decorate([
    (0, mongoose_1.Schema)({ _id: true, timestamps: false })
], ThreadMessage);
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
let Enquiry = class Enquiry extends mongoose_2.Document {
};
exports.Enquiry = Enquiry;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: exports.SOURCE_KEYS }),
    __metadata("design:type", String)
], Enquiry.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Enquiry.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Enquiry.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Enquiry.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Enquiry.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Enquiry.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Enquiry.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DetailItem], default: [] }),
    __metadata("design:type", Array)
], Enquiry.prototype, "details", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ResultCard }),
    __metadata("design:type", ResultCard)
], Enquiry.prototype, "result", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Attachment], default: [] }),
    __metadata("design:type", Array)
], Enquiry.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: () => new Date() }),
    __metadata("design:type", Date)
], Enquiry.prototype, "received", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: exports.STATUS_KEYS, default: 'new' }),
    __metadata("design:type", String)
], Enquiry.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: exports.FOLDERS, default: 'inbox' }),
    __metadata("design:type", String)
], Enquiry.prototype, "folder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Enquiry.prototype, "read", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Enquiry.prototype, "starred", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ThreadMessage], default: [] }),
    __metadata("design:type", Array)
], Enquiry.prototype, "thread", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Note], default: [] }),
    __metadata("design:type", Array)
], Enquiry.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Enquiry.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Enquiry.prototype, "draft", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Enquiry.prototype, "utm", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Enquiry.prototype, "referrer", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Enquiry.prototype, "ip", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Enquiry.prototype, "folderSince", void 0);
exports.Enquiry = Enquiry = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Enquiry);
exports.EnquirySchema = mongoose_1.SchemaFactory.createForClass(Enquiry);
exports.EnquirySchema.index({ email: 1 });
exports.EnquirySchema.index({ folder: 1, status: 1, received: -1 });
exports.EnquirySchema.index({ subject: 'text', message: 'text', name: 'text', email: 'text' });
//# sourceMappingURL=enquiry.schema.js.map