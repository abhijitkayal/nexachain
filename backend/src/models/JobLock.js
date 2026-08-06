const mongoose = require('mongoose');

const JobLockSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: true,
      unique: true,
    },
    lockedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobLock', JobLockSchema);
