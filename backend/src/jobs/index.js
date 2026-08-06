const mongoose = require('mongoose');
const { runRoiJob, catchUpMissedDates } = require('./roi.service');
const { MONGODB_URI } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Standalone cron script.
 * Usage: node src/jobs/roiCron.js --date=2026-08-01
 * If no date provided, runs for today.
 * On boot, also catches up any missed dates.
 */
const main = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB for cron job');

    const args = process.argv.slice(2);
    const dateArg = args.find((a) => a.startsWith('--date='));
    const dateStr = dateArg ? dateArg.split('=')[1] : null;

    if (dateStr) {
      logger.info('Running ROI job for specific date', { date: dateStr });
      const stats = await runRoiJob(dateStr);
      logger.info('ROI job completed', stats);
    } else {
      logger.info('Running catch-up and today ROI job');
      await catchUpMissedDates();
      const stats = await runRoiJob();
      logger.info('ROI job completed', stats);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Cron script failed', { error: error.message });
    await mongoose.disconnect();
    process.exit(1);
  }
};

main();
