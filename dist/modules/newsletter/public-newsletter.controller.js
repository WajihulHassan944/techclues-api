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
exports.PublicNewsletterController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const honeypot_1 = require("../../common/utils/honeypot");
const newsletter_service_1 = require("./newsletter.service");
const public_newsletter_dto_1 = require("./dto/public-newsletter.dto");
let PublicNewsletterController = class PublicNewsletterController {
    constructor(newsletter) {
        this.newsletter = newsletter;
    }
    async subscribe(dto) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const error = await this.newsletter.add(dto.email, dto.name, 'footer');
        if (error)
            return { ok: false, error };
        return { ok: true };
    }
    async unsubscribeGet(query) {
        await this.newsletter.unsubscribeByToken(query.token);
        return { ok: true };
    }
    async unsubscribePost(dto) {
        await this.newsletter.unsubscribeByToken(dto.token);
        return { ok: true };
    }
};
exports.PublicNewsletterController = PublicNewsletterController;
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 8, ttl: 60_000 } }),
    (0, common_1.Post)('subscribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_newsletter_dto_1.SubscribeDto]),
    __metadata("design:returntype", Promise)
], PublicNewsletterController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Get)('unsubscribe'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_newsletter_dto_1.UnsubscribeQueryDto]),
    __metadata("design:returntype", Promise)
], PublicNewsletterController.prototype, "unsubscribeGet", null);
__decorate([
    (0, common_1.Post)('unsubscribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_newsletter_dto_1.UnsubscribeQueryDto]),
    __metadata("design:returntype", Promise)
], PublicNewsletterController.prototype, "unsubscribePost", null);
exports.PublicNewsletterController = PublicNewsletterController = __decorate([
    (0, common_1.Controller)('public/newsletter'),
    __metadata("design:paramtypes", [newsletter_service_1.NewsletterService])
], PublicNewsletterController);
//# sourceMappingURL=public-newsletter.controller.js.map