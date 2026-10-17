import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from '../../database/schemas/settings.schema';
import { DEFAULT_TEMPLATES, SIGNATURE } from '../../common/constants/defaults';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private readonly model: Model<Settings>,
    private readonly activity: ActivityService,
  ) {}

  async get(): Promise<Settings> {
    let settings = await this.model.findOne();
    if (!settings) {
      settings = await this.model.create({
        recipients: ['info@techclues.co.uk'],
        events: { enquiry: true, booking: true, cancelled: true, subscriber: false, summary: true },
        summaryTime: '08:00',
        fromName: 'TechClues',
        signature: SIGNATURE,
        templates: DEFAULT_TEMPLATES,
        retention: { spamDays: 30, enquiryMonths: 0 },
      });
    }
    return settings;
  }

  async update(patch: Partial<Settings>, activityText?: string) {
    const settings = await this.get();
    Object.assign(settings, patch);
    await settings.save();
    if (activityText) await this.activity.log('settings', activityText);
    return settings;
  }
}
