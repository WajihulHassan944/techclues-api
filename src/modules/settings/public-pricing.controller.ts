import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

/** Pricing is the only part of Settings the public site needs — the MVP cost calculator and the
 *  BUILD.ONE price shown in nav/footer/hero. Kept separate from the admin-only settings endpoint
 *  so recipients, templates etc. never leak to an unauthenticated request. */
@Controller('public/pricing')
export class PublicPricingController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  async get() {
    const settings = await this.settings.get();
    return { calculator: settings.calculatorPricing, buildOne: settings.buildOnePrice };
  }
}
