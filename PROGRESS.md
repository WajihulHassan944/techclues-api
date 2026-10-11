# Progress — techclues-api

## Phase 1: backend — DONE (live smoke test passed)

**Live URL**: https://techclues-api.vercel.app

### Status table

| Feature | Endpoint(s) | Tested |
|---|---|---|
| Health | `GET /api/health` | yes — live |
| Auth (login/me/lockout) | `POST /api/auth/login`, `GET /api/auth/me` | yes — live, with the temp admin password |
| Public contact | `POST /api/public/contact` | yes — live (test enquiry created + erased) |
| Public availability | `GET /api/public/availability` | yes — live, returns correct UK-TZ slots |
| Public booking + conflict check | `POST /api/public/bookings` | yes — live (test booking created + erased); e2e test covers the double-booking rejection |
| Newsletter subscribe | `POST /api/public/newsletter/subscribe` | yes — live (test subscriber created + erased) |
| Brevo email sending | enquiry/booking notifications, auto-replies | yes — confirmed via direct Brevo API test that sends from `techcluesltd@gmail.com` are accepted (returned a real `messageId`) even though the sender shows "unverified" in the dashboard |
| Pusher auth | `POST /api/admin/pusher/auth` | yes — live, returns a valid channel auth signature |
| Cloudinary signed upload | `GET /api/admin/uploads/signature` | yes — live, returns a valid signature |
| Admin inbox/bookings/blog/newsletter/settings/activity/dashboard | various `/api/admin/*` | yes — live (empty on prod by design; full CRUD covered by 15 e2e tests against seeded data) |
| Privacy find/erase | `GET/DELETE /api/admin/privacy/*` | yes — live, used to clean up all smoke-test data afterward |
| Swagger disabled in prod | `GET /api/docs` | yes — confirmed 404 in production, reachable locally |
| CSV export | `GET /api/admin/newsletter/export` | yes — e2e test only (not re-tested live, to avoid exporting real subscriber data unnecessarily) |

### What was tested and how
- **Unit tests (12)**: availability/timezone slot math including the BST→GMT clock change;
  newsletter email validation and dedupe logic.
- **e2e tests (15)**: full request/response cycle against `mongodb-memory-server` — auth lockout
  and token flow, every public endpoint including honeypot and validation rejection, booking
  conflict prevention, CSV export, and the privacy find/erase flow. All passing; wired into CI.
- **Live smoke test**: see table above. Ran directly against https://techclues-api.vercel.app,
  all test data created during the smoke test was deleted afterward via the privacy erase endpoint.

### Decisions made without stopping to ask (see README's "Manual checklist" and "Known gaps" for the
user-facing version of these)
- **Mongo URI routing uses `VERCEL_ENV`, not `NODE_ENV`.** Vercel sets `NODE_ENV=production` for
  *both* production and preview deployments, so gating the production-database switch on `NODE_ENV`
  alone would have let a preview deployment read/write real production data. Caught this via local
  testing (see below) and fixed before the first real deploy.
- **A local dev run briefly wrote one test document to the production-labeled database** before the
  above fix was in place. It's flagged in the README's manual checklist for you to delete via the
  Atlas UI (I was blocked from deleting it myself by the environment's destructive-action
  permission classifier, which is working as intended — I didn't attempt to bypass it).
- **Vercel deployment required three iterative fixes**, each committed separately so the history
  explains itself: (1) added a static `public/` placeholder because a custom `buildCommand` makes
  Vercel expect a static output directory even for an API-only project; (2) copied the compiled
  `dist/` into `api/dist` because Vercel's function bundler doesn't reliably sweep in a sibling
  top-level directory produced by a separate build step, even with `includeFiles` configured; (3)
  added middleware to strip a `path` query parameter that the `/api/:path*` → `/api` rewrite
  injects into every request (harmless for most routes, but rejected by the strict
  `forbidNonWhitelisted` validation on the two endpoints that bind their query string to a DTO).
- **Admin password**: none was provided in the brief (`ADMIN_PASSWORD=<I'LL PUT MY ADMIN PASSWORD
  HERE>`), so a random temporary one was generated, hashed, and shared once in chat. Rotate it via
  `POST /api/auth/change-password` immediately.
- **Brevo sender verification turned out not to block sending** — see the status table above.
  Still worth doing for long-term deliverability; not a launch blocker.
- **MVP calculator ("brief") scoring** is accepted from the client rather than recomputed
  server-side, since that scoring logic lives in a frontend wizard component with no backend
  equivalent. Documented as a known gap in README, not silently assumed safe.
- **IDs** switched from the frontend's human-readable sample ids (`enq-1001`) to Mongo ObjectIds —
  confirmed via research that nothing in the frontend parses the numeric suffix meaningfully.

## Phase 2: frontend integration — not started

Will begin on the `techclues` repo: `NEXT_PUBLIC_API_URL`, the typed API client, wiring the public
forms and BookingWidget, replacing the admin's localStorage providers with API-backed ones, and the
Pusher realtime layer.
