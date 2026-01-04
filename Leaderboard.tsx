import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Leaderboard() {
  const leaderboard = useQuery(api.typing.getLeaderboard, {});

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h3 className="text-2xl font-bold text-white mb-6">🏆 Leaderboard</h3>
      
      {!leaderboard ? (
        <p className="text-gray-300">Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <p className="text-gray-300">No results yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry._id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                  : index === 1
                  ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
                  : index === 2
                  ? "bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-600/30"
                  : "bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${
                  index === 0 ? "text-yellow-400" :
                  index === 1 ? "text-gray-300" :
                  index === 2 ? "text-orange-400" :
                  "text-white"
                }`}>
                  #{index + 1}
                </span>
                <span className="text-white font-medium">
                  {entry.username}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-cyan-400 font-bold">
                  {entry.wpm} WPM
                </span>
                <span className="text-green-400">
                  {entry.accuracy}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
