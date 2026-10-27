import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, ResetUserPasswordDto, UpdateUserDto } from './dto/user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() me: AuthUser) {
    return this.users.create(dto, me.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() me: AuthUser) {
    return this.users.update(id, dto, me.sub);
  }

  @Patch(':id/password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetUserPasswordDto) {
    return this.users.resetPassword(id, dto.password);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() me: AuthUser) {
    return this.users.remove(id, me.sub);
  }
}
