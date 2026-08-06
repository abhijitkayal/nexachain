const cron = require('node-cron');
const mongoose = require('mongoose');
const JobLock = require('../models/JobLock');
const { creditDailyRoi, normalizeToUtcMidnight } = require('../services/roi.service');
const logger = require('../utils/logger');

const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Acquire a distributed lock to prevent multiple instances from running.
 * Uses a MongoDB document with TTL as the lock mechanism.
 * The unique {investment, forDate} index is the real safety net.
 */
const acquireLock = async (jobName) => {
  const expiresAt = new Date(Date.now() + LOCK_TTL_MS);
  try {
    await JobLock.create({ jobName, expiresAt });
    return true;
  } catch (error) {
    if (error.code === 11000) {
      // Lock already exists - check if expired
      const existing = await JobLock.findOne({ jobName });
      if (existing && existing.expiresAt < new Date()) {
        await JobLock.deleteOne({ jobName });
        await JobLock.create({ jobName, expiresAt });
        return true;
      }
      return false;
    }
    throw error;
  }
};

const releaseLock = async (jobName) => {
  await JobLock.deleteOne({ jobName });
};

/**
 * Run ROI credit for a specific date.
 * @param {string} [dateStr] - ISO date string (YYYY-MM-DD). If not provided, uses today.
 */
const runRoiJob = async (dateStr) => {
  const forDate = dateStr ? new Date(dateStr) : new Date();
  const normalized = normalizeToUtcMidnight(forDate);

  const lockName = `roi-credit-${normalized.toISOString().split('T')[0]}`;

  const acquired = await acquireLock(lockName);
  if (!acquired) {
    logger.warn('ROI job lock not acquired, skipping', { date: normalized });
    return null;
  }

  try {
    const stats = await creditDailyRoi(normalized);
    return stats;
  } finally {
    await releaseLock(lockName);
  }
};

/**
 * Catch-up logic: process any missed dates since lastRoiCreditedAt.
 */
const catchUpMissedDates = async () => {
  const Investment = require('../models/Investment');

  const lastProcessed = await Investment.findOne({ lastRoiCreditedAt: { $ne: null } })
    .sort({ lastRoiCreditedAt: -1 })
    .select('lastRoiCreditedAt')
    .lean();

  if (!lastProcessed) {
    logger.info('No previous ROI processing found, starting from today');
    return;
  }

  const lastDate = normalizeToUtcMidnight(lastProcessed.lastRoiCreditedAt);
  const today = normalizeToUtcMidnight(new Date());

  const missedDates = [];
  const current = new Date(lastDate);
  current.setUTCDate(current.getUTCDate() + 1);

  while (current <= today) {
    missedDates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  if (missedDates.length === 0) {
    logger.info('No missed dates to process');
    return;
  }

  logger.info('Processing missed dates', { count: missedDates.length });

  for (const date of missedDates) {
    await runRoiJob(date.toISOString().split('T')[0]);
  }
};

/**
 * Start the cron job. Runs at midnight UTC daily.
 * Server timezone should be documented in README.
 */
const startRoiCron = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('ROI cron job triggered');
    try {
      const stats = await runRoiJob();
      logger.info('ROI cron job completed', stats);
    } catch (error) {
      logger.error('ROI cron job failed', { error: error.message });
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'UTC',
  });

  logger.info('ROI cron job scheduled (0 0 * * * UTC)');
};

module.exports = { runRoiJob, catchUpMissedDates, startRoiCron };
