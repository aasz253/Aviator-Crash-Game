const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Bet = require('../models/Bet');

router.get('/history', protect, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user.id })
      .populate('roundId', 'roundNumber crashPoint')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
