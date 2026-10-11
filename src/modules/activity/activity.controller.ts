import { Body, Controller, Delete, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ACTIVITY_KINDS, ActivityKind } from '../../database/schemas/activity.schema';
import { ActivityService } from './activity.service';

class LogActivityDto {
  @IsIn(ACTIVITY_KINDS) kind!: ActivityKind;
  @IsString() text!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('admin/activity')
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  list(@Query('limit') limit?: string) {
    return this.activity.list(limit ? parseInt(limit, 10) : 300);
  }

  /** For client-only actions the backend has no other record of (CSV export, test email, etc). */
  @Post()
  async log(@Body() dto: LogActivityDto) {
    await this.activity.log(dto.kind, dto.text);
    return { ok: true };
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
