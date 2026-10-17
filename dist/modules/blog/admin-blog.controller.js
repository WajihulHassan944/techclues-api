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
exports.AdminBlogController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const blog_service_1 = require("./blog.service");
const blog_post_dto_1 = require("./dto/blog-post.dto");
let AdminBlogController = class AdminBlogController {
    constructor(blog) {
        this.blog = blog;
    }
    list(status, category, page, pageSize) {
        return this.blog.list({
            status,
            category,
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        });
    }
    get(id) {
        return this.blog.findOne(id);
    }
    create(dto) {
        return this.blog.create({
            ...dto,
            scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        });
    }
    save(id, dto) {
        return this.blog.save(id, {
            ...dto,
            scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        });
    }
    duplicate(id) {
        return this.blog.duplicate(id);
    }
    async remove(id) {
        await this.blog.remove(id);
        return { ok: true };
    }
    async slugAvailable(slug, excludeId) {
        return { available: !(await this.blog.slugTaken(slug, excludeId)) };
    }
    listCategories() {
        return this.blog.listCategories();
    }
    createCategory(dto) {
        return this.blog.createCategory(dto.name);
    }
    renameCategory(id, dto) {
        return this.blog.renameCategory(id, dto.name);
    }
    async removeCategory(id) {
        await this.blog.removeCategory(id);
        return { ok: true };
    }
    listAuthors() {
        return this.blog.listAuthors();
    }
    createAuthor(dto) {
        return this.blog.createAuthor(dto.name, dto.role);
    }
    updateAuthor(id, dto) {
        return this.blog.updateAuthor(id, dto.name, dto.role);
    }
    async removeAuthor(id) {
        await this.blog.removeAuthor(id);
        return { ok: true };
    }
    async uploadImage(file) {
        return this.blog.uploadImage(file.buffer);
    }
};
exports.AdminBlogController = AdminBlogController;
__decorate([
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('posts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, blog_post_dto_1.UpdatePostDto]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "save", null);
__decorate([
    (0, common_1.Post)('posts/:id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Delete)('posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminBlogController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('slug-available'),
    __param(0, (0, common_1.Query)('slug')),
    __param(1, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminBlogController.prototype, "slugAvailable", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_post_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, blog_post_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "renameCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminBlogController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Get)('authors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "listAuthors", null);
__decorate([
    (0, common_1.Post)('authors'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_post_dto_1.CreateAuthorDto]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "createAuthor", null);
__decorate([
    (0, common_1.Patch)('authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, blog_post_dto_1.CreateAuthorDto]),
    __metadata("design:returntype", void 0)
], AdminBlogController.prototype, "updateAuthor", null);
__decorate([
    (0, common_1.Delete)('authors/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminBlogController.prototype, "removeAuthor", null);
__decorate([
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminBlogController.prototype, "uploadImage", null);
exports.AdminBlogController = AdminBlogController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/blog'),
    __metadata("design:paramtypes", [blog_service_1.BlogService])
], AdminBlogController);
//# sourceMappingURL=admin-blog.controller.js.map