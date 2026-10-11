import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import {
  AddBookingNoteDto,
  BlockDayDto,
  CancelBookingDto,
  DeleteByEmailDto,
  RescheduleDto,
  SaveAvailabilityDto,
  SetBookingStatusDto,
  UnblockDayDto,
} from './dto/admin-booking.dto';
import { BookingStatus } from '../../database/schemas/booking.schema';

@UseGuards(JwtAuthGuard)
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  list(
    @Query('status') status?: BookingStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.bookings.list({
      status,
      from,
      to,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('availability')
  getAvailability() {
    return this.bookings.getAvailability();
  }

  @Patch('availability')
  saveAvailability(@Body() dto: SaveAvailabilityDto) {
    return this.bookings.saveAvailability(dto);
  }

  @Post('availability/block')
  blockDay(@Body() dto: BlockDayDto) {
    return this.bookings.blockDay(dto.date, dto.reason);
  }

  @Post('availability/unblock')
  unblockDay(@Body() dto: UnblockDayDto) {
    return this.bookings.unblockDay(dto.date);
  }

  @Post('delete-by-email')
  deleteByEmail(@Body() dto: DeleteByEmailDto) {
    return this.bookings.deleteByEmail(dto.email).then((count) => ({ count }));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.bookings.findOne(id);
  }

  @Patch(':id/reschedule')
  reschedule(@Param('id') id: string, @Body() dto: RescheduleDto) {
    return this.bookings.reschedule(id, dto.start, dto.notify ?? true);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookings.cancel(id, dto.reason, dto.notify ?? true);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: SetBookingStatusDto) {
    return this.bookings.setStatus(id, dto.status);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Body() dto: AddBookingNoteDto) {
    return this.bookings.addNote(id, dto.body);
  }
}
