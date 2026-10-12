/* eslint-disable no-console */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  autoReplyEmail,
  bookingAdminEmail,
  bookingVisitorEmail,
  enquiryAdminEmail,
  enquiryReplyEmail,
  newsletterUnsubscribeEmail,
  newsletterWelcomeEmail,
  subscriberAdminEmail,
} from '../modules/email/templates';

const settings = {
  fromName: 'TechClues',
  recipients: ['techcluesltd@gmail.com'],
  signature: 'Best wishes,\nTechClues team\ntechcluesltd@gmail.com\n+44 7472 411699',
};

const sampleEnquiry = {
  name: 'Sarah Whitfield',
  email: 'sarah@brightpathtutoring.co.uk',
  subject: 'Tutoring marketplace: MVP and web app',
  message:
    'Hi, we run a small tutoring agency in Manchester and want to turn it into a marketplace where parents can book vetted tutors online.',
  source: 'contact',
};

const sampleBooking = {
  name: 'Daniel Okafor',
  email: 'daniel@fleetwise.io',
  start: new Date(Date.now() + 86_400_000),
  topic: 'Estimate review',
  meetingLink: 'https://meet.google.com/techclues-calls',
};

const pages: Record<string, { subject: string; html: string; text: string }> = {
  'enquiry-admin': enquiryAdminEmail(sampleEnquiry),
  'auto-reply': autoReplyEmail(
    'Sarah',
    "Thanks for reaching out — we'll take a look and get back to you within a few hours with next steps.",
    settings,
  ),
  'enquiry-reply': enquiryReplyEmail(
    'Sarah',
    "Thanks for the detail — a web and mobile marketplace like this usually starts with a focused MVP covering sign-up, tutor profiles and booking. I'll send a short proposal by Friday.",
    sampleEnquiry,
    settings,
  ),
  'booking-admin-created': bookingAdminEmail(sampleBooking, 'created'),
  'booking-admin-cancelled': bookingAdminEmail(
    sampleBooking,
    'cancelled',
    'Visitor asked to cancel',
  ),
  'booking-confirmed': bookingVisitorEmail(sampleBooking, 'confirmed', settings),
  'booking-rescheduled': bookingVisitorEmail(sampleBooking, 'rescheduled', settings),
  'booking-cancelled': bookingVisitorEmail(
    sampleBooking,
    'cancelled',
    settings,
    'Visitor asked to cancel',
  ),
  'newsletter-welcome': newsletterWelcomeEmail('visitor@example.com', 'sample-token', settings),
  'newsletter-unsubscribe': newsletterUnsubscribeEmail('visitor@example.com', settings),
  'subscriber-admin': subscriberAdminEmail('visitor@example.com subscribed via footer.'),
};

const outDir = join(__dirname, '../../email-previews');
mkdirSync(outDir, { recursive: true });
for (const [name, mail] of Object.entries(pages)) {
  writeFileSync(join(outDir, `${name}.html`), mail.html);
  writeFileSync(join(outDir, `${name}.txt`), mail.text);
  console.log(`Wrote ${name}.html / ${name}.txt — subject: "${mail.subject}"`);
}
console.log(`\nPreviews written to ${outDir}`);
