import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class PublicPartnerDto {
  @IsIn(['join', 'refer']) mode!: 'join' | 'refer';
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() company?: string;
  @IsString() @IsOptional() phone?: string;
  // join mode
  @IsString() @IsOptional() kind?: string;
  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() reach?: string;
  @IsString() @IsOptional() volume?: string;
  @IsString() @IsOptional() notes?: string;
  // refer mode
  @IsString() @IsOptional() clientName?: string;
  @IsString() @IsOptional() clientCompany?: string;
  @IsString() @IsOptional() clientEmail?: string;
  @IsString() @IsOptional() clientPhone?: string;
  @IsString() @IsOptional() projectType?: string;
  @IsString() @IsOptional() budget?: string;
  /** Honeypot — real visitors never fill this in. */
  @IsString() @IsOptional() honeypot?: string;
}
