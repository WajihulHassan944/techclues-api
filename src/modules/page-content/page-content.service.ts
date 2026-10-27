import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageContent } from '../../database/schemas/page-content.schema';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class PageContentService {
  constructor(
    @InjectModel(PageContent.name) private readonly model: Model<PageContent>,
    private readonly activity: ActivityService,
  ) {}

  async get(page: string) {
    const doc = await this.model.findOne({ page }).lean();
    return doc ? Object.fromEntries(doc.blocks as unknown as Map<string, string>) : {};
  }

  /** Upserts the given keys without clobbering keys this call doesn't mention. */
  async update(page: string, patch: Record<string, string>) {
    for (const key of Object.keys(patch)) {
      if (key.includes('.')) {
        throw new BadRequestException(`Block key "${key}" cannot contain "." — Mongo treats it as nesting.`);
      }
    }
    const doc = await this.model.findOneAndUpdate(
      { page },
      { $set: Object.fromEntries(Object.entries(patch).map(([k, v]) => [`blocks.${k}`, v])) },
      { upsert: true, new: true },
    );
    await this.activity.log('settings', `Updated "${page}" page content`);
    return Object.fromEntries(doc.blocks as unknown as Map<string, string>);
  }

  /** Seeds defaults only for keys not already present — never overwrites an admin's edit. */
  async seedDefaults(page: string, defaults: Record<string, string>) {
    const existing = await this.model.findOne({ page }).lean();
    const have = existing ? new Set(Object.keys(existing.blocks as unknown as Map<string, string>)) : new Set<string>();
    const missing = Object.fromEntries(Object.entries(defaults).filter(([k]) => !have.has(k)));
    if (Object.keys(missing).length === 0) return;
    await this.model.findOneAndUpdate(
      { page },
      { $set: Object.fromEntries(Object.entries(missing).map(([k, v]) => [`blocks.${k}`, v])) },
      { upsert: true },
    );
  }
}
