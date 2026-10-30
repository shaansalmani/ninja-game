import React, { useState } from 'react';
import {
  WeaponType,
  GunSkinId,
  OutfitId,
  CharacterModelId,
  PlayerProgress,
} from '../types/game';
import {
  GUN_SKIN_DATA,
  OUTFIT_DATA,
  CHARACTER_DATA,
  WEAPON_PRICES,
} from '../utils/combatConfig';
import { sound } from '../utils/audio';
import {
  ShoppingBag,
  X,
  Check,
  Coins,
  Sparkles,
  Crosshair,
  Shirt,
  User,
  Target,
} from 'lucide-react';

interface ShopModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updated: PlayerProgress) => void;
  onClose: () => void;
}

type ShopTab = 'gun_skins' | 'outfits' | 'characters' | 'weapons';

export const ShopModal: React.FC<ShopModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('gun_skins');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setPurchaseNotice(msg);
    setTimeout(() => setPurchaseNotice(null), 3000);
  };

  const handleBuyGunSkin = (skinId: GunSkinId, price: number) => {
    if (progress.coins < price) {
      sound.playMistake();
      showNotice('Insufficient coins! Win races or defeat enemies in Story Mode.');
      return;
    }
    if (progress.unlockedGunSkins?.includes(skinId)) {
      showNotice('Gun skin already owned!');
      return;
    }

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - price,
      unlockedGunSkins: [...(progress.unlockedGunSkins || ['plasma_cyan']), skinId],
      equippedGunSkin: skinId, // Auto-equip newly bought skin
    };
    sound.playCoin();
    sound.playVictory();
    onUpdateProgress(updated);
    showNotice(`Unlocked & equipped ${GUN_SKIN_DATA[skinId].name}!`);
  };

  const handleBuyOutfit = (outfitId: OutfitId, price: number) => {
    if (progress.coins < price) {
      sound.playMistake();
      showNotice('Insufficient coins! Earn bounties in Story Mode.');
      return;
    }
    if (progress.unlockedOutfits?.includes(outfitId)) {
      showNotice('Outfit already owned!');
      return;
    }

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - price,
      unlockedOutfits: [...(progress.unlockedOutfits || ['tactical_stealth']), outfitId],
      equippedOutfit: outfitId,
    };
    sound.playCoin();
    sound.playVictory();
    onUpdateProgress(updated);
    showNotice(`Unlocked & equipped ${OUTFIT_DATA[outfitId].name}!`);
  };

  const handleBuyCharacter = (charId: CharacterModelId, price: number) => {
    if (progress.coins < price) {
      sound.playMistake();
      showNotice('Insufficient coins! Complete more levels.');
      return;
    }
    if (progress.unlockedCharacters?.includes(charId)) {
      showNotice('Character hero already recruited!');
      return;
    }

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - price,
      unlockedCharacters: [...(progress.unlockedCharacters || ['myraa_hunter']), charId],
      characterModel: charId,
    };
    sound.playCoin();
    sound.playVictory();
    onUpdateProgress(updated);
    showNotice(`Recruited ${CHARACTER_DATA[charId].name}!`);
  };

  const handleBuyWeapon = (weapon: WeaponType, price: number) => {
    if (progress.coins < price) {
      sound.playMistake();
      showNotice('Insufficient coins! Conquer Story levels to earn bounties.');
      return;
    }
    if (progress.unlockedWeapons?.includes(weapon)) {
      showNotice('Weapon already purchased!');
      return;
    }

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - price,
      unlockedWeapons: [...(progress.unlockedWeapons || ['gun']), weapon],
      equippedWeapon: weapon,
    };
    sound.playCoin();
    sound.playVictory();
    onUpdateProgress(updated);
    showNotice(`Purchased and equipped ${weapon.toUpperCase()}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-slate-100">
                ARMORY SHOP
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Acquire high-tech firearm skins, ballistic armor, and specialized heroes.
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

        {/* Notice Banner */}
        {purchaseNotice && (
          <div className="mb-3 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{purchaseNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('gun_skins')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'gun_skins'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>GUN SKINS</span>
          </button>

          <button
            onClick={() => setActiveTab('outfits')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'outfits'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>OUTFITS</span>
          </button>

          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'characters'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>HEROES</span>
          </button>

          <button
            onClick={() => setActiveTab('weapons')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'weapons'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>WEAPONS</span>
          </button>
        </div>

        {/* TAB 1: GUN SKINS */}
        {activeTab === 'gun_skins' && (
          <div className="space-y-3">
            {(['crimson_fury', 'neon_emerald', 'golden_viper', 'void_purple'] as GunSkinId[]).map((id) => {
              const g = GUN_SKIN_DATA[id];
              const isUnlocked = progress.unlockedGunSkins?.includes(id);
              const canAfford = progress.coins >= g.price;

              return (
                <div
                  key={id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: g.color, boxShadow: `0 0 10px ${g.color}` }}
                    />
                    <div>
                      <span className="font-mono text-sm font-bold block" style={{ color: g.color }}>
                        {g.name}
                      </span>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">{g.desc}</p>
                    </div>
                  </div>

                  <button
                    disabled={isUnlocked || !canAfford}
                    onClick={() => handleBuyGunSkin(id, g.price)}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shrink-0 ${
                      isUnlocked
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 cursor-default'
                        : canAfford
                        ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-md'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? 'OWNED' : `${g.price} C`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: OUTFITS */}
        {activeTab === 'outfits' && (
          <div className="space-y-3">
            {(['cyber_spec_ops', 'crimson_ronin', 'shadow_wraith', 'golden_warlord'] as OutfitId[]).map((id) => {
              const o = OUTFIT_DATA[id];
              const isUnlocked = progress.unlockedOutfits?.includes(id);
              const canAfford = progress.coins >= o.price;

              return (
                <div
                  key={id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black"
                        style={{ backgroundColor: o.primaryColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: o.accentColor }}
                      />
                    </div>
                    <div>
                      <span className="font-mono text-sm font-bold text-slate-100 block">
                        {o.name}
                      </span>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">{o.desc}</p>
                    </div>
                  </div>

                  <button
                    disabled={isUnlocked || !canAfford}
                    onClick={() => handleBuyOutfit(id, o.price)}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shrink-0 ${
                      isUnlocked
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 cursor-default'
                        : canAfford
                        ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-md'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? 'OWNED' : `${o.price} C`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="space-y-3">
            {(['shadow_commando', 'kunoichi_sniper'] as CharacterModelId[]).map((id) => {
              const c = CHARACTER_DATA[id];
              const isUnlocked = progress.unlockedCharacters?.includes(id);
              const canAfford = progress.coins >= c.price;

              return (
                <div
                  key={id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block">
                      {c.title}
                    </span>
                    <span className="font-display font-black text-sm text-slate-100 block">
                      {c.name}
                    </span>
                    <p className="text-xs text-slate-400 font-sans mt-1">{c.desc}</p>
                  </div>

                  <button
                    disabled={isUnlocked || !canAfford}
                    onClick={() => handleBuyCharacter(id, c.price)}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shrink-0 ${
                      isUnlocked
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 cursor-default'
                        : canAfford
                        ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-md'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? 'RECRUITED' : `${c.price} C`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: WEAPONS */}
        {activeTab === 'weapons' && (
          <div className="space-y-3">
            {/* Bow */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-display font-black text-sm text-emerald-300 block">
                    ANCESTRAL GREATBOW
                  </span>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Long-range piercing weapon equipped with Swift Arrow, Volley, and Giant Shockwaves.
                  </p>
                </div>
              </div>

              <button
                disabled={progress.unlockedWeapons?.includes('bow') || progress.coins < WEAPON_PRICES.bow}
                onClick={() => handleBuyWeapon('bow', WEAPON_PRICES.bow)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shrink-0 ${
                  progress.unlockedWeapons?.includes('bow')
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 cursor-default'
                    : progress.coins >= WEAPON_PRICES.bow
                    ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-md'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                {progress.unlockedWeapons?.includes('bow') ? 'OWNED' : `${WEAPON_PRICES.bow} C`}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-mono text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
