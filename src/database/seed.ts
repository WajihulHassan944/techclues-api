/* eslint-disable no-console */
import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AdminSchema } from './schemas/admin.schema';
import { EnquirySchema } from './schemas/enquiry.schema';
import { BookingSchema, AvailabilitySchema } from './schemas/booking.schema';
import { BlogPostSchema, BlogCategorySchema, BlogAuthorSchema } from './schemas/blog.schema';
import { SubscriberSchema } from './schemas/subscriber.schema';
import { SettingsSchema } from './schemas/settings.schema';
import { DEFAULT_TEMPLATES, SIGNATURE } from '../common/constants/defaults';
import { DEFAULT_AVAILABILITY } from '../common/utils/availability';
import { BODIES } from './seed-blog-bodies';

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
  const Booking = mongoose.model('Booking', BookingSchema);
  const Availability = mongoose.model('Availability', AvailabilitySchema);
  const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
  const BlogCategory = mongoose.model('BlogCategory', BlogCategorySchema);
  const BlogAuthor = mongoose.model('BlogAuthor', BlogAuthorSchema);
  const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
  const Settings = mongoose.model('Settings', SettingsSchema);

  await Promise.all([
    Enquiry.deleteMany({}),
    Booking.deleteMany({}),
    Availability.deleteMany({}),
    BlogPost.deleteMany({}),
    BlogCategory.deleteMany({}),
    BlogAuthor.deleteMany({}),
    Subscriber.deleteMany({}),
  ]);

  const now = Date.now();
  const min = (m: number) => new Date(now - m * 60_000);

  // --- Admin ---
  const email = process.env.ADMIN_EMAIL ?? 'techcluesltd@gmail.com';
  const existingAdmin = await Admin.findOne({ email });
  if (!existingAdmin) {
    const passwordHash =
      process.env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash('ChangeMe123!', 12));
    await Admin.create({ email, passwordHash });
    console.log(`Seeded admin ${email}`);
  }

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

  // --- Enquiries (representative subset of the frontend's seedInbox) ---
  await Enquiry.insertMany([
    {
      source: 'contact',
      name: 'Sarah Whitfield',
      email: 'sarah@brightpathtutoring.co.uk',
      company: 'Brightpath Tutoring',
      subject: 'Tutoring marketplace: MVP and web app',
      message:
        'Hi, we run a small tutoring agency in Manchester and want to turn it into a marketplace where parents can book vetted tutors online. We have a rough spec and about six months of runway. Could we talk through what an MVP would look like and what it might cost?',
      details: [
        { label: 'I need', value: 'MVP, Web or mobile app' },
        { label: 'Budget', value: '£15k–£40k' },
      ],
      received: min(12),
      status: 'new',
      folder: 'inbox',
    },
    {
      source: 'calculator',
      name: 'Daniel Okafor',
      email: 'daniel@fleetwise.io',
      phone: '+44 7700 900412',
      company: 'Fleetwise',
      subject: 'Estimate: fleet maintenance web and mobile app',
      message: 'Used the MVP cost calculator and asked for the estimate by email.',
      details: [
        { label: 'Goal', value: 'Launch a new product' },
        { label: 'Platform', value: 'Web and mobile' },
        { label: 'Pace', value: 'Balanced' },
      ],
      result: {
        title: 'Estimate shown to the visitor',
        headline: '£18,400 – £24,600',
        lines: ['Timeline: 10–12 weeks', 'Based on 4 features, web and mobile'],
      },
      received: min(47),
      status: 'new',
      folder: 'inbox',
    },
    {
      source: 'kill-my-idea',
      name: 'Priya Nair',
      email: 'priya.nair@gmail.com',
      subject: 'Idea tested: pet-sitter marketplace',
      message: 'A marketplace that matches busy professionals with trusted pet sitters nearby.',
      details: [
        { label: 'Who is it for?', value: 'Busy professionals with dogs or cats in UK cities' },
        { label: 'What do they use today?', value: 'Facebook groups, Rover, friends' },
      ],
      result: {
        title: 'Verdict shown to the visitor',
        headline: 'Watch this',
        lines: ['Holds up: you already have an audience', 'Weak point: Rover is free and familiar'],
      },
      received: min(130),
      status: 'new',
      folder: 'inbox',
    },
    {
      source: 'grant',
      name: 'Marcus Doyle',
      email: 'marcus@doylefabrication.co.uk',
      phone: '+44 7911 123456',
      company: 'Doyle Fabrication Ltd',
      subject: 'Grant support: production scheduling automation',
      message:
        'We want to replace spreadsheets with a production scheduling tool and would like to know whether any funding could support it.',
      details: [
        { label: 'Type of business', value: 'Limited company' },
        { label: 'Based in', value: 'England' },
      ],
      received: min(190),
      status: 'new',
      folder: 'inbox',
    },
    {
      source: 'zero-one',
      name: 'Hannah Lee',
      email: 'hannah@fitloop.app',
      phone: '+44 7488 220915',
      company: 'FitLoop',
      subject: 'ZERO.ONE brief: last-minute gym classes',
      message:
        'An app that fills last-minute gym class cancellations by offering the spots to nearby members at a discount.',
      received: min(1500),
      read: true,
      status: 'new',
      folder: 'inbox',
    },
    {
      source: 'partner-join',
      name: 'Aisha Rahman',
      email: 'aisha@rahmanandco.co.uk',
      company: 'Rahman & Co Accountants',
      subject: 'Partner application: accountancy practice',
      message:
        'We advise around 120 small businesses and regularly get asked who to trust for software. Interested in becoming a referral partner.',
      received: min(2900),
      read: true,
      status: 'replied',
      folder: 'inbox',
      thread: [
        {
          from: 'us',
          at: min(2700),
          body: "Hi Aisha,\n\nThanks for applying, we'd be glad to have you as a partner. I'll send over the partner pack and the referral terms today.",
          deliveryStatus: 'sent',
        },
      ],
    },
    {
      source: 'careers',
      name: 'Luca Moretti',
      email: 'luca.moretti@proton.me',
      subject: 'Application: Frontend Developer',
      message: 'Applying for the frontend role — portfolio and CV attached.',
      received: min(3000),
      read: true,
      status: 'new',
      folder: 'inbox',
    },
  ]);
  console.log('Seeded enquiries');

  // --- Availability + Bookings ---
  await Availability.create(DEFAULT_AVAILABILITY);
  const soon = new Date(now + 150 * 60_000);
  await Booking.insertMany([
    {
      name: 'Aisha Rahman',
      email: 'aisha@rahmanandco.co.uk',
      phone: '+44 7700 900117',
      company: 'Rahman & Co Accountants',
      start: soon,
      minutes: 30,
      topic: 'Partner introduction',
      via: 'Book a call',
      status: 'confirmed',
      history: [{ at: min(2600), text: 'Booked on the website (Book a call)' }],
    },
    {
      name: 'James Carter',
      email: 'james@northernfreight.co.uk',
      phone: '+44 7766 301288',
      company: 'Northern Freight',
      start: new Date(now + 86_400_000 + 3_600_000 * 11),
      minutes: 30,
      topic: 'Shipment tracking portal: scoping',
      via: 'Book a call',
      status: 'confirmed',
      history: [{ at: min(3800), text: 'Booked on the website (Book a call)' }],
    },
    {
      name: 'Hannah Lee',
      email: 'hannah@fitloop.app',
      phone: '+44 7488 220915',
      company: 'FitLoop',
      start: new Date(now + 86_400_000 + 3_600_000 * 15.5),
      minutes: 30,
      topic: 'ZERO.ONE scope call',
      via: 'ZERO.ONE brief',
      status: 'confirmed',
      history: [{ at: min(1400), text: 'Booked on the website (ZERO.ONE brief)' }],
    },
    {
      name: 'Emily Zhang',
      email: 'emily@lumenhealth.co',
      company: 'Lumen Health',
      start: new Date(now - 86_400_000),
      minutes: 30,
      topic: 'Patient intake app',
      via: 'Book a call',
      status: 'completed',
      history: [{ at: min(5600), text: 'Booked on the website (Book a call)' }],
    },
    {
      name: 'Tom Gallagher',
      email: 'tom@pixelandpine.studio',
      company: 'Pixel & Pine',
      start: new Date(now + 3 * 86_400_000),
      minutes: 30,
      topic: 'Referral partner catch-up',
      via: 'Book a call',
      status: 'cancelled',
      cancelReason: 'Visitor asked to cancel',
      history: [
        { at: min(1600), text: 'Booked on the website (Book a call)' },
        { at: min(300), text: 'Cancelled: Visitor asked to cancel' },
      ],
    },
  ]);
  console.log('Seeded bookings + availability');

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
      cover: '/images/media/mvp-software-development-vebryx-7df8a242be.webp',
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

  // --- Newsletter ---
  await Subscriber.insertMany(
    [
      ['amelia@example.com', 'Amelia Ford', 'footer'],
      ['ryan@example.com', 'Ryan Clarke', 'blog'],
      ['nadia@example.com', 'Nadia Hussain', 'manual'],
    ].map(([email2, name, source]) => ({
      email: email2,
      name,
      source,
      status: 'subscribed',
      at: min(Math.random() * 5000),
      unsubscribeToken: Math.random().toString(36).slice(2),
    })),
  );
  console.log('Seeded newsletter subscribers');

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
