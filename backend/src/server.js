const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const { catchUpMissedDates, startRoiCron } = require('./jobs/roiCron');
const seedPlans = require('./utils/seedPlans');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDB();

    // Seed default plans if none exist
    await seedPlans();

    // Catch up missed ROI dates on boot
    await catchUpMissedDates();

    // Start cron job
    startRoiCron();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err.message });
  process.exit(1);
});

startServer();
