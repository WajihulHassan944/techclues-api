import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from '../../database/schemas/service.schema';
import { ActivityModule } from '../activity/activity.module';
import { ServiceService } from './service.service';
import { AdminServiceController } from './admin-service.controller';
import { PublicServiceController } from './public-service.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]), ActivityModule],
  providers: [ServiceService],
  controllers: [AdminServiceController, PublicServiceController],
})
export class ServiceModule {}
