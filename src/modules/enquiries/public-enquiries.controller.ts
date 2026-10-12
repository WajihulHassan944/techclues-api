import { Body, Controller, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { checkHoneypot } from '../../common/utils/honeypot';
import { EnquiriesService } from './enquiries.service';
import { PublicContactDto } from './dto/public-contact.dto';
import { PublicBriefDto } from './dto/public-brief.dto';
import { PublicZeroOneDto } from './dto/public-zero-one.dto';
import { PublicGrantDto } from './dto/public-grant.dto';
import { PublicPartnerDto } from './dto/public-partner.dto';
import { PublicCareersDto } from './dto/public-careers.dto';
import { PublicChatDto } from './dto/public-chat.dto';

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

  @Post('grant')
  async grant(@Body() dto: PublicGrantDto, @Req() req: Request) {
    checkHoneypot(dto.website);
    const enquiry = await this.enquiries.createPublic({
      source: 'grant',
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      subject: `Grant support: ${dto.legalName}`,
      message: dto.about || `Checking funding options for ${dto.project}.`,
      details: toDetails({
        role: dto.role,
        legalName: dto.legalName,
        companyNumber: dto.companyNumber,
        businessType: dto.businessType,
        basedIn: dto.basedIn,
        employees: dto.employees,
        turnover: dto.turnover,
        trading: dto.trading,
        project: dto.project,
        budget: dto.budget,
        start: dto.start,
        match: dto.match,
        publicFunding: dto.publicFunding,
      }),
      ip: req.ip,
      referrer: req.headers.referer,
    });
    return { id: String(enquiry._id) };
  }

  @Post('partner')
  async partner(@Body() dto: PublicPartnerDto, @Req() req: Request) {
    checkHoneypot(dto.honeypot);
    const isJoin = dto.mode === 'join';
    const enquiry = await this.enquiries.createPublic({
      source: isJoin ? 'partner-join' : 'partner-refer',
      name: dto.name,
      email: dto.email,
      company: dto.company,
      phone: dto.phone,
      subject: isJoin
        ? `Partner application from ${dto.name}`
        : `Referral: ${dto.clientName ?? 'a client'}`,
      message: isJoin
        ? dto.notes || `Applying to become a partner (${dto.kind ?? 'unspecified'}).`
        : dto.notes ||
          `Referring ${dto.clientName ?? 'a client'} for ${dto.projectType ?? 'a project'}.`,
      details: isJoin
        ? toDetails({ kind: dto.kind, website: dto.website, reach: dto.reach, volume: dto.volume })
        : toDetails({
            clientName: dto.clientName,
            clientCompany: dto.clientCompany,
            clientEmail: dto.clientEmail,
            clientPhone: dto.clientPhone,
            projectType: dto.projectType,
            budget: dto.budget,
          }),
      ip: req.ip,
      referrer: req.headers.referer,
    });
    return { id: String(enquiry._id) };
  }

  @Post('careers')
  async careers(@Body() dto: PublicCareersDto, @Req() req: Request) {
    checkHoneypot(dto.website);
    const enquiry = await this.enquiries.createPublic({
      source: 'careers',
      name: dto.name,
      email: dto.email,
      subject: `Application: ${dto.areas?.[0] ?? 'General'} role`,
      message: dto.message,
      details: toDetails({
        areas: dto.areas?.join(', '),
        other: dto.other,
        location: dto.location,
        link: dto.link,
      }),
      ip: req.ip,
      referrer: req.headers.referer,
    });
    return { id: String(enquiry._id) };
  }

  @Post('chat')
  async chat(@Body() dto: PublicChatDto, @Req() req: Request) {
    checkHoneypot(dto.website);
    const enquiry = await this.enquiries.createPublic({
      source: 'chat',
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      subject: `Chat widget: ${dto.topic ?? dto.name}`,
      message: dto.message,
      details: toDetails({ topic: dto.topic }),
      ip: req.ip,
      referrer: req.headers.referer,
    });
    return { id: String(enquiry._id) };
  }
}
