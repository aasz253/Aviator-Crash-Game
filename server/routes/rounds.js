const express = require('express');
const router = express.Router();
const Round = require('../models/Round');

router.get('/history', async (req, res) => {
  try {
    const rounds = await Round.find({ status: 'ended' })
      .sort({ roundNumber: -1 })
      .limit(50)
      .select('roundNumber crashPoint startTime endTime');
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
