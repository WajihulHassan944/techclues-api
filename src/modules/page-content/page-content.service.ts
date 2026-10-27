import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageContent } from '../../database/schemas/page-content.schema';
import { ActivityService } from '../activity/activity.service';

/** `.lean()` returns a Map field as a plain object, not a Map instance — normalise either shape. */
function blocksToObject(blocks: Map<string, string> | Record<string, string> | undefined): Record<string, string> {
  if (!blocks) return {};
  return blocks instanceof Map ? Object.fromEntries(blocks) : blocks;
}

@Injectable()
export class PageContentService {
  constructor(
    @InjectModel(PageContent.name) private readonly model: Model<PageContent>,
    private readonly activity: ActivityService,
  ) {}

  async get(page: string) {
    const doc = await this.model.findOne({ page }).lean();
    return blocksToObject(doc?.blocks as Map<string, string> | Record<string, string> | undefined);
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
    return blocksToObject(doc.blocks);
  }

  /** Seeds defaults only for keys not already present — never overwrites an admin's edit. */
  async seedDefaults(page: string, defaults: Record<string, string>) {
    const existing = await this.model.findOne({ page }).lean();
    const have = new Set(Object.keys(blocksToObject(existing?.blocks as Map<string, string> | Record<string, string> | undefined)));
    const missing = Object.fromEntries(Object.entries(defaults).filter(([k]) => !have.has(k)));
    if (Object.keys(missing).length === 0) return;
    await this.model.findOneAndUpdate(
      { page },
      { $set: Object.fromEntries(Object.entries(missing).map(([k, v]) => [`blocks.${k}`, v])) },
      { upsert: true },
    );
  }
}
