const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks of current user for current cycle
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    }).sort({ impact: 1, createdAt: -1 }); // High impact first (custom sort later)

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', protect, async (req, res) => {
  try {
    const { title, estimatedTime, impact } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (estimatedTime === undefined || estimatedTime < 0) {
      return res.status(400).json({ message: 'Valid estimated time is required' });
    }
    if (!['High', 'Medium', 'Low'].includes(impact)) {
      return res.status(400).json({ message: 'Impact must be High, Medium or Low' });
    }

    const task = await Task.create({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
      title: title.trim(),
      estimatedTime: Number(estimatedTime),
      impact,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/analysis
// @desc    Get 80/20 analysis
router.get('/analysis', protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    });

    const high = tasks.filter(t => t.impact === 'High');
    const medium = tasks.filter(t => t.impact === 'Medium');
    const low = tasks.filter(t => t.impact === 'Low');

    const totalTime = tasks.reduce((sum, t) => sum + t.estimatedTime, 0);
    const highTime = high.reduce((sum, t) => sum + t.estimatedTime, 0);
    const lowTime = low.reduce((sum, t) => sum + t.estimatedTime, 0);

    res.json({
      totalTasks: tasks.length,
      highImpact: high,
      mediumImpact: medium,
      lowImpact: low,
      totalTime,
      highTime,
      lowTime,
      highPercentage: totalTime > 0 ? Math.round((highTime / totalTime) * 100) : 0,
      lowPercentage: totalTime > 0 ? Math.round((lowTime / totalTime) * 100) : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;