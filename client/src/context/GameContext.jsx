import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();
const GameContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [state.user, state.token]);

  const login = async (phoneNumber, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (username, phoneNumber, password, confirmPassword) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phoneNumber, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch({ type: 'REGISTER_SUCCESS', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'REGISTER_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateBalance = (balance) => {
    dispatch({ type: 'UPDATE_BALANCE', payload: balance });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { ...state, loading: false, user: action.payload.user, token: action.payload.token };
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { user: null, token: null, loading: false, error: null };
    case 'UPDATE_BALANCE':
      return { ...state, user: { ...state.user, balance: action.payload } };
    default:
      return state;
  }
}

export function useAuth() {
  return useContext(AuthContext);
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useReducer(gameReducer, {
    state: 'waiting',
    roundNumber: 0,
    multiplier: 1.0,
    countdown: 0,
    crashPoint: null,
    history: [],
    currentBets: [],
    leaderboard: [],
    myBet: null,
    myCashout: null,
    betResult: null,
    cashoutResult: null,
    error: null,
  });

  const socketRef = useRef(null);

  useEffect(() => {
    let interval;
    if (gameState.state === 'waiting' && gameState.countdown > 0) {
      interval = setInterval(() => {
        setGameState({ type: 'GAME_STATE', payload: { countdown: Math.max(0, gameState.countdown - 0.1) } });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState.state, gameState.countdown]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(API_URL, {
      auth: { token },
      query: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinGame');
    });

    socket.on('gameState', (data) => {
      setGameState({ type: 'GAME_STATE', payload: data });
    });

    socket.on('roundStart', (data) => {
      setGameState({ type: 'ROUND_START', payload: data });
    });

    socket.on('multiplierUpdate', (data) => {
      setGameState({ type: 'MULTIPLIER_UPDATE', payload: data });
    });

    socket.on('crash', (data) => {
      setGameState({ type: 'CRASH', payload: data });
    });

    socket.on('currentRoundBets', (data) => {
      setGameState({ type: 'CURRENT_ROUND_BETS', payload: data });
    });

    socket.on('leaderboardUpdate', (data) => {
      setGameState({ type: 'LEADERBOARD_UPDATE', payload: data });
    });

    socket.on('betResult', (data) => {
      setGameState({ type: 'BET_RESULT', payload: data });
    });

    socket.on('cashoutResult', (data) => {
      setGameState({ type: 'CASHOUT_RESULT', payload: data });
    });

    socket.on('error', (data) => {
      setGameState({ type: 'SOCKET_ERROR', payload: data });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const placeBet = (amount) => {
    if (socketRef.current) {
      socketRef.current.emit('placeBet', { amount });
    }
  };

  const cashout = () => {
    if (socketRef.current) {
      socketRef.current.emit('cashout');
    }
  };

  return (
    <GameContext.Provider value={{ ...gameState, placeBet, cashout }}>
      {children}
    </GameContext.Provider>
  );
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'GAME_STATE':
      return { ...state, ...action.payload };
    case 'ROUND_START':
      return { 
        ...state, 
        state: 'in_progress', 
        multiplier: 1.0, 
        myCashout: null, 
        betResult: null, 
        cashoutResult: null,
        currentBets: [],
        leaderboard: [],
      };
    case 'MULTIPLIER_UPDATE':
      return { ...state, multiplier: action.payload.multiplier };
    case 'CRASH':
      return { 
        ...state, 
        state: 'crashed', 
        crashPoint: action.payload.crashPoint,
        history: [action.payload.crashPoint, ...state.history].slice(0, 50),
      };
    case 'CURRENT_ROUND_BETS':
      return { ...state, currentBets: action.payload };
    case 'LEADERBOARD_UPDATE':
      if (Array.isArray(action.payload)) {
        return { ...state, leaderboard: action.payload };
      }
      return { ...state, leaderboard: [...state.leaderboard, action.payload] };
    case 'BET_RESULT':
      return { ...state, betResult: action.payload };
    case 'CASHOUT_RESULT':
      return { ...state, cashoutResult: action.payload };
    case 'SOCKET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MY_BET':
      return { ...state, myBet: action.payload };
    case 'SET_MY_CASHOUT':
      return { ...state, myCashout: action.payload };
    default:
      return state;
  }
}

export function useGame() {
  return useContext(GameContext);
}
