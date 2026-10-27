import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ADMIN_ROLES } from '../../../database/schemas/admin.schema';

export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(1) name!: string;
  @IsString() @MinLength(8) password!: string;
  @IsIn(ADMIN_ROLES) role!: (typeof ADMIN_ROLES)[number];
}

export class UpdateUserDto {
  @IsString() @IsOptional() name?: string;
  @IsIn(ADMIN_ROLES) @IsOptional() role?: (typeof ADMIN_ROLES)[number];
  @IsBoolean() @IsOptional() blocked?: boolean;
}

export class ResetUserPasswordDto {
  @IsString() @MinLength(8) password!: string;
}
