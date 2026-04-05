const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/deposit', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: amount } },
      { new: true }
    );
    res.json({
      message: 'Deposit successful',
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: -amount } },
      { new: true }
    );
    res.json({
      message: 'Withdrawal processed',
      balance: user.balance - amount,
      phoneNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
