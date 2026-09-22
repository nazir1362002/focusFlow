const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    estimatedTime: {
      type: Number, // in hours
      required: true,
      min: 0,
    },
    impact: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);