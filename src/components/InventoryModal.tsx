import React, { useState } from 'react';
import {
  WeaponType,
  ElementalSkin,
  GunSkinId,
  OutfitId,
  CharacterModelId,
  PlayerProgress,
} from '../types/game';
import {
  ELEMENTAL_SKIN_DATA,
  GUN_SKIN_DATA,
  OUTFIT_DATA,
  CHARACTER_DATA,
  GUN_POWERS,
  BOW_POWERS,
} from '../utils/combatConfig';
import { sound } from '../utils/audio';
import { CharacterPreview } from './CharacterPreview';
import {
  Shield,
  X,
  Check,
  Crosshair,
  Sparkles,
  Clock,
  User,
  Palette,
  Shirt,
  Target,
  PackageCheck,
  Zap,
} from 'lucide-react';

interface InventoryModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updated: PlayerProgress) => void;
  onClose: () => void;
}

type TabType = 'characters' | 'outfits' | 'gun_skins' | 'colors' | 'weapons' | 'purchased';

export const InventoryModal: React.FC<InventoryModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gun_skins');

  const elementalSkins: ElementalSkin[] = ['lightning', 'fire', 'water', 'diamond', 'rock'];
  const gunSkins: GunSkinId[] = ['plasma_cyan', 'crimson_fury', 'neon_emerald', 'golden_viper', 'void_purple'];
  const outfits: OutfitId[] = ['tactical_stealth', 'cyber_spec_ops', 'crimson_ronin', 'shadow_wraith', 'golden_warlord'];
  const characterModels: CharacterModelId[] = ['myraa_hunter', 'shadow_commando', 'kunoichi_sniper'];

  // Temporary weapon countdown
  const tempSecondsLeft = progress.temporaryWeaponExpiresAt
    ? Math.max(0, (progress.temporaryWeaponExpiresAt - Date.now()) / 1000)
    : 0;

  // Handlers for instant equipping & live preview
  const handleEquipGunSkin = (skinId: GunSkinId) => {
    sound.playKeyPress();
    const isUnlocked = progress.unlockedGunSkins?.includes(skinId) || skinId === 'plasma_cyan';
    if (!isUnlocked) return;
    const updated: PlayerProgress = {
      ...progress,
      equippedGunSkin: skinId,
    };
    onUpdateProgress(updated);
  };

  const handleEquipOutfit = (outfitId: OutfitId) => {
    sound.playKeyPress();
    const isUnlocked = progress.unlockedOutfits?.includes(outfitId) || outfitId === 'tactical_stealth';
    if (!isUnlocked) return;
    const updated: PlayerProgress = {
      ...progress,
      equippedOutfit: outfitId,
    };
    onUpdateProgress(updated);
  };

  const handleEquipElementalSkin = (skin: ElementalSkin) => {
    sound.playKeyPress();
    const isUnlocked = progress.unlockedSkins?.includes(skin) || skin === 'lightning';
    if (!isUnlocked) return;
    const updated: PlayerProgress = {
      ...progress,
      equippedSkin: skin,
    };
    onUpdateProgress(updated);
  };

  const handleEquipCharacter = (charId: CharacterModelId) => {
    sound.playKeyPress();
    const isUnlocked = progress.unlockedCharacters?.includes(charId) || charId === 'myraa_hunter';
    if (!isUnlocked) return;
    const updated: PlayerProgress = {
      ...progress,
      characterModel: charId,
    };
    onUpdateProgress(updated);
  };

  const handleEquipWeapon = (w: WeaponType) => {
    sound.playKeyPress();
    const isUnlocked = progress.unlockedWeapons?.includes(w) || w === 'gun';
    if (!isUnlocked) return;
    const updated: PlayerProgress = {
      ...progress,
      equippedWeapon: w,
    };
    onUpdateProgress(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#090e1a] border border-slate-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-100 tracking-wider">
                ARMORY & CUSTOMIZATION
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Real-time character loadout: changes apply instantly to gameplay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 font-mono text-xs font-bold text-amber-400">
              <span>{progress.coins.toLocaleString()} COINS</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary Weapon Alert */}
        {progress.temporaryWeapon && tempSecondsLeft > 0 && (
          <div className="px-5 py-2 bg-purple-950/50 border-b border-purple-500/40 flex items-center justify-between text-xs font-mono shrink-0">
            <div className="flex items-center gap-2 text-purple-300">
              <Clock className="w-4 h-4 animate-spin" />
              <span>
                ACTIVE CHEST WEAPON:{' '}
                <strong className="text-amber-400 uppercase">{progress.temporaryWeapon}</strong>
              </span>
            </div>
            <span className="font-bold text-amber-300 tabular-nums">
              {Math.ceil(tempSecondsLeft)}s LEFT
            </span>
          </div>
        )}

        {/* MAIN BODY: 2-COLUMN SPLIT (LEFT: Character Preview | RIGHT: Categorized Inventory) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          {/* ==================================================== */}
          {/* LEFT COLUMN: LIVE ANIMATED CHARACTER PREVIEW (5 COLS) */}
          {/* ==================================================== */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#050811] to-[#04060c] border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col items-center justify-between overflow-y-auto">
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
              <span className="uppercase font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> LIVE COMBAT STANCE
              </span>
              <span className="text-slate-500">GUN ARMED</span>
            </div>

            {/* Character Preview Viewport */}
            <div className="w-full flex-1 flex items-center justify-center my-auto py-2">
              <CharacterPreview
                skin={progress.equippedSkin || 'lightning'}
                gunSkin={progress.equippedGunSkin || 'plasma_cyan'}
                outfit={progress.equippedOutfit || 'tactical_stealth'}
                characterModel={progress.characterModel || 'myraa_hunter'}
                width={280}
                height={380}
                interactive={true}
              />
            </div>

            {/* Loadout Summary Pill */}
            <div className="w-full grid grid-cols-3 gap-1.5 pt-2 text-[10px] font-mono text-center">
              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block uppercase">GUN SKIN</span>
                <span className="font-bold text-cyan-400 truncate block">
                  {GUN_SKIN_DATA[progress.equippedGunSkin || 'plasma_cyan']?.name || 'Carbine'}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block uppercase">OUTFIT</span>
                <span className="font-bold text-amber-400 truncate block">
                  {OUTFIT_DATA[progress.equippedOutfit || 'tactical_stealth']?.name || 'Shinobi'}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block uppercase">ELEMENT</span>
                <span className="font-bold text-emerald-400 truncate block">
                  {ELEMENTAL_SKIN_DATA[progress.equippedSkin || 'lightning']?.name?.split(' ')[0] || 'Lightning'}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* RIGHT COLUMN: CATEGORIZED INVENTORY INTERFACE (7 COLS) */}
          {/* ===================================================== */}
          <div className="md:col-span-7 flex flex-col bg-[#090e1a] p-4 sm:p-5 overflow-y-auto">
            {/* Category Navigation Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-[11px] font-mono shrink-0">
              <button
                onClick={() => setActiveTab('gun_skins')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                  activeTab === 'gun_skins'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="truncate">GUN SKINS</span>
              </button>

              <button
                onClick={() => setActiveTab('outfits')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                  activeTab === 'outfits'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span className="truncate">OUTFITS</span>
              </button>

              <button
                onClick={() => setActiveTab('colors')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                  activeTab === 'colors'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="truncate">COLORS</span>
              </button>

              <button
                onClick={() => setActiveTab('characters')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                  activeTab === 'characters'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="truncate">HEROES</span>
              </button>

              <button
                onClick={() => setActiveTab('weapons')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                  activeTab === 'weapons'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span className="truncate">ARSENAL</span>
              </button>

              <button
                onClick={() => setActiveTab('purchased')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all ${
                  activeTab === 'purchased'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span className="truncate">VAULT</span>
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* TAB 1: GUN SKINS */}
              {activeTab === 'gun_skins' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>SELECT GUN WEAPON SKIN</span>
                    <span className="text-cyan-400 font-bold">CLICK TO EQUIP INSTANTLY</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {gunSkins.map((id) => {
                      const g = GUN_SKIN_DATA[id];
                      const isEquipped = (progress.equippedGunSkin || 'plasma_cyan') === id;
                      const isUnlocked = progress.unlockedGunSkins?.includes(id) || id === 'plasma_cyan';

                      return (
                        <div
                          key={id}
                          onClick={() => isUnlocked && handleEquipGunSkin(id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isEquipped
                              ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                              : isUnlocked
                              ? 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                              : 'bg-slate-950/30 border-slate-900 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className="font-mono text-xs font-bold"
                                style={{ color: g.color }}
                              >
                                {g.name}
                              </span>
                              {isEquipped ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/40">
                                  <Check className="w-3 h-3" /> EQUIPPED
                                </span>
                              ) : isUnlocked ? (
                                <span className="text-[10px] font-mono text-slate-400">UNLOCKED</span>
                              ) : (
                                <span className="text-[10px] font-mono text-amber-400">
                                  LOCKED ({g.price}c)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug">
                              {g.desc}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: g.color, boxShadow: `0 0 8px ${g.color}` }}
                            />
                            <button
                              disabled={!isUnlocked || isEquipped}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipGunSkin(id);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                isEquipped
                                  ? 'bg-cyan-500 text-black'
                                  : isUnlocked
                                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              {isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : 'LOCKED'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: OUTFITS */}
              {activeTab === 'outfits' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>SELECT COMBAT OUTFIT</span>
                    <span className="text-cyan-400 font-bold">UPDATES ARMOR & SUIT</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {outfits.map((id) => {
                      const o = OUTFIT_DATA[id];
                      const isEquipped = (progress.equippedOutfit || 'tactical_stealth') === id;
                      const isUnlocked = progress.unlockedOutfits?.includes(id) || id === 'tactical_stealth';

                      return (
                        <div
                          key={id}
                          onClick={() => isUnlocked && handleEquipOutfit(id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isEquipped
                              ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                              : isUnlocked
                              ? 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                              : 'bg-slate-950/30 border-slate-900 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-bold text-slate-200">
                                {o.name}
                              </span>
                              {isEquipped ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/40">
                                  <Check className="w-3 h-3" /> EQUIPPED
                                </span>
                              ) : isUnlocked ? (
                                <span className="text-[10px] font-mono text-slate-400">UNLOCKED</span>
                              ) : (
                                <span className="text-[10px] font-mono text-amber-400">
                                  LOCKED ({o.price}c)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug">
                              {o.desc}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-full border border-black/40"
                                style={{ backgroundColor: o.primaryColor }}
                              />
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: o.accentColor }}
                              />
                            </div>
                            <button
                              disabled={!isUnlocked || isEquipped}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipOutfit(id);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                isEquipped
                                  ? 'bg-cyan-500 text-black'
                                  : isUnlocked
                                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              {isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : 'LOCKED'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: PLAYER COLORS & ELEMENTAL AURA */}
              {activeTab === 'colors' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>SELECT ELEMENTAL COLOR & AURA</span>
                    <span className="text-cyan-400 font-bold">EMITS CUSTOM ENERGY PARTICLES</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {elementalSkins.map((skinId) => {
                      const s = ELEMENTAL_SKIN_DATA[skinId];
                      const isEquipped = (progress.equippedSkin || 'lightning') === skinId;
                      const isUnlocked = progress.unlockedSkins?.includes(skinId) || true;

                      return (
                        <div
                          key={skinId}
                          onClick={() => handleEquipElementalSkin(skinId)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isEquipped
                              ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className="font-mono text-xs font-bold"
                                style={{ color: s.color }}
                              >
                                {s.name}
                              </span>
                              {isEquipped && (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/40">
                                  <Check className="w-3 h-3" /> ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug">
                              {s.desc}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}` }}
                            />
                            <button
                              disabled={isEquipped}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipElementalSkin(skinId);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                isEquipped
                                  ? 'bg-cyan-500 text-black'
                                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                              }`}
                            >
                              {isEquipped ? 'ACTIVE' : 'EQUIP'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: HERO CHARACTERS */}
              {activeTab === 'characters' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>SELECT PLAYABLE HERO</span>
                    <span className="text-cyan-400 font-bold">TACTICAL GUNSLINGERS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {characterModels.map((charId) => {
                      const c = CHARACTER_DATA[charId];
                      const isEquipped = (progress.characterModel || 'myraa_hunter') === charId;
                      const isUnlocked = progress.unlockedCharacters?.includes(charId) || charId === 'myraa_hunter';

                      return (
                        <div
                          key={charId}
                          onClick={() => isUnlocked && handleEquipCharacter(charId)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isEquipped
                              ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                              : isUnlocked
                              ? 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                              : 'bg-slate-950/30 border-slate-900 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="text-[10px] font-mono text-cyan-400 uppercase block">
                                  {c.title}
                                </span>
                                <span className="font-display font-black text-sm text-slate-100">
                                  {c.name}
                                </span>
                              </div>
                              {isEquipped && (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/40">
                                  <Check className="w-3 h-3" /> ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans mt-1.5 leading-snug">
                              {c.desc}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-end pt-2 border-t border-slate-800/80">
                            <button
                              disabled={!isUnlocked || isEquipped}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipCharacter(charId);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                isEquipped
                                  ? 'bg-cyan-500 text-black'
                                  : isUnlocked
                                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              {isEquipped ? 'ACTIVE' : isUnlocked ? 'SELECT' : 'LOCKED'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: WEAPONS / ARSENAL */}
              {activeTab === 'weapons' && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>PRIMARY WEAPON ARSENAL</span>
                    <span className="text-cyan-400 font-bold">GUN IS DEFAULT</span>
                  </div>

                  {/* Primary Gun Card */}
                  <div
                    onClick={() => handleEquipWeapon('gun')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      progress.equippedWeapon === 'gun'
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crosshair className="w-5 h-5 text-cyan-400" />
                        <div>
                          <span className="font-display font-black text-sm text-cyan-300 block">
                            PLASMA CARBINE (GUN)
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Default Standard Issue Firearm
                          </span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                        <Check className="w-3 h-3" /> PRIMARY WEAPON
                      </span>
                    </div>

                    {/* Gun Special Powers */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      {GUN_POWERS.map((p) => (
                        <div key={p.id} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-cyan-400 font-bold block">{p.name}</span>
                          <span className="text-slate-400">{p.damage} DMG</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary / Unlockable Bow Card */}
                  <div
                    onClick={() => progress.unlockedWeapons?.includes('bow') && handleEquipWeapon('bow')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      progress.equippedWeapon === 'bow'
                        ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="font-display font-black text-sm text-emerald-300 block">
                            ANCESTRAL GREATBOW
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Long-Range Piercing Artillery
                          </span>
                        </div>
                      </div>
                      {progress.equippedWeapon === 'bow' ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                          <Check className="w-3 h-3" /> EQUIPPED
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEquipWeapon('bow')}
                          className="px-3 py-1 rounded bg-slate-800 text-slate-200 text-xs font-mono font-bold hover:bg-slate-700"
                        >
                          {progress.unlockedWeapons?.includes('bow') ? 'EQUIP' : 'ACQUIRE IN SHOP'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      {BOW_POWERS.map((p) => (
                        <div key={p.id} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-emerald-400 font-bold block">{p.name}</span>
                          <span className="text-slate-400">{p.damage} DMG</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PURCHASED VAULT */}
              {activeTab === 'purchased' && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>ACQUIRED VAULT INVENTORY</span>
                    <span className="text-amber-400 font-bold">ALL UNLOCKED GEAR</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Unlocked Gun Skins:</span>
                      <span className="text-cyan-400 font-bold">
                        {progress.unlockedGunSkins?.length || 1} / 5
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Unlocked Outfits:</span>
                      <span className="text-amber-400 font-bold">
                        {progress.unlockedOutfits?.length || 1} / 5
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Elemental Auras:</span>
                      <span className="text-emerald-400 font-bold">5 / 5 Unlocked</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">Unlocked Weapons:</span>
                      <span className="text-purple-400 font-bold">
                        {progress.unlockedWeapons?.length || 1}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans">
                    New skins, armors, and weapons can be purchased with coins earned in Story Mode and Race Mode from the Shop!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            All modifications save automatically to player profile.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl font-mono text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-md ml-auto"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
