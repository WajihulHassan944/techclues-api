/* eslint-disable no-console */
// One-off, idempotent seed: upserts the 11 /services/* pages' editable copy (grid-card title/
// description/features + hero eyebrow/headline/subheading), ported verbatim from the existing
// hardcoded markup so nothing changes visually until an admin edits something. Safe to re-run —
// upserted by slug. Run with `npm run seed:services`.
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { ServiceSchema } from './schemas/service.schema';
import { SERVICES } from './seed-services-data';

dns.setServers(['1.1.1.1', '8.8.8.8']);

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const Service = mongoose.model('Service', ServiceSchema);

  let written = 0;
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    await Service.updateOne({ slug: s.slug }, { $set: { ...s, order: i } }, { upsert: true });
    written += 1;
  }
  console.log(`Upserted ${written} services.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
