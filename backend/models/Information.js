const mongoose = require('mongoose');

const informationSchema = new mongoose.Schema(
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
    activity: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },
    isUseful: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Information', informationSchema);