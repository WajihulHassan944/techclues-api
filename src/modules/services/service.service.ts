import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from '../../database/schemas/service.schema';
import { ActivityService } from '../activity/activity.service';
import { UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private readonly model: Model<Service>,
    private readonly activity: ActivityService,
  ) {}

  async listAll() {
    return this.model.find().sort({ order: 1 }).lean();
  }

  async listPublic() {
    return this.model.find().sort({ order: 1 }).lean();
  }

  async getPublic(slug: string) {
    return this.model.findOne({ slug }).lean();
  }

  async update(slug: string, patch: UpdateServiceDto) {
    const service = await this.model.findOne({ slug });
    if (!service) throw new NotFoundException('Service not found');
    Object.assign(service, patch);
    await service.save();
    await this.activity.log('settings', `Updated the "${service.cardTitle}" service page`);
    return service;
  }

  async reorder(slugs: string[]) {
    await Promise.all(slugs.map((slug, order) => this.model.updateOne({ slug }, { $set: { order } })));
  }
}
