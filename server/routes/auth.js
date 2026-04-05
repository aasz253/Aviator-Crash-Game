const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, phoneNumber, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const userExists = await User.findOne({
      $or: [{ username }, { phoneNumber }],
    });
    if (userExists) {
      return res.status(400).json({
        message: userExists.username === username
          ? 'Username already taken'
          : 'Phone number already registered',
      });
    }
    const user = await User.create({ username, phoneNumber, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        balance: user.balance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        balance: user.balance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
