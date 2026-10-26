import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FooterLink, FooterLinkSchema } from '../../database/schemas/footer-link.schema';
import { ActivityModule } from '../activity/activity.module';
import { FooterLinkService } from './footer-link.service';
import { AdminFooterLinkController } from './admin-footer-link.controller';
import { PublicFooterLinkController } from './public-footer-link.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FooterLink.name, schema: FooterLinkSchema }]),
    ActivityModule,
  ],
  providers: [FooterLinkService],
  controllers: [AdminFooterLinkController, PublicFooterLinkController],
})
export class FooterLinkModule {}
