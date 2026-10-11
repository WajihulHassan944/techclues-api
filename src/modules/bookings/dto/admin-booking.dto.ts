import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { BOOKING_STATUSES } from '../../../database/schemas/booking.schema';
import { IsIn } from 'class-validator';

export class RescheduleDto {
  @IsISO8601() start!: string;
  @IsOptional() notify?: boolean;
}

export class CancelBookingDto {
  @IsString() reason!: string;
  @IsOptional() notify?: boolean;
}

export class SetBookingStatusDto {
  @IsIn(BOOKING_STATUSES) status!: (typeof BOOKING_STATUSES)[number];
}

export class AddBookingNoteDto {
  @IsString() body!: string;
}

export class BlockDayDto {
  @IsString() date!: string;
  @IsString() reason!: string;
}

export class UnblockDayDto {
  @IsString() date!: string;
}

export class SaveAvailabilityDto {
  @IsOptional() slotMinutes?: number;
  @IsOptional() bufferMinutes?: number;
  @IsOptional() noticeHours?: number;
  @IsOptional() windowDays?: number;
  @IsString() @IsOptional() meetingLink?: string;
  @IsOptional() days?: { on: boolean; from: string; to: string }[];
}

export class DeleteByEmailDto {
  @IsString() email!: string;
}
