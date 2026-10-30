import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { RolePermissionsService } from './role-permissions.service';

/** Any authenticated admin needs this — it's how the panel decides what to show in its own
 * sidebar — unlike admin-role-permissions.controller.ts, which only a Super Admin may call to
 * change the matrix itself. */
@UseGuards(JwtAuthGuard)
@Controller('admin/my-permissions')
export class MyPermissionsController {
  constructor(private readonly rolePermissions: RolePermissionsService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.rolePermissions.myPermissions(user.role);
  }
}
