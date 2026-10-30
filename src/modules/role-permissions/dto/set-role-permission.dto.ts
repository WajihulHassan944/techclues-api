import { IsIn } from 'class-validator';
import {
  PERMISSION_LEVELS,
  PERMISSION_MODULES,
  PERMISSIONABLE_ROLES,
  PermissionableRole,
  PermissionLevel,
  PermissionModuleKey,
} from '../../../database/schemas/role-permission.schema';

export class SetRolePermissionDto {
  @IsIn(PERMISSIONABLE_ROLES)
  role!: PermissionableRole;

  @IsIn(PERMISSION_MODULES)
  module!: PermissionModuleKey;

  @IsIn(PERMISSION_LEVELS)
  level!: PermissionLevel;
}
