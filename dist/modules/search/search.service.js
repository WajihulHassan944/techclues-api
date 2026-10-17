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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enquiry_schema_1 = require("../../database/schemas/enquiry.schema");
const booking_schema_1 = require("../../database/schemas/booking.schema");
const subscriber_schema_1 = require("../../database/schemas/subscriber.schema");
const blog_schema_1 = require("../../database/schemas/blog.schema");
const LIMIT = 5;
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
let SearchService = class SearchService {
    constructor(enquiryModel, bookingModel, subscriberModel, postModel) {
        this.enquiryModel = enquiryModel;
        this.bookingModel = bookingModel;
        this.subscriberModel = subscriberModel;
        this.postModel = postModel;
    }
    async search(q) {
        const term = q.trim();
        if (!term)
            return { enquiries: [], bookings: [], subscribers: [], posts: [] };
        const re = new RegExp(escapeRegex(term), 'i');
        const [enquiries, bookings, subscribers, posts] = await Promise.all([
            this.enquiryModel
                .find({ $or: [{ name: re }, { email: re }, { subject: re }] })
                .sort({ received: -1 })
                .limit(LIMIT)
                .select('name email subject source')
                .lean(),
            this.bookingModel
                .find({ $or: [{ name: re }, { email: re }, { topic: re }] })
                .sort({ start: -1 })
                .limit(LIMIT)
                .select('name email topic start')
                .lean(),
            this.subscriberModel
                .find({ $or: [{ email: re }, { name: re }] })
                .sort({ at: -1 })
                .limit(LIMIT)
                .select('email name status')
                .lean(),
            this.postModel
                .find({ title: re })
                .sort({ updatedAt: -1 })
                .limit(LIMIT)
                .select('title slug status')
                .lean(),
        ]);
        return {
            enquiries: enquiries.map((e) => ({
                id: String(e._id),
                title: e.subject,
                subtitle: `${e.name} · ${e.email}`,
                source: e.source,
            })),
            bookings: bookings.map((b) => ({
                id: String(b._id),
                title: b.topic,
                subtitle: `${b.name} · ${new Date(b.start).toLocaleDateString('en-GB')}`,
            })),
            subscribers: subscribers.map((s) => ({
                id: String(s._id),
                title: s.email,
                subtitle: s.name ?? s.status,
            })),
            posts: posts.map((p) => ({
                id: String(p._id),
                title: p.title,
                subtitle: p.status,
                slug: p.slug,
            })),
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enquiry_schema_1.Enquiry.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(2, (0, mongoose_1.InjectModel)(subscriber_schema_1.Subscriber.name)),
    __param(3, (0, mongoose_1.InjectModel)(blog_schema_1.BlogPost.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SearchService);
//# sourceMappingURL=search.service.js.map