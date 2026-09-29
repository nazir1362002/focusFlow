const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');
const { protect } = require('../middleware/auth');

// @route   GET /api/focus
// @desc    Get all focus sessions of current user
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await FocusSession.find({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/focus
// @desc    Create / save a completed focus session
router.post('/', protect, async (req, res) => {
  try {
    const { task, plannedDuration, actualDuration, interruptions, notes, startedAt, endedAt } = req.body;

    if (!task || !plannedDuration) {
      return res.status(400).json({ message: 'Task and planned duration are required' });
    }

    const session = await FocusSession.create({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
      task: task.trim(),
      plannedDuration: Number(plannedDuration),
      actualDuration: Number(actualDuration) || 0,
      interruptions: Number(interruptions) || 0,
      notes: notes || '',
      startedAt: startedAt || new Date(),
      endedAt: endedAt || new Date(),
      completed: true,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/focus/:id
// @desc    Delete a focus session
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await FocusSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;