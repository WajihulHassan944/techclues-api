import { IsEmail, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

export class PublicCreateBookingDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() company?: string;
  @IsISO8601() start!: string;
  @IsString() @MinLength(1) topic!: string;
  @IsString() @IsOptional() via?: string;
  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() turnstileToken?: string;
}
