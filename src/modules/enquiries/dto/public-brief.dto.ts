import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ResultCardDto {
  @IsString() title!: string;
  @IsString() headline!: string;
  @IsString({ each: true }) lines!: string[];
}

/** MVP cost calculator ("brief") submission. */
export class PublicBriefDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() company?: string;

  @IsString() @IsOptional() platform?: string;
  @IsString() @IsOptional() goal?: string;
  @IsString() @IsOptional() features?: string;
  @IsString() @IsOptional() pace?: string;

  @ValidateNested()
  @Type(() => ResultCardDto)
  @IsOptional()
  result?: ResultCardDto;

  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() turnstileToken?: string;
}
