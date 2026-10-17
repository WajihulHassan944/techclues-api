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
exports.AdminFaqController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const faq_service_1 = require("./faq.service");
const faq_dto_1 = require("./dto/faq.dto");
let AdminFaqController = class AdminFaqController {
    constructor(faqs) {
        this.faqs = faqs;
    }
    list() {
        return this.faqs.listAll();
    }
    listGroups() {
        return this.faqs.listGroups();
    }
    create(dto) {
        return this.faqs.create(dto);
    }
    reorder(dto) {
        return this.faqs.reorder(dto.group, dto.ids);
    }
    update(id, dto) {
        return this.faqs.update(id, dto);
    }
    async remove(id) {
        await this.faqs.remove(id);
        return { ok: true };
    }
};
exports.AdminFaqController = AdminFaqController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminFaqController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('groups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminFaqController.prototype, "listGroups", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [faq_dto_1.CreateFaqDto]),
    __metadata("design:returntype", void 0)
], AdminFaqController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [faq_dto_1.ReorderFaqDto]),
    __metadata("design:returntype", void 0)
], AdminFaqController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, faq_dto_1.UpdateFaqDto]),
    __metadata("design:returntype", void 0)
], AdminFaqController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminFaqController.prototype, "remove", null);
exports.AdminFaqController = AdminFaqController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/faqs'),
    __metadata("design:paramtypes", [faq_service_1.FaqService])
], AdminFaqController);
//# sourceMappingURL=admin-faq.controller.js.map