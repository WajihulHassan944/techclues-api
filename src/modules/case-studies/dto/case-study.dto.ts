import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CASE_STUDY_STATUSES } from '../../../database/schemas/case-study.schema';

class ResultDto {
  @IsString() value!: string;
  @IsString() label!: string;
}

class TestimonialDto {
  @IsString() @IsOptional() quote?: string;
  @IsString() @IsOptional() author?: string;
  @IsString() @IsOptional() role?: string;
}

export class CreateCaseStudyDto {
  @IsString() title!: string;
  @IsString() @IsOptional() slug?: string;
  @IsString() client!: string;
  @IsString() industry!: string;
  @IsArray() @IsString({ each: true }) @IsOptional() services?: string[];
  @IsString() excerpt!: string;
  @IsString() @IsOptional() body?: string;
  @IsString() @IsOptional() cover?: string;
  @IsString() @IsOptional() coverAlt?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() images?: string[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultDto)
  @IsOptional()
  results?: ResultDto[];
  @ValidateNested() @Type(() => TestimonialDto) @IsOptional() testimonial?: TestimonialDto;
  @IsIn(CASE_STUDY_STATUSES) @IsOptional() status?: (typeof CASE_STUDY_STATUSES)[number];
  @IsBoolean() @IsOptional() featured?: boolean;
  @IsString() @IsOptional() seoTitle?: string;
  @IsString() @IsOptional() seoDescription?: string;
}

export class UpdateCaseStudyDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() slug?: string;
  @IsString() @IsOptional() client?: string;
  @IsString() @IsOptional() industry?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() services?: string[];
  @IsString() @IsOptional() excerpt?: string;
  @IsString() @IsOptional() body?: string;
  @IsString() @IsOptional() cover?: string;
  @IsString() @IsOptional() coverAlt?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() images?: string[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultDto)
  @IsOptional()
  results?: ResultDto[];
  @ValidateNested() @Type(() => TestimonialDto) @IsOptional() testimonial?: TestimonialDto;
  @IsIn(CASE_STUDY_STATUSES) @IsOptional() status?: (typeof CASE_STUDY_STATUSES)[number];
  @IsBoolean() @IsOptional() featured?: boolean;
  @IsString() @IsOptional() seoTitle?: string;
  @IsString() @IsOptional() seoDescription?: string;
}
