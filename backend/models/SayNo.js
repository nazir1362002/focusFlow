const mongoose = require('mongoose');

const sayNoSchema = new mongoose.Schema(
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
    scenario: {
      type: String,
      required: true,
    },
    userResponse: {
      type: String,
      required: true,
    },
    aiFeedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SayNo', sayNoSchema);