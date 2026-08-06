const mongoose = require('mongoose');

const RoiHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    investment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    forDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['credited', 'failed', 'skipped'],
      default: 'credited',
    },
  },
  { timestamps: true }
);

RoiHistorySchema.index({ investment: 1, forDate: 1 }, { unique: true });

module.exports = mongoose.model('RoiHistory', RoiHistorySchema);
