import React from 'react';
import { GameState } from '../types/game';
import { Zap, Flame, Wind, Gauge, Flag, Sparkles } from 'lucide-react';

interface RaceControlDashboardProps {
  speed: number;
  streak: number;
  turboReady: boolean;
  gameState: GameState;
  cadence: number;
  rank: number;
  onTurboTap: () => void;
}

export const RaceControlDashboard: React.FC<RaceControlDashboardProps> = ({
  speed,
  streak,
  turboReady,
  gameState,
  cadence,
  rank,
  onTurboTap,
}) => {
  const speedKmh = Math.round(speed * 3.6);
  const isRacing = gameState === 'RACING';

  return (
    <div className="w-full rounded-2xl p-4 sm:p-5 border border-slate-800 bg-[#090e1a]/90 backdrop-blur-md shadow-xl flex flex-col gap-3">
      {/* Top telemetry strip */}
      <div className="w-full flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wider">MOMENTUM:</span>
          {streak > 0 ? (
            <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded-full">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              {streak}x HYPER RUNNER
            </span>
          ) : (
            <span className="text-slate-500">ACCELERATING</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            SPEED:{' '}
            <strong className="text-cyan-400 font-bold tabular-nums text-sm">
              {speedKmh} KM/H
            </strong>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">
            CADENCE:{' '}
            <strong className="text-emerald-400 font-bold tabular-nums">
              {cadence} RPM
            </strong>
          </span>
        </div>
      </div>

      {/* Speedometer Bar & Control Hints */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1 sm:w-56">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="text-slate-400">VELOCITY RATIO</span>
              <span className="text-cyan-300 font-bold">{Math.min(100, Math.round((speed / 8.5) * 100))}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                style={{ width: `${Math.min(100, (speed / 8.5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action button instructions */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
            <kbd className="text-cyan-300 font-bold">JOYSTICK RIGHT</kbd>
            <span className="text-slate-400">or</span>
            <kbd className="text-cyan-300 font-bold">D</kbd>
            <span className="text-slate-500">: SPRINT</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
            <kbd className="text-emerald-300 font-bold">JUMP</kbd>
            <span className="text-slate-400">or</span>
            <kbd className="text-emerald-300 font-bold">SPACE</kbd>
            <span className="text-slate-500">: LEAP</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
            <kbd className="text-amber-300 font-bold">DASH</kbd>
            <span className="text-slate-400">or</span>
            <kbd className="text-amber-300 font-bold">L</kbd>
            <span className="text-slate-500">: TURBO BOOST</span>
          </div>
        </div>
      </div>
    </div>
  );
};
