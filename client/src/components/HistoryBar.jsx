import { useGame } from '../context/GameContext';

export default function HistoryBar() {
  const { history, crashPoint, state } = useGame();

  const displayHistory = [];
  if (state === 'crashed' && crashPoint) {
    displayHistory.unshift(crashPoint);
  }
  displayHistory.push(...history.slice(0, 19));

  if (displayHistory.length === 0) {
    return (
      <div className="bg-aviator-card border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-gray-500 text-sm">Waiting for game history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-aviator-card border-b border-gray-800 px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {displayHistory.map((value, index) => {
          let pillClass = 'history-pill ';
          if (value >= 10) pillClass += 'history-pill-high';
          else if (value >= 2) pillClass += 'history-pill-medium';
          else pillClass += 'history-pill-low';

          return (
            <span key={index} className={pillClass}>
              {value.toFixed(2)}x
            </span>
          );
        })}
      </div>
    </div>
  );
}
