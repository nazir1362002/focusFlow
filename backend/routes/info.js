const express = require('express');
const router = express.Router();
const Information = require('../models/Information');
const { protect } = require('../middleware/auth');

// @route   GET /api/info
// @desc    Get all information records of current user
router.get('/', protect, async (req, res) => {
  try {
    const records = await Information.find({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/info
// @desc    Add a new information activity
router.post('/', protect, async (req, res) => {
  try {
    const { activity, duration, isUseful } = req.body;

    if (!activity || activity.trim() === '') {
      return res.status(400).json({ message: 'Activity is required' });
    }
    if (!duration || duration < 1) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }
    if (typeof isUseful !== 'boolean') {
      return res.status(400).json({ message: 'isUseful must be true or false' });
    }

    const record = await Information.create({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
      activity: activity.trim(),
      duration: Number(duration),
      isUseful,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/info/:id
// @desc    Delete an information record
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await Information.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (record.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await record.deleteOne();
    res.json({ message: 'Record deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/info/analysis
// @desc    Get useful vs unnecessary consumption analysis
router.get('/analysis', protect, async (req, res) => {
  try {
    const records = await Information.find({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    });

    const useful = records.filter(r => r.isUseful);
    const waste = records.filter(r => !r.isUseful);

    const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
    const usefulMinutes = useful.reduce((sum, r) => sum + r.duration, 0);
    const wasteMinutes = waste.reduce((sum, r) => sum + r.duration, 0);

    res.json({
      totalRecords: records.length,
      usefulCount: useful.length,
      wasteCount: waste.length,
      totalMinutes,
      usefulMinutes,
      wasteMinutes,
      usefulPercentage: totalMinutes > 0 ? Math.round((usefulMinutes / totalMinutes) * 100) : 0,
      wastePercentage: totalMinutes > 0 ? Math.round((wasteMinutes / totalMinutes) * 100) : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;