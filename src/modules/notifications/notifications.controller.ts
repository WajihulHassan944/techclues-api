import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list() {
    return this.notifications.list();
  }

  @Post('read-all')
  readAll() {
    return this.notifications.markAllRead();
  }

  @Post(':id/read')
  read(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }
}
