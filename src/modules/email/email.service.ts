import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Attachment {
  name: string;
  /** base64-encoded content */
  content: string;
}

export interface SendEmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  attachments?: Attachment[];
  headers?: Record<string, string>;
}

const BREVO_BASE = 'https://api.brevo.com/v3';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey?: string;
  private readonly senderEmail?: string;
  private readonly senderName: string;
  private readonly listId?: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = config.get<string>('brevo.apiKey');
    this.senderEmail = config.get<string>('brevo.senderEmail');
    this.senderName = config.get<string>('brevo.senderName') ?? 'TechClues';
    this.listId = config.get<number>('brevo.listId');
    if (!this.apiKey || !this.senderEmail) {
      this.logger.warn('Brevo not fully configured — emails will be logged, not sent');
    }
  }

  private headers() {
    return { 'api-key': this.apiKey!, 'Content-Type': 'application/json' };
  }

  async send(options: SendEmailOptions) {
    if (!this.apiKey || !this.senderEmail) {
      this.logger.log(
        `[dev-mode email] to=${options.to.map((t) => t.email).join(',')} subject="${options.subject}"`,
      );
      return { skipped: true };
    }
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${BREVO_BASE}/smtp/email`,
          {
            sender: { email: this.senderEmail, name: this.senderName },
            to: options.to,
            subject: options.subject,
            htmlContent: options.htmlContent,
            textContent: options.textContent,
            replyTo: options.replyTo,
            attachment: options.attachments,
            headers: options.headers,
          },
          { headers: this.headers() },
        ),
      );
      return data;
    } catch (err) {
      this.logger.error('Failed to send email via Brevo', (err as Error).message);
      throw err;
    }
  }

  async upsertContact(email: string, attributes?: Record<string, unknown>, listIds?: number[]) {
    if (!this.apiKey) return { skipped: true };
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          `${BREVO_BASE}/contacts`,
          {
            email,
            attributes,
            listIds: listIds ?? (this.listId ? [this.listId] : undefined),
            updateEnabled: true,
          },
          { headers: this.headers() },
        ),
      );
      return data;
    } catch (err) {
      this.logger.error(`Failed to upsert Brevo contact ${email}`, (err as Error).message);
      return null;
    }
  }

  async removeFromList(email: string) {
    if (!this.apiKey || !this.listId) return;
    try {
      await firstValueFrom(
        this.http.post(
          `${BREVO_BASE}/contacts/lists/${this.listId}/contacts/remove`,
          { emails: [email] },
          { headers: this.headers() },
        ),
      );
    } catch (err) {
      this.logger.error(`Failed to remove ${email} from Brevo list`, (err as Error).message);
    }
  }

  /** Deletes the Brevo contact entirely — used for GDPR erasure, not routine unsubscribes. */
  async deleteContact(email: string) {
    if (!this.apiKey) return;
    try {
      await firstValueFrom(
        this.http.delete(`${BREVO_BASE}/contacts/${encodeURIComponent(email)}`, {
          headers: this.headers(),
        }),
      );
    } catch (err) {
      this.logger.error(`Failed to delete Brevo contact ${email}`, (err as Error).message);
    }
  }

  async ensureList(name: string): Promise<number | undefined> {
    if (this.listId) return this.listId;
    if (!this.apiKey) return undefined;
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${BREVO_BASE}/contacts/lists`, { headers: this.headers() }),
      );
      const existing = (data?.lists as { id: number; name: string }[] | undefined)?.find(
        (l) => l.name === name,
      );
      if (existing) return existing.id;
      const created = await firstValueFrom(
        this.http.post(
          `${BREVO_BASE}/contacts/lists`,
          { name, folderId: 1 },
          { headers: this.headers() },
        ),
      );
      return created.data?.id;
    } catch (err) {
      this.logger.error('Failed to ensure Brevo list exists', (err as Error).message);
      return undefined;
    }
  }
}
