"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enquiry_schema_1 = require("../../database/schemas/enquiry.schema");
const booking_schema_1 = require("../../database/schemas/booking.schema");
const tz_1 = require("../../common/utils/tz");
const RANGE_CONFIG = {
    '7d': { days: 7, bucketDays: 1 },
    '30d': { days: 30, bucketDays: 1 },
    '13w': { days: 91, bucketDays: 7 },
};
let DashboardService = class DashboardService {
    constructor(enquiryModel, bookingModel) {
        this.enquiryModel = enquiryModel;
        this.bookingModel = bookingModel;
    }
    async stats(range) {
        const { days, bucketDays } = RANGE_CONFIG[range];
        const now = Date.now();
        const start = new Date(now - days * 86_400_000);
        const enquiries = await this.enquiryModel
            .find({ folder: { $ne: 'spam' }, received: { $gte: start } })
            .select('source received status')
            .lean();
        const buckets = [];
        for (let t = start.getTime(); t < now; t += bucketDays * 86_400_000) {
            const bucketStart = new Date(t);
            const bucketEnd = new Date(Math.min(t + bucketDays * 86_400_000, now));
            const inBucket = enquiries.filter((e) => e.received.getTime() >= bucketStart.getTime() &&
                e.received.getTime() < bucketEnd.getTime());
            const bySource = {};
            for (const key of enquiry_schema_1.SOURCE_KEYS)
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
        const previousStart = new Date(start.getTime() - days * 86_400_000);
        const previousTotal = await this.enquiryModel.countDocuments({
            folder: { $ne: 'spam' },
            received: { $gte: previousStart, $lt: start },
        });
        const sparkDays = 12;
        const sparkStart = new Date(now - sparkDays * 86_400_000);
        const sparkEnquiries = await this.enquiryModel
            .find({ folder: { $ne: 'spam' }, received: { $gte: sparkStart } })
            .select('received')
            .lean();
        const spark = [];
        for (let i = sparkDays - 1; i >= 0; i--) {
            const dayStart = new Date(now - (i + 1) * 86_400_000);
            const dayEnd = new Date(now - i * 86_400_000);
            spark.push(sparkEnquiries.filter((e) => e.received.getTime() >= dayStart.getTime() && e.received.getTime() < dayEnd.getTime()).length);
        }
        const bySourceTotal = {};
        for (const key of enquiry_schema_1.SOURCE_KEYS)
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
            previousTotal,
            spark,
            conversion,
            bySource: bySourceTotal,
            buckets,
            needsReply,
            upcomingCalls,
            todayKey: (0, tz_1.dateKey)(new Date()),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enquiry_schema_1.Enquiry.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map