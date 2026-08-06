const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Plan = require('../src/models/Plan');
const Investment = require('../src/models/Investment');
const RoiHistory = require('../src/models/RoiHistory');
const ReferralIncome = require('../src/models/ReferralIncome');
const Ledger = require('../src/models/Ledger');
const { creditDailyRoi, normalizeToUtcMidnight } = require('../src/services/roi.service');

let mongoServer;
let plan;
let user1, user2, user3;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  plan = await Plan.create({
    name: 'Premium Plan',
    minAmount: 100,
    maxAmount: 10000,
    dailyRoiPercent: 2,
    durationDays: 10,
    levelIncomePercents: [10, 5, 3, 2, 1],
  });

  user1 = await User.create({
    fullName: 'User 1',
    email: 'user1@example.com',
    mobile: '1111111111',
    password: 'password123',
    referralCode: 'USER1',
    walletBalance: 50000,
  });

  user2 = await User.create({
    fullName: 'User 2',
    email: 'user2@example.com',
    mobile: '2222222222',
    password: 'password123',
    referralCode: 'USER2',
    referredBy: user1._id,
    ancestors: [{ user: user1._id, level: 1 }],
    walletBalance: 50000,
  });

  user3 = await User.create({
    fullName: 'User 3',
    email: 'user3@example.com',
    mobile: '3333333333',
    password: 'password123',
    referralCode: 'USER3',
    referredBy: user2._id,
    ancestors: [
      { user: user1._id, level: 1 },
      { user: user2._id, level: 2 },
    ],
    walletBalance: 50000,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (!['users', 'plans'].includes(key)) {
      await collections[key].deleteMany({});
    }
  }
});

describe('ROI Service', () => {
  it('should credit daily ROI for active investments', async () => {
    const today = normalizeToUtcMidnight(new Date());

    await Investment.create({
      user: user1._id,
      plan: plan._id,
      amount: 1000,
      dailyRoiPercent: 2,
      durationDays: 10,
      startDate: today,
      endDate: new Date(today.getTime() + 10 * 86400000),
    });

    const stats = await creditDailyRoi(today);

    expect(stats.processed).toBe(1);
    expect(stats.skipped).toBe(0);
    expect(stats.failed).toBe(0);

    const roiHistory = await RoiHistory.findOne({
      user: user1._id,
      forDate: today,
    });
    expect(roiHistory).toBeTruthy();
    expect(roiHistory.amount).toBe(20);

    const updatedUser = await User.findById(user1._id);
    expect(updatedUser.walletBalance).toBe(50020);
    expect(updatedUser.totalRoiEarned).toBe(20);
  });

  it('should skip already processed investments (idempotency)', async () => {
    const today = normalizeToUtcMidnight(new Date());

    await Investment.create({
      user: user1._id,
      plan: plan._id,
      amount: 1000,
      dailyRoiPercent: 2,
      durationDays: 10,
      startDate: today,
      endDate: new Date(today.getTime() + 10 * 86400000),
    });

    await creditDailyRoi(today);
    const stats = await creditDailyRoi(today);

    expect(stats.processed).toBe(0);
    expect(stats.skipped).toBe(1);
  });

  it('should distribute level income to ancestors', async () => {
    const today = normalizeToUtcMidnight(new Date());

    await Investment.create({
      user: user3._id,
      plan: plan._id,
      amount: 1000,
      dailyRoiPercent: 2,
      durationDays: 10,
      startDate: today,
      endDate: new Date(today.getTime() + 10 * 86400000),
    });

    await Investment.create({
      user: user2._id,
      plan: plan._id,
      amount: 1000,
      dailyRoiPercent: 2,
      durationDays: 10,
      startDate: today,
      endDate: new Date(today.getTime() + 10 * 86400000),
    });

    await Investment.create({
      user: user1._id,
      plan: plan._id,
      amount: 1000,
      dailyRoiPercent: 2,
      durationDays: 10,
      startDate: today,
      endDate: new Date(today.getTime() + 10 * 86400000),
    });

    await creditDailyRoi(today);

    const user2Income = await ReferralIncome.findOne({
      beneficiary: user2._id,
      fromUser: user3._id,
    });
    expect(user2Income).toBeTruthy();
    expect(user2Income.level).toBe(2);
    expect(user2Income.amount).toBe(10);

    const user1Income = await ReferralIncome.findOne({
      beneficiary: user1._id,
      fromUser: user3._id,
    });
    expect(user1Income).toBeTruthy();
    expect(user1Income.level).toBe(1);
    expect(user1Income.amount).toBe(20);
  });

  it('should write ledger entries for all transactions', async () => {
    const today = normalizeToUtcMidnight(new Date());

    await Investment.create({
      user: user1._id,
      plan: plan._id,
      amount: 1000,
      dailyRoiPercent: 2,
      durationDays: 10,
      startDate: today,
      endDate: new Date(today.getTime() + 10 * 86400000),
    });

    await creditDailyRoi(today);

    const ledgerEntries = await Ledger.find({ user: user1._id });
    expect(ledgerEntries.length).toBeGreaterThan(0);

    const roiLedger = ledgerEntries.find((l) => l.type === 'roi');
    expect(roiLedger).toBeTruthy();
    expect(roiLedger.amount).toBe(20);
  });
});
