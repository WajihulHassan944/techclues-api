import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailTemplate, EmailTemplateSchema } from '../../database/schemas/email-template.schema';
import { Subscriber, SubscriberSchema } from '../../database/schemas/subscriber.schema';
import { ActivityModule } from '../activity/activity.module';
import { EmailModule } from '../email/email.module';
import { EmailTemplateService } from './email-template.service';
import { AdminEmailTemplateController } from './admin-email-template.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
    ActivityModule,
    EmailModule,
  ],
  providers: [EmailTemplateService],
  controllers: [AdminEmailTemplateController],
})
export class EmailTemplateModule {}
