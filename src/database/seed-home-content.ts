/* eslint-disable no-console */
// One-off, idempotent seed: populates the homepage's editable text blocks with the current
// hardcoded copy, only for keys not already set (so it never clobbers an admin's edit). Run with
// `npm run seed:home-content`.
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { PageContentSchema } from './schemas/page-content.schema';
import { HOME_CONTENT } from './seed-home-content-data';

dns.setServers(['1.1.1.1', '8.8.8.8']);

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const PageContent = mongoose.model('PageContent', PageContentSchema);
  const existing = await PageContent.findOne({ page: 'home' }).lean();
  const have = existing ? new Set(Object.keys(existing.blocks ?? {})) : new Set<string>();
  const missing = Object.fromEntries(
    Object.entries(HOME_CONTENT).filter(([k]) => !have.has(k)).map(([k, v]) => [k, v.value]),
  );
  if (Object.keys(missing).length === 0) {
    console.log('Nothing to seed — every key already has a value.');
  } else {
    await PageContent.findOneAndUpdate(
      { page: 'home' },
      { $set: Object.fromEntries(Object.entries(missing).map(([k, v]) => [`blocks.${k}`, v])) },
      { upsert: true },
    );
    console.log(`Seeded ${Object.keys(missing).length} key(s).`);
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
