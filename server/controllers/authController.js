const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  dailyGoalHours: user.dailyGoalHours,
  createdAt: user.createdAt,
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'An account with that email already exists.' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: generateToken(user._id, user.role), user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: generateToken(user._id, user.role), user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

// PUT /api/auth/profile  — update name, dailyGoalHours, or change password
const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword, dailyGoalHours } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name) user.name = name;
    if (dailyGoalHours !== undefined) user.dailyGoalHours = Number(dailyGoalHours);

    // Password change flow
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password is required to set a new one.' });
      const match = await user.matchPassword(currentPassword);
      if (!match)
        return res.status(400).json({ message: 'Current password is incorrect.' });
      user.password = newPassword; // pre-save hook re-hashes it
    }

    await user.save();
    res.json({ user: sanitizeUser(user), message: 'Profile updated successfully.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile };
