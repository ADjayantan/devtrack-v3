const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    learned: {
      type: String,
      required: [true, 'What you learned is required'],
      trim: true,
      minlength: [10, 'Please write at least 10 characters about what you learned'],
      maxlength: [2000, 'Entry cannot exceed 2000 characters'],
    },
    tasksCompleted: {
      type: Number,
      required: true,
      min: [0, 'Tasks completed cannot be negative'],
      max: [100, 'Tasks completed seems too high — max 100'],
      default: 0,
    },
    hoursSpent: {
      type: Number,
      required: true,
      min: [0, 'Hours cannot be negative'],
      max: [24, 'Cannot spend more than 24 hours in a day'],
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Cannot have more than 10 tags per entry',
      },
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // optional: 1=rough, 5=great
    },
  },
  { timestamps: true }
);

// Fix PERF-02: Compound index for all common query patterns
dailyLogSchema.index({ user: 1, date: -1 });           // Primary query: user's logs sorted by date
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true }); // Enforce one log per user per day
dailyLogSchema.index({ user: 1, tags: 1 });            // Tag filtering
// Fix PERF-02: Text index for keyword search on learned field
dailyLogSchema.index({ learned: 'text', tags: 'text' }, {
  weights: { learned: 10, tags: 5 },
  name: 'log_text_search',
});

module.exports = mongoose.model('DailyLog', dailyLogSchema);
