import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { FOLDERS, STATUS_KEYS } from '../../../database/schemas/enquiry.schema';

export class BulkIdsDto {
  @IsArray() @IsString({ each: true }) ids!: string[];
}

export class SetReadDto extends BulkIdsDto {
  @IsBoolean() read!: boolean;
}

export class SetStatusDto extends BulkIdsDto {
  @IsIn(STATUS_KEYS) status!: (typeof STATUS_KEYS)[number];
}

export class MoveFolderDto extends BulkIdsDto {
  @IsIn(FOLDERS) folder!: (typeof FOLDERS)[number];
}

export class AddNoteDto {
  @IsString() body!: string;
}

export class SendReplyDto {
  @IsString() body!: string;
  @IsString() @IsOptional() templateId?: string;
}

export class SaveDraftDto {
  @IsString() draft!: string;
}

export class BlockEmailDto {
  @IsString() email!: string;
}
