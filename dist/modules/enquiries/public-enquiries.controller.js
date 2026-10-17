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
exports.PublicEnquiriesController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const honeypot_1 = require("../../common/utils/honeypot");
const enquiries_service_1 = require("./enquiries.service");
const public_contact_dto_1 = require("./dto/public-contact.dto");
const public_brief_dto_1 = require("./dto/public-brief.dto");
const public_zero_one_dto_1 = require("./dto/public-zero-one.dto");
const public_grant_dto_1 = require("./dto/public-grant.dto");
const public_partner_dto_1 = require("./dto/public-partner.dto");
const public_careers_dto_1 = require("./dto/public-careers.dto");
const public_chat_dto_1 = require("./dto/public-chat.dto");
const public_service_lead_dto_1 = require("./dto/public-service-lead.dto");
function toDetails(obj) {
    return Object.entries(obj)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([label, value]) => ({ label, value: String(value) }));
}
let PublicEnquiriesController = class PublicEnquiriesController {
    constructor(enquiries) {
        this.enquiries = enquiries;
    }
    async contact(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const enquiry = await this.enquiries.createPublic({
            source: 'contact',
            name: dto.name,
            email: dto.email,
            company: dto.company,
            subject: `Contact form from ${dto.name}`,
            message: dto.message,
            details: toDetails({ needs: dto.needs?.join(', '), budget: dto.budget, other: dto.other }),
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async brief(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const enquiry = await this.enquiries.createPublic({
            source: 'calculator',
            name: dto.name,
            email: dto.email,
            company: dto.company,
            subject: `MVP cost estimate for ${dto.name}`,
            message: dto.result?.headline ?? 'Submitted the MVP cost calculator.',
            details: toDetails({
                platform: dto.platform,
                goal: dto.goal,
                features: dto.features,
                pace: dto.pace,
            }),
            result: dto.result,
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async zeroOne(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const enquiry = await this.enquiries.createPublic({
            source: 'zero-one',
            name: dto.name,
            email: dto.email,
            company: dto.company,
            phone: dto.phone,
            subject: `BUILD.ONE brief from ${dto.name}`,
            message: dto.idea,
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async grant(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const enquiry = await this.enquiries.createPublic({
            source: 'grant',
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            subject: `Grant support: ${dto.legalName}`,
            message: dto.about || `Checking funding options for ${dto.project}.`,
            details: toDetails({
                role: dto.role,
                legalName: dto.legalName,
                companyNumber: dto.companyNumber,
                businessType: dto.businessType,
                basedIn: dto.basedIn,
                employees: dto.employees,
                turnover: dto.turnover,
                trading: dto.trading,
                project: dto.project,
                budget: dto.budget,
                start: dto.start,
                match: dto.match,
                publicFunding: dto.publicFunding,
            }),
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async partner(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.honeypot);
        const isJoin = dto.mode === 'join';
        const enquiry = await this.enquiries.createPublic({
            source: isJoin ? 'partner-join' : 'partner-refer',
            name: dto.name,
            email: dto.email,
            company: dto.company,
            phone: dto.phone,
            subject: isJoin
                ? `Partner application from ${dto.name}`
                : `Referral: ${dto.clientName ?? 'a client'}`,
            message: isJoin
                ? dto.notes || `Applying to become a partner (${dto.kind ?? 'unspecified'}).`
                : dto.notes ||
                    `Referring ${dto.clientName ?? 'a client'} for ${dto.projectType ?? 'a project'}.`,
            details: isJoin
                ? toDetails({ kind: dto.kind, website: dto.website, reach: dto.reach, volume: dto.volume })
                : toDetails({
                    clientName: dto.clientName,
                    clientCompany: dto.clientCompany,
                    clientEmail: dto.clientEmail,
                    clientPhone: dto.clientPhone,
                    projectType: dto.projectType,
                    budget: dto.budget,
                }),
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async careers(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const enquiry = await this.enquiries.createPublic({
            source: 'careers',
            name: dto.name,
            email: dto.email,
            subject: `Application: ${dto.areas?.[0] ?? 'General'} role`,
            message: dto.message,
            details: toDetails({
                areas: dto.areas?.join(', '),
                other: dto.other,
                location: dto.location,
                link: dto.link,
            }),
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async chat(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const enquiry = await this.enquiries.createPublic({
            source: 'chat',
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            subject: `Chat widget: ${dto.topic ?? dto.name}`,
            message: dto.message,
            details: toDetails({ topic: dto.topic }),
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async staffAugmentation(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const name = `${dto.firstName} ${dto.lastName}`.trim();
        const enquiry = await this.enquiries.createPublic({
            source: 'staff-augmentation',
            marketingConsent: dto.marketingConsent,
            name,
            email: dto.email,
            company: dto.company,
            phone: dto.phone ? `${dto.phoneCode ?? ''} ${dto.phone}`.trim() : undefined,
            subject: `Staff augmentation: ${dto.need} (${name})`,
            message: dto.brief || `Looking for: ${dto.need}.`,
            details: toDetails({
                need: dto.need,
                companySize: dto.companySize,
                timeline: dto.timeline,
                marketingConsent: dto.marketingConsent ? 'yes' : 'no',
            }),
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
    async gameDevelopment(dto, req) {
        (0, honeypot_1.checkHoneypot)(dto.website);
        const name = `${dto.firstName} ${dto.lastName}`.trim();
        const enquiry = await this.enquiries.createPublic({
            source: 'game-development',
            marketingConsent: dto.marketingConsent,
            name,
            email: dto.email,
            company: dto.company,
            phone: dto.phone ? `${dto.phoneCode ?? ''} ${dto.phone}`.trim() : undefined,
            subject: `Game development: ${dto.need} (${name})`,
            message: dto.brief || `Stage: ${dto.need}.`,
            details: toDetails({
                stage: dto.need,
                marketingConsent: dto.marketingConsent ? 'yes' : 'no',
            }),
            ip: req.ip,
            referrer: req.headers.referer,
        });
        return { id: String(enquiry._id) };
    }
};
exports.PublicEnquiriesController = PublicEnquiriesController;
__decorate([
    (0, common_1.Post)('contact'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_contact_dto_1.PublicContactDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "contact", null);
__decorate([
    (0, common_1.Post)('brief'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_brief_dto_1.PublicBriefDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "brief", null);
__decorate([
    (0, common_1.Post)('zero-one'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_zero_one_dto_1.PublicZeroOneDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "zeroOne", null);
__decorate([
    (0, common_1.Post)('grant'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_grant_dto_1.PublicGrantDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "grant", null);
__decorate([
    (0, common_1.Post)('partner'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_partner_dto_1.PublicPartnerDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "partner", null);
__decorate([
    (0, common_1.Post)('careers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_careers_dto_1.PublicCareersDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "careers", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_chat_dto_1.PublicChatDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('staff-augmentation'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_service_lead_dto_1.PublicStaffAugmentationDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "staffAugmentation", null);
__decorate([
    (0, common_1.Post)('game-development'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_service_lead_dto_1.PublicGameDevelopmentDto, Object]),
    __metadata("design:returntype", Promise)
], PublicEnquiriesController.prototype, "gameDevelopment", null);
exports.PublicEnquiriesController = PublicEnquiriesController = __decorate([
    (0, throttler_1.Throttle)({ default: { limit: 8, ttl: 60_000 } }),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService])
], PublicEnquiriesController);
//# sourceMappingURL=public-enquiries.controller.js.map