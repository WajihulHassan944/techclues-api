import type { Request, Response } from 'express';
import type { INestApplication } from '@nestjs/common';
// Imports the tsc-compiled output (built by `nest build`, then copied into
// api/dist by the vercel-build script), not the raw TS source — Vercel's
// bundler for /api functions does not reliably support `emitDecoratorMetadata`,
// which Nest's DI relies on. The copy into api/dist (rather than requiring the
// top-level dist/ directly) is deliberate: Vercel's function bundler traces
// and packages files that live inside the function's own source tree (api/),
// but does not reliably sweep in a sibling top-level directory produced by a
// separate custom buildCommand step, even with `includeFiles` configured.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp }: { createApp: () => Promise<INestApplication> } = require('./dist/bootstrap');

// Cached across warm serverless invocations so we don't rebuild the Nest app
// (and reopen the Mongoose connection) on every request. The in-flight PROMISE
// is cached, not just the resolved app — a burst of concurrent requests on a
// cold start (e.g. the admin panel's parallel preload calls) would otherwise
// each see the cache empty and independently call createApp()/init(), racing
// each other's providers. Guards like ThrottlerGuard populate state in an
// async onModuleInit(), so a request that slips through before that resolves
// can hit "this.throttlers is not iterable". Awaiting one shared promise
// guarantees every provider's onModuleInit has fully resolved before any
// request is routed.
let cachedAppPromise: Promise<INestApplication> | undefined;

async function getApp(): Promise<INestApplication> {
  if (!cachedAppPromise) {
    cachedAppPromise = createApp()
      .then(async (app) => {
        await app.init();
        return app;
      })
      .catch((err) => {
        cachedAppPromise = undefined;
        throw err;
      });
  }
  return cachedAppPromise;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
}
