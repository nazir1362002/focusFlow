const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cycleNumber: {
      type: Number,
      required: true,
    },
    focusScore: {
      type: Number,
      required: true,
    },
    scoreBreakdown: {
      type: Object,
      default: {},
    },
    weeklyReport: {
      type: String, // Markdown or plain text from Gemini
      default: '',
    },
    focusBlueprint: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);