import { MongoMemoryServer } from 'mongodb-memory-server';
import * as nock from 'nock';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI_DEV = mongod.getUri();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.NODE_ENV = 'test';
  process.env.ADMIN_EMAIL = 'admin@test.local';
  // bcrypt hash of "TestPassword123!"
  process.env.ADMIN_PASSWORD_HASH = '$2a$10$zQ25LgvjRMPnSxgTWnz4/eLR8gNa8Ws/iQQ7LuZPEIeGnfGyJzgQ2';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  process.env.NOTIFY_EMAIL = 'notify@test.local';
  process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
  process.env.BREVO_API_KEY = '';
  process.env.PUSHER_APP_ID = '';
  process.env.PUSHER_KEY = '';
  process.env.PUSHER_SECRET = '';
  process.env.PUSHER_CLUSTER = '';

  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(async () => {
  nock.cleanAll();
  nock.enableNetConnect();
  if (mongod) await mongod.stop();
});
