"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const templates_1 = require("../modules/email/templates");
const settings = {
    fromName: 'TechClues',
    recipients: ['info@techclues.co.uk'],
    signature: 'Best wishes,\nTechClues team\ninfo@techclues.co.uk\n+44 7472 411699',
};
const sampleEnquiry = {
    name: 'Sarah Whitfield',
    email: 'sarah@brightpathtutoring.co.uk',
    subject: 'Tutoring marketplace: MVP and web app',
    message: 'Hi, we run a small tutoring agency in Manchester and want to turn it into a marketplace where parents can book vetted tutors online.',
    source: 'contact',
};
const sampleBooking = {
    name: 'Daniel Okafor',
    email: 'daniel@fleetwise.io',
    start: new Date(Date.now() + 86_400_000),
    topic: 'Estimate review',
    meetingLink: 'https://meet.jit.si/TechClues-Calls',
};
const pages = {
    'enquiry-admin': (0, templates_1.enquiryAdminEmail)(sampleEnquiry),
    'auto-reply': (0, templates_1.autoReplyEmail)('Sarah', "Thanks for reaching out — we'll take a look and get back to you within a few hours with next steps.", settings),
    'enquiry-reply': (0, templates_1.enquiryReplyEmail)('Sarah', "Thanks for the detail — a web and mobile marketplace like this usually starts with a focused MVP covering sign-up, tutor profiles and booking. I'll send a short proposal by Friday.", sampleEnquiry, settings),
    'booking-admin-created': (0, templates_1.bookingAdminEmail)(sampleBooking, 'created'),
    'booking-admin-cancelled': (0, templates_1.bookingAdminEmail)(sampleBooking, 'cancelled', 'Visitor asked to cancel'),
    'booking-confirmed': (0, templates_1.bookingVisitorEmail)(sampleBooking, 'confirmed', settings),
    'booking-rescheduled': (0, templates_1.bookingVisitorEmail)(sampleBooking, 'rescheduled', settings),
    'booking-cancelled': (0, templates_1.bookingVisitorEmail)(sampleBooking, 'cancelled', settings, 'Visitor asked to cancel'),
    'newsletter-welcome': (0, templates_1.newsletterWelcomeEmail)('visitor@example.com', 'sample-token', settings),
    'newsletter-unsubscribe': (0, templates_1.newsletterUnsubscribeEmail)('visitor@example.com', settings),
    'subscriber-admin': (0, templates_1.subscriberAdminEmail)('visitor@example.com subscribed via footer.'),
};
const outDir = (0, path_1.join)(__dirname, '../../email-previews');
(0, fs_1.mkdirSync)(outDir, { recursive: true });
for (const [name, mail] of Object.entries(pages)) {
    (0, fs_1.writeFileSync)((0, path_1.join)(outDir, `${name}.html`), mail.html);
    (0, fs_1.writeFileSync)((0, path_1.join)(outDir, `${name}.txt`), mail.text);
    console.log(`Wrote ${name}.html / ${name}.txt — subject: "${mail.subject}"`);
}
console.log(`\nPreviews written to ${outDir}`);
//# sourceMappingURL=email-preview.js.map