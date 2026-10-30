import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** Modules a Super Admin can grant per-role access to. Users and core business Settings are
 * deliberately excluded — those stay hard-restricted to super_admin (+admin for Settings) so a
 * misconfigured matrix can never grant user management or account-wide settings away. */
export const PERMISSION_MODULES = [
  'inbox',
  'bookings',
  'blog',
  'homepage',
  'case-studies',
  'services',
  'faqs',
  'footer-links',
  'testimonials',
  'media',
  'newsletter',
  'email-templates',
  'seo',
] as const;
export type PermissionModuleKey = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_LEVELS = ['none', 'view', 'edit'] as const;
export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

/** super_admin is deliberately not configurable here — it always has full access, so the matrix
 * can never lock every admin out of the panel. */
export const PERMISSIONABLE_ROLES = ['admin', 'editor', 'seo_manager', 'staff'] as const;
export type PermissionableRole = (typeof PERMISSIONABLE_ROLES)[number];

@Schema({ timestamps: true })
export class RolePermission extends Document {
  @Prop({ required: true, enum: PERMISSIONABLE_ROLES })
  role!: PermissionableRole;

  @Prop({ required: true, enum: PERMISSION_MODULES })
  module!: PermissionModuleKey;

  @Prop({ required: true, enum: PERMISSION_LEVELS, default: 'none' })
  level!: PermissionLevel;
}

export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);
RolePermissionSchema.index({ role: 1, module: 1 }, { unique: true });
