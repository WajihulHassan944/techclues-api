import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class PublicChatDto {
  @IsString() @IsOptional() topic?: string;
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @MinLength(1) message!: string;
  /** Honeypot — real visitors never fill this in. */
  @IsString() @IsOptional() website?: string;
}
