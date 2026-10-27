import { IsObject, IsString } from 'class-validator';

export class UpdatePageContentDto {
  @IsObject() blocks!: Record<string, string>;
}

export class SeedPageContentDto {
  @IsString() page!: string;
  @IsObject() blocks!: Record<string, string>;
}
