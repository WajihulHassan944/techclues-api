import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class PublicZeroOneDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() company?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @MinLength(1) idea!: string;
  @IsBoolean() @IsOptional() consent?: boolean;
  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() turnstileToken?: string;
}
