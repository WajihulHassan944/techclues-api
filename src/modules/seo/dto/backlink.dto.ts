import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { BACKLINK_STATUSES, BACKLINK_TYPES } from '../../../database/schemas/backlink.schema';

export class CreateBacklinkDto {
  @IsString() @MinLength(1) sourceUrl!: string;
  @IsString() @IsOptional() targetPath?: string;
  @IsString() @IsOptional() anchorText?: string;
  @IsIn(BACKLINK_TYPES) @IsOptional() type?: (typeof BACKLINK_TYPES)[number];
  @IsIn(BACKLINK_STATUSES) @IsOptional() status?: (typeof BACKLINK_STATUSES)[number];
  @IsNumber() @IsOptional() domainRating?: number;
  @IsBoolean() @IsOptional() nofollow?: boolean;
  @IsString() @IsOptional() notes?: string;
}

export class UpdateBacklinkDto {
  @IsString() @IsOptional() sourceUrl?: string;
  @IsString() @IsOptional() targetPath?: string;
  @IsString() @IsOptional() anchorText?: string;
  @IsIn(BACKLINK_TYPES) @IsOptional() type?: (typeof BACKLINK_TYPES)[number];
  @IsIn(BACKLINK_STATUSES) @IsOptional() status?: (typeof BACKLINK_STATUSES)[number];
  @IsNumber() @IsOptional() domainRating?: number;
  @IsBoolean() @IsOptional() nofollow?: boolean;
  @IsString() @IsOptional() notes?: string;
}
