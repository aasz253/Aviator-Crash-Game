const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const GameEngine = require('./game/gameEngine');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/bets', require('./routes/bets'));
app.use('/api/rounds', require('./routes/rounds'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aviator server is running' });
});

const gameEngine = new GameEngine(io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      socket.user = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    socket.user = null;
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.emit('gameState', {
    state: gameEngine.gameState,
    roundNumber: gameEngine.roundNumber,
    multiplier: gameEngine.multiplier,
  });

  socket.on('joinGame', () => {
    socket.join('game');
    if (socket.user) {
      console.log(`${socket.user.username} joined the game`);
    }
  });

  socket.on('placeBet', async (data) => {
    if (!socket.user) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    const result = await gameEngine.placeBet(socket.user._id, data.amount);
    socket.emit('betResult', result);
  });

  socket.on('cashout', async () => {
    if (!socket.user) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    const result = await gameEngine.cashout(socket.user._id);
    socket.emit('cashoutResult', result);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
