const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['roi', 'level_income', 'investment_debit', 'deposit', 'withdrawal'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
      enum: ['Investment', 'Plan', 'RoiHistory', 'ReferralIncome', 'Transaction'],
    },
  },
  { timestamps: true }
);

LedgerSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Ledger', LedgerSchema);
