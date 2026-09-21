const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cycleNumber: {
      type: Number,
      default: 1,
    },
    currentDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 7,
    },
    completedDays: {
      type: [Number],
      default: [],
    },
    // Store answers/data for each day
    dayData: {
      day1: { type: Object, default: {} }, // Self-discovery answers
      day2: { type: Object, default: {} }, // Goals summary
      day3: { type: Object, default: {} }, // Actions summary
      day4: { type: Object, default: {} }, // 80/20 analysis
      day5: { type: Object, default: {} }, // Focus sessions summary
      day6: { type: Object, default: {} }, // Information diet
      day7: { type: Object, default: {} }, // Final reflection
    },
    isCompleted: {
      type: Boolean,
      default: false, // true when all 7 days are done
    },
    focusScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one progress document per user per cycle
progressSchema.index({ user: 1, cycleNumber: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);