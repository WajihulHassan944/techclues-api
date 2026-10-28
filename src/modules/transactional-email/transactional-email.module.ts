import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionalEmailOverride, TransactionalEmailOverrideSchema } from '../../database/schemas/transactional-email.schema';
import { ActivityModule } from '../activity/activity.module';
import { TransactionalEmailService } from './transactional-email.service';
import { AdminTransactionalEmailController } from './admin-transactional-email.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: TransactionalEmailOverride.name, schema: TransactionalEmailOverrideSchema }]), ActivityModule],
  providers: [TransactionalEmailService],
  controllers: [AdminTransactionalEmailController],
  exports: [TransactionalEmailService],
})
export class TransactionalEmailModule {}
