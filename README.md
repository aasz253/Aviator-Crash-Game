# Aviator Crash Game

A full-stack real-time crash gambling game similar to Aviator, built with React, Node.js, Socket.io, and MongoDB.

## Features

- Real-time multiplayer crash game with Socket.io
- JWT authentication (login/register)
- Live betting system with auto-bet and auto-cashout
- Real-time leaderboard and active players display
- Game history with multiplier pills
- Mock M-Pesa deposit system
- Dark theme UI matching Aviator style
- Dual betting panels

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Backend

```bash
cd server
npm install
```

Create a `.env` file (already provided):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aviator
JWT_SECRET=aviator_super_secret_key_2024_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
avi/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── game/
│   │   └── gameEngine.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Bet.js
│   │   └── Round.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── bets.js
│   │   └── rounds.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── HistoryBar.jsx
│   │   │   ├── GameDisplay.jsx
│   │   │   ├── BetPanel.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── context/
│   │   │   └── GameContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── GamePage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/user/balance | Get user balance |
| POST | /api/user/deposit | Mock deposit |
| GET | /api/bets/history | Get bet history |
| GET | /api/rounds/history | Get round history |

## Socket Events

### Client → Server
- `joinGame` - Join the game room
- `placeBet` - Place a bet { amount: number }
- `cashout` - Cashout current bet

### Server → Client
- `gameState` - Current game state
- `roundStart` - New round started
- `multiplierUpdate` - Multiplier tick
- `crash` - Round crashed
- `currentRoundBets` - All bets in current round
- `leaderboardUpdate` - Leaderboard updates

## Game Logic

- Rounds last ~8 seconds waiting, then run until crash
- Crash point generated with provably fair algorithm
- Crash range: 1.01x - 100x (with house edge)
- Minimum bet: 10 KES
- Auto-bet and auto-cashout features available

## License

MIT
