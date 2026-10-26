import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enquiry } from '../../database/schemas/enquiry.schema';
import { Booking } from '../../database/schemas/booking.schema';
import { Subscriber } from '../../database/schemas/subscriber.schema';
import { BlogPost } from '../../database/schemas/blog.schema';
import { CaseStudy } from '../../database/schemas/case-study.schema';

const LIMIT = 5;

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Enquiry.name) private readonly enquiryModel: Model<Enquiry>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Subscriber.name) private readonly subscriberModel: Model<Subscriber>,
    @InjectModel(BlogPost.name) private readonly postModel: Model<BlogPost>,
    @InjectModel(CaseStudy.name) private readonly caseStudyModel: Model<CaseStudy>,
  ) {}

  async search(q: string) {
    const term = q.trim();
    if (!term) return { enquiries: [], bookings: [], subscribers: [], posts: [], caseStudies: [] };
    const re = new RegExp(escapeRegex(term), 'i');

    const [enquiries, bookings, subscribers, posts, caseStudies] = await Promise.all([
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
      this.caseStudyModel
        .find({ $or: [{ title: re }, { client: re }] })
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
      caseStudies: caseStudies.map((c) => ({
        id: String(c._id),
        title: c.title,
        subtitle: c.status,
        slug: c.slug,
      })),
    };
  }
}
