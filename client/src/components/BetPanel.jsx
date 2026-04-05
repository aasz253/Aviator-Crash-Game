import { useState, useEffect, useCallback } from 'react';
import { useGame, useAuth } from '../context/GameContext';
import { aviatorSound } from '../utils/sound';

const PRESET_AMOUNTS = [10, 50, 100, 500];

export default function BetPanel({ panelId = 1 }) {
  const { state, multiplier, placeBet, cashout, addLocalBet, updateLocalBet } = useGame();
  const { user, gameMode, demoBalance, updateDemoBalance, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState('');
  const [hasBet, setHasBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [autoBet, setAutoBet] = useState(false);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutTarget, setAutoCashoutTarget] = useState(2.0);
  const [betForNext, setBetForNext] = useState(false);
  const [currentBet, setCurrentBet] = useState(null);
  const [winAmount, setWinAmount] = useState(0);
  const [liveMultiplier, setLiveMultiplier] = useState(1.0);
  const [betId, setBetId] = useState(null);
  const [crashFlash, setCrashFlash] = useState(false);

  const getBalance = () => gameMode === 'demo' ? demoBalance : (user?.balance || 0);
  const updateBal = (amount) => {
    if (gameMode === 'demo') {
      updateDemoBalance(amount);
    } else {
      updateBalance(amount);
    }
  };

  const getBetAmount = () => customAmount ? parseFloat(customAmount) : betAmount;

  useEffect(() => {
    if (state === 'crashed') {
      setHasBet(false);
      setHasCashedOut(false);
      setCurrentBet(null);
      setLiveMultiplier(1.0);
      setBetId(null);
      setCrashFlash(true);
      setTimeout(() => setCrashFlash(false), 1000);
    }
  }, [state]);

  useEffect(() => {
    if (state === 'in_progress') {
      setLiveMultiplier(multiplier);
    }
  }, [multiplier, state]);

  useEffect(() => {
    if (state === 'in_progress' && hasBet && !hasCashedOut && currentBet && autoCashout && multiplier >= autoCashoutTarget) {
      handleCashout();
    }
  }, [state, multiplier, hasBet, hasCashedOut, currentBet, autoCashout, autoCashoutTarget]);

  const placeBetAction = useCallback(() => {
    const amount = getBetAmount();
    if (amount <= 0) return;
    if (amount > getBalance()) return;
    if (state !== 'waiting') return;

    const id = `${user?.username || 'Player'}-${panelId}-${Date.now()}`;
    setBetId(id);

    updateBal(getBalance() - amount);
    setCurrentBet(amount);
    setHasBet(true);
    setHasCashedOut(false);
    aviatorSound.playBetPlaced();

    addLocalBet(user?.username || 'Player', amount, id, panelId);
  }, [betAmount, customAmount, state, gameMode, demoBalance, user, panelId]);

  const handleCancel = useCallback(() => {
    if (!currentBet || state !== 'waiting') return;

    updateBal(getBalance() + currentBet);
    setHasBet(false);
    setCurrentBet(null);
    setBetId(null);
    aviatorSound.playBetPlaced();
  }, [currentBet, state, gameMode, demoBalance, user]);

  const handleCashout = useCallback(() => {
    if (!currentBet || hasCashedOut) return;

    const win = Math.round(currentBet * liveMultiplier * 100) / 100;
    setWinAmount(win);
    setHasCashedOut(true);
    updateBal(getBalance() + win);
    aviatorSound.playCashout();

    if (betId) {
      updateLocalBet(betId, 'cashed_out', liveMultiplier, win);
    }
  }, [currentBet, liveMultiplier, hasCashedOut, gameMode, demoBalance, user, betId]);

  useEffect(() => {
    if (state === 'crashed' && hasBet && !hasCashedOut && betId) {
      updateLocalBet(betId, 'crashed', null, 0);
    }
  }, [state, hasBet, hasCashedOut, betId]);

  const handlePresetClick = (amount) => {
    setBetAmount(amount);
    setCustomAmount('');
  };

  const canBet = state === 'waiting' && !hasBet;
  const canCancel = state === 'waiting' && hasBet;
  const canCashout = state === 'in_progress' && hasBet && !hasCashedOut && currentBet;
  const isWaitingForNext = state === 'in_progress' && betForNext;
  const potentialWin = currentBet ? (currentBet * liveMultiplier).toFixed(2) : '0.00';

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            gameMode === 'demo' ? 'bg-aviator-purple/20 text-aviator-purple' : 'bg-aviator-green/20 text-aviator-green'
          }`}>
            {gameMode.toUpperCase()}
          </span>
          <h3 className="text-sm font-bold text-gray-300">
            Bet {panelId}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={autoBet}
              onChange={(e) => setAutoBet(e.target.checked)}
              className="rounded bg-aviator-darker border-gray-600 w-3 h-3"
            />
            Auto
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={autoCashout}
              onChange={(e) => setAutoCashout(e.target.checked)}
              className="rounded bg-aviator-darker border-gray-600 w-3 h-3"
            />
            Auto Cashout
          </label>
        </div>
      </div>

      {autoCashout && (
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Target:</span>
            <input
              type="number"
              value={autoCashoutTarget}
              onChange={(e) => setAutoCashoutTarget(parseFloat(e.target.value) || 1.01)}
              className="input-field py-1 text-sm"
              min="1.01"
              step="0.1"
            />
            <span className="text-xs text-gray-400">x</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            className={`py-2 rounded-lg text-sm font-bold transition-all ${
              betAmount === amount && !customAmount
                ? 'bg-aviator-green text-black'
                : 'bg-aviator-darker text-gray-300 hover:bg-gray-700'
            }`}
          >
            {amount}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Custom amount"
          className="input-field text-center text-lg font-bold"
          min="10"
        />
      </div>

      {!hasBet && (
        <button
          onClick={placeBetAction}
          disabled={state !== 'waiting' || getBalance() < getBetAmount()}
          className={`w-full text-lg py-3 px-6 rounded-lg font-bold transition-all ${
            state === 'waiting' && getBalance() >= getBetAmount()
              ? 'bg-aviator-green text-black hover:bg-green-400 active:scale-95'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {state === 'waiting' ? `BET ${getBetAmount().toFixed(2)} KES` : `WAITING... ${getBetAmount().toFixed(2)} KES`}
        </button>
      )}

      {hasBet && state === 'waiting' && (
        <button
          onClick={handleCancel}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all active:scale-95 text-lg"
        >
          CANCEL {currentBet?.toFixed(2)} KES
        </button>
      )}

      {canCashout && (
        <button
          onClick={handleCashout}
          className="w-full btn-orange text-lg animate-pulse"
        >
          CASHOUT {potentialWin} KES
        </button>
      )}

      {!hasBet && state === 'in_progress' && (
        <button
          disabled
          className={`w-full text-lg py-3 px-6 rounded-lg font-bold transition-all ${
            crashFlash
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {crashFlash ? 'FLEW AWAY!' : 'WAITING FOR NEXT ROUND'}
        </button>
      )}

      {hasBet && state === 'in_progress' && !hasCashedOut && (
        <div className="w-full py-3 bg-aviator-orange/20 border border-aviator-orange/50 rounded-lg text-center">
          <span className="text-aviator-orange font-bold">IN GAME: {currentBet?.toFixed(2)} KES</span>
        </div>
      )}

      {hasCashedOut && (
        <div className="w-full py-3 bg-green-900/50 border border-green-700 rounded-lg text-center">
          <span className="text-green-400 font-bold">Won {winAmount.toFixed(2)} KES!</span>
        </div>
      )}

      {state === 'crashed' && hasBet && !hasCashedOut && (
        <div className="w-full py-3 bg-red-900/50 border border-red-700 rounded-lg text-center">
          <span className="text-red-400 font-bold">Lost {currentBet?.toFixed(2)} KES</span>
        </div>
      )}

      <div className="mt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={betForNext}
            onChange={(e) => setBetForNext(e.target.checked)}
            className="rounded bg-aviator-darker border-gray-600"
          />
          <span className="text-sm text-gray-300">
            {isWaitingForNext ? 'Bet queued for next round' : 'BET NEXT'}
          </span>
        </label>
      </div>
    </div>
  );
}
