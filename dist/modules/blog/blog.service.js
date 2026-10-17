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
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const blog_schema_1 = require("../../database/schemas/blog.schema");
const slugify_1 = require("../../common/utils/slugify");
const activity_service_1 = require("../activity/activity.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let BlogService = class BlogService {
    constructor(postModel, categoryModel, authorModel, activity, cloudinary) {
        this.postModel = postModel;
        this.categoryModel = categoryModel;
        this.authorModel = authorModel;
        this.activity = activity;
        this.cloudinary = cloudinary;
    }
    async uniqueSlug(base, excludeId) {
        const root = (0, slugify_1.slugify)(base) || 'post';
        let slug = root;
        let n = 2;
        while (await this.slugTaken(slug, excludeId)) {
            slug = `${root}-${n}`;
            n += 1;
        }
        return slug;
    }
    async slugTaken(slug, excludeId) {
        const filter = { slug };
        if (excludeId)
            filter._id = { $ne: excludeId };
        return (await this.postModel.countDocuments(filter)) > 0;
    }
    async create(input) {
        const slug = await this.uniqueSlug(input.slug ?? input.title);
        const post = await this.postModel.create({ ...input, slug, status: input.status ?? 'draft' });
        await this.activity.log('blog', `Created draft post "${post.title}"`);
        return post;
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('Post not found');
        const doc = await this.postModel.findById(id);
        if (!doc)
            throw new common_1.NotFoundException('Post not found');
        return doc;
    }
    async findBySlug(slug) {
        const doc = await this.postModel.findOne({ slug });
        if (!doc)
            throw new common_1.NotFoundException('Post not found');
        return doc;
    }
    async list(query) {
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.category)
            filter.category = query.category;
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const [items, total] = await Promise.all([
            this.postModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            this.postModel.countDocuments(filter),
        ]);
        return { items, total, page, pageSize };
    }
    async listPublic(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const now = new Date();
        const filter = { status: 'published', publishedAt: { $lte: now } };
        const [items, total] = await Promise.all([
            this.postModel
                .find(filter)
                .sort({ publishedAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .select('-body')
                .lean(),
            this.postModel.countDocuments(filter),
        ]);
        return { items: await this.withAuthor(items), total, page, pageSize };
    }
    async withAuthorOne(post) {
        const author = await this.authorModel.findById(post.authorId).lean();
        return { ...post.toObject(), author: author ? { name: author.name, role: author.role } : null };
    }
    async withAuthor(items) {
        const ids = [...new Set(items.map((i) => i.authorId))];
        const authors = await this.authorModel.find({ _id: { $in: ids } }).lean();
        const byId = new Map(authors.map((a) => [String(a._id), { name: a.name, role: a.role }]));
        return items.map((i) => ({ ...i, author: byId.get(i.authorId) ?? null }));
    }
    async save(id, patch) {
        const post = await this.findOne(id);
        if (patch.slug && patch.slug !== post.slug) {
            if (await this.slugTaken(patch.slug, id)) {
                patch.slug = await this.uniqueSlug(patch.slug, id);
            }
        }
        if (patch.status === 'published' && post.status !== 'published' && !patch.publishedAt) {
            patch.publishedAt = new Date();
        }
        Object.assign(post, patch);
        await post.save();
        await this.activity.log('blog', `Updated post "${post.title}"`);
        return post;
    }
    async duplicate(id) {
        const post = await this.findOne(id);
        const slug = await this.uniqueSlug(`${post.title}-copy`);
        const copy = await this.postModel.create({
            title: `${post.title} (copy)`,
            slug,
            excerpt: post.excerpt,
            category: post.category,
            authorId: post.authorId,
            cover: post.cover,
            coverAlt: post.coverAlt,
            body: post.body,
            status: 'draft',
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
        });
        await this.activity.log('blog', `Duplicated post "${post.title}"`);
        return copy;
    }
    async remove(id) {
        const post = await this.findOne(id);
        await post.deleteOne();
        await this.activity.log('blog', `Deleted post "${post.title}"`);
    }
    async publishDuePosts() {
        const now = new Date();
        const due = await this.postModel.find({ status: 'scheduled', scheduledFor: { $lte: now } });
        for (const post of due) {
            post.status = 'published';
            post.publishedAt = post.scheduledFor ?? now;
            await post.save();
            await this.activity.log('blog', `Published scheduled post "${post.title}"`);
        }
        return due.length;
    }
    listCategories() {
        return this.categoryModel.find().sort({ name: 1 }).lean();
    }
    async createCategory(name) {
        return this.categoryModel.create({ name });
    }
    async renameCategory(id, name) {
        const category = await this.categoryModel.findById(id);
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        const oldName = category.name;
        category.name = name;
        await category.save();
        await this.postModel.updateMany({ category: oldName }, { category: name });
        return category;
    }
    async removeCategory(id) {
        await this.categoryModel.findByIdAndDelete(id);
    }
    listAuthors() {
        return this.authorModel.find().sort({ name: 1 }).lean();
    }
    async createAuthor(name, role) {
        return this.authorModel.create({ name, role });
    }
    async updateAuthor(id, name, role) {
        const author = await this.authorModel.findById(id);
        if (!author)
            throw new common_1.NotFoundException('Author not found');
        author.name = name;
        author.role = role;
        await author.save();
        return author;
    }
    async removeAuthor(id) {
        await this.authorModel.findByIdAndDelete(id);
    }
    async uploadImage(buffer) {
        return this.cloudinary.uploadBuffer(buffer, 'techclues/blog');
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blog_schema_1.BlogPost.name)),
    __param(1, (0, mongoose_1.InjectModel)(blog_schema_1.BlogCategory.name)),
    __param(2, (0, mongoose_1.InjectModel)(blog_schema_1.BlogAuthor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        activity_service_1.ActivityService,
        cloudinary_service_1.CloudinaryService])
], BlogService);
//# sourceMappingURL=blog.service.js.map