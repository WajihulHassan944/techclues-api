import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsString() @MinLength(1) name!: string;
  @IsString() @MinLength(1) subject!: string;
  @IsString() bodyHtml!: string;
}

export class UpdateEmailTemplateDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() subject?: string;
  @IsString() @IsOptional() bodyHtml?: string;
}
