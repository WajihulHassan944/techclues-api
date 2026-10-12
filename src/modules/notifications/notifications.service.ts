import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from '../../database/schemas/notification.schema';
import { PusherService } from '../pusher/pusher.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly model: Model<Notification>,
    private readonly pusher: PusherService,
  ) {}

  async create(type: NotificationType, message: string, link?: string) {
    const doc = await this.model.create({ type, message, link, read: false, at: new Date() });
    await this.pusher.trigger('notification.created', {
      id: String(doc._id),
      type,
      message,
      link,
      at: doc.at.toISOString(),
    });
    return doc;
  }

  async list(limit = 20) {
    const [items, unread] = await Promise.all([
      this.model.find().sort({ at: -1 }).limit(limit).lean(),
      this.model.countDocuments({ read: false }),
    ]);
    return { items, unread };
  }

  async markAllRead() {
    await this.model.updateMany({ read: false }, { read: true });
  }

  async markRead(id: string) {
    await this.model.updateOne({ _id: id }, { read: true });
  }
}
