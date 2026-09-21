const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { protect } = require('../middleware/auth');

// @route   GET /api/goals
// @desc    Get all goals of current user for current cycle
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    }).sort({ isPriority: -1, createdAt: -1 });

    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/goals
// @desc    Create a new goal
router.post('/', protect, async (req, res) => {
  try {
    const { title, category, description, isPriority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Goal title is required' });
    }

    const goal = await Goal.create({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
      title: title.trim(),
      category: category || 'Personal',
      description: description || '',
      isPriority: isPriority || false,
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update a goal
router.put('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Make sure user owns the goal
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, category, description, isPriority, isCompleted } = req.body;

    goal.title = title || goal.title;
    goal.category = category || goal.category;
    goal.description = description !== undefined ? description : goal.description;
    goal.isPriority = isPriority !== undefined ? isPriority : goal.isPriority;
    goal.isCompleted = isCompleted !== undefined ? isCompleted : goal.isCompleted;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
router.delete('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;