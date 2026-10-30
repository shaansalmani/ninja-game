import React from 'react';
import { Racer, GameStats } from '../types/game';
import { Trophy, RotateCcw, ArrowRight, Menu, Zap, Target, Timer, Flame, CheckCircle, XCircle } from 'lucide-react';

interface GameOverModalProps {
  racers: Racer[];
  stats: GameStats;
  level: number;
  winner: Racer;
  onNextLevel: () => void;
  onRestartRace: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  racers,
  stats,
  level,
  winner,
  onNextLevel,
  onRestartRace,
  onReturnToMenu,
}) => {
  const isHumanWinner = winner.role === 'human';

  // Format race time mm:ss.s
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  // Sort racers by finish position/distance
  const sortedRacers = [...racers].sort((a, b) => {
    if (a.finishTime !== null && b.finishTime !== null) {
      return a.finishTime - b.finishTime;
    }
    if (a.finishTime !== null) return -1;
    if (b.finishTime !== null) return 1;
    return b.distance - a.distance;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        {/* Victory/Defeat Header */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
              isHumanWinner
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-amber-500/20'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-rose-500/20'
            }`}
          >
            {isHumanWinner ? (
              <Trophy className="w-8 h-8 animate-bounce" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
          </div>

          <h2
            className={`font-display text-3xl sm:text-4xl font-black tracking-tight ${
              isHumanWinner ? 'text-amber-300' : 'text-slate-100'
            }`}
          >
            {isHumanWinner ? 'VICTORY! SHINOBI MASTER' : 'DEFEATED! RIVAL CROSSED FIRST'}
          </h2>

          <p className="mt-1 text-sm text-slate-400 font-sans">
            {isHumanWinner
              ? `Outstanding agility! You claimed 1st place in Rooftop Race Level ${level}.`
              : `${winner.name} took the checkered ribbon. Sharpen your keystrokes and try again!`}
          </p>
        </div>

        {/* Podium Finishing Order Strip */}
        <div className="w-full my-6 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
            FINAL ROOFTOP STANDINGS:
          </span>
          <div className="space-y-2">
            {sortedRacers.map((racer, index) => {
              const place = index + 1;
              const isYou = racer.role === 'human';

              return (
                <div
                  key={racer.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border ${
                    isYou
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-bold w-6 h-6 rounded flex items-center justify-center text-[10px] ${
                        place === 1
                          ? 'bg-amber-400 text-black'
                          : place === 2
                          ? 'bg-slate-300 text-black'
                          : place === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {place}
                    </span>
                    <span className="font-bold">
                      {racer.name} {isYou && '(YOU)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      {racer.finishTime !== null
                        ? formatTime(racer.finishTime)
                        : `${Math.round(racer.distance)}% mark`}
                    </span>
                    {place === 1 && (
                      <span className="text-amber-400 font-bold text-[10px]">WINNER</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-6">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> FINAL WPM
            </span>
            <span className="text-xl font-bold text-cyan-400 mt-1 tabular-nums">
              {stats.wpm}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> ACCURACY
            </span>
            <span className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">
              {stats.accuracy}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> MAX STREAK
            </span>
            <span className="text-xl font-bold text-amber-400 mt-1 tabular-nums">
              {stats.maxStreak}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Timer className="w-3.5 h-3.5 text-purple-400" /> TIME
            </span>
            <span className="text-xl font-bold text-purple-400 mt-1 tabular-nums">
              {formatTime(stats.raceTime)}
            </span>
          </div>
        </div>

        {/* Detailed Character Metrics */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 py-1.5 border-t border-slate-800/80 mb-6">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Correct characters: <strong className="text-slate-200">{stats.correctChars}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Mistakes: <strong className="text-slate-200">{stats.incorrectChars}</strong>
          </span>
          <span>
            Words typed: <strong className="text-slate-200">{stats.completedWords}</strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {isHumanWinner ? (
            <button
              onClick={onNextLevel}
              className="flex-1 w-full py-3.5 px-6 rounded-xl font-display font-black text-sm tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-[0.98]"
            >
              <span>NEXT LEVEL ({level + 1})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRestartRace}
              className="flex-1 w-full py-3.5 px-6 rounded-xl font-display font-black text-sm tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          )}

          <button
            onClick={onRestartRace}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-mono text-xs font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-mono text-xs font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Menu className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
