import { useState } from 'react';
import { useAuth } from '../context/GameContext';
import axios from 'axios';
import { aviatorSound } from '../utils/sound';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Header() {
  const { user, logout, updateBalance, demoBalance, gameMode, setGameMode, resetDemoBalance } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSound = () => {
    const enabled = aviatorSound.toggle();
    setSoundOn(enabled);
  };

  const currentBalance = gameMode === 'demo' ? demoBalance : (user?.balance || 0);

  return (
    <header className="bg-aviator-card border-b border-gray-800 px-3 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-aviator-accent">AVIATOR</h1>
          <button
            onClick={toggleSound}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={soundOn ? 'Mute sound' : 'Enable sound'}
          >
            {soundOn ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 5a1 1 0 012 0v6a1 1 0 11-2 0V5z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.78L4.71 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.71l3.673-3.784a1 1 0 011.006-.14z" clipRule="evenodd" />
                <path d="M15 8a1 1 0 10-2 0v4a1 1 0 102 0V8z" />
                <path d="M17.293 6.707a1 1 0 010 1.414l-2.586 2.586 2.586 2.586a1 1 0 01-1.414 1.414l-2.586-2.586-2.586 2.586a1 1 0 01-1.414-1.414l2.586-2.586-2.586-2.586a1 1 0 011.414-1.414l2.586 2.586 2.586-2.586a1 1 0 011.414 0z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-aviator-darker rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => setGameMode('demo')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                gameMode === 'demo'
                  ? 'bg-aviator-purple text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              DEMO
            </button>
            <button
              onClick={() => setGameMode('real')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                gameMode === 'real'
                  ? 'bg-aviator-green text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              REAL
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-aviator-darker rounded-lg px-2.5 py-1.5 border border-gray-700">
            <span className="text-gray-400 text-xs hidden sm:inline">
              {gameMode === 'demo' ? 'Demo:' : 'Balance:'}
            </span>
            <span className={`font-bold text-sm ${gameMode === 'demo' ? 'text-aviator-purple' : 'text-aviator-green'}`}>
              {currentBalance.toFixed(2)} KES
            </span>
          </div>

          {gameMode === 'demo' && demoBalance < 10 && (
            <button
              onClick={resetDemoBalance}
              className="btn-primary text-xs py-1.5 px-3 hidden sm:block"
            >
              RESET 5000
            </button>
          )}

          {gameMode === 'real' && (
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setShowDeposit(true)}
                className="btn-orange text-xs py-1.5 px-3"
              >
                DEPOSIT
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="text-xs py-1.5 px-3 bg-aviator-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
              >
                WITHDRAW
              </button>
            </div>
          )}

          <span className="text-gray-300 text-sm hidden sm:inline">{user?.username}</span>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden mt-3 pb-3 border-t border-gray-700 pt-3 space-y-3">
          {gameMode === 'demo' && demoBalance < 10 && (
            <button
              onClick={() => { resetDemoBalance(); setMenuOpen(false); }}
              className="w-full btn-primary text-sm py-2"
            >
              RESET 5000
            </button>
          )}

          {gameMode === 'real' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setShowDeposit(true); setMenuOpen(false); }}
                className="btn-orange text-sm py-2"
              >
                DEPOSIT
              </button>
              <button
                onClick={() => { setShowWithdraw(true); setMenuOpen(false); }}
                className="text-sm py-2 bg-aviator-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
              >
                WITHDRAW
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{user?.username}</span>
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} />
      <WithdrawModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} />
    </header>
  );
}
