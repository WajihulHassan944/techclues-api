import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * The login endpoint's strict 5/min throttle is a real production security control, not something
 * to relax globally — but it also makes every e2e test that signs in independently (rather than
 * sharing one session) start failing once a handful of tests run back to back. Skipping it outside
 * production keeps the real control intact while not punishing local/test runs for doing the same
 * thing a browser would (log in once per test) rather than restructuring every spec around a shared
 * session.
 */
@Injectable()
export class DevSkipThrottleGuard extends ThrottlerGuard {
  protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
    const effectiveEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
    return effectiveEnv !== 'production';
  }
}
