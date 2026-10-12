import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class PublicCareersDto {
  @IsArray() @IsOptional() areas?: string[];
  @IsString() @IsOptional() other?: string;
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() location?: string;
  @IsString() @IsOptional() link?: string;
  @IsString() @MinLength(1) message!: string;
  /** Honeypot — real visitors never fill this in. */
  @IsString() @IsOptional() website?: string;
}
