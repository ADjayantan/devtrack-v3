const DailyLog = require('../models/DailyLog');

// ─── Streak Algorithm (UTC-safe) ──────────────────────────────────────────────
const calculateStreak = (datesSortedDesc) => {
  if (!datesSortedDesc.length) return 0;
  const toDay = (d) => new Date(d + 'T00:00:00Z');
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  if (datesSortedDesc[0] !== todayStr && datesSortedDesc[0] !== yesterdayStr) return 0;
  let streak = 1;
  for (let i = 0; i < datesSortedDesc.length - 1; i++) {
    const diff = (toDay(datesSortedDesc[i]) - toDay(datesSortedDesc[i + 1])) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

// ─── GET /api/logs ─────────────────────────────────────────────────────────────
const getLogs = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    const filter = { user: req.userId };
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = req.query.startDate;
      if (req.query.endDate)   filter.date.$lte = req.query.endDate;
    }
    if (req.query.tag)    filter.tags = req.query.tag.trim();
    if (req.query.search) filter.$text = { $search: req.query.search.trim() };

    const [logs, totalCount, allStats] = await Promise.all([
      DailyLog.find(filter)
        .sort(req.query.search ? { score: { $meta: 'textScore' } } : { date: -1 })
        .skip(skip).limit(limit).lean(),
      DailyLog.countDocuments(filter),
      // Stats always from full dataset — not just this page
      DailyLog.find({ user: req.userId }).select('date hoursSpent tasksCompleted mood').sort({ date: -1 }).lean(),
    ]);

    const streak    = calculateStreak(allStats.map((l) => l.date));
    const totalHours = allStats.reduce((s, l) => s + l.hoursSpent, 0);
    const totalTasks = allStats.reduce((s, l) => s + l.tasksCompleted, 0);

    res.json({
      logs,
      pagination: {
        page, limit, totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      stats: {
        totalDays: allStats.length,
        totalTasks,
        totalHours: parseFloat(totalHours.toFixed(1)),
        streak,
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /api/logs/analytics ──────────────────────────────────────────────────
// Returns rich data for the Analytics page (all logs, no pagination)
const getAnalytics = async (req, res, next) => {
  try {
    const logs = await DailyLog.find({ user: req.userId })
      .select('date hoursSpent tasksCompleted mood tags learned')
      .sort({ date: 1 })
      .lean();

    // Monthly aggregation
    const monthly = {};
    logs.forEach((l) => {
      const month = l.date.slice(0, 7); // YYYY-MM
      if (!monthly[month]) monthly[month] = { hours: 0, tasks: 0, days: 0 };
      monthly[month].hours += l.hoursSpent;
      monthly[month].tasks += l.tasksCompleted;
      monthly[month].days  += 1;
    });

    // Tag frequency
    const tagFreq = {};
    logs.forEach((l) => l.tags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
    const topTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Mood trend (last 30 days with mood set)
    const moodTrend = logs
      .filter((l) => l.mood !== null && l.mood !== undefined)
      .slice(-30)
      .map((l) => ({ date: l.date, mood: l.mood }));

    // Heatmap data — date → hours
    const heatmap = logs.map((l) => ({ date: l.date, hours: l.hoursSpent, tasks: l.tasksCompleted }));

    res.json({ monthly: Object.entries(monthly).map(([month, v]) => ({ month, ...v })), topTags, moodTrend, heatmap });
  } catch (err) { next(err); }
};

// ─── GET /api/logs/export ─────────────────────────────────────────────────────
// Returns all logs as CSV download
const exportCSV = async (req, res, next) => {
  try {
    const logs = await DailyLog.find({ user: req.userId }).sort({ date: -1 }).lean();
    const header = 'Date,Hours Spent,Tasks Completed,Mood,Tags,What I Learned';
    const rows = logs.map((l) => [
      l.date,
      l.hoursSpent,
      l.tasksCompleted,
      l.mood || '',
      (l.tags || []).join('|'),
      `"${(l.learned || '').replace(/"/g, '""')}"`, // escape quotes
    ].join(','));
    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=devtrack-logs.csv');
    res.send(csv);
  } catch (err) { next(err); }
};

// ─── POST /api/logs ───────────────────────────────────────────────────────────
const createLog = async (req, res, next) => {
  try {
    const { date, learned, tasksCompleted, hoursSpent, tags, mood } = req.body;
    const log = await DailyLog.create({
      user: req.userId, date, learned,
      tasksCompleted: Number(tasksCompleted),
      hoursSpent: Number(hoursSpent),
      tags: tags || [],
      mood: mood ? Number(mood) : null,
    });
    res.status(201).json({ log });
  } catch (err) { next(err); }
};

// ─── PUT /api/logs/:id ────────────────────────────────────────────────────────
const updateLog = async (req, res, next) => {
  try {
    const { date, learned, tasksCompleted, hoursSpent, tags, mood } = req.body;
    const updates = {};
    if (date !== undefined)           updates.date = date;
    if (learned !== undefined)        updates.learned = learned;
    if (tasksCompleted !== undefined) updates.tasksCompleted = Number(tasksCompleted);
    if (hoursSpent !== undefined)     updates.hoursSpent = Number(hoursSpent);
    if (tags !== undefined)           updates.tags = tags;
    if (mood !== undefined)           updates.mood = mood ? Number(mood) : null;

    const log = await DailyLog.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.json({ log });
  } catch (err) { next(err); }
};

// ─── DELETE /api/logs/:id ─────────────────────────────────────────────────────
const deleteLog = async (req, res, next) => {
  try {
    const log = await DailyLog.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!log) return res.status(404).json({ message: 'Log not found.' });
    res.json({ message: 'Log deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getLogs, createLog, updateLog, deleteLog, getAnalytics, exportCSV };
