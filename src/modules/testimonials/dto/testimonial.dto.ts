import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTestimonialDto {
  @IsString() quote!: string;
  @IsString() name!: string;
  @IsString() role!: string;
  @IsString() @IsOptional() initials?: string;
  @IsString() @IsOptional() photo?: string;
}

export class UpdateTestimonialDto {
  @IsString() @IsOptional() quote?: string;
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() role?: string;
  @IsString() @IsOptional() initials?: string;
  @IsString() @IsOptional() photo?: string;
  @IsBoolean() @IsOptional() published?: boolean;
}

export class ReorderTestimonialsDto {
  @IsArray() @ArrayNotEmpty() @IsString({ each: true }) ids!: string[];
}
