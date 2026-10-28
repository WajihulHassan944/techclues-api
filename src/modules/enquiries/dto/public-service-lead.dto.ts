import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const STAFF_NEEDS = [
  'One specialist',
  'A full team',
  'Short-term coverage',
  'Not sure yet',
] as const;
export const GAME_NEEDS = [
  'Just a concept',
  'Prototype or vertical slice built',
  'In production, need capacity',
  'Live title, need live ops',
] as const;
export const AI_NEEDS = [
  'Not sure where to start',
  'Have a specific workflow to automate',
  'Already built something, needs work',
  'Want an AI feature added to our product',
] as const;

/** Shared shape of the "tell us what you need" lead forms on the service pages. */
class ServiceLeadBase {
  @IsString() @MaxLength(80) firstName!: string;
  @IsString() @MaxLength(80) lastName!: string;
  @IsEmail() email!: string;
  @IsString() @IsOptional() @MaxLength(120) company?: string;
  @IsString() @IsOptional() @MaxLength(8) phoneCode?: string;
  @IsString() @IsOptional() @MaxLength(40) phone?: string;
  @IsString() @IsOptional() @MaxLength(4000) brief?: string;
  @IsBoolean() consent!: boolean;
  @IsBoolean() @IsOptional() marketingConsent?: boolean;
  /** Honeypot: real visitors never fill this in. */
  @IsString() @IsOptional() website?: string;
}

export class PublicStaffAugmentationDto extends ServiceLeadBase {
  @IsIn(STAFF_NEEDS as unknown as string[]) need!: string;
  @IsString() @IsOptional() companySize?: string;
  @IsString() @IsOptional() timeline?: string;
}

export class PublicGameDevelopmentDto extends ServiceLeadBase {
  @IsIn(GAME_NEEDS as unknown as string[]) need!: string;
}

export class PublicAiEnablementDto extends ServiceLeadBase {
  @IsIn(AI_NEEDS as unknown as string[]) need!: string;
}
