import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../../database/schemas/admin.schema';
import { ActivityModule } from '../activity/activity.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]), ActivityModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
