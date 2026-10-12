import { Controller, Get } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('public/faqs')
export class PublicFaqController {
  constructor(private readonly faqs: FaqService) {}

  @Get()
  list() {
    return this.faqs.listPublicGrouped();
  }
}
