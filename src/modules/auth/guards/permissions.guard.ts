import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../feature.decorator';
import { AuthUser } from '../current-user.decorator';
import { PermissionModuleKey, PermissionLevel } from '../../../database/schemas/role-permission.schema';
import { RolePermissionsService } from '../../role-permissions/role-permissions.service';

const RANK: Record<PermissionLevel, number> = { none: 0, view: 1, edit: 2 };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolePermissions: RolePermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<PermissionModuleKey | undefined>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!feature) return true;

    const req = context.switchToHttp().getRequest<{ user?: AuthUser; method: string }>();
    const user = req.user;
    if (!user) throw new ForbiddenException('You do not have permission to do that');
    if (user.role === 'super_admin') return true;

    const required: PermissionLevel = req.method === 'GET' || req.method === 'HEAD' ? 'view' : 'edit';
    const level = await this.rolePermissions.effectiveLevel(user.role, feature);
    if (RANK[level] < RANK[required]) {
      throw new ForbiddenException('You do not have permission to do that');
    }
    return true;
  }
}
