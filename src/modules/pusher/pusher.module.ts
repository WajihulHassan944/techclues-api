import { Module } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { PusherController } from './pusher.controller';

@Module({
  providers: [PusherService],
  controllers: [PusherController],
  exports: [PusherService],
})
export class PusherModule {}
