const mongoose = require('mongoose');
const User = require('../models/User');
const ReferralIncome = require('../models/ReferralIncome');
const { creditWallet } = require('./wallet.service');
const logger = require('../utils/logger');

/**
 * Distribute level income to ancestors based on the investment plan's level percents.
 *
 * @param {Object} params
 * @param {Object} params.fromUser - The user whose ROI triggered this income
 * @param {number} params.baseAmount - The ROI amount to calculate level income from
 * @param {mongoose.Types.ObjectId} params.sourceRoiHistory - The ROI history entry ID
 * @param {mongoose.Types.ObjectId} params.sourceInvestment - The investment ID
 * @param {mongoose.ClientSession} params.session - MongoDB session
 * @returns {Array} Array of created ReferralIncome documents
 *
 * Rules:
 * - Level income is calculated as: baseAmount * plan.levelIncomePercents[level-1] / 100
 * - Beneficiary must have an active investment to receive income
 * - Beneficiary must not be blocked
 * - Idempotent via unique index on {sourceRoiHistory, beneficiary}
 */
const distributeLevelIncome = async ({
  fromUser,
  baseAmount,
  sourceRoiHistory,
  sourceInvestment,
  session,
}) => {
  if (!fromUser.ancestors || fromUser.ancestors.length === 0) {
    return [];
  }

  const investment = await mongoose.model('Investment').findById(sourceInvestment).session(session);
  if (!investment) {
    logger.warn('Investment not found for level income distribution', { sourceInvestment });
    return [];
  }

  const plan = await mongoose.model('Plan').findById(investment.plan).session(session);
  if (!plan) {
    logger.warn('Plan not found for level income distribution', { planId: investment.plan });
    return [];
  }

  const incomes = [];
  const ancestorIds = fromUser.ancestors.map((a) => a.user);

  const ancestorUsers = await User.find({
    _id: { $in: ancestorIds },
    status: { $ne: 'blocked' },
  }).session(session);

  const ancestorMap = new Map(ancestorUsers.map((u) => [u._id.toString(), u]));

  // Check which ancestors have active investments
  const activeAncestorInvestments = await mongoose.model('Investment').find({
    user: { $in: ancestorIds },
    status: 'active',
  }).session(session);

  const activeInvestorIds = new Set(
    activeAncestorInvestments.map((inv) => inv.user.toString())
  );

  for (const ancestor of fromUser.ancestors) {
    const level = ancestor.level;
    const percentIndex = level - 1;

    if (percentIndex >= plan.levelIncomePercents.length) continue;

    const percent = plan.levelIncomePercents[percentIndex];
    if (percent <= 0) continue;

    const ancestorUser = ancestorMap.get(ancestor.user.toString());
    if (!ancestorUser) continue;

    // Rule: beneficiary must have at least one active investment
    if (!activeInvestorIds.has(ancestor.user.toString())) {
      logger.debug('Skipping level income - beneficiary has no active investment', {
        beneficiaryId: ancestor.user,
        level,
      });
      continue;
    }

    const incomeAmount = Math.round((baseAmount * percent) / 100 * 100) / 100;
    if (incomeAmount <= 0) continue;

    try {
      const referralIncome = await ReferralIncome.create(
        [
          {
            beneficiary: ancestor.user,
            fromUser: fromUser._id,
            sourceInvestment,
            sourceRoiHistory,
            level,
            amount: incomeAmount,
            percent,
          },
        ],
        { session }
      );

      await User.findByIdAndUpdate(
        ancestor.user,
        { $inc: { totalLevelIncome: incomeAmount } },
        { session }
      );

      await creditWallet({
        userId: ancestor.user,
        amount: incomeAmount,
        type: 'level_income',
        reference: referralIncome[0]._id,
        referenceModel: 'ReferralIncome',
        session,
      });

      incomes.push(referralIncome[0]);
    } catch (error) {
      // Duplicate key means already processed - skip silently
      if (error.code === 11000) {
        logger.debug('Level income already processed, skipping', {
          beneficiaryId: ancestor.user,
          sourceRoiHistory,
        });
        continue;
      }
      throw error;
    }
  }

  return incomes;
};

module.exports = { distributeLevelIncome };
