/* eslint-disable no-console */
import 'dotenv/config';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AdminSchema } from './schemas/admin.schema';
import { EnquirySchema } from './schemas/enquiry.schema';
import { BlockedSenderSchema } from './schemas/blocked-sender.schema';
import { BookingSchema, AvailabilitySchema } from './schemas/booking.schema';
import { BlogPostSchema, BlogCategorySchema, BlogAuthorSchema } from './schemas/blog.schema';
import { FaqSchema } from './schemas/faq.schema';
import { SubscriberSchema } from './schemas/subscriber.schema';
import { SettingsSchema } from './schemas/settings.schema';
import { DEFAULT_TEMPLATES, SIGNATURE } from '../common/constants/defaults';
import { DEFAULT_AVAILABILITY } from '../common/utils/availability';
import { BODIES } from './seed-blog-bodies';
import { seedBookingsData, seedInboxData, seedSubscribersData } from './seed-generators';
import faqsData from './data/faqs-data.json';

async function main() {
  const uri = process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error(
      'Refusing to seed: set MONGODB_URI_DEV in .env to a DEV/TEST database. ' +
        'This script never runs against MONGODB_URI (production).',
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const Admin = mongoose.model('Admin', AdminSchema);
  const Enquiry = mongoose.model('Enquiry', EnquirySchema);
  const BlockedSender = mongoose.model('BlockedSender', BlockedSenderSchema);
  const Booking = mongoose.model('Booking', BookingSchema);
  const Availability = mongoose.model('Availability', AvailabilitySchema);
  const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
  const BlogCategory = mongoose.model('BlogCategory', BlogCategorySchema);
  const BlogAuthor = mongoose.model('BlogAuthor', BlogAuthorSchema);
  const Faq = mongoose.model('Faq', FaqSchema);
  const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
  const Settings = mongoose.model('Settings', SettingsSchema);

  await Promise.all([
    Enquiry.deleteMany({}),
    BlockedSender.deleteMany({}),
    Booking.deleteMany({}),
    Availability.deleteMany({}),
    BlogPost.deleteMany({}),
    BlogCategory.deleteMany({}),
    BlogAuthor.deleteMany({}),
    Faq.deleteMany({}),
    Subscriber.deleteMany({}),
  ]);

  const now = Date.now();

  // --- Admin ---
  // Always reset credentials to the configured defaults, not just on first run: e2e tests (e.g.
  // the settings "change password" flow) mutate the real admin account, and reseeding is how
  // test isolation gets restored between runs rather than leaving a changed password behind.
  const email = process.env.ADMIN_EMAIL ?? 'techcluesltd@gmail.com';
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash('ChangeMe123!', 12));
  await Admin.findOneAndUpdate(
    { email },
    {
      $set: { email, passwordHash, failedLoginAttempts: 0, tokenVersion: 0 },
      $unset: { lockUntil: 1 },
    },
    { upsert: true },
  );
  console.log(`Seeded admin ${email}`);

  // --- Settings ---
  await Settings.deleteMany({});
  await Settings.create({
    recipients: ['techcluesltd@gmail.com'],
    events: { enquiry: true, booking: true, cancelled: true, subscriber: false, summary: true },
    summaryTime: '08:00',
    fromName: 'TechClues',
    signature: SIGNATURE,
    templates: DEFAULT_TEMPLATES,
    retention: { spamDays: 30, enquiryMonths: 0 },
  });

  // --- Enquiries: full parity with the frontend's lib/admin/inbox-seed.ts (17 items) ---
  const { enquiries, blocked } = seedInboxData(now);
  await Enquiry.insertMany(enquiries);
  await BlockedSender.insertMany(blocked);
  console.log(`Seeded ${enquiries.length} enquiries and ${blocked.length} blocked sender(s)`);

  // --- Availability + Bookings: full parity with lib/admin/bookings-seed.ts (11 items) ---
  await Availability.create(DEFAULT_AVAILABILITY);
  const bookings = seedBookingsData(now);
  await Booking.insertMany(bookings);
  console.log(`Seeded ${bookings.length} bookings + availability`);

  // --- Blog ---
  const categories = await BlogCategory.insertMany(
    ['AI', 'Funding', 'Costs', 'Building', 'Validation', 'Strategy'].map((name) => ({ name })),
  );
  const [au1, au2] = await BlogAuthor.insertMany([
    { name: 'TechClues team', role: 'Editorial' },
    { name: 'Khashir Khalil', role: 'Founder and CEO' },
  ]);
  void categories;

  await BlogPost.insertMany([
    {
      slug: 'mvp-software-development-age-of-ai',
      title: 'MVP Software Development in the Age of AI',
      category: 'AI',
      status: 'published',
      excerpt:
        'MVP software development helps startups test ideas with real users, cut costs, and use AI tools to move fast without overbuilding.',
      cover: '/images/media/mvp-software-development-techclues.webp',
      coverAlt: 'MVP Software Development',
      body: BODIES['mvp-software-development-age-of-ai'],
      publishedAt: new Date('2026-10-06T09:00:00Z'),
      authorId: String(au1._id),
      seoTitle: 'MVP Software Development in the Age of AI | TechClues',
      seoDescription:
        'Most startups fail because they build too much, too early. MVP software development is how you validate before you commit.',
    },
    {
      slug: 'ai-funding-uk-scotland',
      title: 'Funding for AI projects in the UK and Scotland',
      category: 'Funding',
      status: 'published',
      excerpt:
        "What's actually open to UK and Scottish businesses that want to use AI, and how to plan a project that doesn't depend on a grant.",
      cover: '/images/blog/ai-funding.jpg',
      coverAlt: 'Victorian and modern buildings side by side in Glasgow',
      body: BODIES['ai-funding-uk-scotland'],
      publishedAt: new Date('2026-09-25T09:00:00Z'),
      authorId: String(au1._id),
      seoTitle: 'AI Funding for UK & Scottish Businesses (2026) | TechClues',
      seoDescription:
        "What's actually open to UK and Scottish businesses that want to use AI, including what's paused.",
    },
    {
      slug: 'mvp-cost-uk',
      title: 'How much does an MVP cost in the UK?',
      category: 'Costs',
      status: 'published',
      excerpt:
        'What an MVP budget pays for, the four choices that move the price most, and the costs founders forget.',
      cover: '/images/services/mvp.jpg',
      coverAlt: 'A team planning a product together at a whiteboard',
      body: BODIES['mvp-cost-uk'],
      publishedAt: new Date('2026-08-26T09:00:00Z'),
      authorId: String(au1._id),
      seoTitle: 'MVP Cost in UK and How Much Startups Should Budget | TechClues',
      seoDescription: 'Find out the MVP cost in UK and what drives the price.',
    },
    {
      slug: 'prototype-vs-mvp',
      title: 'Prototype vs MVP: which one do you need?',
      category: 'Strategy',
      status: 'draft',
      excerpt:
        'A prototype answers "can we build it?" and an MVP answers "will anyone use it?". Here\'s how to choose.',
      cover: '',
      body: '<p>People use "prototype" and "MVP" as if they mean the same thing. They do not.</p>',
      authorId: String(au1._id),
      seoTitle: 'Prototype vs MVP: Which One Do You Need? | TechClues',
    },
    {
      slug: 'validate-startup-idea-before-development',
      title: 'How to validate a startup idea before you write any code',
      category: 'Validation',
      status: 'scheduled',
      scheduledFor: new Date(now + 3 * 86_400_000),
      excerpt: 'Five cheap ways to find out whether people want your idea, before you build it.',
      cover: '/images/services/mvp.jpg',
      body: '<p>The cheapest time to find out an idea will not work is before you build it.</p>',
      authorId: String(au1._id),
      seoTitle: 'How to Validate a Startup Idea Before Development | TechClues',
    },
    {
      slug: 'no-code-vs-custom-development',
      title: 'No-code or custom code for your MVP?',
      category: 'Building',
      status: 'draft',
      excerpt: 'When no-code platforms are the smart choice, and when custom code is worth it.',
      cover: '',
      body: '<p>Draft in progress.</p>',
      authorId: String(au2._id),
    },
  ]);
  console.log('Seeded blog posts, categories and authors');

  // --- FAQs: ported from the frontend's old static lib/service-faqs.ts (+ the calculator/home lists) ---
  const faqGroups = faqsData as Record<string, { q: string; a: string }[]>;
  const faqDocs = Object.entries(faqGroups).flatMap(([group, items]) =>
    items.map((item, i) => ({
      group,
      question: item.q,
      answer: item.a,
      order: i,
      published: true,
    })),
  );
  await Faq.insertMany(faqDocs);
  console.log(`Seeded ${faqDocs.length} FAQs across ${Object.keys(faqGroups).length} groups`);

  // --- Newsletter: full parity with lib/admin/newsletter.ts's seedSubscribers (65 items) ---
  const subscribers = seedSubscribersData(now).map((s) => ({
    ...s,
    unsubscribeToken: randomBytes(24).toString('hex'),
  }));
  await Subscriber.insertMany(subscribers);
  console.log(`Seeded ${subscribers.length} newsletter subscribers`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
