const express = require('express');
const router = express.Router();
const { createInvestment, getInvestments, createInvestmentSchema } = require('../controllers/investment.controller');
const { verifyJWT } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(verifyJWT);
router.post('/', validate(createInvestmentSchema), createInvestment);
router.get('/', getInvestments);

module.exports = router;
