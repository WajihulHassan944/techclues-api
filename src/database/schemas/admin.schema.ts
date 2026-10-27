import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const ADMIN_ROLES = ['super_admin', 'admin', 'editor', 'seo_manager', 'staff'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ trim: true })
  name?: string;

  @Prop({ required: true, enum: ADMIN_ROLES, default: 'admin' })
  role!: AdminRole;

  /** A blocked account can no longer sign in, but its record (and activity history) is kept. */
  @Prop({ required: true, default: false })
  blocked!: boolean;

  @Prop()
  refreshTokenHash?: string;

  @Prop({ default: 0 })
  failedLoginAttempts!: number;

  @Prop()
  lockUntil?: Date;

  @Prop()
  passwordChangedAt?: Date;

  /** Bumped on password change / "sign out everywhere" to invalidate all outstanding refresh tokens. */
  @Prop({ default: 0 })
  tokenVersion!: number;

  // --- Two-factor auth (TOTP) ---
  @Prop()
  twoFactorSecret?: string;

  @Prop({ required: true, default: false })
  twoFactorEnabled!: boolean;

  @Prop({ type: [String], default: [] })
  twoFactorRecoveryCodes!: string[];

  @Prop()
  invitedBy?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  resetTokenHash?: string;

  @Prop()
  resetTokenExpires?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
