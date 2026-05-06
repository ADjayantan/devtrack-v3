const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: [50, 'Name cannot exceed 50 characters'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Min 6 chars'], select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // New: daily learning goal in hours
    dailyGoalHours: { type: Number, min: 0, max: 24, default: 2 },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
