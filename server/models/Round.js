const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  crashPoint: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  totalBets: {
    type: Number,
    default: 0,
  },
  totalBetAmount: {
    type: Number,
    default: 0,
  },
  totalPayout: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'ended'],
    default: 'waiting',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Round', roundSchema);
