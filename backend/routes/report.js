const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Progress = require('../models/Progress');
const Goal = require('../models/Goal');
const Action = require('../models/Action');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const Information = require('../models/Information');
const { protect } = require('../middleware/auth');
const { calculateFocusScore } = require('../services/focusScore');
const { generateReportAndBlueprint } = require('../services/gemini');

// @route   POST /api/report/generate
// @desc    Calculate score + generate AI report & blueprint
router.post('/generate', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const cycleNumber = req.user.currentCycle || 1;

    // Check if journey is completed
    const progress = await Progress.findOne({ user: userId, cycleNumber });
    if (!progress || !progress.isCompleted) {
      return res.status(400).json({ message: 'Please complete all 7 days first' });
    }

    // Check if report already exists
    let existing = await Report.findOne({ user: userId, cycleNumber });
    if (existing) {
      return res.json(existing);
    }

    // 1. Calculate Focus Score
    const scoreResult = await calculateFocusScore(userId, cycleNumber, {
      Goal, Action, Task, FocusSession, Information, Progress
    });

    // Save score to progress
    progress.focusScore = scoreResult.totalScore;
    await progress.save();

    // 2. Collect data for AI
    const [goals, actions, tasks, sessions, info] = await Promise.all([
      Goal.find({ user: userId, cycleNumber }),
      Action.find({ user: userId, cycleNumber }).populate('goal', 'title'),
      Task.find({ user: userId, cycleNumber }),
      FocusSession.find({ user: userId, cycleNumber }),
      Information.find({ user: userId, cycleNumber }),
    ]);

    const userData = {
      focusScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown,
      goals: goals.map(g => ({ title: g.title, category: g.category, isPriority: g.isPriority })),
      actions: actions.map(a => ({ title: a.title, goal: a.goal?.title, completed: a.isCompleted })),
      tasks: tasks.map(t => ({ title: t.title, impact: t.impact, time: t.estimatedTime })),
      focusSessions: sessions.map(s => ({
        task: s.task,
        duration: s.actualDuration,
        interruptions: s.interruptions
      })),
      informationDiet: info.map(i => ({
        activity: i.activity,
        duration: i.duration,
        useful: i.isUseful
      })),
      finalReflection: progress.dayData?.day7?.finalReflection || '',
      day1: progress.dayData?.day1 || {},
    };

    // 3. Call Gemini
    const { weeklyReport, focusBlueprint } = await generateReportAndBlueprint(userData);

    // 4. Save Report
    const report = await Report.create({
      user: userId,
      cycleNumber,
      focusScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown,
      weeklyReport,
      focusBlueprint,
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
});

// @route   GET /api/report
// @desc    Get report for current cycle
router.get('/', protect, async (req, res) => {
  try {
    const report = await Report.findOne({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    });

    if (!report) {
      return res.status(404).json({ message: 'No report found. Generate one first.' });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;