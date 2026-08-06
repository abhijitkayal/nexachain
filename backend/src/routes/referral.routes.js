const express = require('express');
const router = express.Router();
const { getDirectReferrals, getReferralTree, getReferralTreeStats, getReferralIncome } = require('../controllers/referral.controller');
const { verifyJWT } = require('../middleware/auth');

router.use(verifyJWT);
router.get('/direct', getDirectReferrals);
router.get('/tree', getReferralTree);
router.get('/tree/stats', getReferralTreeStats);
router.get('/income', getReferralIncome);

module.exports = router;
