import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PERMISSION_LEVELS,
  PERMISSION_MODULES,
  PERMISSIONABLE_ROLES,
  PermissionableRole,
  PermissionLevel,
  PermissionModuleKey,
  RolePermission,
} from '../../database/schemas/role-permission.schema';

/** Shipped defaults — what each role could already do before the matrix became configurable.
 * Used whenever a (role, module) pair has no row yet, so the system works out of the box and a
 * Super Admin only needs to touch the rows they actually want to change. */
const DEFAULTS: Record<PermissionableRole, Partial<Record<PermissionModuleKey, PermissionLevel>>> = {
  admin: Object.fromEntries(PERMISSION_MODULES.map((m) => [m, 'edit'])) as never,
  editor: {
    blog: 'edit',
    homepage: 'edit',
    'case-studies': 'edit',
    services: 'edit',
    faqs: 'edit',
    'footer-links': 'edit',
    testimonials: 'edit',
    media: 'edit',
    newsletter: 'edit',
    'email-templates': 'edit',
  },
  seo_manager: { seo: 'edit' },
  staff: { inbox: 'edit', bookings: 'edit' },
};

const RANK: Record<PermissionLevel, number> = { none: 0, view: 1, edit: 2 };

@Injectable()
export class RolePermissionsService {
  constructor(@InjectModel(RolePermission.name) private readonly model: Model<RolePermission>) {}

  private defaultFor(role: PermissionableRole, module: PermissionModuleKey): PermissionLevel {
    return DEFAULTS[role][module] ?? 'none';
  }

  /** The matrix a Super Admin edits: every (role, module) pair, DB overrides merged over defaults. */
  async getMatrix() {
    const rows = await this.model.find().lean();
    const overrides = new Map(rows.map((r) => [`${r.role}:${r.module}`, r.level]));
    return PERMISSIONABLE_ROLES.map((role) => ({
      role,
      modules: Object.fromEntries(
        PERMISSION_MODULES.map((module) => [
          module,
          overrides.get(`${role}:${module}`) ?? this.defaultFor(role, module),
        ]),
      ) as Record<PermissionModuleKey, PermissionLevel>,
    }));
  }

  /** Used by PermissionsGuard on every gated request — kept cheap (single indexed lookup). */
  async effectiveLevel(role: string, module: PermissionModuleKey): Promise<PermissionLevel> {
    if (!PERMISSIONABLE_ROLES.includes(role as PermissionableRole)) return 'none';
    const found = await this.model.findOne({ role, module }).lean();
    return found?.level ?? this.defaultFor(role as PermissionableRole, module);
  }

  /** What the current user can see in the panel itself — super_admin gets 'edit' on every
   * module without a DB round trip, since it's never configurable. */
  async myPermissions(role: string): Promise<Record<PermissionModuleKey, PermissionLevel>> {
    if (role === 'super_admin') {
      return Object.fromEntries(PERMISSION_MODULES.map((m) => [m, 'edit'])) as Record<PermissionModuleKey, PermissionLevel>;
    }
    if (!PERMISSIONABLE_ROLES.includes(role as PermissionableRole)) {
      return Object.fromEntries(PERMISSION_MODULES.map((m) => [m, 'none'])) as Record<PermissionModuleKey, PermissionLevel>;
    }
    const rows = await this.model.find({ role }).lean();
    const overrides = new Map(rows.map((r) => [r.module, r.level]));
    return Object.fromEntries(
      PERMISSION_MODULES.map((m) => [m, overrides.get(m) ?? this.defaultFor(role as PermissionableRole, m)]),
    ) as Record<PermissionModuleKey, PermissionLevel>;
  }

  async setLevel(role: PermissionableRole, module: PermissionModuleKey, level: PermissionLevel) {
    if (!PERMISSIONABLE_ROLES.includes(role)) throw new BadRequestException('Unknown role');
    if (!PERMISSION_MODULES.includes(module)) throw new BadRequestException('Unknown module');
    if (!PERMISSION_LEVELS.includes(level)) throw new BadRequestException('Unknown level');
    await this.model.updateOne({ role, module }, { $set: { level } }, { upsert: true });
    return this.getMatrix();
  }
}

export { RANK as PERMISSION_RANK };
