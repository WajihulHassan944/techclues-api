import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class PublicContactDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() company?: string;
  @IsString() @MinLength(1) message!: string;
  @IsArray() @IsOptional() needs?: string[];
  @IsString() @IsOptional() budget?: string;
  @IsString() @IsOptional() other?: string;
  @IsBoolean() @IsOptional() consent?: boolean;
  /** Honeypot — real visitors never fill this in. */
  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() turnstileToken?: string;
}
