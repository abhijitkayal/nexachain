const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Plan = require('../models/Plan');
const { verifyJWT } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const createPlanSchema = Joi.object({
  name: Joi.string().required(),
  minAmount: Joi.number().positive().required(),
  maxAmount: Joi.number().positive().greater(Joi.ref('minAmount')).required(),
  dailyRoiPercent: Joi.number().min(0).max(100).required(),
  durationDays: Joi.number().integer().positive().required(),
  levelIncomePercents: Joi.array().items(Joi.number().min(0).max(100)).min(1).required(),
});

router.get('/', async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ minAmount: 1 }).lean();
    return sendSuccess(res, {
      message: 'Plans fetched',
      data: plans,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyJWT, validate(createPlanSchema), async (req, res, next) => {
  try {
    const existing = await Plan.findOne({ name: req.body.name });
    if (existing) {
      return sendError(res, { message: 'Plan with this name already exists', statusCode: 409 });
    }

    const plan = await Plan.create(req.body);
    return sendSuccess(res, {
      message: 'Plan created',
      data: plan,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
