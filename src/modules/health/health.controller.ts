import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    return {
      status: 'ok',
      time: new Date().toISOString(),
      db: this.connection.readyState === 1 ? 'connected' : 'disconnected',
    };
  }
}
