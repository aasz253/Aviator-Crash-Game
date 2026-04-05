import { useGame } from '../context/GameContext';

export default function GameDisplay() {
  const { state, multiplier, roundNumber, countdown, crashPoint } = useGame();

  const getMultiplierClass = () => {
    switch (state) {
      case 'waiting':
        return 'multiplier-waiting';
      case 'in_progress':
        return 'multiplier-playing';
      case 'crashed':
        return 'multiplier-crashed';
      default:
        return 'multiplier-waiting';
    }
  };

  const getDisplayValue = () => {
    if (state === 'waiting') {
      return `${countdown > 0 ? countdown.toFixed(1) : '0.0'}s`;
    }
    if (state === 'crashed') {
      return `${crashPoint?.toFixed(2) || '1.00'}x`;
    }
    return `${multiplier.toFixed(2)}x`;
  };

  return (
    <div className="relative bg-aviator-darker rounded-2xl overflow-hidden border border-gray-800 aspect-video flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-aviator-darker via-transparent to-aviator-darker opacity-50" />

      {state === 'in_progress' && (
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00e701" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00e701" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 400 Q ${Math.min(multiplier * 50, 400)} ${400 - Math.min(multiplier * 30, 350)} ${Math.min(multiplier * 80, 800)} ${400 - Math.min(multiplier * 50, 380)}`}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
            />
            <path
              d={`M 0 400 Q ${Math.min(multiplier * 50, 400)} ${400 - Math.min(multiplier * 30, 350)} ${Math.min(multiplier * 80, 800)} ${400 - Math.min(multiplier * 50, 380)} L ${Math.min(multiplier * 80, 800)} 400 L 0 400 Z`}
              fill="url(#lineGradient)"
              opacity="0.1"
            />
          </svg>
        </div>
      )}

      <div className={`relative z-10 text-center ${state === 'in_progress' ? 'flying' : ''} ${state === 'crashed' ? 'crashed' : ''}`}>
        {state === 'waiting' && (
          <>
            <p className="text-gray-400 text-lg mb-2">Round #{roundNumber}</p>
            <p className="text-4xl font-bold text-white mb-4">
              {countdown > 0 ? `Starting in ${countdown.toFixed(1)}s` : 'Starting...'}
            </p>
            <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-aviator-orange transition-all duration-100"
                style={{ width: `${((8 - countdown) / 8) * 100}%` }}
              />
            </div>
          </>
        )}

        {(state === 'in_progress' || state === 'crashed') && (
          <div className={getMultiplierClass()}>
            <div className="multiplier-display">{getDisplayValue()}</div>
            {state === 'in_progress' && (
              <p className="text-gray-400 text-lg mt-2">Round #{roundNumber}</p>
            )}
            {state === 'crashed' && (
              <p className="text-aviator-accent text-2xl font-bold mt-4">FLEW AWAY!</p>
            )}
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 bg-aviator-card/80 backdrop-blur rounded-lg px-3 py-1">
        <span className="text-sm text-gray-300">Round: #{roundNumber}</span>
      </div>
    </div>
  );
}
