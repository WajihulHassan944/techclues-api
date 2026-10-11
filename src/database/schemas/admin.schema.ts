import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

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
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
