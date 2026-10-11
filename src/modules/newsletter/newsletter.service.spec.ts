import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NewsletterService, EMAIL_RE } from './newsletter.service';
import { Subscriber } from '../../database/schemas/subscriber.schema';
import { ActivityService } from '../activity/activity.service';
import { EmailService } from '../email/email.service';
import { PusherService } from '../pusher/pusher.service';
import { SettingsService } from '../settings/settings.service';

describe('EMAIL_RE', () => {
  it('accepts well-formed emails', () => {
    expect(EMAIL_RE.test('person@example.com')).toBe(true);
    expect(EMAIL_RE.test('first.last+tag@sub.example.co.uk')).toBe(true);
  });

  it('rejects malformed emails', () => {
    expect(EMAIL_RE.test('not-an-email')).toBe(false);
    expect(EMAIL_RE.test('missing@domain')).toBe(false);
    expect(EMAIL_RE.test('has space@example.com')).toBe(false);
    expect(EMAIL_RE.test('<script>@example.com')).toBe(false);
  });
});

describe('NewsletterService.add', () => {
  let service: NewsletterService;
  const findOne = jest.fn();
  const create = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: getModelToken(Subscriber.name), useValue: { findOne, create } },
        { provide: ActivityService, useValue: { log: jest.fn() } },
        { provide: EmailService, useValue: { upsertContact: jest.fn(), send: jest.fn(), removeFromList: jest.fn() } },
        { provide: PusherService, useValue: { trigger: jest.fn() } },
        {
          provide: SettingsService,
          useValue: { get: jest.fn().mockResolvedValue({ events: { subscriber: false }, recipients: [] }) },
        },
      ],
    }).compile();
    service = moduleRef.get(NewsletterService);
  });

  it('rejects an invalid email before touching the database', async () => {
    const error = await service.add('not-an-email', undefined, 'footer');
    expect(error).toBe('Enter a valid email address');
    expect(findOne).not.toHaveBeenCalled();
  });

  it('creates a new subscriber when the email is new', async () => {
    findOne.mockResolvedValue(null);
    create.mockResolvedValue({});
    const error = await service.add('new@example.com', 'New Person', 'footer');
    expect(error).toBe('');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com', status: 'subscribed' }),
    );
  });

  it('rejects a duplicate active subscription', async () => {
    findOne.mockResolvedValue({ status: 'subscribed' });
    const error = await service.add('existing@example.com', undefined, 'footer');
    expect(error).toBe('That email is already subscribed');
  });
});
