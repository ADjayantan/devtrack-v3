const express = require('express');
const router = express.Router();
const {
  getActivities, getTodayActivities, createActivity, updateActivity, deleteActivity,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { activityRules, validate } = require('../utils/validators');

router.use(protect);
router.use(apiLimiter);

router.get('/today', getTodayActivities);        // must be before /:id
router.get('/',      getActivities);
router.post('/',     activityRules, validate, createActivity);
router.put('/:id',   activityRules, validate, updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
