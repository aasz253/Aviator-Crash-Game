import { useState, useEffect } from 'react';
import Header from '../components/Header';
import HistoryBar from '../components/HistoryBar';
import GameDisplay from '../components/GameDisplay';
import BetPanel from '../components/BetPanel';
import Leaderboard from '../components/Leaderboard';
import { useGame } from '../context/GameContext';

export default function GamePage() {
  const { state, crashPoint, roundNumber } = useGame();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (state === 'crashed' && crashPoint) {
      setHistory((prev) => [crashPoint, ...prev].slice(0, 50));
    }
  }, [state, crashPoint]);

  return (
    <div className="min-h-screen bg-aviator-dark">
      <Header />
      <HistoryBar />

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <GameDisplay />

            <div className="grid grid-cols-2 gap-2">
              <BetPanel panelId={1} />
              <BetPanel panelId={2} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>
      </main>

        <footer className="mt-8 py-4 text-center text-gray-600 text-sm border-t border-gray-800">
          <p>Aviator Crash Game &copy; sifunacodex2026 - Play Responsibly</p>
        </footer>
    </div>
  );
}
