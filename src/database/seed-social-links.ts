/* eslint-disable no-console */
// One-off, additive seed: adds the footer's social icons (LinkedIn, Instagram, Facebook, Google)
// as FooterLink documents in the new "social" group, ported from the previously-hardcoded markup
// in components/site/SiteFooter.tsx. Only inserts if the group is still empty, so it never
// duplicates or overwrites links an admin has already added — pass --force to reset just this
// group. Run with `npm run seed:social-links`.
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import { FooterLinkSchema } from './schemas/footer-link.schema';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/khashir-khalil-57577a10a' },
  { label: 'Instagram', href: 'https://www.instagram.com/techclues.uk/' },
  { label: 'Facebook', href: 'https://www.facebook.com/officialtechclues' },
  { label: 'Google', href: 'https://www.google.com/maps?q=52.42898951737887,-1.8330309441802974' },
];

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const FooterLink = mongoose.model('FooterLink', FooterLinkSchema);

  const existing = await FooterLink.countDocuments({ group: 'social' });
  if (existing > 0 && !process.argv.includes('--force')) {
    console.log(
      `"social" group already has ${existing} link(s) — skipping. Pass --force to reset.`,
    );
    await mongoose.disconnect();
    return;
  }
  if (existing > 0) {
    await FooterLink.deleteMany({ group: 'social' });
    console.log(`Cleared ${existing} existing social link(s).`);
  }

  const docs = SOCIAL_LINKS.map((link, order) => ({
    group: 'social',
    label: link.label,
    href: link.href,
    order,
    newTab: true,
    published: true,
  }));
  await FooterLink.insertMany(docs);
  console.log(`Inserted ${docs.length} social links.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
