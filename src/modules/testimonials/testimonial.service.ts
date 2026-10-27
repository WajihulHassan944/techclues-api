import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial } from '../../database/schemas/testimonial.schema';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectModel(Testimonial.name) private readonly model: Model<Testimonial>,
    private readonly activity: ActivityService,
  ) {}

  async listAll() {
    return this.model.find().sort({ order: 1 }).lean();
  }

  async listPublic() {
    return this.model.find({ published: true }).sort({ order: 1 }).lean();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Testimonial not found');
    return doc;
  }

  async create(input: { quote: string; name: string; role: string; initials?: string; photo?: string }) {
    const last = await this.model.findOne().sort({ order: -1 }).lean();
    const initials = input.initials?.trim() || input.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
    const doc = await this.model.create({ ...input, initials, order: (last?.order ?? -1) + 1 });
    await this.activity.log('testimonial', `Added a testimonial from "${input.name}"`);
    return doc;
  }

  async update(id: string, patch: Partial<Pick<Testimonial, 'quote' | 'name' | 'role' | 'initials' | 'photo' | 'published'>>) {
    const doc = await this.findOne(id);
    Object.assign(doc, patch);
    await doc.save();
    await this.activity.log('testimonial', `Updated the testimonial from "${doc.name}"`);
    return doc;
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    await doc.deleteOne();
    await this.activity.log('testimonial', `Deleted the testimonial from "${doc.name}"`);
  }

  async reorder(ids: string[]) {
    await Promise.all(ids.map((id, order) => this.model.updateOne({ _id: id }, { $set: { order } })));
  }
}
