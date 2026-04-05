const Round = require('../models/Round');
const Bet = require('../models/Bet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class GameEngine {
  constructor(io) {
    this.io = io;
    this.currentRound = null;
    this.roundNumber = 0;
    this.multiplier = 1.0;
    this.crashPoint = 0;
    this.gameState = 'waiting';
    this.waitingTimer = null;
    this.gameTimer = null;
    this.bets = new Map();
    this.activeBets = new Map();
    this.WAITING_DURATION = 8000;
    this.TICK_INTERVAL = 100;
    this.generateCrashPoint();
    this.initRoundNumber();
  }

  async initRoundNumber() {
    try {
      const lastRound = await Round.findOne().sort({ roundNumber: -1 });
      this.roundNumber = lastRound ? lastRound.roundNumber : 0;
    } catch (error) {
      this.roundNumber = 0;
    }
    this.startNewRound();
  }

  generateCrashPoint() {
    const houseEdge = 0.05;
    const e = 2 ** 32;
    const h = Math.floor(Math.random() * e);
    if (h % 33 === 0) {
      this.crashPoint = 1.0;
    } else {
      this.crashPoint = Math.floor((100 * e - h) / (e - h)) / 100;
    }
    if (this.crashPoint < 1.01) this.crashPoint = 1.01;
    if (Math.random() < houseEdge * 0.3) {
      this.crashPoint = Math.max(1.01, this.crashPoint * 0.5);
    }
    this.crashPoint = Math.min(this.crashPoint, 100);
    this.crashPoint = Math.round(this.crashPoint * 100) / 100;
  }

  async startNewRound() {
    this.roundNumber++;
    this.gameState = 'waiting';
    this.multiplier = 1.0;
    this.bets.clear();
    this.activeBets.clear();
    this.generateCrashPoint();

    this.currentRound = await Round.create({
      roundNumber: this.roundNumber,
      crashPoint: this.crashPoint,
      status: 'waiting',
    });

    this.io.emit('gameState', {
      state: 'waiting',
      roundNumber: this.roundNumber,
      countdown: this.WAITING_DURATION / 1000,
    });

    this.waitingTimer = setTimeout(() => {
      this.startGame();
    }, this.WAITING_DURATION);
  }

  async startGame() {
    this.gameState = 'in_progress';
    const startTime = new Date();

    await Round.findByIdAndUpdate(this.currentRound._id, {
      status: 'in_progress',
      startTime,
    });

    this.io.emit('roundStart', {
      roundNumber: this.roundNumber,
      crashPoint: this.crashPoint,
    });

    let elapsed = 0;
    this.gameTimer = setInterval(async () => {
      elapsed += this.TICK_INTERVAL;
      this.multiplier = Math.pow(Math.E, 0.00006 * elapsed);
      this.multiplier = Math.round(this.multiplier * 100) / 100;

      if (this.multiplier >= this.crashPoint) {
        this.multiplier = this.crashPoint;
        this.crash();
        return;
      }

      this.io.emit('multiplierUpdate', {
        multiplier: this.multiplier,
        roundNumber: this.roundNumber,
      });

      this.emitLeaderboardUpdate();
      this.emitCurrentRoundBets();
    }, this.TICK_INTERVAL);
  }

  async crash() {
    clearInterval(this.gameTimer);
    this.gameState = 'ended';

    for (const [userId, bet] of this.activeBets) {
      bet.status = 'crashed';
      bet.cashoutMultiplier = null;
      bet.winAmount = 0;
      await Bet.findByIdAndUpdate(bet._id, {
        status: 'crashed',
        cashoutMultiplier: null,
        winAmount: 0,
      });
    }

    await Round.findByIdAndUpdate(this.currentRound._id, {
      status: 'ended',
      endTime: new Date(),
    });

    this.io.emit('crash', {
      crashPoint: this.crashPoint,
      roundNumber: this.roundNumber,
    });

    setTimeout(() => {
      this.startNewRound();
    }, 3000);
  }

  async placeBet(userId, betAmount) {
    if (this.gameState !== 'waiting') {
      return { success: false, message: 'Betting is closed' };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.balance < betAmount) {
      return { success: false, message: 'Insufficient balance' };
    }

    if (betAmount < 10) {
      return { success: false, message: 'Minimum bet is 10 KES' };
    }

    await User.findByIdAndUpdate(userId, { $inc: { balance: -betAmount } });

    const bet = await Bet.create({
      userId,
      roundId: this.currentRound._id,
      betAmount,
      status: 'pending',
    });

    this.bets.set(userId.toString(), {
      betId: bet._id,
      userId,
      username: user.username,
      betAmount,
      status: 'pending',
    });

    this.activeBets.set(userId.toString(), bet);

    await Round.findByIdAndUpdate(this.currentRound._id, {
      $inc: { totalBets: 1, totalBetAmount: betAmount },
    });

    this.emitCurrentRoundBets();
    return { success: true, message: 'Bet placed' };
  }

  async cashout(userId) {
    if (this.gameState !== 'in_progress') {
      return { success: false, message: 'Cannot cashout now' };
    }

    const bet = this.activeBets.get(userId.toString());
    if (!bet || bet.status !== 'pending') {
      return { success: false, message: 'No active bet' };
    }

    const winAmount = Math.round(bet.betAmount * this.multiplier * 100) / 100;

    bet.status = 'cashed_out';
    bet.cashoutMultiplier = this.multiplier;
    bet.winAmount = winAmount;

    await Bet.findByIdAndUpdate(bet._id, {
      status: 'cashed_out',
      cashoutMultiplier: this.multiplier,
      winAmount,
    });

    await User.findByIdAndUpdate(userId, { $inc: { balance: winAmount } });

    await Round.findByIdAndUpdate(this.currentRound._id, {
      $inc: { totalPayout: winAmount },
    });

    this.activeBets.delete(userId.toString());

    const user = await User.findById(userId);

    this.io.emit('leaderboardUpdate', {
      player: user.username,
      betAmount: bet.betAmount,
      winAmount,
      multiplier: this.multiplier,
    });

    this.emitCurrentRoundBets();

    return {
      success: true,
      multiplier: this.multiplier,
      winAmount,
      balance: user.balance,
    };
  }

  emitLeaderboardUpdate() {
    const leaderboard = [];
    for (const [userId, bet] of this.activeBets) {
      if (bet.status === 'cashed_out') {
        leaderboard.push({
          username: bet.username || 'Player',
          betAmount: bet.betAmount,
          winAmount: bet.winAmount,
          multiplier: bet.cashoutMultiplier,
        });
      }
    }
    this.io.emit('leaderboardUpdate', leaderboard);
  }

  emitCurrentRoundBets() {
    const currentBets = [];
    for (const [userId, betData] of this.bets) {
      const activeBet = this.activeBets.get(userId);
      currentBets.push({
        username: betData.username,
        betAmount: betData.betAmount,
        status: activeBet ? activeBet.status : betData.status,
        winAmount: activeBet?.winAmount || 0,
        multiplier: activeBet?.cashoutMultiplier || null,
      });
    }
    this.io.emit('currentRoundBets', currentBets);
  }

  getHistory() {
    return this.io.emit('historyUpdate', {
      roundNumber: this.roundNumber,
      crashPoint: this.crashPoint,
    });
  }
}

module.exports = GameEngine;
