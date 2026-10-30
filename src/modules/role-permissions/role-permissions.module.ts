import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolePermission, RolePermissionSchema } from '../../database/schemas/role-permission.schema';
import { RolePermissionsService } from './role-permissions.service';
import { AdminRolePermissionsController } from './admin-role-permissions.controller';
import { MyPermissionsController } from './my-permissions.controller';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

/** Global: PermissionsGuard is used by @Feature() routes across most admin modules, so every one
 * of them would otherwise need to import this module just to resolve RolePermissionsService. */
@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: RolePermission.name, schema: RolePermissionSchema }])],
  providers: [RolePermissionsService, PermissionsGuard],
  controllers: [AdminRolePermissionsController, MyPermissionsController],
  exports: [RolePermissionsService, PermissionsGuard],
})
export class RolePermissionsModule {}
