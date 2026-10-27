import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '../../../database/schemas/admin.schema';
import { ROLES_KEY } from '../roles.decorator';
import { AuthUser } from '../current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<AdminRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed || allowed.length === 0) return true;
    const { user } = context.switchToHttp().getRequest<{ user: AuthUser }>();
    if (!user || !allowed.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to do that');
    }
    return true;
  }
}
