const express = require('express');
const router = express.Router();
const Action = require('../models/Action');
const Goal = require('../models/Goal');
const { protect } = require('../middleware/auth');

// @route   GET /api/actions
// @desc    Get all actions of current user (optionally filter by goal)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    };

    if (req.query.goalId) {
      filter.goal = req.query.goalId;
    }

    const actions = await Action.find(filter)
      .populate('goal', 'title category')
      .sort({ createdAt: -1 });

    res.json(actions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/actions
// @desc    Create a new action for a goal
router.post('/', protect, async (req, res) => {
  try {
    const { goalId, title } = req.body;

    if (!goalId || !title || title.trim() === '') {
      return res.status(400).json({ message: 'Goal and action title are required' });
    }

    // Verify the goal belongs to the user
    const goal = await Goal.findById(goalId);
    if (!goal || goal.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const action = await Action.create({
      user: req.user._id,
      goal: goalId,
      cycleNumber: req.user.currentCycle || 1,
      title: title.trim(),
    });

    const populated = await Action.findById(action._id).populate('goal', 'title category');
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/actions/:id
// @desc    Update an action (mainly toggle completed)
router.put('/:id', protect, async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }

    if (action.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.body.title !== undefined) action.title = req.body.title;
    if (req.body.isCompleted !== undefined) action.isCompleted = req.body.isCompleted;

    const updated = await action.save();
    const populated = await Action.findById(updated._id).populate('goal', 'title category');
    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/actions/:id
// @desc    Delete an action
router.delete('/:id', protect, async (req, res) => {
  try {
    const action = await Action.findById(req.params.id);

    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }

    if (action.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await action.deleteOne();
    res.json({ message: 'Action deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;