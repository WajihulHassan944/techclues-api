import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq } from '../../database/schemas/faq.schema';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<Faq>,
    private readonly activity: ActivityService,
  ) {}

  /** All FAQs, grouped and ordered — used by the admin panel. */
  async listAll() {
    return this.faqModel.find().sort({ group: 1, order: 1 }).lean();
  }

  /** Every group key currently in use, with a count — lets the admin pick a page/section to edit. */
  async listGroups() {
    const rows = await this.faqModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$group', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ group: r._id, count: r.count }));
  }

  /** Published FAQs grouped by page/section — used by the public site, shaped to match
   *  the old static `serviceFaqs` map so every consuming page needs only a one-line change. */
  async listPublicGrouped(): Promise<Record<string, { q: string; a: string }[]>> {
    const rows = await this.faqModel.find({ published: true }).sort({ group: 1, order: 1 }).lean();
    const out: Record<string, { q: string; a: string }[]> = {};
    for (const r of rows) {
      (out[r.group] ??= []).push({ q: r.question, a: r.answer });
    }
    return out;
  }

  async findOne(id: string) {
    const doc = await this.faqModel.findById(id);
    if (!doc) throw new NotFoundException('FAQ not found');
    return doc;
  }

  async create(input: { group: string; question: string; answer: string }) {
    const last = await this.faqModel.findOne({ group: input.group }).sort({ order: -1 }).lean();
    const faq = await this.faqModel.create({ ...input, order: (last?.order ?? -1) + 1 });
    await this.activity.log('faq', `Added a question to "${input.group}"`);
    return faq;
  }

  async update(
    id: string,
    patch: Partial<Pick<Faq, 'group' | 'question' | 'answer' | 'published'>>,
  ) {
    const faq = await this.findOne(id);
    Object.assign(faq, patch);
    await faq.save();
    await this.activity.log('faq', `Updated a question in "${faq.group}"`);
    return faq;
  }

  async remove(id: string) {
    const faq = await this.findOne(id);
    await faq.deleteOne();
    await this.activity.log('faq', `Deleted a question from "${faq.group}"`);
  }

  /** Applies a new sequential order to a group's items, in the order of the given ids. */
  async reorder(group: string, ids: string[]) {
    await Promise.all(
      ids.map((id, order) => this.faqModel.updateOne({ _id: id, group }, { $set: { order } })),
    );
  }
}
