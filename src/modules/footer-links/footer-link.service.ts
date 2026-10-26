import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FOOTER_GROUPS, FooterGroup, FooterLink } from '../../database/schemas/footer-link.schema';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class FooterLinkService {
  constructor(
    @InjectModel(FooterLink.name) private readonly model: Model<FooterLink>,
    private readonly activity: ActivityService,
  ) {}

  async listAll() {
    return this.model.find().sort({ group: 1, order: 1 }).lean();
  }

  /** Published links grouped by column — used by the public footer. */
  async listPublicGrouped(): Promise<
    Record<FooterGroup, { label: string; href: string; newTab: boolean }[]>
  > {
    const rows = await this.model.find({ published: true }).sort({ group: 1, order: 1 }).lean();
    const out = Object.fromEntries(FOOTER_GROUPS.map((g) => [g, []])) as unknown as Record<
      FooterGroup,
      { label: string; href: string; newTab: boolean }[]
    >;
    for (const r of rows) out[r.group].push({ label: r.label, href: r.href, newTab: r.newTab });
    return out;
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Footer link not found');
    return doc;
  }

  async create(input: { group: FooterGroup; label: string; href: string; newTab?: boolean }) {
    const last = await this.model.findOne({ group: input.group }).sort({ order: -1 }).lean();
    const link = await this.model.create({ ...input, order: (last?.order ?? -1) + 1 });
    await this.activity.log('settings', `Added a footer link to "${input.group}"`);
    return link;
  }

  async update(
    id: string,
    patch: Partial<Pick<FooterLink, 'group' | 'label' | 'href' | 'newTab' | 'published'>>,
  ) {
    const link = await this.findOne(id);
    Object.assign(link, patch);
    await link.save();
    await this.activity.log('settings', `Updated a footer link in "${link.group}"`);
    return link;
  }

  async remove(id: string) {
    const link = await this.findOne(id);
    await link.deleteOne();
    await this.activity.log('settings', `Deleted a footer link from "${link.group}"`);
  }

  async reorder(group: FooterGroup, ids: string[]) {
    await Promise.all(
      ids.map((id, order) => this.model.updateOne({ _id: id, group }, { $set: { order } })),
    );
  }
}
