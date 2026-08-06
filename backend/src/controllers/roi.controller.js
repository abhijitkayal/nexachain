const { creditDailyRoi, normalizeToUtcMidnight } = require('../services/roi.service');
const RoiHistory = require('../models/RoiHistory');
const { sendSuccess } = require('../utils/apiResponse');

const triggerRoi = async (req, res, next) => {
  try {
    const dateStr = req.body.date;
    const forDate = dateStr ? new Date(dateStr) : new Date();
    const normalized = normalizeToUtcMidnight(forDate);

    const stats = await creditDailyRoi(normalized);

    return sendSuccess(res, {
      message: 'ROI processed',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/roi/history?page=1&limit=20&status=credited
 * List ROI history for the authenticated user.
 */
const getRoiHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [records, total] = await Promise.all([
      RoiHistory.find(filter)
        .populate('investment', 'amount dailyRoiPercent plan')
        .sort({ forDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RoiHistory.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: 'ROI history fetched',
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { triggerRoi, getRoiHistory };
