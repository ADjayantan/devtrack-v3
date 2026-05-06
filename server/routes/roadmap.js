const express = require('express');
const router = express.Router();
const { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { roadmapRules, validate } = require('../utils/validators');

router.use(protect);
router.use(apiLimiter);

router.get('/', getRoadmaps);
router.post('/', roadmapRules, validate, createRoadmap);
router.put('/:id', updateRoadmap);
router.delete('/:id', deleteRoadmap);

module.exports = router;
