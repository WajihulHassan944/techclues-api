import { Body, Controller, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { checkHoneypot } from '../../common/utils/honeypot';
import { EnquiriesService } from './enquiries.service';
import { PublicContactDto } from './dto/public-contact.dto';
import { PublicBriefDto } from './dto/public-brief.dto';
import { PublicZeroOneDto } from './dto/public-zero-one.dto';

function toDetails(obj: Record<string, unknown>): { label: string; value: string }[] {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([label, value]) => ({ label, value: String(value) }));
}

@Throttle({ default: { limit: 8, ttl: 60_000 } })
@Controller('public')
export class PublicEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Post('contact')
  async contact(@Body() dto: PublicContactDto, @Req() req: Request) {
    checkHoneypot(dto.website);
    const enquiry = await this.enquiries.createPublic({
      source: 'contact',
      name: dto.name,
      email: dto.email,
      company: dto.company,
      subject: `Contact form from ${dto.name}`,
      message: dto.message,
      details: toDetails({ needs: dto.needs?.join(', '), budget: dto.budget, other: dto.other }),
      ip: req.ip,
      referrer: req.headers.referer,
    });
    return { id: String(enquiry._id) };
  }

  @Post('brief')
  async brief(@Body() dto: PublicBriefDto, @Req() req: Request) {
    checkHoneypot(dto.website);
    const enquiry = await this.enquiries.createPublic({
      source: 'calculator',
      name: dto.name,
      email: dto.email,
      company: dto.company,
      subject: `MVP cost estimate for ${dto.name}`,
      message: dto.result?.headline ?? 'Submitted the MVP cost calculator.',
      details: toDetails({
        platform: dto.platform,
        goal: dto.goal,
        features: dto.features,
        pace: dto.pace,
      }),
      result: dto.result,
      ip: req.ip,
      referrer: req.headers.referer,
    });
    return { id: String(enquiry._id) };
  }

  @Post('zero-one')
  async zeroOne(@Body() dto: PublicZeroOneDto, @Req() req: Request) {
    checkHoneypot(dto.website);
    const enquiry = await this.enquiries.createPublic({
      source: 'zero-one',
      name: dto.name,
      email: dto.email,
      company: dto.company,
      phone: dto.phone,
      subject: `ZERO.ONE brief from ${dto.name}`,
      message: dto.idea,
      ip: req.ip,
      referrer: req.headers.referer,
    });
    return { id: String(enquiry._id) };
  }
}
