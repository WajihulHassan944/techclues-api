import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CaseStudy, CaseStudyStatus } from '../../database/schemas/case-study.schema';
import { slugify } from '../../common/utils/slugify';
import { ActivityService } from '../activity/activity.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class CaseStudyService {
  constructor(
    @InjectModel(CaseStudy.name) private readonly model: Model<CaseStudy>,
    private readonly activity: ActivityService,
    private readonly cloudinary: CloudinaryService,
    private readonly media: MediaService,
  ) {}

  async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || 'case-study';
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
    return (await this.model.countDocuments(filter)) > 0;
  }

  async create(input: Partial<CaseStudy> & { title: string }) {
    const slug = await this.uniqueSlug(input.slug ?? input.title);
    const doc = await this.model.create({ ...input, slug, status: input.status ?? 'draft' });
    await this.activity.log('settings', `Created draft case study "${doc.title}"`);
    return doc;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Case study not found');
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Case study not found');
    return doc;
  }

  async findBySlug(slug: string) {
    const doc = await this.model.findOne({ slug });
    if (!doc) throw new NotFoundException('Case study not found');
    return doc;
  }

  async list(query: {
    status?: CaseStudyStatus;
    industry?: string;
    service?: string;
    page?: number;
    pageSize?: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.industry) filter.industry = query.industry;
    if (query.service) filter.services = query.service;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }

  async listPublic(query: {
    industry?: string;
    service?: string;
    featured?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const filter: Record<string, unknown> = { status: 'published' };
    if (query.industry) filter.industry = query.industry;
    if (query.service) filter.services = query.service;
    if (query.featured) filter.featured = true;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ featured: -1, publishedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select('-body')
        .lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }

  async save(id: string, patch: Partial<CaseStudy>) {
    const doc = await this.findOne(id);
    if (patch.slug && patch.slug !== doc.slug) {
      if (await this.slugTaken(patch.slug, id)) {
        patch.slug = await this.uniqueSlug(patch.slug, id);
      }
    }
    if (patch.status === 'published' && doc.status !== 'published' && !patch.publishedAt) {
      patch.publishedAt = new Date();
    }
    Object.assign(doc, patch);
    await doc.save();
    await this.activity.log('settings', `Updated case study "${doc.title}"`);
    return doc;
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    await doc.deleteOne();
    await this.activity.log('settings', `Deleted case study "${doc.title}"`);
  }

  async uploadImage(buffer: Buffer, filename = 'upload') {
    const result = await this.cloudinary.uploadBuffer(buffer, 'techclues/case-studies');
    await this.media.recordExisting({ url: result.url, publicId: result.publicId, filename }).catch(() => undefined);
    return result;
  }
}
