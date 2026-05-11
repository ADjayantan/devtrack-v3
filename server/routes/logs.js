const express = require('express');
const router = express.Router();
const { getLogs, createLog, updateLog, deleteLog, getAnalytics, exportCSV } = require('../controllers/logController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { logRules, logUpdateRules, logQueryRules, validate } = require('../utils/validators');

router.use(protect);
router.use(apiLimiter);

router.get('/analytics', getAnalytics);   // must be before /:id routes
router.get('/export',    exportCSV);
router.get('/',          logQueryRules, validate, getLogs);
router.post('/',         logRules, validate, createLog);
router.put('/:id',       logUpdateRules, validate, updateLog);  // Fix: was using logRules which forced date on every PUT
router.delete('/:id',    deleteLog);

module.exports = router;
