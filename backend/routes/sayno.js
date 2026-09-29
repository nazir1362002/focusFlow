const express = require('express');
const router = express.Router();
const SayNo = require('../models/SayNo');
const { protect } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Predefined scenarios
const SCENARIOS = [
  "Your friend asks you to attend a social event while you have an important deadline tomorrow.",
  "A colleague asks you to take on extra work that will eat into your deep work time.",
  "Your family wants you to join a long video call during your planned focus block.",
  "You receive a notification about a new series on Netflix right when you planned to study.",
  "Someone invites you to a meeting that has no clear agenda and isn't critical.",
  "A friend keeps messaging you during your focus session asking for quick favors."
];

// @route   GET /api/sayno/scenarios
// @desc    Get list of scenarios
router.get('/scenarios', protect, (req, res) => {
  res.json(SCENARIOS);
});

// @route   GET /api/sayno
// @desc    Get user's previous responses
router.get('/', protect, async (req, res) => {
  try {
    const responses = await SayNo.find({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
    }).sort({ createdAt: -1 });

    res.json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sayno
// @desc    Submit a response + optional AI feedback
router.post('/', protect, async (req, res) => {
  try {
    const { scenario, userResponse, getFeedback } = req.body;

    if (!scenario || !userResponse) {
      return res.status(400).json({ message: 'Scenario and response are required' });
    }

    let aiFeedback = '';

    // Optional AI feedback
    if (getFeedback) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

        const prompt = `
You are a focus coach. The user was given this situation:

"${scenario}"

They responded:
"${userResponse}"

Give short, constructive feedback (3-5 sentences) on how well they protected their focus. 
Be encouraging but honest. Suggest a better alternative if needed.
`;

        const result = await model.generateContent(prompt);
        aiFeedback = result.response.text();
      } catch (err) {
        console.error('AI feedback error:', err.message);
        aiFeedback = 'AI feedback temporarily unavailable.';
      }
    }

    const entry = await SayNo.create({
      user: req.user._id,
      cycleNumber: req.user.currentCycle || 1,
      scenario,
      userResponse,
      aiFeedback,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;