const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
      data: null,
      meta: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createRateLimiter(15 * 60 * 1000, 20);
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100);

module.exports = { authLimiter, generalLimiter, createRateLimiter };
