const Plan = require('../models/Plan');
const logger = require('../utils/logger');

const defaultPlans = [
  {
    name: 'Starter',
    minAmount: 100,
    maxAmount: 999,
    dailyRoiPercent: 1.0,
    durationDays: 30,
    levelIncomePercents: [10, 5, 3, 2, 1],
    isActive: true,
  },
  {
    name: 'Basic',
    minAmount: 1000,
    maxAmount: 4999,
    dailyRoiPercent: 1.5,
    durationDays: 60,
    levelIncomePercents: [10, 5, 3, 2, 1],
    isActive: true,
  },
  {
    name: 'Premium',
    minAmount: 5000,
    maxAmount: 19999,
    dailyRoiPercent: 2.0,
    durationDays: 90,
    levelIncomePercents: [10, 5, 3, 2, 1],
    isActive: true,
  },
  {
    name: 'Enterprise',
    minAmount: 20000,
    maxAmount: 100000,
    dailyRoiPercent: 2.5,
    durationDays: 120,
    levelIncomePercents: [10, 5, 3, 2, 1],
    isActive: true,
  },
];

const seedPlans = async () => {
  try {
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany(defaultPlans);
      logger.info('Default plans seeded', { count: defaultPlans.length });
    }
  } catch (error) {
    logger.error('Failed to seed plans', { error: error.message });
  }
};

module.exports = seedPlans;
