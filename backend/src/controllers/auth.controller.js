const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { generateReferralCode } = require('../utils/referralCode');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = require('../config/env');

const registerSchema = Joi.object({
  fullName: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().required(),
  password: Joi.string().min(6).required(),
  referralCode: Joi.string().allow('', null).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Register a new user with optional referral code.
 * Populates ancestors from the parent's ancestors + parent (cap at N levels).
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, mobile, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return sendError(res, {
        message: 'User with this email or mobile already exists',
        statusCode: 409,
      });
    }

    // Find referrer if referral code provided
    let referrer = null;
    let ancestors = [];
    if (referralCode && referralCode.trim()) {
      referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (!referrer) {
        return sendError(res, {
          message: 'Invalid referral code',
          statusCode: 400,
        });
      }
      // Build ancestors: parent's ancestors + parent
      ancestors = [...(referrer.ancestors || [])];
      const nextLevel = ancestors.length + 1;
      ancestors.push({ user: referrer._id, level: nextLevel });
    }

    // Generate unique referral code
    let newReferralCode;
    let isUnique = false;
    while (!isUnique) {
      newReferralCode = generateReferralCode();
      const existing = await User.findOne({ referralCode: newReferralCode });
      if (!existing) isUnique = true;
    }

    const user = await User.create({
      fullName,
      email,
      mobile,
      password,
      referralCode: newReferralCode,
      referredBy: referrer ? referrer._id : null,
      ancestors,
    });

    const tokens = generateTokens(user._id);

    return sendSuccess(res, {
      message: 'Registration successful',
      data: { user, ...tokens },
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Returns access token + refresh token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, {
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    if (user.status !== 'active') {
      return sendError(res, {
        message: 'Account is not active',
        statusCode: 403,
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, {
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    const tokens = generateTokens(user._id);

    return sendSuccess(res, {
      message: 'Login successful',
      data: { user, ...tokens },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current user profile.
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, {
      message: 'User profile fetched',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, registerSchema, loginSchema };
