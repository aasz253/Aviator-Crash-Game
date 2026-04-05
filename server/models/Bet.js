const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true,
  },
  betAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  cashoutMultiplier: {
    type: Number,
    default: null,
  },
  winAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'cashed_out', 'crashed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Bet', betSchema);
