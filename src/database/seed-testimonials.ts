/* eslint-disable no-console */
// One-off, additive seed: ports the homepage's previously-hardcoded testimonial list into the
// new Testimonial collection so the admin-managed rotator launches with real content instead of
// empty. Only inserts if the collection is still empty — pass --force to reset. Run with
// `npm run seed:testimonials`.
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { TestimonialSchema } from './schemas/testimonial.schema';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const TESTIMONIALS = [
  { quote: 'TechClues turned our rough sketch into a live MVP in less than six weeks. A working build landed in front of us weekly, and the cost stayed exactly as first quoted.', name: 'Daniel Hughes', role: 'Founder, UK property start-up', initials: 'DH' },
  { quote: 'The old site looked decent but never generated enquiries. Since TechClues rebuilt it, pages load quicker and phone calls from Google began arriving in the first month.', name: 'Sarah Mitchell', role: 'Practice manager, dental clinic', initials: 'SM' },
  { quote: 'We arrived with a part-built prototype made using AI tools. They cleaned it up, locked it down and made it fit for actual customers, explaining each choice in everyday English.', name: 'Tom Fletcher', role: 'CEO, e-commerce start-up', initials: 'TF' },
  { quote: 'A custom dashboard from them now handles our orders and stock automatically. My team gets hours back each day, and at last I can see sales, inventory and staff tasks in one place.', name: 'Jennifer Walsh', role: 'Operations director, retail business', initials: 'JW' },
];

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

  const existing = await Testimonial.countDocuments();
  if (existing > 0 && !process.argv.includes('--force')) {
    console.log(`Testimonial collection already has ${existing} document(s) — skipping. Pass --force to reset.`);
    await mongoose.disconnect();
    return;
  }
  if (existing > 0) {
    await Testimonial.deleteMany({});
    console.log(`Cleared ${existing} existing testimonial(s).`);
  }

  await Testimonial.insertMany(TESTIMONIALS.map((t, order) => ({ ...t, order, published: true })));
  console.log(`Inserted ${TESTIMONIALS.length} testimonials.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
