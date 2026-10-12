import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @IsString() group!: string;
  @IsString() question!: string;
  @IsString() answer!: string;
}

export class UpdateFaqDto {
  @IsString() @IsOptional() group?: string;
  @IsString() @IsOptional() question?: string;
  @IsString() @IsOptional() answer?: string;
  @IsBoolean() @IsOptional() published?: boolean;
}

export class ReorderFaqDto {
  @IsString() group!: string;
  @IsArray() @ArrayNotEmpty() @IsString({ each: true }) ids!: string[];
}
