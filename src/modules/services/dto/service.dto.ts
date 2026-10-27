import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {
  @IsString() @IsOptional() cardTitle?: string;
  @IsString() @IsOptional() cardDescription?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() features?: string[];
  @IsString() @IsOptional() heroEyebrow?: string;
  @IsString() @IsOptional() heroHeadline?: string;
  @IsString() @IsOptional() heroSubheading?: string;
}

export class ReorderServicesDto {
  @IsArray() @IsString({ each: true }) slugs!: string[];
}
