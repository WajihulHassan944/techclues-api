import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '../../database/schemas/admin.schema';

export const ROLES_KEY = 'roles';
/** Restricts a route (or whole controller) to the given roles. Combine with JwtAuthGuard + RolesGuard. */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
