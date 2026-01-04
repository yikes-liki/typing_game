import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ParticleBackground } from "./ParticleBackground";
import { GameStats } from "./GameStats";
import { Leaderboard } from "./Leaderboard";

interface GameState {
  text: string;
  currentIndex: number;
  startTime: number | null;
  endTime: number | null;
  mistakes: number;
  isActive: boolean;
  isFinished: boolean;
}

export function TypingGame() {
  const [gameState, setGameState] = useState<GameState>({
    text: "",
    currentIndex: 0,
    startTime: null,
    endTime: null,
    mistakes: 0,
    isActive: false,
    isFinished: false,
  });

  const [userInput, setUserInput] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [showStats, setShowStats] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const randomText = useQuery(api.typing.getRandomText, { difficulty });
  const saveResult = useMutation(api.typing.saveGameResult);
  const initTexts = useMutation(api.typing.initializeTexts);
  const userStats = useQuery(api.typing.getUserStats);

  useEffect(() => {
    initTexts();
  }, [initTexts]);

  const startGame = useCallback(() => {
    if (!randomText) return;
    
    setGameState({
      text: randomText.content,
      currentIndex: 0,
      startTime: Date.now(),
      endTime: null,
      mistakes: 0,
      isActive: true,
      isFinished: false,
    });
    setUserInput("");
    inputRef.current?.focus();
  }, [randomText]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentIndex: 0,
      startTime: null,
      endTime: null,
      mistakes: 0,
      isActive: false,
      isFinished: false,
    }));
    setUserInput("");
  }, []);

  const calculateWPM = useCallback(() => {
    if (!gameState.startTime || !gameState.endTime) return 0;
    const timeInMinutes = (gameState.endTime - gameState.startTime) / 60000;
    const wordsTyped = gameState.currentIndex / 5; 
    return Math.round(wordsTyped / timeInMinutes);
  }, [gameState]);

  const calculateAccuracy = useCallback(() => {
    if (gameState.currentIndex === 0) return 100;
    return Math.round(((gameState.currentIndex - gameState.mistakes) / gameState.currentIndex) * 100);
  }, [gameState]);

  useEffect(() => {
    if (gameState.isFinished && gameState.endTime && gameState.startTime) {
      const wpm = calculateWPM();
      const accuracy = calculateAccuracy();
      const timeSpent = (gameState.endTime - gameState.startTime) / 1000;

      saveResult({
        wpm,
        accuracy,
        timeSpent,
        textLength: gameState.text.length,
        mistakes: gameState.mistakes,
        gameMode: difficulty,
      });
    }
  }, [gameState.isFinished, gameState.endTime, gameState.startTime, calculateWPM, calculateAccuracy, saveResult, difficulty, gameState.text.length, gameState.mistakes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!gameState.isActive) return;

    const currentChar = gameState.text[gameState.currentIndex];
    const typedChar = value[value.length - 1];

    if (typedChar === currentChar) {
      const newIndex = gameState.currentIndex + 1;
      
      if (newIndex === gameState.text.length) {
        
        setGameState(prev => ({
          ...prev,
          currentIndex: newIndex,
          endTime: Date.now(),
          isActive: false,
          isFinished: true,
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          currentIndex: newIndex,
        }));
      }
      
      setUserInput(value);
    } else if (typedChar !== undefined) {
    
      setGameState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
      }));
    }
  };

  const renderText = () => {
    if (!gameState.text) return null;

    return (
      <div className="text-2xl leading-relaxed font-mono bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
        {gameState.text.split('').map((char, index) => {
          let className = "transition-all duration-150 ";
          
          if (index < gameState.currentIndex) {
            className += "text-green-400 bg-green-400/20 rounded";
          } else if (index === gameState.currentIndex) {
            className += "text-white bg-blue-500/50 rounded animate-pulse";
          } else {
            className += "text-gray-300";
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  const currentWPM = gameState.startTime && gameState.isActive 
    ? Math.round(((gameState.currentIndex / 5) / ((Date.now() - gameState.startTime) / 60000)) || 0)
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            TypeRush
          </h1>
          <p className="text-xl text-gray-300">Test your typing speed with style</p>
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white"
            disabled={gameState.isActive}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <button
            onClick={startGame}
            disabled={gameState.isActive || !randomText}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {gameState.isActive ? "Game Active" : "Start Game"}
          </button>
          
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
          >
            Reset
          </button>

          <button
            onClick={() => setShowStats(!showStats)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
        </div>

        {/* Live Stats */}
        {gameState.isActive && (
          <div className="flex justify-center gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-cyan-400">{currentWPM}</div>
              <div className="text-sm text-gray-300">WPM</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-green-400">{calculateAccuracy()}%</div>
              <div className="text-sm text-gray-300">Accuracy</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-red-400">{gameState.mistakes}</div>
              <div className="text-sm text-gray-300">Mistakes</div>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="max-w-4xl mx-auto mb-8">
          {renderText()}
          
          {gameState.isActive && (
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="w-full mt-6 px-6 py-4 text-xl bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Start typing here..."
              autoFocus
            />
          )}
        </div>

        {/* Results */}
        {gameState.isFinished && (
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Game Complete! 🎉</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">{calculateWPM()}</div>
                <div className="text-gray-300">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">{calculateAccuracy()}%</div>
                <div className="text-gray-300">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">{gameState.mistakes}</div>
                <div className="text-gray-300">Mistakes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">
                  {gameState.endTime && gameState.startTime 
                    ? Math.round((gameState.endTime - gameState.startTime) / 1000)
                    : 0}s
                </div>
                <div className="text-gray-300">Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats and Leaderboard */}
        {showStats && (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <GameStats stats={userStats} />
            <Leaderboard />
          </div>
        )}
      </div>
    </div>
  );
}
