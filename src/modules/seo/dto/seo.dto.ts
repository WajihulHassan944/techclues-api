import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { SCHEMA_TYPES } from '../../../database/schemas/seo-entry.schema';

export class UpsertSeoEntryDto {
  @IsString() @MinLength(1) path!: string;
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() canonical?: string;
  @IsString() @IsOptional() ogTitle?: string;
  @IsString() @IsOptional() ogDescription?: string;
  @IsString() @IsOptional() ogImage?: string;
  @IsString() @IsOptional() twitterCard?: string;
  @IsBoolean() @IsOptional() noindex?: boolean;
  @IsIn(SCHEMA_TYPES) @IsOptional() schemaType?: (typeof SCHEMA_TYPES)[number];
  @IsString() @IsOptional() schemaJson?: string;
  @IsBoolean() @IsOptional() includeInSitemap?: boolean;
}

export class CreateRedirectDto {
  @IsString() @MinLength(1) from!: string;
  @IsString() @MinLength(1) to!: string;
  @IsIn([301, 302]) @IsOptional() statusCode?: 301 | 302;
}

export class UpdateRedirectDto {
  @IsString() @IsOptional() to?: string;
  @IsIn([301, 302]) @IsOptional() statusCode?: 301 | 302;
}

export class Report404Dto {
  @IsString() @MinLength(1) path!: string;
  @IsString() @IsOptional() referrer?: string;
}
