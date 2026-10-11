import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SubscribeDto {
  @IsEmail() email!: string;
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() website?: string;
}

export class UnsubscribeQueryDto {
  @IsString() token!: string;
}
