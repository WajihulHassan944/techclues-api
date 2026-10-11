import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { BlogService } from '../blog/blog.service';

/**
 * Vercel serverless functions don't keep a process alive for @nestjs/schedule's
 * in-memory timers to fire, so periodic jobs are invoked instead via Vercel Cron
 * (see vercel.json) hitting these endpoints, guarded by a shared secret header.
 */
@Controller('internal/cron')
export class CronController {
  constructor(
    private readonly enquiries: EnquiriesService,
    private readonly blog: BlogService,
    private readonly config: ConfigService,
  ) {}

  private assertAuthorized(secret?: string) {
    const expected = this.config.get<string>('jwt.secret');
    if (!secret || secret !== expected) throw new UnauthorizedException();
  }

  @Post('purge-spam')
  async purgeSpam(@Headers('x-cron-secret') secret?: string) {
    this.assertAuthorized(secret);
    const count = await this.enquiries.purgeOldSpam();
    return { purged: count };
  }

  @Post('publish-scheduled')
  async publishScheduled(@Headers('x-cron-secret') secret?: string) {
    this.assertAuthorized(secret);
    const count = await this.blog.publishDuePosts();
    return { published: count };
  }
}
