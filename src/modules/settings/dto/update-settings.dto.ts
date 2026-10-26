import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class NotifyEventsDto {
  @IsBoolean() @IsOptional() enquiry?: boolean;
  @IsBoolean() @IsOptional() booking?: boolean;
  @IsBoolean() @IsOptional() cancelled?: boolean;
  @IsBoolean() @IsOptional() subscriber?: boolean;
  @IsBoolean() @IsOptional() summary?: boolean;
}

class RetentionDto {
  @IsOptional() spamDays?: number;
  @IsOptional() enquiryMonths?: number;
}

export class ReplyTemplateDto {
  @IsString() id!: string;
  @IsString() label!: string;
  @IsString() body!: string;
  @IsArray() @IsOptional() sources?: string[];
}

class CalculatorOptionDto {
  @IsString() id!: string;
  @IsString() name!: string;
  @IsString() text!: string;
  @IsNumber() multiplier!: number;
}

class CalculatorFeatureDto {
  @IsString() id!: string;
  @IsString() name!: string;
  @IsNumber() baseCost!: number;
  @IsNumber() weeks!: number;
}

class CalculatorFloorsDto {
  @IsNumber() @IsOptional() mvp?: number;
  @IsNumber() @IsOptional() full?: number;
  @IsNumber() @IsOptional() update?: number;
}

export class CalculatorPricingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculatorOptionDto)
  @IsOptional()
  goals?: CalculatorOptionDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculatorOptionDto)
  @IsOptional()
  platforms?: CalculatorOptionDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculatorFeatureDto)
  @IsOptional()
  features?: CalculatorFeatureDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculatorOptionDto)
  @IsOptional()
  paces?: CalculatorOptionDto[];
  @IsNumber() @IsOptional() setupFee?: number;
  @ValidateNested() @Type(() => CalculatorFloorsDto) @IsOptional() floors?: CalculatorFloorsDto;
}

export class BuildOnePriceDto {
  @IsNumber() @IsOptional() amount?: number;
  @IsString() @IsOptional() durationLabel?: string;
}

export class UpdateSettingsDto {
  @IsArray() @IsOptional() recipients?: string[];

  @ValidateNested()
  @Type(() => NotifyEventsDto)
  @IsOptional()
  events?: NotifyEventsDto;

  @IsString() @IsOptional() summaryTime?: string;
  @IsString() @IsOptional() fromName?: string;
  @IsString() @IsOptional() signature?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplyTemplateDto)
  @IsOptional()
  templates?: ReplyTemplateDto[];

  @ValidateNested()
  @Type(() => RetentionDto)
  @IsOptional()
  retention?: RetentionDto;

  @ValidateNested()
  @Type(() => CalculatorPricingDto)
  @IsOptional()
  calculatorPricing?: CalculatorPricingDto;

  @ValidateNested()
  @Type(() => BuildOnePriceDto)
  @IsOptional()
  buildOnePrice?: BuildOnePriceDto;
}
