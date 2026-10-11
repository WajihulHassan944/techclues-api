import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enquiry, SOURCE_KEYS } from '../../database/schemas/enquiry.schema';
import { Booking } from '../../database/schemas/booking.schema';
import { dateKey } from '../../common/utils/tz';

export type Range = '7d' | '30d' | '13w';
const RANGE_CONFIG: Record<Range, { days: number; bucketDays: number }> = {
  '7d': { days: 7, bucketDays: 1 },
  '30d': { days: 30, bucketDays: 1 },
  '13w': { days: 91, bucketDays: 7 },
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Enquiry.name) private readonly enquiryModel: Model<Enquiry>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
  ) {}

  async stats(range: Range) {
    const { days, bucketDays } = RANGE_CONFIG[range];
    const now = Date.now();
    const start = new Date(now - days * 86_400_000);

    const enquiries = await this.enquiryModel
      .find({ folder: { $ne: 'spam' }, received: { $gte: start } })
      .select('source received status')
      .lean();

    const buckets: {
      start: string;
      end: string;
      total: number;
      bySource: Record<string, number>;
    }[] = [];
    for (let t = start.getTime(); t < now; t += bucketDays * 86_400_000) {
      const bucketStart = new Date(t);
      const bucketEnd = new Date(Math.min(t + bucketDays * 86_400_000, now));
      const inBucket = enquiries.filter(
        (e) =>
          e.received.getTime() >= bucketStart.getTime() &&
          e.received.getTime() < bucketEnd.getTime(),
      );
      const bySource: Record<string, number> = {};
      for (const key of SOURCE_KEYS)
        bySource[key] = inBucket.filter((e) => e.source === key).length;
      buckets.push({
        start: bucketStart.toISOString(),
        end: bucketEnd.toISOString(),
        total: inBucket.length,
        bySource,
      });
    }

    const total = enquiries.length;
    const won = enquiries.filter((e) => e.status === 'won').length;
    const conversion = total > 0 ? won / total : 0;

    const bySourceTotal: Record<string, number> = {};
    for (const key of SOURCE_KEYS)
      bySourceTotal[key] = enquiries.filter((e) => e.source === key).length;

    const needsReply = await this.enquiryModel
      .find({ folder: 'inbox', status: 'new' })
      .sort({ received: -1 })
      .limit(10)
      .lean();

    const upcomingCalls = await this.bookingModel
      .find({ status: 'confirmed', start: { $gte: new Date() } })
      .sort({ start: 1 })
      .limit(10)
      .lean();

    return {
      range,
      total,
      conversion,
      bySource: bySourceTotal,
      buckets,
      needsReply,
      upcomingCalls,
      todayKey: dateKey(new Date()),
    };
  }
}
