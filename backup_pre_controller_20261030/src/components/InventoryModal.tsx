import React from 'react';
import { WeaponType, ElementalSkin, PlayerProgress } from '../types/game';
import { ELEMENTAL_SKIN_DATA, SWORD_POWERS, GUN_POWERS, BOW_POWERS } from '../utils/combatConfig';
import { sound } from '../utils/audio';
import { Shield, X, Check, Sword, Crosshair, Sparkles, Clock, Lock } from 'lucide-react';

interface InventoryModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updated: PlayerProgress) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const skins: ElementalSkin[] = ['lightning', 'fire', 'water', 'diamond', 'rock'];

  const handleEquipWeapon = (w: WeaponType) => {
    sound.playKeyPress();
    const updated: PlayerProgress = {
      ...progress,
      equippedWeapon: w,
    };
    onUpdateProgress(updated);
  };

  const handleEquipSkin = (s: ElementalSkin) => {
    sound.playKeyPress();
    const updated: PlayerProgress = {
      ...progress,
      equippedSkin: s,
    };
    onUpdateProgress(updated);
  };

  // Remaining temporary weapon duration
  const tempSecondsLeft = progress.temporaryWeaponExpiresAt
    ? Math.max(0, (progress.temporaryWeaponExpiresAt - Date.now()) / 1000)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-slate-100">
                INVENTORY & SKINS
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Equip your active arsenal and elemental shinobi affinity.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Temporary Chest Weapon Notice */}
        {progress.temporaryWeapon && tempSecondsLeft > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-purple-950/70 border border-purple-500/50 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-purple-300">
              <Clock className="w-4 h-4 animate-spin" />
              <span>
                TEMPORARY CHEST WEAPON:{' '}
                <strong className="text-amber-400 uppercase">{progress.temporaryWeapon}</strong>
              </span>
            </div>
            <span className="font-bold text-amber-300 tabular-nums">
              {Math.ceil(tempSecondsLeft)}s REMAINING
            </span>
          </div>
        )}

        {/* Section 1: Elemental Ninja Skins */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              FIVE ELEMENTAL SKINS
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Active: {ELEMENTAL_SKIN_DATA[progress.equippedSkin].name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {skins.map((skinKey) => {
              const info = ELEMENTAL_SKIN_DATA[skinKey];
              const isEquipped = progress.equippedSkin === skinKey;

              return (
                <button
                  key={skinKey}
                  onClick={() => handleEquipSkin(skinKey)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: info.color, boxShadow: `0 0 10px ${info.glow}` }}
                    />
                    {isEquipped && (
                      <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950 px-1 rounded">
                        EQUIPPED
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-xs text-slate-200 capitalize">{skinKey}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-sans">
                    {info.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Weapons Arsenal */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sword className="w-3.5 h-3.5 text-amber-400" />
              EQUIPPED WEAPON
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sword */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                progress.equippedWeapon === 'sword'
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-cyan-300">SHINOBI SWORD</span>
                  {progress.equippedWeapon === 'sword' && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Default weapon with 5 elemental martial powers.
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  Unlocked: {progress.unlockedPowers.join(', ')}
                </div>
              </div>

              <button
                onClick={() => handleEquipWeapon('sword')}
                disabled={progress.equippedWeapon === 'sword'}
                className={`mt-3 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition-all ${
                  progress.equippedWeapon === 'sword'
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                {progress.equippedWeapon === 'sword' ? 'EQUIPPED' : 'EQUIP SWORD'}
              </button>
            </div>

            {/* Gun */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                progress.equippedWeapon === 'gun'
                  ? 'border-rose-400 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-rose-300">PLASMA REVOLVER</span>
                  {progress.equippedWeapon === 'gun' && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Pistol, Triple, Rapid, Laser, and Storm firing.
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  {progress.unlockedWeapons.includes('gun') ? 'Status: Owned' : 'Status: Locked in Shop (10,000c)'}
                </div>
              </div>

              {progress.unlockedWeapons.includes('gun') ? (
                <button
                  onClick={() => handleEquipWeapon('gun')}
                  disabled={progress.equippedWeapon === 'gun'}
                  className={`mt-3 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition-all ${
                    progress.equippedWeapon === 'gun'
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-rose-500 text-white hover:bg-rose-400'
                  }`}
                >
                  {progress.equippedWeapon === 'gun' ? 'EQUIPPED' : 'EQUIP GUN'}
                </button>
              ) : (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              )}
            </div>

            {/* Bow */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                progress.equippedWeapon === 'bow'
                  ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-300">ANCESTRAL BOW</span>
                  {progress.equippedWeapon === 'bow' && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Air shot, Piercing beam, Volley and Giant arrows.
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  {progress.unlockedWeapons.includes('bow') ? 'Status: Owned' : 'Status: Locked in Shop (20,000c)'}
                </div>
              </div>

              {progress.unlockedWeapons.includes('bow') ? (
                <button
                  onClick={() => handleEquipWeapon('bow')}
                  disabled={progress.equippedWeapon === 'bow'}
                  className={`mt-3 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition-all ${
                    progress.equippedWeapon === 'bow'
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400'
                  }`}
                >
                  {progress.equippedWeapon === 'bow' ? 'EQUIPPED' : 'EQUIP BOW'}
                </button>
              ) : (
                <div className="mt-3 flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            RETURN TO GAME
          </button>
        </div>
      </div>
    </div>
  );
};
