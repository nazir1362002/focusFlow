const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// @route   GET /api/progress
// @desc    Get current progress of logged-in user
router.get('/', protect, async (req, res) => {
  try {
    let progress = await Progress.findOne({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    });

    // If no progress exists yet, create one
    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        cycleNumber: req.user.currentCycle || 1,
        currentDay: 1,
        completedDays: [],
      });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/progress/complete-day
// @desc    Mark a day as completed and unlock next day
router.put('/complete-day', protect, async (req, res) => {
  try {
    const { day, dayData } = req.body; // day = 1 to 7

    if (!day || day < 1 || day > 7) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Prevent skipping days
    if (day > 1 && !progress.completedDays.includes(day - 1)) {
      return res.status(400).json({
        message: `You must complete Day ${day - 1} first`,
      });
    }

    // Save day data
    progress.dayData[`day${day}`] = dayData || {};

    // Add to completedDays if not already there
    if (!progress.completedDays.includes(day)) {
      progress.completedDays.push(day);
    }

    // Update currentDay
    if (day < 7) {
      progress.currentDay = day + 1;
    } else {
      progress.currentDay = 7;
      progress.isCompleted = true;
    }

    await progress.save();

    res.json({
      message: `Day ${day} completed successfully`,
      progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/progress/save-day-data
// @desc    Save partial data for a day (without marking complete)
router.put('/save-day-data', protect, async (req, res) => {
  try {
    const { day, dayData } = req.body;

    if (!day || day < 1 || day > 7) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    progress.dayData[`day${day}`] = {
      ...progress.dayData[`day${day}`],
      ...dayData,
    };

    await progress.save();

    res.json({ message: 'Data saved', progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;