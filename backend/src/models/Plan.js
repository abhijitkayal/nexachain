const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
    },
    minAmount: {
      type: Number,
      required: [true, 'Minimum amount is required'],
      min: [1, 'Minimum amount must be at least 1'],
    },
    maxAmount: {
      type: Number,
      required: [true, 'Maximum amount is required'],
    },
    dailyRoiPercent: {
      type: Number,
      required: [true, 'Daily ROI percent is required'],
      min: [0, 'Daily ROI percent cannot be negative'],
      max: [100, 'Daily ROI percent cannot exceed 100'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration days is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    levelIncomePercents: {
      type: [Number],
      required: [true, 'Level income percents are required'],
      validate: {
        validator: (v) => v.length > 0 && v.every((p) => p >= 0 && p <= 100),
        message: 'Level income percents must be non-empty array of percentages',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
