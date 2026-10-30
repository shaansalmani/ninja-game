import React, { useRef, useEffect } from 'react';
import { GameState } from '../types/game';
import { Zap, Flame, AlertCircle, Sparkles } from 'lucide-react';

interface TypingAreaProps {
  currentWord: string;
  nextWords: string[];
  typedInput: string;
  isError: boolean;
  gameState: GameState;
  currentStreak: number;
  instantCpm: number;
  onCharacterInput: (char: string) => void;
  onBackspace: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  currentWord,
  nextWords,
  typedInput,
  isError,
  gameState,
  currentStreak,
  instantCpm,
  onCharacterInput,
  onBackspace,
}) => {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus during RACING or COUNTDOWN state
  useEffect(() => {
    if (gameState === 'RACING' || gameState === 'COUNTDOWN') {
      hiddenInputRef.current?.focus();
    }
  }, [gameState]);

  // Keep input focused when clicking anywhere in the typing container
  const handleContainerClick = () => {
    hiddenInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameState !== 'RACING') {
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace();
      return;
    }

    // Ignore non-character keys (e.g. Shift, Ctrl, Alt, CapsLock, Tab, Arrow keys)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onCharacterInput(e.key);
    }
  };

  const isRacing = gameState === 'RACING';

  return (
    <div
      onClick={handleContainerClick}
      className={`relative w-full rounded-2xl p-5 sm:p-6 transition-all border ${
        isError
          ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.2)] animate-shake'
          : currentStreak >= 5
          ? 'bg-slate-900/90 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
          : 'bg-slate-900/70 border-slate-800 shadow-xl'
      }`}
    >
      {/* Hidden real input element to capture native keyboard and mobile touch keyboard */}
      <input
        ref={hiddenInputRef}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        disabled={gameState !== 'RACING' && gameState !== 'COUNTDOWN'}
        className="opacity-0 absolute -top-10 left-0 w-1 h-1 pointer-events-none"
        onKeyDown={handleKeyDown}
        aria-label="Ninja Typing Input"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Top Momentum & Feedback Strip */}
        <div className="w-full flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider">MOMENTUM:</span>
            {currentStreak > 0 ? (
              <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                {currentStreak}x STREAK
              </span>
            ) : (
              <span className="text-slate-500">BUILDING SPEED</span>
            )}
            {currentStreak >= 5 && (
              <span className="hidden sm:flex items-center gap-1 font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-400/40 px-2 py-0.5 rounded-full animate-bounce text-[11px]">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                HYPER RUNNER
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              CADENCE:{' '}
              <span className="text-cyan-400 font-bold tabular-nums">
                {instantCpm} CPM
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              BOOST:{' '}
              <span
                className={`font-bold tabular-nums ${
                  currentStreak >= 3 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                +{Math.min(50, currentStreak * 8)}%
              </span>
            </span>
          </div>
        </div>

        {/* Primary Interactive Word Display */}
        <div className="py-2 sm:py-4 px-6 flex items-center justify-center">
          <div className="flex items-center tracking-widest text-3xl sm:text-5xl md:text-6xl font-mono font-extrabold select-none">
            {currentWord.split('').map((char, index) => {
              const isTyped = index < typedInput.length;
              const isCurrent = index === typedInput.length;
              const hasMistake = isTyped && typedInput[index].toUpperCase() !== char;

              let charColor = 'text-slate-400';
              let charBg = 'transparent';

              if (hasMistake) {
                charColor = 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
                charBg = 'bg-rose-500/20';
              } else if (isTyped) {
                charColor = 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]';
              } else if (isCurrent) {
                charColor = 'text-white underline decoration-cyan-400 decoration-4 underline-offset-8';
              }

              return (
                <span
                  key={index}
                  className={`inline-block px-1 sm:px-1.5 py-0.5 rounded transition-colors duration-75 ${charColor} ${charBg}`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Error Feedback Alert Banner */}
        {isError && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-950/60 border border-rose-500/40 px-3 py-1 rounded-md">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>MISTAKE PENALTY: Speed slowed down! Type correctly to recover.</span>
          </div>
        )}

        {/* Upcoming Words Queue Preview */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono text-slate-500 border-t border-slate-800/80 pt-3">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">
            NEXT WORDS:
          </span>
          {nextWords.slice(0, 4).map((word, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800/80 ${
                idx === 0 ? 'text-slate-300 font-semibold border-slate-700' : 'text-slate-500'
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Helpful Keyboard Indicator */}
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {isRacing
              ? 'Click anywhere to focus keyboard · Case-insensitive input'
              : gameState === 'COUNTDOWN'
              ? 'Prepare your fingers on the home row...'
              : 'Race completed'}
          </span>
        </div>
      </div>
    </div>
  );
};
