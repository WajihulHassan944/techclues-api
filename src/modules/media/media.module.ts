import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaAsset, MediaAssetSchema } from '../../database/schemas/media-asset.schema';
import { ActivityModule } from '../activity/activity.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MediaService } from './media.service';
import { AdminMediaController } from './admin-media.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: MediaAsset.name, schema: MediaAssetSchema }]), ActivityModule, CloudinaryModule],
  providers: [MediaService],
  controllers: [AdminMediaController],
  exports: [MediaService],
})
export class MediaModule {}
