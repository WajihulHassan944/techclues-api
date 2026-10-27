import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from '../../database/schemas/settings.schema';
import { DEFAULT_TEMPLATES, SIGNATURE } from '../../common/constants/defaults';
import {
  DEFAULT_CALCULATOR_PRICING,
  DEFAULT_BUILD_ONE_PRICE,
} from '../../common/constants/pricing';
import { DEFAULT_SEO_GLOBALS } from '../../common/constants/seo-defaults';
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
        calculatorPricing: DEFAULT_CALCULATOR_PRICING,
        buildOnePrice: DEFAULT_BUILD_ONE_PRICE,
        seo: DEFAULT_SEO_GLOBALS,
      });
    } else {
      let dirty = false;
      // Backfills an existing Settings row created before pricing/seo existed on the schema — the
      // subdocument's own `default: {}` leaves its array fields empty rather than populated,
      // so a plain schema default only covers a brand-new document, not this case.
      if (!settings.calculatorPricing?.features?.length) {
        settings.calculatorPricing = DEFAULT_CALCULATOR_PRICING;
        if (!settings.buildOnePrice?.amount) settings.buildOnePrice = DEFAULT_BUILD_ONE_PRICE;
        dirty = true;
      }
      if (!settings.seo?.defaultTitle) {
        settings.seo = DEFAULT_SEO_GLOBALS;
        dirty = true;
      }
      if (dirty) await settings.save();
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
