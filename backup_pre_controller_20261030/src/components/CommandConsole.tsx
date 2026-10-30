import React from 'react';
import { WeaponType, MovementCommand, WeaponPower, PowerConfig } from '../types/game';
import { Lock, Sparkles, Shield, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, PackageOpen } from 'lucide-react';

interface CommandConsoleProps {
  typedBuffer: string;
  activeWeapon: WeaponType;
  availablePowers: PowerConfig[];
  unlockedPowers: string[];
  powerCooldowns: Record<string, number>; // remaining seconds
  onExecuteCommand: (cmd: string) => void;
  isBusy: boolean;
  canOpenChest: boolean;
  canClimb: boolean;
  temporaryWeaponTimeLeft: number | null;
}

const MOVEMENT_COMMANDS: { cmd: MovementCommand; label: string; icon: React.ReactNode }[] = [
  { cmd: 'LEFT', label: 'Move Left', icon: <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" /> },
  { cmd: 'RIGHT', label: 'Move Right', icon: <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> },
  { cmd: 'JUMP', label: 'Jump / Leap', icon: <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> },
  { cmd: 'CLIMB', label: 'Climb Ladder', icon: <Shield className="w-3.5 h-3.5 text-emerald-400" /> },
  { cmd: 'DOWN', label: 'Drop / Descend', icon: <ArrowDown className="w-3.5 h-3.5 text-slate-400" /> },
  { cmd: 'OPEN', label: 'Open Chest', icon: <PackageOpen className="w-3.5 h-3.5 text-purple-400" /> },
];

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  typedBuffer,
  activeWeapon,
  availablePowers,
  unlockedPowers,
  powerCooldowns,
  onExecuteCommand,
  isBusy,
  canOpenChest,
  canClimb,
  temporaryWeaponTimeLeft,
}) => {
  // Render command string with typed letters highlighted
  const renderCommandProgress = (cmd: string) => {
    const isPrefixMatch = typedBuffer.length > 0 && cmd.toUpperCase().startsWith(typedBuffer.toUpperCase());
    const matchedCount = isPrefixMatch ? typedBuffer.length : 0;

    return (
      <span className="font-mono font-bold tracking-wider text-xs">
        {cmd.split('').map((char, i) => {
          const isMatched = i < matchedCount;
          return (
            <span
              key={i}
              className={`transition-colors duration-75 ${
                isMatched
                  ? 'text-cyan-300 font-extrabold bg-cyan-950/80 px-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : 'text-slate-200'
              }`}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 z-20 pointer-events-auto">
      {/* LEFT CONSOLE: Movement & Interaction */}
      <div className="bg-[#090e1a]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs font-mono">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
            MOVEMENT CONSOLE
          </span>
          <span className="text-slate-500 text-[11px]">Type command or press key</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 gap-2">
          {MOVEMENT_COMMANDS.map(({ cmd, label, icon }) => {
            const isMatch = typedBuffer.length > 0 && cmd.startsWith(typedBuffer.toUpperCase());
            const isDisabled =
              (cmd === 'OPEN' && !canOpenChest) ||
              (cmd === 'CLIMB' && !canClimb) ||
              isBusy;

            return (
              <button
                key={cmd}
                onClick={() => !isDisabled && onExecuteCommand(cmd)}
                disabled={isDisabled}
                className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-lg border text-center transition-all ${
                  isMatch
                    ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-[1.02]'
                    : isDisabled
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-40 cursor-not-allowed'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {icon}
                  {renderCommandProgress(cmd)}
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-full">
                  {cmd === 'OPEN' && canOpenChest ? '⭐ CHEST READY' : label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT CONSOLE: Weapons & Powers */}
      <div className="bg-[#090e1a]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {activeWeapon.toUpperCase()} POWERS
            </span>
            {temporaryWeaponTimeLeft !== null && (
              <span className="text-[10px] font-bold text-purple-400 bg-purple-950/80 border border-purple-500/40 px-1.5 py-0.5 rounded animate-pulse">
                TEMP: {Math.ceil(temporaryWeaponTimeLeft)}s
              </span>
            )}
          </div>
          <span className="text-slate-500 text-[11px]">Type command to strike</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 gap-2">
          {availablePowers.map((power) => {
            const isUnlocked = activeWeapon !== 'sword' || unlockedPowers.includes(power.id);
            const remainingCooldown = powerCooldowns[power.id] || 0;
            const isOnCooldown = remainingCooldown > 0;
            const isMatch = typedBuffer.length > 0 && power.command.startsWith(typedBuffer.toUpperCase());
            const isDisabled = !isUnlocked || isOnCooldown || isBusy;

            return (
              <button
                key={power.id}
                onClick={() => !isDisabled && onExecuteCommand(power.command)}
                disabled={isDisabled}
                title={!isUnlocked ? `Unlock ${power.name} in Shop for ${power.price} coins` : power.description}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                  isMatch
                    ? 'border-amber-400 bg-amber-950/50 shadow-[0_0_12px_rgba(251,191,36,0.3)] scale-[1.02]'
                    : !isUnlocked
                    ? 'border-slate-800/80 bg-slate-950/60 opacity-60'
                    : isOnCooldown
                    ? 'border-slate-800 bg-slate-950/80 opacity-75'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                {/* Cooldown overlay progress */}
                {isOnCooldown && (
                  <div
                    className="absolute inset-0 bg-rose-950/40 rounded-lg pointer-events-none flex items-center justify-center"
                    style={{
                      borderBottom: `3px solid #f43f5e`,
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-rose-300">
                      {remainingCooldown.toFixed(1)}s
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 mb-0.5">
                  {!isUnlocked ? (
                    <Lock className="w-3 h-3 text-slate-500" />
                  ) : null}
                  {renderCommandProgress(power.command)}
                </div>

                <span className="text-[10px] text-slate-400 truncate max-w-full">
                  {!isUnlocked ? `${power.price}c` : `${power.damage} DMG`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
