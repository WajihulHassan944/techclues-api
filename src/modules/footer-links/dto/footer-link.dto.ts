import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { FOOTER_GROUPS, FooterGroup } from '../../../database/schemas/footer-link.schema';

export class CreateFooterLinkDto {
  @IsIn(FOOTER_GROUPS) group!: FooterGroup;
  @IsString() label!: string;
  @IsString() href!: string;
  @IsBoolean() @IsOptional() newTab?: boolean;
}

export class UpdateFooterLinkDto {
  @IsIn(FOOTER_GROUPS) @IsOptional() group?: FooterGroup;
  @IsString() @IsOptional() label?: string;
  @IsString() @IsOptional() href?: string;
  @IsBoolean() @IsOptional() newTab?: boolean;
  @IsBoolean() @IsOptional() published?: boolean;
}

export class ReorderFooterLinksDto {
  @IsIn(FOOTER_GROUPS) group!: FooterGroup;
  @IsString({ each: true }) ids!: string[];
}
