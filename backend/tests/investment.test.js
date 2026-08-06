const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Plan = require('../src/models/Plan');
const Investment = require('../src/models/Investment');

let mongoServer;
let token;
let user;
let plan;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  user = await User.create({
    fullName: 'John Doe',
    email: 'john@example.com',
    mobile: '1234567890',
    password: 'password123',
    walletBalance: 10000,
  });

  plan = await Plan.create({
    name: 'Basic Plan',
    minAmount: 100,
    maxAmount: 5000,
    dailyRoiPercent: 1.5,
    durationDays: 30,
    levelIncomePercents: [10, 5, 3, 2, 1],
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'john@example.com',
      password: 'password123',
    });

  token = loginRes.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (key !== 'users' && key !== 'plans') {
      await collections[key].deleteMany({});
    }
  }
});

describe('Investment Endpoints', () => {
  describe('POST /api/investments', () => {
    it('should create an investment and debit wallet', async () => {
      const initialBalance = user.walletBalance;

      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          planId: plan._id.toString(),
          amount: 1000,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(1000);
      expect(res.body.data.dailyRoiPercent).toBe(1.5);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.walletBalance).toBe(initialBalance - 1000);
    });

    it('should reject amount outside plan range', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          planId: plan._id.toString(),
          amount: 50,
        });

      expect(res.status).toBe(400);
    });

    it('should reject insufficient balance', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          planId: plan._id.toString(),
          amount: 20000,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/investments', () => {
    it('should list investments with pagination', async () => {
      await Investment.create({
        user: user._id,
        plan: plan._id,
        amount: 1000,
        dailyRoiPercent: 1.5,
        durationDays: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const res = await request(app)
        .get('/api/investments?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });
  });
});
