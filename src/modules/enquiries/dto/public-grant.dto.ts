import { IsEmail, IsOptional, IsString } from 'class-validator';

export class PublicGrantDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() role?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() legalName!: string;
  @IsString() @IsOptional() companyNumber?: string;
  @IsString() businessType!: string;
  @IsString() basedIn!: string;
  @IsString() employees!: string;
  @IsString() @IsOptional() turnover?: string;
  @IsString() @IsOptional() trading?: string;
  @IsString() project!: string;
  @IsString() @IsOptional() budget?: string;
  @IsString() @IsOptional() start?: string;
  @IsString() @IsOptional() match?: string;
  @IsString() @IsOptional() publicFunding?: string;
  @IsString() @IsOptional() about?: string;
  /** Honeypot — real visitors never fill this in. */
  @IsString() @IsOptional() website?: string;
}
