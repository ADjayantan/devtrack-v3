const { body, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').normalizeEmail().isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').isLength({ max: 72 }),
];

const loginRules = [
  body('email').normalizeEmail().isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// FIX BUG-2: Removed the 30-day restriction on date — users must be able to edit old logs
const logRules = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      const date = new Date(value + 'T00:00:00Z');
      const now = new Date();
      if (date > now) throw new Error('Date cannot be in the future');
      return true;
    }),
  body('learned').trim().notEmpty().withMessage('What you learned is required')
    .isLength({ min: 10 }).withMessage('Please write at least 10 characters')
    .isLength({ max: 2000 }).withMessage('Entry cannot exceed 2000 characters'),
  body('tasksCompleted').isInt({ min: 0, max: 100 }).withMessage('Tasks must be between 0 and 100'),
  body('hoursSpent').isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed')
    .custom((arr) => {
      if (arr.some((t) => typeof t !== 'string' || t.length > 30))
        throw new Error('Each tag must be a string under 30 characters');
      return true;
    }),
  body('mood').optional().isInt({ min: 1, max: 5 }).withMessage('Mood must be 1-5'),
];

// Separate update rules — date is optional on PUT (don't force resending it)
const logUpdateRules = [
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      const date = new Date(value + 'T00:00:00Z');
      const now = new Date();
      if (date > now) throw new Error('Date cannot be in the future');
      return true;
    }),
  body('learned').optional().trim()
    .isLength({ min: 10 }).withMessage('Please write at least 10 characters')
    .isLength({ max: 2000 }).withMessage('Entry cannot exceed 2000 characters'),
  body('tasksCompleted').optional().isInt({ min: 0, max: 100 }).withMessage('Tasks must be between 0 and 100'),
  body('hoursSpent').optional().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed')
    .custom((arr) => {
      if (arr.some((t) => typeof t !== 'string' || t.length > 30))
        throw new Error('Each tag must be a string under 30 characters');
      return true;
    }),
  body('mood').optional().isInt({ min: 1, max: 5 }).withMessage('Mood must be 1-5'),
];

const activityRules = [
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD')
    .custom((value) => {
      if (new Date(value + 'T00:00:00Z') > new Date()) throw new Error('Date cannot be in the future');
      return true;
    }),
  body('type')
    .optional()
    .isIn(['exercise', 'reading', 'meditation', 'coding', 'custom'])
    .withMessage('Type must be exercise, reading, meditation, coding, or custom'),
  body('name').optional().trim().notEmpty().withMessage('Activity name cannot be empty').isLength({ max: 100 }),
  body('duration').optional().isInt({ min: 0, max: 1440 }).withMessage('Duration must be 0–1440 minutes'),
  body('intensity').optional().isIn(['low', 'medium', 'high', '']).withMessage('Intensity must be low, medium, or high'),
  body('notes').optional().trim().isLength({ max: 500 }),
];

const roadmapRules = [
  body('title').trim().notEmpty().withMessage('Roadmap title is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

const logQueryRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 100 }),
  query('startDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('tag').optional().trim().isLength({ max: 30 }),
];

const profileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 50 }),
  body('dailyGoalHours').optional().isFloat({ min: 0, max: 24 }).withMessage('Daily goal must be between 0 and 24 hours'),
  body('currentPassword').optional().notEmpty().withMessage('Current password is required to change password'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

module.exports = { validate, registerRules, loginRules, logRules, logUpdateRules, roadmapRules, logQueryRules, profileRules, activityRules };
