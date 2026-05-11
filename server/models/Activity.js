const mongoose = require('mongoose');

const ACTIVITY_TYPES = ['exercise', 'reading', 'meditation', 'coding', 'custom'];
const INTENSITY_LEVELS = ['low', 'medium', 'high'];

const activitySchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: [true, 'Activity type is required'],
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    // Duration in minutes
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      max: [1440, 'Duration cannot exceed 1440 minutes (24h)'],
      default: 0,
    },
    // Only relevant for exercise type
    intensity: {
      type: String,
      enum: [...INTENSITY_LEVELS, null],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Primary query: user's activities sorted by date
activitySchema.index({ user: 1, date: -1 });
// Filter by type
activitySchema.index({ user: 1, type: 1 });
// Streak: find latest activity timestamp
activitySchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
