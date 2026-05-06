const express = require('express');
const router = express.Router();
const { getLogs, createLog, updateLog, deleteLog, getAnalytics, exportCSV } = require('../controllers/logController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { logRules, logQueryRules, validate } = require('../utils/validators');

router.use(protect);
router.use(apiLimiter);

router.get('/analytics', getAnalytics);   // must be before /:id routes
router.get('/export',    exportCSV);
router.get('/',          logQueryRules, validate, getLogs);
router.post('/',         logRules, validate, createLog);
router.put('/:id',       logRules, validate, updateLog);
router.delete('/:id',    deleteLog);

module.exports = router;
