const Roadmap = require('../models/Roadmap');

// GET /api/roadmap
const getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ roadmaps });
  } catch (err) {
    next(err);
  }
};

// POST /api/roadmap
const createRoadmap = async (req, res, next) => {
  try {
    const { title, description, milestones } = req.body;
    const roadmap = await Roadmap.create({
      user: req.userId,
      title,
      description: description || '',
      milestones: (milestones || []).map((m) =>
        typeof m === 'string' ? { title: m } : { title: m.title }
      ),
    });
    res.status(201).json({ roadmap });
  } catch (err) {
    next(err);
  }
};

// PUT /api/roadmap/:id
// Handles: title/desc updates, add milestone, toggle milestone
const updateRoadmap = async (req, res, next) => {
  try {
    const { title, description, addMilestone, toggleMilestone, deleteMilestone } = req.body;

    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.userId });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    if (title !== undefined) roadmap.title = title.trim();
    if (description !== undefined) roadmap.description = description.trim();

    if (addMilestone) {
      const milestoneTitle = addMilestone.trim();
      if (!milestoneTitle) {
        return res.status(400).json({ message: 'Milestone title cannot be empty.' });
      }
      if (milestoneTitle.length > 200) {
        return res.status(400).json({ message: 'Milestone title too long (max 200 chars).' });
      }
      roadmap.milestones.push({ title: milestoneTitle });
    }

    if (toggleMilestone) {
      const milestone = roadmap.milestones.id(toggleMilestone);
      if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });
      milestone.completed = !milestone.completed;
      milestone.completedAt = milestone.completed ? new Date() : null;
    }

    // Fix: original had no way to delete individual milestones
    if (deleteMilestone) {
      roadmap.milestones = roadmap.milestones.filter(
        (m) => m._id.toString() !== deleteMilestone
      );
    }

    await roadmap.save();
    res.json({ roadmap });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/roadmap/:id
const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });
    res.json({ message: 'Roadmap deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap };
