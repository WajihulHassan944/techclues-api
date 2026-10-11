import { IsOptional, IsString } from 'class-validator';

export class PublicAvailabilityQueryDto {
  @IsString() from!: string;
  @IsString() to!: string;
  @IsString() @IsOptional() tz?: string;
}
