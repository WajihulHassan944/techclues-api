import type { Request, Response } from 'express';
import type { INestApplication } from '@nestjs/common';
// Imports the tsc-compiled output (built by `nest build` as the Vercel build
// command), not the raw TS source — Vercel's bundler for /api functions does
// not reliably support `emitDecoratorMetadata`, which Nest's DI relies on.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp }: { createApp: () => Promise<INestApplication> } = require('../dist/bootstrap');

// Cached across warm serverless invocations so we don't rebuild the Nest app
// (and reopen the Mongoose connection) on every request.
let cachedApp: INestApplication | undefined;

async function getApp(): Promise<INestApplication> {
  if (!cachedApp) {
    cachedApp = await createApp();
    await cachedApp.init();
  }
  return cachedApp;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
}
