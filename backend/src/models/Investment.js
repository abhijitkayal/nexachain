const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [1, 'Investment amount must be at least 1'],
    },
    dailyRoiPercent: {
      type: Number,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalRoiPaid: {
      type: Number,
      default: 0,
    },
    lastRoiCreditedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

InvestmentSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Investment', InvestmentSchema);
