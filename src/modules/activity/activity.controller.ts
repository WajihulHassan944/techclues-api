import { Controller, Delete, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  list(@Query('limit') limit?: string) {
    return this.activity.list(limit ? parseInt(limit, 10) : 300);
  }

  @Get('export')
  exportAll() {
    return this.activity.exportAll();
  }

  @Delete()
  @HttpCode(200)
  async clear() {
    await this.activity.clear();
    return { ok: true };
  }
}
