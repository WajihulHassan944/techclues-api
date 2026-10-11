# Progress — techclues-api

## Phase 1: backend (in progress)

### Done
- NestJS scaffold: config validation (fail-fast), helmet, compression, CORS allowlist, global
  ValidationPipe, global exception filter, request logging, rate limiting (`@nestjs/throttler`),
  Swagger at `/api/docs` (disabled in production), `/api/health`.
- Auth: single admin seeded from env, JWT access + httpOnly-cookie refresh, lockout after 5 failed
  attempts (15 min), change-password invalidates other sessions via token version bump.
- Public endpoints: contact, brief (MVP calculator), zero-one, availability, bookings, newsletter
  subscribe/unsubscribe. All with honeypot + per-route throttling.
- Admin endpoints: inbox (list/search/filter/read/star/status/move/notes/reply/block/templates via
  settings), bookings (list/reschedule/cancel/status/availability/blocked dates/delete-by-email),
  blog (CRUD/categories/authors/image upload/duplicate), newsletter (list/add/import/export/stats),
  settings, activity log, dashboard stats, privacy (find/erase), Pusher auth, Cloudinary
  signature+upload+delete.
- Data layer: Mongoose schemas with the indexes described in the task (unique slug, unique
  confirmed-booking slot, email indexes, text index for inbox search). TTL/retention for spam is
  enforced via a cron-triggered purge endpoint, not a static TTL index (see below).
- Booking conflict prevention: availability/slot logic ported verbatim from the frontend's
  `lib/admin/tz.ts` + `availability.ts` (unit-tested, including the BST/GMT clock change), plus a
  partial unique index on `{start, status:"confirmed"}` as a second line of defense.
- Seed script (`npm run seed`) loads a representative subset of the frontend's sample data —
  enquiries across all sources, bookings, the 3 real blog posts (exact bodies copied from
  `blog-bodies.ts`) plus the 3 draft/scheduled ones, and sample subscribers. Refuses to run unless
  `MONGODB_URI_DEV` is set.
- Tests: 12 unit tests (availability/tz edge cases including DST, newsletter email validation) + 15
  e2e tests against `mongodb-memory-server` covering auth, every public endpoint, booking conflict,
  CSV export, and the privacy find/erase flow. All passing. GitHub Actions CI runs lint + build +
  both test suites on push/PR.
- Secrets hygiene: `.env` is gitignored, `.env.example` has names only, verified no secret values
  are staged for commit.

### In progress / not yet done
- Vercel project linking and first deploy.
- Vercel env vars (production + preview + development).
- Live smoke test against the deployed URL.
- Phase 2 (frontend integration) — not started.

### Decisions made without stopping to ask
- **Mongo URI routing**: `configuration.ts` only reads `MONGODB_URI` when `NODE_ENV=production`;
  development and test always use `MONGODB_URI_DEV`. This was tightened mid-build after local
  testing revealed the opposite logic would let a local `npm run start:dev` silently write to the
  production-labeled database. See the Manual Checklist in `README.md` for the one stray test
  document this produced before the fix, which needs manual deletion.
- **Admin password**: none was provided (the brief left `ADMIN_PASSWORD=<I'LL PUT MY ADMIN PASSWORD
  HERE>`), so a random 16-character temporary password was generated and hashed. It was shared once
  in the chat response — rotate it immediately via `/api/auth/change-password` after first login.
- **Brevo sender verification**: discovered during testing that the connected Brevo account had no
  verified sender matching `techcluesltd@gmail.com` (only an unrelated "Latache" sender existed).
  Added `techcluesltd@gmail.com` as a sender via the Brevo API — **a verification email was sent to
  that inbox and must be clicked before any email will actually send.**
- **MVP calculator ("brief") scoring**: the backend accepts the `result` card (title/headline/lines)
  from the client rather than recomputing it, since the calculator's scoring logic lives in a
  multi-step frontend wizard component with no backend equivalent yet. Flagged as a known gap, not
  silently assumed safe.
- **Cron jobs**: `@nestjs/schedule` doesn't work reliably on Vercel serverless (no persistent
  process for its timers). Replaced with two secret-guarded HTTP endpoints meant to be called by
  Vercel Cron or an external scheduler — not yet wired up to an actual schedule.
- **IDs**: switched from the frontend's human-readable sample ids (`enq-1001`) to Mongo ObjectIds,
  after confirming via research that nothing in the frontend parses the numeric suffix meaningfully.
