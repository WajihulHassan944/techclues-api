/* eslint-disable no-console */
// One-off: promotes the existing admin account to role "super_admin" (needed now that admin
// accounts carry roles) and sets its password to the value given for this account. Safe to
// re-run — it only ever touches the one account matched by ADMIN_EMAIL. Run with
// `npm run seed:super-admin`.
import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AdminSchema } from './schemas/admin.schema';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const EMAIL = process.env.ADMIN_EMAIL ?? 'techcluesltd@gmail.com';
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URI_DEV;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_DEV) to run this seed.');
    process.exit(1);
  }
  if (!PASSWORD) {
    console.error('Set SUPER_ADMIN_PASSWORD to run this seed.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${uri.replace(/\/\/.*@/, '//***@')}`);

  const Admin = mongoose.model('Admin', AdminSchema);
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const result = await Admin.findOneAndUpdate(
    { email: EMAIL.toLowerCase() },
    {
      $set: {
        email: EMAIL.toLowerCase(),
        passwordHash,
        role: 'super_admin',
        blocked: false,
        failedLoginAttempts: 0,
      },
      $unset: { lockUntil: '' },
      $setOnInsert: { tokenVersion: 0, twoFactorEnabled: false, twoFactorRecoveryCodes: [] },
    },
    { upsert: true, new: true },
  );

  console.log(`Super admin ready: ${result.email} (role: ${result.role})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
