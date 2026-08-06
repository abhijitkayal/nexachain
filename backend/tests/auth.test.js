const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john@example.com',
          mobile: '1234567890',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('referralCode');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should register with referral code and populate ancestors', async () => {
      // Create a referrer first
      const referrer = await User.create({
        fullName: 'Referrer User',
        email: 'referrer@example.com',
        mobile: '1111111111',
        password: 'password123',
        referralCode: 'REF123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Referred User',
          email: 'referred@example.com',
          mobile: '2222222222',
          password: 'password123',
          referralCode: 'REF123',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.referredBy).toBe(referrer._id.toString());
      expect(res.body.data.user.ancestors).toHaveLength(1);
      expect(res.body.data.user.ancestors[0].user).toBe(referrer._id.toString());
      expect(res.body.data.user.ancestors[0].level).toBe(1);
    });

    it('should reject duplicate email', async () => {
      await User.create({
        fullName: 'Existing User',
        email: 'john@example.com',
        mobile: '1234567890',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john@example.com',
          mobile: '9999999999',
          password: 'password123',
        });

      expect(res.status).toBe(409);
    });

    it('should reject invalid referral code', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'John Doe',
          email: 'john@example.com',
          mobile: '1234567890',
          password: 'password123',
          referralCode: 'INVALID',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid referral code');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        fullName: 'John Doe',
        email: 'john@example.com',
        mobile: '1234567890',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      const user = await User.create({
        fullName: 'John Doe',
        email: 'john@example.com',
        mobile: '1234567890',
        password: 'password123',
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('john@example.com');
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
