const express = require('express');
const router = express.Router();
const { getSummary, getEarningsChart } = require('../controllers/dashboard.controller');
const { verifyJWT } = require('../middleware/auth');

router.use(verifyJWT);
router.get('/summary', getSummary);
router.get('/earnings-chart', getEarningsChart);

module.exports = router;
