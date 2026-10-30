import { SetMetadata } from '@nestjs/common';
import { PermissionModuleKey } from '../../database/schemas/role-permission.schema';

export const FEATURE_KEY = 'feature';
/** Tags a route (or whole controller) with the permission-matrix module it belongs to. Combine
 * with JwtAuthGuard + PermissionsGuard. GET/HEAD requests need 'view'; everything else needs
 * 'edit'. super_admin always passes. */
export const Feature = (module: PermissionModuleKey) => SetMetadata(FEATURE_KEY, module);
