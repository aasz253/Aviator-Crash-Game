import { useGame } from '../context/GameContext';

export default function Leaderboard() {
  const { currentBets, leaderboard } = useGame();

  const allPlayers = [...currentBets];

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-aviator-orange" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        Live Bets
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-2 px-2 font-medium">PLAYER</th>
              <th className="text-right py-2 px-2 font-medium">BET KES</th>
              <th className="text-right py-2 px-2 font-medium">WIN KES</th>
            </tr>
          </thead>
          <tbody>
            {allPlayers.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No bets placed yet
                </td>
              </tr>
            ) : (
              allPlayers.map((player, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-800 ${
                    player.status === 'cashed_out' ? 'bg-green-900/10' : ''
                  }`}
                >
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-aviator-purple flex items-center justify-center text-xs font-bold">
                        {player.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-300">{player.username}</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-2 text-gray-300">
                    {player.betAmount.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2">
                    {player.status === 'cashed_out' ? (
                      <span className="text-aviator-green font-bold">
                        {player.winAmount.toFixed(2)}
                      </span>
                    ) : player.status === 'crashed' ? (
                      <span className="text-aviator-accent">Lost</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {leaderboard.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Recent Cashouts</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Array.isArray(leaderboard)
              ? leaderboard.slice(-10).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{entry.player || entry.username}</span>
                    <span className="text-aviator-green font-bold">
                      +{entry.winAmount?.toFixed(2) || '0.00'} KES
                    </span>
                  </div>
                ))
              : null}
          </div>
        </div>
      )}
    </div>
  );
}
