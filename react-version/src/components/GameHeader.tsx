import React from 'react';
import { GameStats, GameState } from '../types/game';
import { Volume2, VolumeX, HelpCircle, Settings2, RotateCcw, Timer, Menu } from 'lucide-react';

interface GameHeaderProps {
  stats: GameStats;
  level: number;
  gameState: GameState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onRestartRace: () => void;
  onReturnToMenu?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  stats,
  level,
  gameState,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenHowToPlay,
  onRestartRace,
  onReturnToMenu,
}) => {
  // Format race time mm:ss.s
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    if (rank === 2) return 'text-slate-300 bg-slate-900/60 border-slate-600/40';
    if (rank === 3) return 'text-amber-600 bg-amber-950/60 border-amber-700/40';
    return 'text-slate-400 bg-slate-900/60 border-slate-700/40';
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return '1ST';
    if (rank === 2) return '2ND';
    if (rank === 3) return '3RD';
    return '4TH';
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand title & Level */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-display font-black text-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            N
          </div>
          <span className="font-display font-black text-base sm:text-lg tracking-wider text-slate-100 whitespace-nowrap">
            NINJA <span className="text-cyan-400">RACE</span>
          </span>
        </div>
        <span className="text-slate-700">|</span>
        <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
          LVL {level}
        </span>
      </div>

      {/* Zone 2: Live Statistics Cluster (Clean, unboxed metadata with tabular numbers) */}
      <div className="hidden md:flex items-center gap-5 text-xs font-mono">
        {/* Live Position */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">POS:</span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded border text-[11px] ${getRankColor(
              stats.playerRank
            )}`}
          >
            {getRankSuffix(stats.playerRank)}
          </span>
        </div>

        <span className="text-slate-700">·</span>

        {/* Live WPM */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">WPM:</span>
          <span className="font-bold text-cyan-400 text-sm tabular-nums">
            {stats.wpm}
          </span>
        </div>

        <span className="text-slate-700">·</span>

        {/* Live Accuracy */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">ACC:</span>
          <span
            className={`font-bold tabular-nums ${
              stats.accuracy >= 95
                ? 'text-emerald-400'
                : stats.accuracy >= 85
                ? 'text-cyan-400'
                : 'text-amber-400'
            }`}
          >
            {stats.accuracy}%
          </span>
        </div>

        <span className="text-slate-700">·</span>

        {/* Words Completed */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">WORDS:</span>
          <span className="font-bold text-slate-200 tabular-nums">
            {stats.completedWords}
          </span>
        </div>

        <span className="text-slate-700">·</span>

        {/* Race Timer */}
        <div className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-200 tabular-nums">
            {formatTime(stats.raceTime)}
          </span>
        </div>
      </div>

      {/* Zone 3: Functional Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          className={`p-2 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
          }`}
          aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {gameState === 'RACING' && (
          <button
            onClick={onRestartRace}
            title="Restart Race"
            className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Restart Race"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenHowToPlay}
          title="How To Play"
          className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="How to play instructions"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Game Settings"
          className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {onReturnToMenu && (
          <button
            onClick={onReturnToMenu}
            title="Return to Main Menu"
            className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1 font-mono text-xs font-bold"
            aria-label="Return to Main Menu"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">MENU</span>
          </button>
        )}
      </div>
    </header>
  );
};
