import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolePermissionsService } from './role-permissions.service';
import { SetRolePermissionDto } from './dto/set-role-permission.dto';

/** Only a Super Admin can view or change the permission matrix — it decides what every other
 * role can do, so it stays outside the matrix it configures. */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('admin/role-permissions')
export class AdminRolePermissionsController {
  constructor(private readonly rolePermissions: RolePermissionsService) {}

  @Get()
  getMatrix() {
    return this.rolePermissions.getMatrix();
  }

  @Patch()
  setLevel(@Body() dto: SetRolePermissionDto) {
    return this.rolePermissions.setLevel(dto.role, dto.module, dto.level);
  }
}
