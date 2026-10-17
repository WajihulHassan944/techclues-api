"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const admin_schema_1 = require("./schemas/admin.schema");
const enquiry_schema_1 = require("./schemas/enquiry.schema");
const blocked_sender_schema_1 = require("./schemas/blocked-sender.schema");
const booking_schema_1 = require("./schemas/booking.schema");
const blog_schema_1 = require("./schemas/blog.schema");
const faq_schema_1 = require("./schemas/faq.schema");
const subscriber_schema_1 = require("./schemas/subscriber.schema");
const settings_schema_1 = require("./schemas/settings.schema");
const defaults_1 = require("../common/constants/defaults");
const availability_1 = require("../common/utils/availability");
const seed_blog_bodies_1 = require("./seed-blog-bodies");
const seed_generators_1 = require("./seed-generators");
const faqs_data_json_1 = __importDefault(require("./data/faqs-data.json"));
async function main() {
    const uri = process.env.MONGODB_URI_DEV;
    if (!uri) {
        console.error('Refusing to seed: set MONGODB_URI_DEV in .env to a DEV/TEST database. ' +
            'This script never runs against MONGODB_URI (production).');
        process.exit(1);
    }
    await mongoose_1.default.connect(uri);
    console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);
    const Admin = mongoose_1.default.model('Admin', admin_schema_1.AdminSchema);
    const Enquiry = mongoose_1.default.model('Enquiry', enquiry_schema_1.EnquirySchema);
    const BlockedSender = mongoose_1.default.model('BlockedSender', blocked_sender_schema_1.BlockedSenderSchema);
    const Booking = mongoose_1.default.model('Booking', booking_schema_1.BookingSchema);
    const Availability = mongoose_1.default.model('Availability', booking_schema_1.AvailabilitySchema);
    const BlogPost = mongoose_1.default.model('BlogPost', blog_schema_1.BlogPostSchema);
    const BlogCategory = mongoose_1.default.model('BlogCategory', blog_schema_1.BlogCategorySchema);
    const BlogAuthor = mongoose_1.default.model('BlogAuthor', blog_schema_1.BlogAuthorSchema);
    const Faq = mongoose_1.default.model('Faq', faq_schema_1.FaqSchema);
    const Subscriber = mongoose_1.default.model('Subscriber', subscriber_schema_1.SubscriberSchema);
    const Settings = mongoose_1.default.model('Settings', settings_schema_1.SettingsSchema);
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
    const email = process.env.ADMIN_EMAIL ?? 'techcluesltd@gmail.com';
    const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash('ChangeMe123!', 12));
    await Admin.findOneAndUpdate({ email }, {
        $set: { email, passwordHash, failedLoginAttempts: 0, tokenVersion: 0 },
        $unset: { lockUntil: 1 },
    }, { upsert: true });
    console.log(`Seeded admin ${email}`);
    await Settings.deleteMany({});
    await Settings.create({
        recipients: ['info@techclues.co.uk'],
        events: { enquiry: true, booking: true, cancelled: true, subscriber: false, summary: true },
        summaryTime: '08:00',
        fromName: 'TechClues',
        signature: defaults_1.SIGNATURE,
        templates: defaults_1.DEFAULT_TEMPLATES,
        retention: { spamDays: 30, enquiryMonths: 0 },
    });
    const { enquiries, blocked } = (0, seed_generators_1.seedInboxData)(now);
    await Enquiry.insertMany(enquiries);
    await BlockedSender.insertMany(blocked);
    console.log(`Seeded ${enquiries.length} enquiries and ${blocked.length} blocked sender(s)`);
    await Availability.create(availability_1.DEFAULT_AVAILABILITY);
    const bookings = (0, seed_generators_1.seedBookingsData)(now);
    await Booking.insertMany(bookings);
    console.log(`Seeded ${bookings.length} bookings + availability`);
    const categories = await BlogCategory.insertMany(['AI', 'Funding', 'Costs', 'Building', 'Validation', 'Strategy'].map((name) => ({ name })));
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
            excerpt: 'MVP software development helps startups test ideas with real users, cut costs, and use AI tools to move fast without overbuilding.',
            cover: '/images/media/mvp-software-development-techclues.webp',
            coverAlt: 'MVP Software Development',
            body: seed_blog_bodies_1.BODIES['mvp-software-development-age-of-ai'],
            publishedAt: new Date('2026-10-06T09:00:00Z'),
            authorId: String(au1._id),
            seoTitle: 'MVP Software Development in the Age of AI | TechClues',
            seoDescription: 'Most startups fail because they build too much, too early. MVP software development is how you validate before you commit.',
        },
        {
            slug: 'ai-funding-uk-scotland',
            title: 'Funding for AI projects in the UK and Scotland',
            category: 'Funding',
            status: 'published',
            excerpt: "What's actually open to UK and Scottish businesses that want to use AI, and how to plan a project that doesn't depend on a grant.",
            cover: '/images/blog/ai-funding.jpg',
            coverAlt: 'Victorian and modern buildings side by side in Glasgow',
            body: seed_blog_bodies_1.BODIES['ai-funding-uk-scotland'],
            publishedAt: new Date('2026-09-25T09:00:00Z'),
            authorId: String(au1._id),
            seoTitle: 'AI Funding for UK & Scottish Businesses (2026) | TechClues',
            seoDescription: "What's actually open to UK and Scottish businesses that want to use AI, including what's paused.",
        },
        {
            slug: 'mvp-cost-uk',
            title: 'How much does an MVP cost in the UK?',
            category: 'Costs',
            status: 'published',
            excerpt: 'What an MVP budget pays for, the four choices that move the price most, and the costs founders forget.',
            cover: '/images/services/mvp.jpg',
            coverAlt: 'A team planning a product together at a whiteboard',
            body: seed_blog_bodies_1.BODIES['mvp-cost-uk'],
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
            excerpt: 'A prototype answers "can we build it?" and an MVP answers "will anyone use it?". Here\'s how to choose.',
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
    const faqGroups = faqs_data_json_1.default;
    const faqDocs = Object.entries(faqGroups).flatMap(([group, items]) => items.map((item, i) => ({
        group,
        question: item.q,
        answer: item.a,
        order: i,
        published: true,
    })));
    await Faq.insertMany(faqDocs);
    console.log(`Seeded ${faqDocs.length} FAQs across ${Object.keys(faqGroups).length} groups`);
    const subscribers = (0, seed_generators_1.seedSubscribersData)(now).map((s) => ({
        ...s,
        unsubscribeToken: (0, crypto_1.randomBytes)(24).toString('hex'),
    }));
    await Subscriber.insertMany(subscribers);
    console.log(`Seeded ${subscribers.length} newsletter subscribers`);
    await mongoose_1.default.disconnect();
    console.log('Done.');
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map