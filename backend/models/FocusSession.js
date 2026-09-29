const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
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
    task: {
      type: String,
      required: true,
      trim: true,
    },
    plannedDuration: {
      type: Number, // in minutes
      required: true,
    },
    actualDuration: {
      type: Number, // in minutes
      default: 0,
    },
    interruptions: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FocusSession', focusSessionSchema);