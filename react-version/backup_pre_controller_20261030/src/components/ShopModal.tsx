import React, { useState } from 'react';
import { WeaponType, SwordPower, PlayerProgress } from '../types/game';
import { SWORD_POWERS, WEAPON_PRICES } from '../utils/combatConfig';
import { sound } from '../utils/audio';
import { ShoppingBag, X, Check, Lock, Coins, Sparkles, Sword, Crosshair, Zap } from 'lucide-react';

interface ShopModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updated: PlayerProgress) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'powers' | 'weapons'>('powers');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setPurchaseNotice(msg);
    setTimeout(() => setPurchaseNotice(null), 3000);
  };

  // Purchase Sword Power
  const handleBuyPower = (powerId: SwordPower, price: number) => {
    if (progress.coins < price) {
      sound.playMistake();
      showNotice('Insufficient coins! Defeat more enemies in Story Mode.');
      return;
    }
    if (progress.unlockedPowers.includes(powerId)) {
      showNotice('Power already unlocked!');
      return;
    }

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - price,
      unlockedPowers: [...progress.unlockedPowers, powerId],
    };
    sound.playCoin();
    sound.playVictory();
    onUpdateProgress(updated);
    showNotice(`Successfully unlocked ${powerId} Power!`);
  };

  // Purchase Weapon (Gun 10,000, Bow 20,000)
  const handleBuyWeapon = (weapon: WeaponType, price: number) => {
    if (progress.coins < price) {
      sound.playMistake();
      showNotice('Insufficient coins! Complete levels to earn more bounties.');
      return;
    }
    if (progress.unlockedWeapons.includes(weapon)) {
      showNotice('Weapon already purchased!');
      return;
    }

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - price,
      unlockedWeapons: [...progress.unlockedWeapons, weapon],
      equippedWeapon: weapon, // Auto-equip newly acquired weapon
    };
    sound.playCoin();
    sound.playVictory();
    onUpdateProgress(updated);
    showNotice(`Purchased and equipped ${weapon.toUpperCase()}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-slate-100">
                SHINOBI WEAPON SHOP
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Master ancient sword arts, futuristic firearms and lethal longbows.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold shadow-sm">
              <Coins className="w-4 h-4" />
              <span>{progress.coins.toLocaleString()} C</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('powers')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'powers'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sword className="w-4 h-4" />
            <span>SWORD POWERS (5)</span>
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'weapons'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>GUN & BOW WEAPONS</span>
          </button>
        </div>

        {/* Notice Alert */}
        {purchaseNotice && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono text-center animate-fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{purchaseNotice}</span>
          </div>
        )}

        {/* Tab 1: Sword Powers */}
        {activeTab === 'powers' && (
          <div className="space-y-3">
            {SWORD_POWERS.map((power) => {
              const isUnlocked = progress.unlockedPowers.includes(power.id);
              const canAfford = progress.coins >= (power.price || 0);

              return (
                <div
                  key={power.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-slate-950/40 border-slate-800'
                      : canAfford
                      ? 'bg-slate-900/80 border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex flex-col mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-cyan-300">
                        {power.command}
                      </span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="font-bold text-slate-200 text-sm">{power.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        {power.damage} DMG
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">{power.description}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                        <Check className="w-3.5 h-3.5" /> UNLOCKED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyPower(power.id as SwordPower, power.price || 0)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-md active:scale-95'
                            : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>UNLOCK · {power.price?.toLocaleString()} C</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Weapon Armory (Gun 10,000, Bow 20,000) */}
        {activeTab === 'weapons' && (
          <div className="space-y-4">
            {/* Gun Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg text-rose-400">
                      PLASMA REVOLVER (GUN)
                    </span>
                    <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 rounded">
                      HIGHEST DAMAGE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Equips 5 high-impact firearms powers: <strong>FIRE, TRIPLE, RAPID, LASER, STORM</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {progress.unlockedWeapons.includes('gun') ? (
                    <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> PURCHASED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyWeapon('gun', WEAPON_PRICES.gun)}
                      className="px-4 py-2 rounded-lg font-mono text-xs font-bold bg-rose-500 text-white hover:bg-rose-400 shadow-md transition-all active:scale-95"
                    >
                      BUY · 10,000 C
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-mono text-slate-400">
                <div>FIRE: 55 DMG</div>
                <div>TRIPLE: 120 DMG</div>
                <div>RAPID: 180 DMG</div>
                <div>LASER: 210 DMG</div>
                <div>STORM: 280 DMG</div>
              </div>
            </div>

            {/* Bow & Arrow Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg text-emerald-400">
                      ANCESTRAL GREATBOW
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                      PIERCING & AIR ATTACKS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Equips 5 acrobatic bow powers: <strong>ARROW, AIR, VOLLEY, PIERCE, GIANT</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {progress.unlockedWeapons.includes('bow') ? (
                    <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> PURCHASED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyWeapon('bow', WEAPON_PRICES.bow)}
                      className="px-4 py-2 rounded-lg font-mono text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 shadow-md transition-all active:scale-95"
                    >
                      BUY · 20,000 C
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-mono text-slate-400">
                <div>ARROW: 48 DMG</div>
                <div>AIR: 105 DMG</div>
                <div>VOLLEY: 140 DMG</div>
                <div>PIERCE: 160 DMG</div>
                <div>GIANT: 230 DMG</div>
              </div>
            </div>
          </div>
        )}

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
