import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

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
}
