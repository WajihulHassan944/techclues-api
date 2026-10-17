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
exports.CronController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const enquiries_service_1 = require("../enquiries/enquiries.service");
const blog_service_1 = require("../blog/blog.service");
let CronController = class CronController {
    constructor(enquiries, blog, config) {
        this.enquiries = enquiries;
        this.blog = blog;
        this.config = config;
    }
    assertAuthorized(secret) {
        const expected = this.config.get('jwt.secret');
        if (!secret || secret !== expected)
            throw new common_1.UnauthorizedException();
    }
    async purgeSpam(secret) {
        this.assertAuthorized(secret);
        const count = await this.enquiries.purgeOldSpam();
        return { purged: count };
    }
    async publishScheduled(secret) {
        this.assertAuthorized(secret);
        const count = await this.blog.publishDuePosts();
        return { published: count };
    }
};
exports.CronController = CronController;
__decorate([
    (0, common_1.Post)('purge-spam'),
    __param(0, (0, common_1.Headers)('x-cron-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CronController.prototype, "purgeSpam", null);
__decorate([
    (0, common_1.Post)('publish-scheduled'),
    __param(0, (0, common_1.Headers)('x-cron-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CronController.prototype, "publishScheduled", null);
exports.CronController = CronController = __decorate([
    (0, common_1.Controller)('internal/cron'),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService,
        blog_service_1.BlogService,
        config_1.ConfigService])
], CronController);
//# sourceMappingURL=cron.controller.js.map