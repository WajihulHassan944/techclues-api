import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { checkHoneypot } from '../../common/utils/honeypot';
import { BookingsService } from './bookings.service';
import { PublicAvailabilityQueryDto } from './dto/public-availability.dto';
import { PublicCreateBookingDto } from './dto/public-booking.dto';

@Controller('public')
export class PublicBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('availability')
  availability(@Query() query: PublicAvailabilityQueryDto) {
    return this.bookings.availabilitySlots(query.from, query.to);
  }

  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @Post('bookings')
  async create(@Body() dto: PublicCreateBookingDto, @Req() req: Request) {
    checkHoneypot(dto.website);
    void req;
    const booking = await this.bookings.createBooking(dto);
    return {
      id: String(booking._id),
      start: booking.start,
      minutes: booking.minutes,
      meetingLink: booking.meetingLink,
    };
  }
}
