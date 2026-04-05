import { useState, useEffect } from 'react';
import { useGame, useAuth } from '../context/GameContext';

const PRESET_AMOUNTS = [10, 50, 100, 500];

export default function BetPanel({ panelId = 1 }) {
  const { state, multiplier, placeBet, cashout, betResult, cashoutResult, myBet, myCashout } = useGame();
  const { user } = useAuth();
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

  useEffect(() => {
    if (state === 'waiting') {
      if (betForNext && autoBet && !hasBet) {
        const amount = customAmount ? parseFloat(customAmount) : betAmount;
        if (amount > 0) {
          placeBet(amount);
          setHasBet(true);
          setCurrentBet(amount);
        }
      }
    }
    if (state === 'in_progress' && hasBet && !hasCashedOut) {
      if (autoCashout && multiplier >= autoCashoutTarget) {
        handleCashout();
      }
    }
    if (state === 'crashed') {
      if (hasBet && !hasCashedOut) {
        setWinAmount(0);
      }
      setHasBet(false);
      setHasCashedOut(false);
      setCurrentBet(null);
    }
  }, [state]);

  useEffect(() => {
    if (betResult?.success) {
      setHasBet(true);
      setCurrentBet(betAmount);
    }
  }, [betResult]);

  useEffect(() => {
    if (cashoutResult?.success) {
      setHasCashedOut(true);
      setWinAmount(cashoutResult.winAmount);
    }
  }, [cashoutResult]);

  const handlePlaceBet = () => {
    const amount = customAmount ? parseFloat(customAmount) : betAmount;
    if (amount <= 0) return;
    placeBet(amount);
    setHasBet(true);
    setCurrentBet(amount);
  };

  const handleCashout = () => {
    cashout();
    setHasCashedOut(true);
  };

  const handlePresetClick = (amount) => {
    setBetAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
  };

  const canBet = state === 'waiting' && !hasBet;
  const canCashout = state === 'in_progress' && hasBet && !hasCashedOut;
  const isWaitingForNext = state === 'in_progress' && betForNext;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">
          {panelId === 1 ? 'Main Bet' : 'Secondary Bet'}
        </h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoBet}
              onChange={(e) => setAutoBet(e.target.checked)}
              className="rounded bg-aviator-darker border-gray-600"
            />
            Auto
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCashout}
              onChange={(e) => setAutoCashout(e.target.checked)}
              className="rounded bg-aviator-darker border-gray-600"
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
          onChange={handleCustomChange}
          placeholder="Custom amount"
          className="input-field text-center text-lg font-bold"
          min="10"
        />
      </div>

      {canBet && (
        <button
          onClick={handlePlaceBet}
          className="w-full btn-primary text-lg"
        >
          BET {(customAmount ? parseFloat(customAmount) : betAmount).toFixed(2)} KES
        </button>
      )}

      {canCashout && (
        <button
          onClick={handleCashout}
          className="w-full btn-orange text-lg"
        >
          CASHOUT {(currentBet * multiplier).toFixed(2)} KES
        </button>
      )}

      {hasBet && !canCashout && state !== 'waiting' && !hasCashedOut && (
        <div className="w-full py-3 bg-gray-800 rounded-lg text-center">
          <span className="text-gray-400">Waiting for round...</span>
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
