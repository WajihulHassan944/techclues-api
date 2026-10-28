import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaAsset } from '../../database/schemas/media-asset.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(MediaAsset.name) private readonly model: Model<MediaAsset>,
    private readonly cloudinary: CloudinaryService,
    private readonly activity: ActivityService,
  ) {}

  async list(query: { page?: number; pageSize?: number; search?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 48));
    const filter = query.search ? { filename: { $regex: query.search, $options: 'i' } } : {};
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, pageSize };
  }

  async upload(buffer: Buffer, filename: string, uploadedBy?: string) {
    const result = await this.cloudinary.uploadBufferWithMeta(buffer, 'techclues/media');
    const asset = await this.model.create({
      url: result.url,
      publicId: result.publicId,
      filename,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      uploadedBy,
    });
    await this.activity.log('settings', `Uploaded "${filename}" to the media library`);
    return asset;
  }

  /** Records an asset that was uploaded elsewhere (e.g. the blog or case-study editors) so it
   *  still shows up in the shared library, without changing how those uploads work. */
  async recordExisting(input: { url: string; publicId: string; filename: string; uploadedBy?: string }) {
    const existing = await this.model.findOne({ publicId: input.publicId });
    if (existing) return existing;
    return this.model.create(input);
  }

  async updateAltText(id: string, altText: string) {
    const asset = await this.model.findById(id);
    if (!asset) throw new NotFoundException('Asset not found');
    asset.altText = altText;
    await asset.save();
    return asset;
  }

  async remove(id: string) {
    const asset = await this.model.findById(id);
    if (!asset) throw new NotFoundException('Asset not found');
    await this.cloudinary.destroy(asset.publicId).catch(() => {});
    await asset.deleteOne();
    await this.activity.log('settings', `Deleted "${asset.filename}" from the media library`);
    return { ok: true };
  }
}
