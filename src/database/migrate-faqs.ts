/* eslint-disable no-console */
// One-off, idempotent migration: ports the FAQ content that used to live as static data in the
// frontend (lib/service-faqs.ts, plus the inline lists on the calculator and homepage) into the
// Faq collection, so it becomes editable from the admin panel. Safe to re-run: it does nothing
// if the collection already has documents, unless --force is passed.
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { FaqSchema } from './schemas/faq.schema';
import faqsData from './data/faqs-data.json';

// Some local/corporate networks ship a Node-visible resolver that can't do the SRV + TXT
// lookups `mongodb+srv://` needs, even though the OS's own resolver handles them fine —
// pointing Node at a public resolver sidesteps that without touching system DNS settings.
dns.setServers(['1.1.1.1', '8.8.8.8']);

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this migration.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const Faq = mongoose.model('Faq', FaqSchema);

  const existing = await Faq.countDocuments();
  if (existing > 0 && !process.argv.includes('--force')) {
    console.log(
      `Faq collection already has ${existing} document(s) — skipping. Pass --force to wipe and reseed.`,
    );
    await mongoose.disconnect();
    return;
  }
  if (existing > 0) {
    await Faq.deleteMany({});
    console.log(`Cleared ${existing} existing FAQ(s).`);
  }

  const groups = faqsData as Record<string, { q: string; a: string }[]>;
  const docs: {
    group: string;
    question: string;
    answer: string;
    order: number;
    published: boolean;
  }[] = [];
  for (const [group, items] of Object.entries(groups)) {
    items.forEach((item, i) => {
      docs.push({ group, question: item.q, answer: item.a, order: i, published: true });
    });
  }

  await Faq.insertMany(docs);
  console.log(`Inserted ${docs.length} FAQs across ${Object.keys(groups).length} groups.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
