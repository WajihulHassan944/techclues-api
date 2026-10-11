import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';
import { POST_STATUSES } from '../../../database/schemas/blog.schema';

export class CreatePostDto {
  @IsString() title!: string;
  @IsString() @IsOptional() slug?: string;
  @IsString() excerpt!: string;
  @IsString() category!: string;
  @IsString() authorId!: string;
  @IsString() @IsOptional() cover?: string;
  @IsString() @IsOptional() coverAlt?: string;
  @IsString() body!: string;
  @IsIn(POST_STATUSES) @IsOptional() status?: (typeof POST_STATUSES)[number];
  @IsISO8601() @IsOptional() scheduledFor?: string;
  @IsString() @IsOptional() seoTitle?: string;
  @IsString() @IsOptional() seoDescription?: string;
}

export class UpdatePostDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() slug?: string;
  @IsString() @IsOptional() excerpt?: string;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() authorId?: string;
  @IsString() @IsOptional() cover?: string;
  @IsString() @IsOptional() coverAlt?: string;
  @IsString() @IsOptional() body?: string;
  @IsIn(POST_STATUSES) @IsOptional() status?: (typeof POST_STATUSES)[number];
  @IsISO8601() @IsOptional() scheduledFor?: string;
  @IsString() @IsOptional() seoTitle?: string;
  @IsString() @IsOptional() seoDescription?: string;
}

export class CreateCategoryDto {
  @IsString() name!: string;
}

export class CreateAuthorDto {
  @IsString() name!: string;
  @IsString() role!: string;
}
