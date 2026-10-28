import { IsIn, IsOptional, IsString } from 'class-validator';
import { TRANSACTIONAL_EMAIL_KEYS } from '../../../database/schemas/transactional-email.schema';

export class UpdateTransactionalEmailDto {
  @IsIn(TRANSACTIONAL_EMAIL_KEYS) key!: (typeof TRANSACTIONAL_EMAIL_KEYS)[number];
  @IsString() @IsOptional() subject?: string;
  @IsString() @IsOptional() heading?: string;
  @IsString() @IsOptional() bodyText?: string;
}
