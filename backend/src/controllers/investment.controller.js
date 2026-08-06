const mongoose = require('mongoose');
const Joi = require('joi');
const Investment = require('../models/Investment');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { debitWallet } = require('../services/wallet.service');
const logger = require('../utils/logger');

const createInvestmentSchema = Joi.object({
  planId: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

const createInvestment = async (req, res, next) => {
  try {
    const { planId, amount } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return sendError(res, { message: 'Plan not found or inactive', statusCode: 404 });
    }

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return sendError(res, {
        message: `Amount must be between ${plan.minAmount} and ${plan.maxAmount}`,
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id);
    if (user.walletBalance < amount) {
      return sendError(res, {
        message: `Insufficient wallet balance. Your balance: ${user.walletBalance}`,
        statusCode: 400,
      });
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await debitWallet({
          userId: req.user._id,
          amount,
          type: 'investment_debit',
          reference: plan._id,
          referenceModel: 'Plan',
          session,
        });

        const startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + plan.durationDays);

        await Investment.create(
          [
            {
              user: req.user._id,
              plan: plan._id,
              amount,
              dailyRoiPercent: plan.dailyRoiPercent,
              durationDays: plan.durationDays,
              startDate,
              endDate,
            },
          ],
          { session }
        );
      });

      const updatedUser = await User.findById(req.user._id);

      return sendSuccess(res, {
        message: 'Investment created successfully',
        data: { walletBalance: updatedUser.walletBalance },
        statusCode: 201,
      });
    } catch (txError) {
      logger.error('Transaction failed', { error: txError.message });
      return sendError(res, {
        message: txError.message || 'Transaction failed',
        statusCode: 400,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

const getInvestments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .populate('plan', 'name dailyRoiPercent durationDays')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Investment.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: 'Investments fetched',
      data: investments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createInvestment, getInvestments, createInvestmentSchema };
