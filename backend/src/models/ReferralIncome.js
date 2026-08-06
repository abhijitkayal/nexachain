const mongoose = require('mongoose');

const ReferralIncomeSchema = new mongoose.Schema(
  {
    beneficiary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceInvestment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
    },
    sourceRoiHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoiHistory',
      required: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
    },
    percent: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

ReferralIncomeSchema.index({ beneficiary: 1, createdAt: -1 });
ReferralIncomeSchema.index({ sourceRoiHistory: 1, beneficiary: 1 }, { unique: true });

module.exports = mongoose.model('ReferralIncome', ReferralIncomeSchema);
