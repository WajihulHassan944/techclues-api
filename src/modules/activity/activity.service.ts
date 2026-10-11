import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityKind } from '../../database/schemas/activity.schema';

const MAX_ENTRIES = 300;

@Injectable()
export class ActivityService {
  constructor(@InjectModel(Activity.name) private readonly model: Model<Activity>) {}

  async log(kind: ActivityKind, text: string) {
    await this.model.create({ kind, text, at: new Date() });
    const count = await this.model.countDocuments();
    if (count > MAX_ENTRIES) {
      const toRemove = await this.model
        .find()
        .sort({ at: 1 })
        .limit(count - MAX_ENTRIES)
        .select('_id');
      await this.model.deleteMany({ _id: { $in: toRemove.map((d) => d._id) } });
    }
  }

  async list(limit = 300) {
    return this.model.find().sort({ at: -1 }).limit(limit).lean();
  }

  async clear() {
    await this.model.deleteMany({});
  }

  async exportAll() {
    return this.model.find().sort({ at: -1 }).lean();
  }
}
