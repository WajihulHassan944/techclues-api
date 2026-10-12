import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../src/bootstrap';

describe('TechClues API (e2e)', () => {
  let app: INestApplication;
  let server: import('http').Server;
  let token: string;

  beforeAll(async () => {
    app = await createApp();
    await app.init();
    server = app.getHttpServer();

    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin@test.local', password: 'TestPassword123!' })
      .expect(200);
    token = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('health', () => {
    it('GET /api/health reports ok and a connected db', async () => {
      const res = await request(server).get('/api/health').expect(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.db).toBe('connected');
    });
  });

  describe('auth', () => {
    it('rejects an invalid login', async () => {
      await request(server)
        .post('/api/auth/login')
        .send({ email: 'admin@test.local', password: 'wrong' })
        .expect(401);
    });

    it('can fetch /me with the shared token', async () => {
      const me = await request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(me.body.email).toBe('admin@test.local');
    });

    it('rejects admin routes without a token', async () => {
      await request(server).get('/api/admin/inbox').expect(401);
    });
  });

  describe('public enquiries', () => {
    it('creates an enquiry via the contact endpoint', async () => {
      const res = await request(server)
        .post('/api/public/contact')
        .send({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello there' })
        .expect(201);
      expect(res.body.id).toBeDefined();
    });

    it('rejects a contact submission with the honeypot filled in', async () => {
      await request(server)
        .post('/api/public/contact')
        .send({
          name: 'Bot',
          email: 'bot@example.com',
          message: 'spam',
          website: 'http://spam.example',
        })
        .expect(400);
    });

    it('rejects a contact submission missing required fields', async () => {
      await request(server).post('/api/public/contact').send({ name: 'No Email' }).expect(400);
    });

    it('appears in the admin inbox once authenticated', async () => {
      const list = await request(server)
        .get('/api/admin/inbox')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(list.body.total).toBeGreaterThanOrEqual(1);
      expect(list.body.items.some((e: { email: string }) => e.email === 'jane@example.com')).toBe(
        true,
      );
    });
  });

  describe('bookings', () => {
    function nextWeekRange() {
      const from = new Date(Date.now() + 2 * 86_400_000);
      const to = new Date(Date.now() + 9 * 86_400_000);
      return { from: from.toISOString(), to: to.toISOString() };
    }

    it('returns available slots for a future range', async () => {
      const { from, to } = nextWeekRange();
      const res = await request(server)
        .get('/api/public/availability')
        .query({ from, to })
        .expect(200);
      expect(Array.isArray(res.body.slots)).toBe(true);
      expect(res.body.slots.length).toBeGreaterThan(0);
      expect(res.body.duration).toBe(30);
    });

    it('creates a booking for a free slot, then rejects a double-booking of the same slot', async () => {
      const { from, to } = nextWeekRange();
      const avail = await request(server).get('/api/public/availability').query({ from, to });
      const slot = avail.body.slots[0];

      await request(server)
        .post('/api/public/bookings')
        .send({ name: 'Booker One', email: 'booker1@example.com', start: slot, topic: 'Test call' })
        .expect(201);

      await request(server)
        .post('/api/public/bookings')
        .send({ name: 'Booker Two', email: 'booker2@example.com', start: slot, topic: 'Test call' })
        .expect(400);
    });

    it('lists the booking in the admin panel', async () => {
      const res = await request(server)
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.items.some((b: { email: string }) => b.email === 'booker1@example.com')).toBe(
        true,
      );
    });
  });

  describe('newsletter', () => {
    it('subscribes a new email', async () => {
      const res = await request(server)
        .post('/api/public/newsletter/subscribe')
        .send({ email: 'subscriber@example.com', name: 'Sub One' })
        .expect(201);
      expect(res.body.ok).toBe(true);
    });

    it('rejects an invalid email with a friendly error, not a 500', async () => {
      const res = await request(server)
        .post('/api/public/newsletter/subscribe')
        .send({ email: 'not-an-email' })
        .expect(400);
      expect(res.body.error).toBeDefined();
    });

    it('exports subscribers as CSV from the admin panel', async () => {
      const res = await request(server)
        .get('/api/admin/newsletter/export')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.text).toContain('Email,Name,Source,Status');
      expect(res.text).toContain('subscriber@example.com');
    });
  });

  describe('privacy', () => {
    it('finds and then erases all data for an email', async () => {
      await request(server)
        .post('/api/public/contact')
        .send({ name: 'Privacy Test', email: 'erase-me@example.com', message: 'please erase me' })
        .expect(201);

      const found = await request(server)
        .get('/api/admin/privacy/find')
        .query({ email: 'erase-me@example.com' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(found.body.enquiries.length).toBeGreaterThanOrEqual(1);

      const erased = await request(server)
        .delete('/api/admin/privacy/erase')
        .query({ email: 'erase-me@example.com' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(erased.body.enquiriesDeleted).toBeGreaterThanOrEqual(1);

      const confirmEmpty = await request(server)
        .get('/api/admin/privacy/find')
        .query({ email: 'erase-me@example.com' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(confirmEmpty.body.enquiries.length).toBe(0);
    });
  });
});
