const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const RoiHistory = require('../models/RoiHistory');
const User = require('../models/User');
const { creditWallet } = require('./wallet.service');
const { distributeLevelIncome } = require('./referral.service');
const logger = require('../utils/logger');

/**
 * Normalize a date to UTC midnight (start of day).
 * @param {Date} date
 * @returns {Date}
 */
const normalizeToUtcMidnight = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Credit daily ROI for all active investments for a given date.
 * Processes in batches to avoid loading all into memory.
 *
 * @param {Date} forDate - The date to process (will be normalized to UTC midnight)
 * @returns {Object} Summary of processing results
 *
 * Idempotency guarantee:
 * - The unique compound index {investment: 1, forDate: 1} on RoiHistory
 *   ensures duplicate-key errors prevent double-crediting.
 * - The distributed lock (JobLock) is an optimization to prevent
 *   multiple app instances from running concurrently, but the unique
 *   index is the real safety net.
 */
const creditDailyRoi = async (forDate) => {
  const normalizedDate = normalizeToUtcMidnight(forDate);
  const stats = { processed: 0, skipped: 0, failed: 0, duration: 0 };
  const startTime = Date.now();

  logger.info('Starting daily ROI credit', { forDate: normalizedDate.toISOString() });

  const batchSize = 100;
  let hasMore = true;
  let skip = 0;

  while (hasMore) {
    const investments = await Investment.find({
      status: 'active',
      endDate: { $gte: normalizedDate },
    })
      .skip(skip)
      .limit(batchSize)
      .populate('plan')
      .lean();

    if (investments.length === 0) {
      hasMore = false;
      break;
    }

    for (const investment of investments) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const roiAmount =
            (investment.amount * investment.dailyRoiPercent) / 100;

          // Step 1: Insert RoiHistory first for idempotency
          try {
            await RoiHistory.create(
              [
                {
                  user: investment.user,
                  investment: investment._id,
                  amount: roiAmount,
                  forDate: normalizedDate,
                  status: 'credited',
                },
              ],
              { session }
            );
          } catch (error) {
            // Duplicate key = already processed for this date
            if (error.code === 11000) {
              stats.skipped++;
              return; // Skip this investment
            }
            throw error;
          }

          // Step 2: Credit wallet and update investment
          await creditWallet({
            userId: investment.user,
            amount: roiAmount,
            type: 'roi',
            reference: investment._id,
            referenceModel: 'Investment',
            session,
          });

          await User.findByIdAndUpdate(
            investment.user,
            { $inc: { totalRoiEarned: roiAmount } },
            { session }
          );

          await Investment.findByIdAndUpdate(
            investment._id,
            {
              $inc: { totalRoiPaid: roiAmount },
              lastRoiCreditedAt: normalizedDate,
            },
            { session }
          );

          // Step 3: Mark as completed if endDate has passed
          const today = normalizeToUtcMidnight(new Date());
          if (investment.endDate <= today) {
            await Investment.findByIdAndUpdate(
              investment._id,
              { status: 'completed' },
              { session }
            );
          }

          // Step 4: Trigger level income distribution
          const user = await User.findById(investment.user).session(session);
          if (user) {
            const roiHistory = await RoiHistory.findOne({
              investment: investment._id,
              forDate: normalizedDate,
            }).session(session);

            if (roiHistory) {
              await distributeLevelIncome({
                fromUser: user,
                baseAmount: roiAmount,
                sourceRoiHistory: roiHistory._id,
                sourceInvestment: investment._id,
                session,
              });
            }
          }

          stats.processed++;
        });
      } catch (error) {
        stats.failed++;
        logger.error('Failed to credit ROI for investment', {
          investmentId: investment._id,
          error: error.message,
        });
      } finally {
        await session.endSession();
      }
    }

    skip += batchSize;
    if (investments.length < batchSize) {
      hasMore = false;
    }
  }

  stats.duration = Date.now() - startTime;
  logger.info('Daily ROI credit completed', stats);
  return stats;
};

module.exports = { creditDailyRoi, normalizeToUtcMidnight };
