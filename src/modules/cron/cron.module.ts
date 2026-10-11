import { Module } from '@nestjs/common';
import { EnquiriesModule } from '../enquiries/enquiries.module';
import { BlogModule } from '../blog/blog.module';
import { CronController } from './cron.controller';

@Module({
  imports: [EnquiriesModule, BlogModule],
  controllers: [CronController],
})
export class CronModule {}
