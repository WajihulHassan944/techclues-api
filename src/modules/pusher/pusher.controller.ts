import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { PusherService } from './pusher.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/pusher')
export class PusherController {
  constructor(private readonly pusher: PusherService) {}

  @Post('auth')
  auth(
    @Body('socket_id') socketId: string,
    @Body('channel_name') channel: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.pusher.authenticate(socketId, channel, user.sub);
  }
}
