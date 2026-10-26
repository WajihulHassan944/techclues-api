import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from '../../database/schemas/settings.schema';
import { ActivityModule } from '../activity/activity.module';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PublicPricingController } from './public-pricing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }]),
    ActivityModule,
  ],
  providers: [SettingsService],
  controllers: [SettingsController, PublicPricingController],
  exports: [SettingsService],
})
export class SettingsModule {}
