"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const blog_schema_1 = require("../../database/schemas/blog.schema");
const activity_module_1 = require("../activity/activity.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const blog_service_1 = require("./blog.service");
const admin_blog_controller_1 = require("./admin-blog.controller");
const public_blog_controller_1 = require("./public-blog.controller");
let BlogModule = class BlogModule {
};
exports.BlogModule = BlogModule;
exports.BlogModule = BlogModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: blog_schema_1.BlogPost.name, schema: blog_schema_1.BlogPostSchema },
                { name: blog_schema_1.BlogCategory.name, schema: blog_schema_1.BlogCategorySchema },
                { name: blog_schema_1.BlogAuthor.name, schema: blog_schema_1.BlogAuthorSchema },
            ]),
            activity_module_1.ActivityModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        providers: [blog_service_1.BlogService],
        controllers: [admin_blog_controller_1.AdminBlogController, public_blog_controller_1.PublicBlogController],
        exports: [blog_service_1.BlogService],
    })
], BlogModule);
//# sourceMappingURL=blog.module.js.map