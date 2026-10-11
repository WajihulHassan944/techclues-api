import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

export type AdminChannelEvent =
  'enquiry.created' | 'booking.created' | 'booking.updated' | 'subscriber.created' | 'reply.sent';

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  private readonly client?: Pusher;

  constructor(private readonly config: ConfigService) {
    const appId = config.get<string>('pusher.appId');
    const key = config.get<string>('pusher.key');
    const secret = config.get<string>('pusher.secret');
    const cluster = config.get<string>('pusher.cluster');
    if (appId && key && secret && cluster) {
      this.client = new Pusher({ appId, key, secret, cluster, useTLS: true });
    } else {
      this.logger.warn('Pusher not configured — realtime events are disabled');
    }
  }

  async trigger(event: AdminChannelEvent, payload: Record<string, unknown>) {
    if (!this.client) return;
    try {
      await this.client.trigger('private-admin', event, payload);
    } catch (err) {
      this.logger.error(`Failed to trigger Pusher event ${event}`, err as Error);
    }
  }

  authenticate(socketId: string, channel: string, userId: string) {
    if (!this.client) throw new Error('Pusher not configured');
    if (channel !== 'private-admin') throw new Error('Unknown channel');
    return this.client.authorizeChannel(socketId, channel, {
      user_id: userId,
    });
  }
}
