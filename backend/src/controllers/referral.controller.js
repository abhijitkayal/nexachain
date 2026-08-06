const User = require('../models/User');
const ReferralIncome = require('../models/ReferralIncome');
const { sendSuccess } = require('../utils/apiResponse');
const { buildReferralTree, getReferralTreeStats } = require('../services/referralTree.service');

/**
 * GET /api/referrals/direct?page=&limit=
 * List direct referrals (level 1).
 */
const getDirectReferrals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { referredBy: req.user._id };

    const [referrals, total] = await Promise.all([
      User.find(filter)
        .select('fullName email mobile createdAt walletBalance totalRoiEarned')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: 'Direct referrals fetched',
      data: referrals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/tree?depth=10
 * Build complete referral tree using the referralTree service.
 */
const getReferralTree = async (req, res, next) => {
  try {
    const depth = parseInt(req.query.depth, 10) || 10;
    const tree = await buildReferralTree(req.user._id, depth);

    return sendSuccess(res, {
      message: 'Referral tree fetched',
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/income?page=&limit=
 * List referral income history for the current user.
 */
const getReferralIncome = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { beneficiary: req.user._id };

    const [incomes, total] = await Promise.all([
      ReferralIncome.find(filter)
        .populate('fromUser', 'fullName email')
        .populate('sourceInvestment', 'amount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReferralIncome.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: 'Referral income fetched',
      data: incomes,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/tree/stats
 * Get summary statistics for the referral tree.
 */
const getReferralTreeStatsController = async (req, res, next) => {
  try {
    const stats = await getReferralTreeStats(req.user._id);

    return sendSuccess(res, {
      message: 'Referral tree stats fetched',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDirectReferrals, getReferralTree, getReferralTreeStats: getReferralTreeStatsController, getReferralIncome };
