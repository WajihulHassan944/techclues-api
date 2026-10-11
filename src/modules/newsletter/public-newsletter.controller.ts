import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { checkHoneypot } from '../../common/utils/honeypot';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto, UnsubscribeQueryDto } from './dto/public-newsletter.dto';

@Controller('public/newsletter')
export class PublicNewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeDto) {
    checkHoneypot(dto.website);
    const error = await this.newsletter.add(dto.email, dto.name, 'footer');
    if (error) return { ok: false, error };
    return { ok: true };
  }

  @Get('unsubscribe')
  async unsubscribeGet(@Query() query: UnsubscribeQueryDto) {
    await this.newsletter.unsubscribeByToken(query.token);
    return { ok: true };
  }

  @Post('unsubscribe')
  async unsubscribePost(@Body() dto: UnsubscribeQueryDto) {
    await this.newsletter.unsubscribeByToken(dto.token);
    return { ok: true };
  }
}
