import React from 'react';
import { Racer, GameState } from '../types/game';
import { NinjaCharacter } from './NinjaCharacter';
import { Trophy, Flag } from 'lucide-react';

interface RaceTrackProps {
  racers: Racer[];
  gameState: GameState;
  countdown: number | null;
  level: number;
}

const BG_IMAGE_URL = new URL('../assets/images/ninja_race_background_1793389959267.jpg', import.meta.url).href;

export const RaceTrack: React.FC<RaceTrackProps> = ({
  racers,
  gameState,
  countdown,
  level,
}) => {
  // Find leader
  const sortedByDistance = [...racers].sort((a, b) => b.distance - a.distance);
  const leaderId = sortedByDistance[0]?.id;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: '1ST', bg: 'bg-amber-400 text-black border-amber-300' };
    if (rank === 2) return { label: '2ND', bg: 'bg-slate-300 text-black border-slate-200' };
    if (rank === 3) return { label: '3RD', bg: 'bg-amber-700 text-white border-amber-600' };
    return { label: '4TH', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-2xl">
      {/* Rooftop Nightscape Backdrop with Parallax Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none filter blur-[1px]"
        style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
      />
      
      {/* Top track ambiance header */}
      <div className="relative flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-950/70 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            Rooftop Speed Zone · Level {level}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
            TRACK DISTANCE: 1000m
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span>START: 0%</span>
          <span>·</span>
          <span>CHECKPOINT: 50%</span>
          <span>·</span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 inline" /> FINISH: 100%
          </span>
        </div>
      </div>

      {/* Track Lanes Container */}
      <div className="relative p-3 sm:p-4 space-y-2.5">
        {/* Subtle Vertical Distance Grid Lines */}
        <div className="absolute inset-y-0 left-[180px] sm:left-[210px] right-14 pointer-events-none flex justify-between opacity-15">
          <div className="h-full border-r border-dashed border-cyan-400" />
          <div className="h-full border-r border-dashed border-cyan-400" />
          <div className="h-full border-r border-dashed border-amber-400" />
          <div className="h-full border-r border-dashed border-cyan-400" />
        </div>

        {racers.map((racer) => {
          const rankInfo = getRankBadge(racer.rank);
          const isLeader = racer.id === leaderId && racer.distance > 0;
          const isHuman = racer.role === 'human';

          return (
            <div
              key={racer.id}
              className={`relative flex items-center h-16 sm:h-20 rounded-xl px-2.5 sm:px-4 transition-all duration-150 border ${
                isHuman
                  ? 'bg-slate-900/80 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              {/* Lane Info Box (Left) */}
              <div className="w-[150px] sm:w-[180px] shrink-0 flex items-center justify-between pr-3 border-r border-slate-800/80 z-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${rankInfo.bg}`}
                    >
                      {rankInfo.label}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-tight truncate max-w-[90px] sm:max-w-[110px] ${
                        isHuman ? 'text-cyan-300' : 'text-slate-200'
                      }`}
                    >
                      {racer.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {Math.round(racer.distance)}%
                    </span>
                    <span className="text-slate-600 text-[10px]">·</span>
                    <span className="text-[10px] font-mono text-cyan-400/90 tabular-nums">
                      {Math.round(racer.currentSpeed * 3.6)} km/h
                    </span>
                  </div>
                </div>

                {isHuman && (
                  <span className="text-[9px] font-mono bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 px-1.5 py-0.5 rounded">
                    YOU
                  </span>
                )}
              </div>

              {/* Running Field Area */}
              <div className="relative flex-1 h-full mx-2 sm:mx-4 flex items-center">
                {/* Horizontal Speed Runway Strip */}
                <div className="absolute inset-x-0 h-1 bg-slate-800/70 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-75"
                    style={{
                      width: `${racer.distance}%`,
                      backgroundColor: racer.color,
                      boxShadow: `0 0 10px ${racer.glowColor}`,
                    }}
                  />
                </div>

                {/* Animated Runner Container positioned by racer.distance */}
                <div
                  className="absolute transition-all ease-linear duration-75 -translate-y-0.5"
                  style={{
                    left: `calc(${racer.distance}% - ${racer.distance > 90 ? '48px' : '20px'})`,
                    maxWidth: 'calc(100% - 40px)',
                  }}
                >
                  <NinjaCharacter racer={racer} isLeader={isLeader} />
                </div>
              </div>

              {/* Checkered Finish Line Gate (Right) */}
              <div className="w-10 sm:w-12 shrink-0 h-full flex flex-col items-center justify-center border-l-2 border-amber-400/80 pl-2 relative">
                {/* Checkered pattern column */}
                <div className="w-3 h-full flex flex-col justify-between py-1 opacity-70">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-2 bg-gradient-to-r from-amber-300 to-amber-500 rounded-sm"
                    />
                  ))}
                </div>
                {racer.distance >= 100 && (
                  <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Countdown Overlay Display */}
      {gameState === 'COUNTDOWN' && countdown !== null && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-30 pointer-events-none">
          <div className="text-center animate-pulse">
            <span
              className={`font-display text-7xl sm:text-9xl font-extrabold tracking-widest ${
                countdown === 0
                  ? 'text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.9)]'
                  : 'text-amber-400 drop-shadow-[0_0_35px_rgba(251,191,36,0.9)]'
              }`}
            >
              {countdown === 0 ? 'GO!' : countdown}
            </span>
            <p className="mt-2 text-sm sm:text-base font-mono uppercase text-slate-300 tracking-widest">
              {countdown === 0 ? 'RACE IN PROGRESS' : 'GET READY TO TYPE!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
