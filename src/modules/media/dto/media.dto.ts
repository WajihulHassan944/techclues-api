import { IsString } from 'class-validator';

export class UpdateMediaAssetDto {
  @IsString() altText!: string;
}
