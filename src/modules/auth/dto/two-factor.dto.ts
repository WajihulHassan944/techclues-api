import { IsString, MinLength } from 'class-validator';

export class TwoFactorLoginDto {
  @IsString() tempToken!: string;
  @IsString() @MinLength(6) code!: string;
}

export class TwoFactorEnableDto {
  @IsString() @MinLength(6) code!: string;
}

export class TwoFactorDisableDto {
  @IsString() @MinLength(1) password!: string;
}
