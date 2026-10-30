import React from 'react';
import { WeaponType, StoryPhase, BossState, ElementalSkin } from '../types/game';
import { ELEMENTAL_SKIN_DATA } from '../utils/combatConfig';
import { Heart, Coins, Volume2, VolumeX, Menu, Settings2, Maximize, Crosshair } from 'lucide-react';

interface StoryHUDProps {
  level: number;
  phase: StoryPhase;
  playerHealth: number;
  playerMaxHealth: number;
  coins: number;
  equippedWeapon: WeaponType;
  equippedSkin: ElementalSkin;
  waveIndex: number;
  totalWaves: number;
  bossState: BossState | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReturnToMenu: () => void;
  onOpenSettings?: () => void;
  onToggleFullscreen?: () => void;
}

export const StoryHUD: React.FC<StoryHUDProps> = ({
  level,
  phase,
  playerHealth,
  playerMaxHealth,
  coins,
  equippedWeapon,
  equippedSkin,
  waveIndex,
  totalWaves,
  bossState,
  soundEnabled,
  onToggleSound,
  onReturnToMenu,
  onOpenSettings,
  onToggleFullscreen,
}) => {
  const healthPercent = Math.max(0, Math.min(100, (playerHealth / playerMaxHealth) * 100));
  const isLowHealth = healthPercent < 35;
  const skinInfo = ELEMENTAL_SKIN_DATA[equippedSkin];

  return (
    <div className="w-full flex flex-col gap-2 z-30 pointer-events-auto select-none">
      {/* Top Main Status Bar */}
      <div className="w-full flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#090e1a]/90 backdrop-blur-md border border-slate-800 shadow-xl">
        {/* Left: Player Health & Skin Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Heart
                className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${
                  isLowHealth ? 'text-rose-500 animate-bounce' : 'text-rose-400'
                }`}
              />
              <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-200">
                HP {Math.ceil(playerHealth)}/{playerMaxHealth}
              </span>
              {isLowHealth && (
                <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-1 rounded animate-pulse">
                  LOW
                </span>
              )}
            </div>
            {/* Health Bar */}
            <div className="w-28 sm:w-48 h-2 sm:h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  healthPercent > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : healthPercent > 25
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-800/80">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: skinInfo.color, boxShadow: `0 0 8px ${skinInfo.color}` }}
            />
            <span className="text-[11px] font-mono text-slate-400">{skinInfo.name}</span>
          </div>
        </div>

        {/* Center: Level & Phase Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 border border-slate-800 px-2 sm:px-3 py-1 rounded-lg">
            <span className="text-amber-400 font-bold">LVL {level}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">
              {phase === 'COMBAT' ? `Wave ${waveIndex}/${totalWaves}` : phase === 'BOSS' ? 'TITAN BATTLE' : 'ADVENTURE ASCENT'}
            </span>
          </div>
        </div>

        {/* Right: Coins, Weapon, Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded-lg font-mono text-xs font-bold text-amber-400">
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="tabular-nums">{coins.toLocaleString()}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg font-mono text-xs uppercase text-cyan-300">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>{equippedWeapon}</span>
          </div>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors"
              title="Settings & Controller"
            >
              <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <button
            onClick={onReturnToMenu}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors"
            title="Return to Menu"
          >
            <Menu className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Boss Health Bar Banner (Level 6) */}
      {bossState && phase === 'BOSS' && (
        <div className="w-full flex flex-col items-center px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="w-full flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-purple-300 font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              {bossState.name}
            </span>
            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
              <Heart className="w-3 h-3 text-rose-400 fill-rose-500" />
              WEAK POINT: GLOWING HEART
            </span>
            <span className="text-purple-300 font-bold tabular-nums">
              {Math.max(0, Math.ceil(bossState.health))} / {bossState.maxHealth}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-purple-500/50">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-400 rounded-full transition-all duration-150 shadow-[0_0_15px_rgba(244,63,94,0.8)]"
              style={{
                width: `${Math.max(0, Math.min(100, (bossState.health / bossState.maxHealth) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
