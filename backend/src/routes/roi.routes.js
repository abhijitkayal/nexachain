const express = require('express');
const router = express.Router();
const { triggerRoi, getRoiHistory } = require('../controllers/roi.controller');
const { verifyJWT } = require('../middleware/auth');

router.use(verifyJWT);
router.post('/trigger', triggerRoi);
router.get('/history', getRoiHistory);

module.exports = router;
