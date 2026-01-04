interface GameStatsProps {
  stats: {
    gamesPlayed: number;
    averageWpm: number;
    bestWpm: number;
    averageAccuracy: number;
    bestAccuracy: number;
    recentResults: Array<{
      wpm: number;
      accuracy: number;
      _creationTime: number;
    }>;
  } | null | undefined;
}

export function GameStats({ stats }: GameStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-4">Your Stats</h3>
        <p className="text-gray-300">Loading stats...</p>
      </div>
    );
  }

  if (stats.gamesPlayed === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-4">Your Stats</h3>
        <p className="text-gray-300">Play a game to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h3 className="text-2xl font-bold text-white mb-6">Your Stats</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{stats.averageWpm}</div>
          <div className="text-sm text-gray-300">Avg WPM</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{stats.bestWpm}</div>
          <div className="text-sm text-gray-300">Best WPM</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400">{stats.averageAccuracy}%</div>
          <div className="text-sm text-gray-300">Avg Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">{stats.gamesPlayed}</div>
          <div className="text-sm text-gray-300">Games Played</div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Recent Games</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {stats.recentResults.map((result, index) => (
            <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-2">
              <span className="text-cyan-400 font-semibold">{result.wpm} WPM</span>
              <span className="text-green-400">{result.accuracy}%</span>
              <span className="text-gray-400 text-sm">
                {new Date(result._creationTime).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
