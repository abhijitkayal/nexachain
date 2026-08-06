const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const RoiHistory = require('../models/RoiHistory');
const ReferralIncome = require('../models/ReferralIncome');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/dashboard/summary
 * Uses a single aggregation pipeline with $facet for efficient querying.
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [facetResult] = await Investment.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          totalInvested: [
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ],
          activeInvestments: [
            { $match: { status: 'active' } },
            { $count: 'count' },
          ],
          roiSummary: [
            { $group: { _id: null, totalRoiPaid: { $sum: '$totalRoiPaid' } } },
          ],
        },
      },
    ]);

    const totalInvested = facetResult.totalInvested[0]?.total || 0;
    const activeInvestments = facetResult.activeInvestments[0]?.count || 0;
    const totalRoiPaid = facetResult.roiSummary[0]?.totalRoiPaid || 0;

    // Get today's ROI
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const todayRoi = await RoiHistory.aggregate([
      {
        $match: {
          user: userId,
          forDate: { $gte: today, $lt: tomorrow },
          status: 'credited',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const todaysRoi = todayRoi[0]?.total || 0;

    return sendSuccess(res, {
      message: 'Dashboard summary fetched',
      data: {
        totalInvested,
        activeInvestments,
        totalRoiEarned: totalRoiPaid,
        totalLevelIncome: req.user.totalLevelIncome,
        walletBalance: req.user.walletBalance,
        todaysRoi,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/earnings-chart?days=30
 * Daily ROI + level income series for the chart.
 */
const getEarningsChart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days, 10) || 30;

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const [roiData, levelData] = await Promise.all([
      RoiHistory.aggregate([
        {
          $match: {
            user: userId,
            forDate: { $gte: startDate },
            status: 'credited',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$forDate' } },
            roi: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ReferralIncome.aggregate([
        {
          $match: {
            beneficiary: userId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            levelIncome: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge into daily series
    const roiMap = new Map(roiData.map((d) => [d._id, d.roi]));
    const levelMap = new Map(levelData.map((d) => [d._id, d.levelIncome]));

    const chart = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      chart.push({
        date: dateStr,
        roi: roiMap.get(dateStr) || 0,
        levelIncome: levelMap.get(dateStr) || 0,
      });
    }

    return sendSuccess(res, {
      message: 'Earnings chart fetched',
      data: chart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getEarningsChart };
