import { IsArray, IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { SUB_SOURCES, SUB_STATUSES } from '../../../database/schemas/subscriber.schema';

export class AddSubscriberDto {
  @IsEmail() email!: string;
  @IsString() @IsOptional() name?: string;
  @IsIn(SUB_SOURCES) @IsOptional() source?: (typeof SUB_SOURCES)[number];
}

export class SetSubStatusDto {
  @IsArray() @IsString({ each: true }) ids!: string[];
  @IsIn(SUB_STATUSES) status!: (typeof SUB_STATUSES)[number];
}

export class RemoveSubscribersDto {
  @IsArray() @IsString({ each: true }) ids!: string[];
}

export class ImportCsvDto {
  @IsIn(SUB_SOURCES) @IsOptional() source?: (typeof SUB_SOURCES)[number];
}

export class DeleteByEmailDto {
  @IsEmail() email!: string;
}
