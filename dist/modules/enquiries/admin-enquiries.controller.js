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
exports.AdminEnquiriesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const enquiries_service_1 = require("./enquiries.service");
const admin_inbox_dto_1 = require("./dto/admin-inbox.dto");
let AdminEnquiriesController = class AdminEnquiriesController {
    constructor(enquiries) {
        this.enquiries = enquiries;
    }
    list(folder, status, search, page, pageSize) {
        return this.enquiries.list({
            folder,
            status,
            search,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        });
    }
    unreadCount() {
        return this.enquiries.unreadCount().then((count) => ({ count }));
    }
    listBlocked() {
        return this.enquiries.listBlocked();
    }
    get(id) {
        return this.enquiries.findOne(id);
    }
    setRead(dto) {
        return this.enquiries.setRead(dto.ids, dto.read);
    }
    toggleStar(id) {
        return this.enquiries.toggleStar(id);
    }
    setStatus(dto) {
        return this.enquiries.setStatus(dto.ids, dto.status);
    }
    moveTo(dto) {
        return this.enquiries.moveTo(dto.ids, dto.folder);
    }
    deleteForever(dto) {
        return this.enquiries.deleteForever(dto.ids);
    }
    addNote(id, dto) {
        return this.enquiries.addNote(id, dto.body);
    }
    saveDraft(id, dto) {
        return this.enquiries.saveDraft(id, dto.draft);
    }
    sendReply(id, dto) {
        return this.enquiries.sendReply(id, dto.body);
    }
    block(dto) {
        return this.enquiries.block(dto.email);
    }
    unblock(dto) {
        return this.enquiries.unblock(dto.email);
    }
};
exports.AdminEnquiriesController = AdminEnquiriesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('folder')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Get)('blocked'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "listBlocked", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)('read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_inbox_dto_1.SetReadDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "setRead", null);
__decorate([
    (0, common_1.Patch)(':id/star'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "toggleStar", null);
__decorate([
    (0, common_1.Patch)('status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_inbox_dto_1.SetStatusDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "setStatus", null);
__decorate([
    (0, common_1.Patch)('move'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_inbox_dto_1.MoveFolderDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "moveTo", null);
__decorate([
    (0, common_1.Post)('delete-forever'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_inbox_dto_1.BulkIdsDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "deleteForever", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_inbox_dto_1.AddNoteDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "addNote", null);
__decorate([
    (0, common_1.Patch)(':id/draft'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_inbox_dto_1.SaveDraftDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Post)(':id/reply'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_inbox_dto_1.SendReplyDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "sendReply", null);
__decorate([
    (0, common_1.Post)('block'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_inbox_dto_1.BlockEmailDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "block", null);
__decorate([
    (0, common_1.Post)('unblock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_inbox_dto_1.BlockEmailDto]),
    __metadata("design:returntype", void 0)
], AdminEnquiriesController.prototype, "unblock", null);
exports.AdminEnquiriesController = AdminEnquiriesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/inbox'),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService])
], AdminEnquiriesController);
//# sourceMappingURL=admin-enquiries.controller.js.map