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
exports.PublicBlogController = void 0;
const common_1 = require("@nestjs/common");
const blog_service_1 = require("./blog.service");
let PublicBlogController = class PublicBlogController {
    constructor(blog) {
        this.blog = blog;
    }
    list(page, pageSize) {
        return this.blog.listPublic({
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        });
    }
    async get(slug) {
        const post = await this.blog.findBySlug(slug);
        if (post.status !== 'published')
            throw new common_1.NotFoundException('Post not found');
        return this.blog.withAuthorOne(post);
    }
};
exports.PublicBlogController = PublicBlogController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicBlogController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicBlogController.prototype, "get", null);
exports.PublicBlogController = PublicBlogController = __decorate([
    (0, common_1.Controller)('public/blog'),
    __metadata("design:paramtypes", [blog_service_1.BlogService])
], PublicBlogController);
//# sourceMappingURL=public-blog.controller.js.map