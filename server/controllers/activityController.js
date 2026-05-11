const Activity = require('../models/Activity');

// ─── GET /api/activities ──────────────────────────────────────────────────────
const getActivities = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = { user: req.userId };
    if (req.query.type)      filter.type = req.query.type;
    if (req.query.date)      filter.date = req.query.date;
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = req.query.startDate;
      if (req.query.endDate)   filter.date.$lte = req.query.endDate;
    }

    const [activities, totalCount] = await Promise.all([
      Activity.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(filter),
    ]);

    // Summary stats across ALL activities (not just this page)
    const allActivities = await Activity.find({ user: req.userId })
      .select('type duration date').lean();

    const totalDuration   = allActivities.reduce((s, a) => s + (a.duration || 0), 0);
    const totalActivities = allActivities.length;
    const typeCounts = allActivities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      activities,
      pagination: {
        page, limit, totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      stats: { totalActivities, totalDuration, typeCounts },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/activities/today ────────────────────────────────────────────────
const getTodayActivities = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const activities = await Activity.find({ user: req.userId, date: today })
      .sort({ createdAt: -1 }).lean();
    res.json({ activities, date: today });
  } catch (err) { next(err); }
};

// ─── POST /api/activities ─────────────────────────────────────────────────────
const createActivity = async (req, res, next) => {
  try {
    const { date, type, name, duration, intensity, notes } = req.body;
    const activity = await Activity.create({
      user: req.userId,
      date,
      type,
      name: name.trim(),
      duration: duration ? Number(duration) : 0,
      intensity: (type === 'exercise' && intensity) ? intensity : null,
      notes: notes ? notes.trim() : '',
    });
    res.status(201).json({ activity });
  } catch (err) { next(err); }
};

// ─── PUT /api/activities/:id ──────────────────────────────────────────────────
const updateActivity = async (req, res, next) => {
  try {
    const { date, type, name, duration, intensity, notes } = req.body;
    const updates = {};
    if (date      !== undefined) updates.date      = date;
    if (type      !== undefined) updates.type      = type;
    if (name      !== undefined) updates.name      = name.trim();
    if (duration  !== undefined) updates.duration  = Number(duration);
    if (intensity !== undefined) updates.intensity = intensity || null;
    if (notes     !== undefined) updates.notes     = notes ? notes.trim() : '';

    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!activity) return res.status(404).json({ message: 'Activity not found.' });
    res.json({ activity });
  } catch (err) { next(err); }
};

// ─── DELETE /api/activities/:id ───────────────────────────────────────────────
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!activity) return res.status(404).json({ message: 'Activity not found.' });
    res.json({ message: 'Activity deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getActivities, getTodayActivities, createActivity, updateActivity, deleteActivity };
