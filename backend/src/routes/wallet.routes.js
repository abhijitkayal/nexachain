const express = require('express');
const router = express.Router();
const Joi = require('joi');
const mongoose = require('mongoose');
const { verifyJWT } = require('../middleware/auth');
const validate = require('../middleware/validate');
const User = require('../models/User');
const Ledger = require('../models/Ledger');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const depositSchema = Joi.object({
  amount: Joi.number().positive().min(1).max(1000000).required(),
});

router.post('/deposit', verifyJWT, validate(depositSchema), async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const { amount } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { walletBalance: amount } },
        { new: true, session }
      );

      await Ledger.create(
        [
          {
            user: req.user._id,
            type: 'deposit',
            amount,
            balanceAfter: user.walletBalance,
            referenceModel: 'Transaction',
          },
        ],
        { session }
      );

      return sendSuccess(res, {
        message: `Successfully deposited ${amount}`,
        data: { walletBalance: user.walletBalance },
        statusCode: 201,
      });
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
