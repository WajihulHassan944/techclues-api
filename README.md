# TechClues API

NestJS backend for [techclues.co.uk](https://techclues.co.uk) — the marketing site's public forms
(contact, MVP calculator, ZERO.ONE brief, booking, newsletter) and the admin panel (inbox, bookings,
blog, newsletter, settings, activity log).

## Stack

- **NestJS** (TypeScript, strict) on **Express**
- **MongoDB Atlas** via Mongoose
- **Cloudinary** for blog image uploads
- **Brevo** for transactional email and the newsletter contact list
- **Pusher** for realtime admin notifications
- Deployed to **Vercel** as a serverless function (`api/index.ts`), built with `nest build` (plain
  `tsc`, not webpack) so the compiled `dist/` output is required directly by the handler.

## Local setup

```bash
npm install
cp .env.example .env   # fill in real values — see table below
npm run build
npm run seed            # loads sample data into MONGODB_URI_DEV — NEVER run against prod
npm run start:dev
```

The server listens on `PORT` (default 4000) with the global prefix `/api`, so health is at
`http://localhost:4000/api/health`. Swagger docs are at `/api/docs` outside production.

**Database safety:** `configuration.ts` only uses `MONGODB_URI` (the real database) when
`NODE_ENV=production`. Local dev and the test suite always use `MONGODB_URI_DEV`. This is
deliberate — it means a developer can never accidentally point their local server or `npm run seed`
at production data, even if `MONGODB_URI` is set in their `.env`.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | no | `development` \| `production` \| `test`. Only `production` uses `MONGODB_URI`. |
| `PORT` | no | Local dev only; ignored on Vercel. |
| `ADMIN_EMAIL` | yes | Seeded into the `admins` collection on first boot if no admin exists. |
| `ADMIN_PASSWORD_HASH` | yes | bcrypt hash, cost 12. Generate with `node -e "require('bcryptjs').hash('yourpassword',12).then(console.log)"`. |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | yes | Random 64-byte hex strings. Never reuse between environments. |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | no | Default `15m` / `7d`. |
| `NOTIFY_EMAIL` | yes | Default recipient seeded into Settings on first boot. |
| `ALLOWED_ORIGINS` | yes | Comma-separated CORS allowlist. Any `*.vercel.app` origin is also allowed automatically (covers preview deployments). |
| `MONGODB_URI` | yes | **Production** database. Only read when `NODE_ENV=production`. |
| `MONGODB_URI_DEV` | yes (for dev/test) | Dev/test database. Used for local dev, `npm run seed`, and CI. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | yes | Blog image uploads. |
| `BREVO_API_KEY` | yes | Transactional email + newsletter list sync. Without it, emails are logged, not sent (dev-safe no-op). |
| `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME` | yes | **Must be a verified sender in Brevo** — see Manual Checklist below. |
| `BREVO_LIST_ID` | no | Newsletter list id. Create one in Brevo if you don't have one. |
| `PUSHER_APP_ID` / `PUSHER_KEY` / `PUSHER_SECRET` / `PUSHER_CLUSTER` | yes | Realtime admin events. Without these, Pusher calls are no-ops. |
| `TURNSTILE_SECRET` | no | Not yet wired into public form handlers — reserved for future bot protection. |

## Architecture notes

- **Serverless on Vercel**: `api/index.ts` lazily builds the Nest app once per cold start and caches
  it (and its Mongoose connection) in a module-level variable, so warm invocations reuse both. It
  `require()`s the **compiled** `dist/bootstrap.js`, not the TypeScript source — Vercel's bundler for
  `/api` functions doesn't reliably support `emitDecoratorMetadata`, which Nest's DI depends on.
  `vercel.json`'s `buildCommand` runs `nest build` first so `dist/` exists before the function is
  bundled.
- **Cron jobs on serverless**: periodic jobs (purging old spam, publishing scheduled blog posts)
  can't use `@nestjs/schedule`'s in-process timers, because a serverless function doesn't stay alive
  between requests. Instead, `POST /api/internal/cron/purge-spam` and
  `POST /api/internal/cron/publish-scheduled` are plain endpoints guarded by an `x-cron-secret` header
  (set to `JWT_SECRET`), meant to be triggered by [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
  or any external scheduler. **This isn't wired up yet** — see Known Gaps.
- **Availability / timezone math** (`src/common/utils/tz.ts`, `availability.ts`) is ported verbatim
  from the frontend's `lib/admin/tz.ts` and `lib/admin/availability.ts` so booking slot times agree
  bit-for-bit, including across the BST/GMT clock change. If you ever change one side, change both.
- **IDs**: everything uses Mongo ObjectIds. The frontend's old sample data used human-readable ids
  like `enq-1001`; nothing in the real app parses that format, so this is a safe, intentional change
  (see the frontend integration notes for the one route that needs updating because of it:
  `/admin/inbox/[id]`'s static params).

## Endpoints

All routes are prefixed with `/api`.

### Public (no auth, rate-limited, honeypot field `website`)
- `POST /public/contact`, `POST /public/brief`, `POST /public/zero-one` — create an Enquiry
- `GET /public/availability?from&to` — free slots in `{slots, duration, horizonEnd}` shape
- `POST /public/bookings` — create a booking (conflict-checked)
- `POST /public/newsletter/subscribe`, `GET|POST /public/newsletter/unsubscribe?token=`
- `GET /public/blog`, `GET /public/blog/:slug` — published posts only

### Admin (JWT bearer token required)
- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`
- `GET/PATCH /admin/inbox/*` — list/search/read/star/status/move/notes/reply/block
- `GET/PATCH/POST /admin/bookings/*` — list/reschedule/cancel/status/availability/blocked dates
- `GET/POST/PATCH/DELETE /admin/blog/*` — posts, categories, authors, image upload
- `GET/POST /admin/newsletter/*` — list/add/import/export/stats
- `GET/PUT /admin/settings` — notifications, templates, signature, retention
- `GET/DELETE /admin/activity` — activity log
- `GET/DELETE /admin/privacy/find`, `/admin/privacy/erase?email=` — privacy tooling
- `GET /admin/dashboard/stats?range=7d|30d|13w`
- `GET /admin/uploads/signature`, `POST/DELETE /admin/uploads` — Cloudinary
- `POST /admin/pusher/auth` — private channel auth for `pusher-js`

Full request/response shapes: run the server and visit `/api/docs` (Swagger), or see `API.md`.

## Testing

```bash
npm test        # unit tests (Jest)
npm run test:e2e  # e2e tests against mongodb-memory-server, Brevo/Cloudinary/Pusher calls are no-ops
```

e2e tests spin up an in-memory MongoDB (no real database touched) and never call Brevo/Cloudinary/Pusher
for real — `EmailService`/`PusherService` degrade to logging no-ops when their API keys aren't set,
which `test/setup.ts` relies on by leaving those env vars blank.

## Rotating secrets

1. **JWT secrets**: generate new ones (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`),
   update them in Vercel env vars for all environments, redeploy. This invalidates every existing session.
2. **Admin password**: call `POST /api/auth/change-password` while logged in (this also bumps the
   admin's token version, signing out any other session), or manually update `ADMIN_PASSWORD_HASH`
   in Vercel and redeploy (only takes effect for a *new* admin document — if one already exists,
   update it directly in MongoDB Atlas, since the seed-on-boot logic only runs when no admin exists).
3. **Brevo/Cloudinary/Pusher keys**: rotate in each provider's dashboard, update the corresponding
   Vercel env vars, redeploy.

## Manual checklist (things only you can do)

- [ ] **Verify the Brevo sender (recommended, not currently blocking).** `techcluesltd@gmail.com`
      was added as a Brevo sender during setup (id `3`). It shows as unverified in the Brevo
      dashboard, but a direct API test confirmed Brevo still accepts and queues sends from it today
      (unverified only blocks some campaign features, not transactional API sends, on this account).
      Click the verification link sent to that inbox anyway — and for real production deliverability,
      verify a proper domain with SPF/DKIM rather than relying on a Gmail address long-term, since
      Gmail-as-sender is routinely spam-filtered by other providers at scale.
- [ ] **MongoDB Atlas Network Access.** Add `0.0.0.0/0` to Network Access (Vercel's outbound IPs are
      dynamic and not listable), or use Atlas's Vercel integration if available on your plan.
- [ ] **Change the temporary admin password.** See "Phase 1 summary" in the chat for the one-time
      generated password — log in once and call `/api/auth/change-password` immediately.
- [ ] **Vercel env vars**: confirm `vercel env ls` shows all variables in Production, Preview, *and*
      Development (see deploy steps below).
- [ ] **GitHub CLI auth**: `gh` was installed on this machine but never logged in (`gh auth login`)
      — only needed if you want Claude Code to open PRs or check Actions status via `gh` in future
      sessions; direct git pushes don't need it.
- [ ] **Delete the one stray test document** created during local smoke-testing before the dev/prod
      database routing bug (below) was fixed — a single `enquiries` document with
      `email: "test@example.com"` in the `techclues` (not `techclues_dev`) database. Low risk (it's
      an obviously-fake test row and nothing points at that database yet), but worth a quick delete
      in the Atlas UI.

## Known gaps / follow-ups

- **Vercel Cron isn't configured yet.** The purge-spam and publish-scheduled endpoints exist and work
  when called, but nothing calls them on a schedule. Add a `crons` entry to `vercel.json` once this
  project is linked (needs a paid Vercel plan for anything more frequent than once a day) or wire up
  an external scheduler.
- **Turnstile isn't wired in** — `TURNSTILE_SECRET` is read but not checked against anything yet. The
  honeypot field and per-route rate limiting are the only bot defenses right now.
- **MVP calculator scoring isn't reimplemented server-side** — `POST /public/brief` accepts a
  `result` object from the client (title/headline/lines) and stores it as-is for the admin's
  reference. This trusts the client's own scoring math rather than re-deriving it, since the
  calculator's scoring logic lives in a multi-step wizard component on the frontend. Low risk (it's
  cosmetic data shown only in the admin inbox), but worth revisiting if that number needs to be
  trustworthy for anything beyond display.
- **`npm audit`** flags several moderate/high issues, all in transitive dependencies of `@nestjs/*`
  packages (file-type, lodash, multer, qs) or dev-only build tooling (webpack, tmp via `@nestjs/cli`).
  None have a non-breaking fix available yet; `npm audit fix --force` would bump several `@nestjs/*`
  packages to major versions not yet tested against this codebase.
- Grant/Partner/Careers forms exist on the frontend but weren't in the original endpoint list for
  this phase, so they have no backend endpoints yet.
