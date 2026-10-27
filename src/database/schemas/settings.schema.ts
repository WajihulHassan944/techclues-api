import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SourceKey } from './enquiry.schema';

@Schema({ _id: false })
class NotificationEvents {
  @Prop({ default: true })
  enquiry!: boolean;

  @Prop({ default: true })
  booking!: boolean;

  @Prop({ default: true })
  cancelled!: boolean;

  @Prop({ default: false })
  subscriber!: boolean;

  @Prop({ default: true })
  summary!: boolean;
}

@Schema({ _id: false })
export class ReplyTemplate {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  body!: string;

  // Mongoose defaults array paths to `[]` even with no explicit `default`, which would turn an
  // "every enquiry" template (sources left unset) into one that matches nothing — `[]` is a
  // false "only these sources" rather than "no restriction". `default: undefined` opts out.
  @Prop({ type: [String], default: undefined })
  sources?: SourceKey[];
}

@Schema({ _id: false })
class Retention {
  @Prop({ default: 30 })
  spamDays!: number;

  @Prop({ default: 0 })
  enquiryMonths!: number;
}

/** One line of the MVP cost calculator's goal/platform/pace steps — a multiplier applied to the feature total. */
@Schema({ _id: false })
export class CalculatorOption {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  text!: string;

  @Prop({ required: true })
  multiplier!: number;
}
export const CalculatorOptionSchema = SchemaFactory.createForClass(CalculatorOption);

/** One selectable feature in the MVP cost calculator, with its own cost and build time. */
@Schema({ _id: false })
export class CalculatorFeature {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  baseCost!: number;

  @Prop({ required: true })
  weeks!: number;
}
export const CalculatorFeatureSchema = SchemaFactory.createForClass(CalculatorFeature);

@Schema({ _id: false })
class CalculatorFloors {
  @Prop({ default: 5000 })
  mvp!: number;

  @Prop({ default: 10000 })
  full!: number;

  @Prop({ default: 0 })
  update!: number;
}

/** The full pricing model behind /mvp-cost-calculator — mirrors lib/calculator.ts on the frontend. */
@Schema({ _id: false })
export class CalculatorPricing {
  @Prop({ type: [CalculatorOptionSchema], default: [] })
  goals!: CalculatorOption[];

  @Prop({ type: [CalculatorOptionSchema], default: [] })
  platforms!: CalculatorOption[];

  @Prop({ type: [CalculatorFeatureSchema], default: [] })
  features!: CalculatorFeature[];

  @Prop({ type: [CalculatorOptionSchema], default: [] })
  paces!: CalculatorOption[];

  @Prop({ default: 2500 })
  setupFee!: number;

  @Prop({ type: CalculatorFloors, default: {} })
  floors!: CalculatorFloors;
}
export const CalculatorPricingSchema = SchemaFactory.createForClass(CalculatorPricing);

/** The flat BUILD.ONE sprint price shown in nav, footer and the /zero-one page. */
@Schema({ _id: false })
export class BuildOnePrice {
  @Prop({ default: 499 })
  amount!: number;

  @Prop({ default: '7 days' })
  durationLabel!: string;
}
export const BuildOnePriceSchema = SchemaFactory.createForClass(BuildOnePrice);

@Schema({ _id: false })
export class SeoGlobals {
  @Prop({ default: '' })
  googleAnalyticsId!: string;

  @Prop({ default: '' })
  googleSearchConsoleVerification!: string;

  @Prop({ default: '' })
  metaPixelId!: string;

  @Prop({ default: 'TechClues — ship a working MVP in days' })
  defaultTitle!: string;

  @Prop({ default: '' })
  defaultDescription!: string;

  @Prop({ default: '' })
  defaultOgImage!: string;
}
export const SeoGlobalsSchema = SchemaFactory.createForClass(SeoGlobals);

/** Singleton document — there is always exactly one Settings row. */
@Schema({ timestamps: true })
export class Settings extends Document {
  @Prop({ type: [String], default: ['info@techclues.co.uk'] })
  recipients!: string[];

  @Prop({ type: NotificationEvents, default: {} })
  events!: NotificationEvents;

  @Prop({ default: '08:00' })
  summaryTime!: string;

  @Prop({ default: 'TechClues' })
  fromName!: string;

  @Prop({ default: '' })
  signature!: string;

  @Prop({ type: [ReplyTemplate], default: [] })
  templates!: ReplyTemplate[];

  @Prop({ type: Retention, default: {} })
  retention!: Retention;

  @Prop({ type: CalculatorPricing, default: {} })
  calculatorPricing!: CalculatorPricing;

  @Prop({ type: BuildOnePrice, default: {} })
  buildOnePrice!: BuildOnePrice;

  @Prop({ type: SeoGlobals, default: {} })
  seo!: SeoGlobals;

  @Prop()
  passwordChangedAt?: Date;
}
export const SettingsSchema = SchemaFactory.createForClass(Settings);
