import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  @IsOptional()
  NODE_ENV?: string;

  @IsNumberString()
  @IsOptional()
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_EMAIL!: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_PASSWORD_HASH!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_TTL?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_TTL?: string;

  @IsString()
  @IsNotEmpty()
  NOTIFY_EMAIL!: string;

  @IsString()
  @IsNotEmpty()
  ALLOWED_ORIGINS!: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI!: string;

  @IsString()
  @IsOptional()
  MONGODB_URI_DEV?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  @IsString()
  @IsOptional()
  BREVO_API_KEY?: string;

  @IsString()
  @IsOptional()
  BREVO_SENDER_EMAIL?: string;

  @IsString()
  @IsOptional()
  BREVO_SENDER_NAME?: string;

  @IsString()
  @IsOptional()
  BREVO_LIST_ID?: string;

  @IsString()
  @IsOptional()
  PUSHER_APP_ID?: string;

  @IsString()
  @IsOptional()
  PUSHER_KEY?: string;

  @IsString()
  @IsOptional()
  PUSHER_SECRET?: string;

  @IsString()
  @IsOptional()
  PUSHER_CLUSTER?: string;

  @IsString()
  @IsOptional()
  TURNSTILE_SECRET?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n  ');
    throw new Error(
      `Config validation failed — missing or invalid environment variables:\n  ${messages}`,
    );
  }
  return validatedConfig;
}
