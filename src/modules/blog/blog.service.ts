import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BlogAuthor, BlogCategory, BlogPost, PostStatus } from '../../database/schemas/blog.schema';
import { slugify } from '../../common/utils/slugify';
import { ActivityService } from '../activity/activity.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogPost.name) private readonly postModel: Model<BlogPost>,
    @InjectModel(BlogCategory.name) private readonly categoryModel: Model<BlogCategory>,
    @InjectModel(BlogAuthor.name) private readonly authorModel: Model<BlogAuthor>,
    private readonly activity: ActivityService,
    private readonly cloudinary: CloudinaryService,
    private readonly media: MediaService,
  ) {}

  async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || 'post';
    let slug = root;
    let n = 2;
    while (await this.slugTaken(slug, excludeId)) {
      slug = `${root}-${n}`;
      n += 1;
    }
    return slug;
  }

  async slugTaken(slug: string, excludeId?: string) {
    const filter: Record<string, unknown> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return (await this.postModel.countDocuments(filter)) > 0;
  }

  async create(input: Partial<BlogPost> & { title: string }) {
    const slug = await this.uniqueSlug(input.slug ?? input.title);
    const post = await this.postModel.create({ ...input, slug, status: input.status ?? 'draft' });
    await this.activity.log('blog', `Created draft post "${post.title}"`);
    return post;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Post not found');
    const doc = await this.postModel.findById(id);
    if (!doc) throw new NotFoundException('Post not found');
    return doc;
  }

  async findBySlug(slug: string) {
    const doc = await this.postModel.findOne({ slug });
    if (!doc) throw new NotFoundException('Post not found');
    return doc;
  }

  async list(query: { status?: PostStatus; category?: string; page?: number; pageSize?: number }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
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

  async listPublic(query: { page?: number; pageSize?: number }) {
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

  async withAuthorOne(post: BlogPost) {
    const author = await this.authorModel.findById(post.authorId).lean();
    return { ...post.toObject(), author: author ? { name: author.name, role: author.role } : null };
  }

  /** Public responses include the author's name/role inline, since there's no public authors endpoint. */
  private async withAuthor<T extends { authorId: string }>(
    items: T[],
  ): Promise<(T & { author: { name: string; role: string } | null })[]> {
    const ids = [...new Set(items.map((i) => i.authorId))];
    const authors = await this.authorModel.find({ _id: { $in: ids } }).lean();
    const byId = new Map(authors.map((a) => [String(a._id), { name: a.name, role: a.role }]));
    return items.map((i) => ({ ...i, author: byId.get(i.authorId) ?? null }));
  }

  async save(id: string, patch: Partial<BlogPost>) {
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

  async duplicate(id: string) {
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

  async remove(id: string) {
    const post = await this.findOne(id);
    await post.deleteOne();
    await this.activity.log('blog', `Deleted post "${post.title}"`);
  }

  /** Publishes any scheduled posts whose time has come. Called by the cron job. */
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

  // Categories
  listCategories() {
    return this.categoryModel.find().sort({ name: 1 }).lean();
  }

  async createCategory(name: string) {
    return this.categoryModel.create({ name });
  }

  async renameCategory(id: string, name: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    const oldName = category.name;
    category.name = name;
    await category.save();
    await this.postModel.updateMany({ category: oldName }, { category: name });
    return category;
  }

  async removeCategory(id: string) {
    await this.categoryModel.findByIdAndDelete(id);
  }

  // Authors
  listAuthors() {
    return this.authorModel.find().sort({ name: 1 }).lean();
  }

  async createAuthor(name: string, role: string) {
    return this.authorModel.create({ name, role });
  }

  async updateAuthor(id: string, name: string, role: string) {
    const author = await this.authorModel.findById(id);
    if (!author) throw new NotFoundException('Author not found');
    author.name = name;
    author.role = role;
    await author.save();
    return author;
  }

  async removeAuthor(id: string) {
    await this.authorModel.findByIdAndDelete(id);
  }

  async uploadImage(buffer: Buffer, filename = 'upload') {
    const result = await this.cloudinary.uploadBuffer(buffer, 'techclues/blog');
    await this.media.recordExisting({ url: result.url, publicId: result.publicId, filename }).catch(() => undefined);
    return result;
  }
}
