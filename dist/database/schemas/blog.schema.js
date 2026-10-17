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
exports.BlogPostSchema = exports.BlogPost = exports.BlogCategorySchema = exports.BlogCategory = exports.BlogAuthorSchema = exports.BlogAuthor = exports.POST_STATUSES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.POST_STATUSES = ['draft', 'scheduled', 'published'];
let BlogAuthor = class BlogAuthor extends mongoose_2.Document {
};
exports.BlogAuthor = BlogAuthor;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BlogAuthor.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BlogAuthor.prototype, "role", void 0);
exports.BlogAuthor = BlogAuthor = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BlogAuthor);
exports.BlogAuthorSchema = mongoose_1.SchemaFactory.createForClass(BlogAuthor);
let BlogCategory = class BlogCategory extends mongoose_2.Document {
};
exports.BlogCategory = BlogCategory;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], BlogCategory.prototype, "name", void 0);
exports.BlogCategory = BlogCategory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BlogCategory);
exports.BlogCategorySchema = mongoose_1.SchemaFactory.createForClass(BlogCategory);
let BlogPost = class BlogPost extends mongoose_2.Document {
};
exports.BlogPost = BlogPost;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], BlogPost.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BlogPost.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BlogPost.prototype, "excerpt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BlogPost.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BlogPost.prototype, "authorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], BlogPost.prototype, "cover", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BlogPost.prototype, "coverAlt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BlogPost.prototype, "body", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: exports.POST_STATUSES, default: 'draft' }),
    __metadata("design:type", String)
], BlogPost.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], BlogPost.prototype, "publishedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], BlogPost.prototype, "scheduledFor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BlogPost.prototype, "seoTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BlogPost.prototype, "seoDescription", void 0);
exports.BlogPost = BlogPost = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BlogPost);
exports.BlogPostSchema = mongoose_1.SchemaFactory.createForClass(BlogPost);
exports.BlogPostSchema.index({ status: 1, publishedAt: -1 });
//# sourceMappingURL=blog.schema.js.map