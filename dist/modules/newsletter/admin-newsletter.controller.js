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
exports.AdminNewsletterController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const newsletter_service_1 = require("./newsletter.service");
const admin_newsletter_dto_1 = require("./dto/admin-newsletter.dto");
let AdminNewsletterController = class AdminNewsletterController {
    constructor(newsletter) {
        this.newsletter = newsletter;
    }
    list(status, search, page, pageSize) {
        return this.newsletter.list({
            status,
            search,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        });
    }
    stats() {
        return this.newsletter.growthStats();
    }
    async export(status, source, search) {
        return this.newsletter.exportCsv({ status, source, search });
    }
    async add(dto) {
        const error = await this.newsletter.add(dto.email, dto.name, dto.source ?? 'manual');
        if (error)
            return { ok: false, error };
        return { ok: true };
    }
    async import(file) {
        return this.newsletter.importCsv(file.buffer, 'import');
    }
    async addMany(dto) {
        return this.newsletter.addMany(dto.emails, dto.source ?? 'import');
    }
    setStatus(dto) {
        return this.newsletter.setStatus(dto.ids, dto.status);
    }
    remove(dto) {
        return this.newsletter.remove(dto.ids);
    }
    deleteByEmail(dto) {
        return this.newsletter.deleteByEmail(dto.email).then((count) => ({ count }));
    }
};
exports.AdminNewsletterController = AdminNewsletterController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminNewsletterController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminNewsletterController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="subscribers.csv"'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('source')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AdminNewsletterController.prototype, "export", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_newsletter_dto_1.AddSubscriberDto]),
    __metadata("design:returntype", Promise)
], AdminNewsletterController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminNewsletterController.prototype, "import", null);
__decorate([
    (0, common_1.Post)('add-many'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_newsletter_dto_1.AddManySubscribersDto]),
    __metadata("design:returntype", Promise)
], AdminNewsletterController.prototype, "addMany", null);
__decorate([
    (0, common_1.Post)('status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_newsletter_dto_1.SetSubStatusDto]),
    __metadata("design:returntype", void 0)
], AdminNewsletterController.prototype, "setStatus", null);
__decorate([
    (0, common_1.Post)('remove'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_newsletter_dto_1.RemoveSubscribersDto]),
    __metadata("design:returntype", void 0)
], AdminNewsletterController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('delete-by-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_newsletter_dto_1.DeleteByEmailDto]),
    __metadata("design:returntype", void 0)
], AdminNewsletterController.prototype, "deleteByEmail", null);
exports.AdminNewsletterController = AdminNewsletterController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/newsletter'),
    __metadata("design:paramtypes", [newsletter_service_1.NewsletterService])
], AdminNewsletterController);
//# sourceMappingURL=admin-newsletter.controller.js.map