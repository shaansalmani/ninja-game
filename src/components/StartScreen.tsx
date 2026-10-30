import React from 'react';
import { PlayerProgress, GameSettings } from '../types/game';
import { CharacterPreview } from './CharacterPreview';
import { GUN_SKIN_DATA, OUTFIT_DATA, ELEMENTAL_SKIN_DATA } from '../utils/combatConfig';
import {
  Play,
  Flag,
  ShoppingBag,
  Shield,
  HelpCircle,
  Settings2,
  Trophy,
  Zap,
  Crosshair,
  Volume2,
  VolumeX,
  Coins,
  Shirt,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface StartScreenProps {
  progress: PlayerProgress;
  settings: GameSettings;
  onStartStoryMode: () => void;
  onStartRaceMode: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

const LOGO_URL = new URL('../assets/images/ninja_game_logo_1793389959170.jpg', import.meta.url).href;
const BG_URL = new URL('../assets/images/fantasy_forest_mountain_1793398627705.jpg', import.meta.url).href;

export const StartScreen: React.FC<StartScreenProps> = ({
  progress,
  settings,
  onStartStoryMode,
  onStartRaceMode,
  onOpenShop,
  onOpenInventory,
  onOpenHowToPlay,
  onOpenSettings,
  onToggleSound,
}) => {
  const gunSkin = progress.equippedGunSkin || 'plasma_cyan';
  const outfit = progress.equippedOutfit || 'tactical_stealth';
  const skin = progress.equippedSkin || 'lightning';
  const charModel = progress.characterModel || 'myraa_hunter';

  const gunInfo = GUN_SKIN_DATA[gunSkin];
  const outfitInfo = OUTFIT_DATA[outfit];
  const skinInfo = ELEMENTAL_SKIN_DATA[skin];

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between py-4 px-3 sm:px-8 max-w-6xl mx-auto select-none">
      {/* Background Ambience with Parallax Blur */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-25 pointer-events-none filter blur-[1px]"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />

      {/* 1. TOP HEADER STRIP */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-display font-black text-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            M
          </div>
          <div>
            <span className="font-display font-black text-base sm:text-lg tracking-wider text-slate-100 block leading-tight">
              MYRAA <span className="text-cyan-400">NINJA ADVENTURE</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              TACTICAL GUNNER & ROOFTOP CHAMPIONSHIP
            </span>
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          {/* Vault Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 font-mono text-xs font-bold text-amber-400 shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="tabular-nums">{progress.coins.toLocaleString()}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            title="Toggle Sound FX"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline">{settings.soundEnabled ? 'AUDIO' : 'MUTED'}</span>
          </button>

          {/* Guide */}
          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            title="How to Play Guide"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">GUIDE</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white transition-colors"
            title="Game & Controller Settings"
          >
            <Settings2 className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* 2. MAIN LOBBY STAGE: CHARACTER SHOWCASE & GAME SELECT */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-4 sm:py-6">
        {/* ========================================================= */}
        {/* LEFT / CENTER: FULL ANIMATED PLAYER CHARACTER IN THE LOBBY */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#0a0f1d] via-[#060a14] to-[#04060c] border border-cyan-500/30 p-4 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col items-center">
            {/* Lobby Badge */}
            <div className="w-full flex items-center justify-between pb-2 text-[10px] font-mono">
              <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> ACTIVE COMBAT HERO
              </span>
              <span className="text-slate-400 font-semibold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                ARMED & READY
              </span>
            </div>

            {/* Live Animated Player Character Holding Gun */}
            <div className="w-full flex items-center justify-center my-1">
              <CharacterPreview
                skin={skin}
                gunSkin={gunSkin}
                outfit={outfit}
                characterModel={charModel}
                width={280}
                height={360}
                interactive={true}
              />
            </div>

            {/* Loadout Badges */}
            <div className="w-full flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: gunInfo?.color || '#06b6d4', boxShadow: `0 0 6px ${gunInfo?.color}` }}
                />
                <span className="text-slate-200 font-bold">{gunInfo?.name || 'Carbine'}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: outfitInfo?.accentColor || '#38bdf8' }}
                />
                <span className="text-slate-400">{outfitInfo?.name || 'Shinobi'}</span>
              </div>
            </div>

            {/* Quick Customize CTA Button */}
            <button
              onClick={onOpenInventory}
              className="mt-3 w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center justify-center gap-2 transition-all shadow-md group"
            >
              <Shirt className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>CUSTOMIZE CHARACTER & GUN SKINS</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT: GAME MODES, PROGRESSION & ACTION BUTTONS */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Title & Status */}
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              TACTICAL SHINOBI SHOOTER · ARENA CHAMPIONSHIP
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white mt-1 drop-shadow-md">
              ENTER THE BATTLEGROUND
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-sans leading-relaxed">
              Equip your plasma firearms, climb towering fortress ladders, defeat flying laser drones, and confront the Shadow Titan across 6 dangerous adventure stages.
            </p>
          </div>

          {/* Game Mode Launch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. STORY MODE CARD */}
            <div
              onClick={onStartStoryMode}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-slate-950 border border-cyan-500/50 shadow-xl cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Crosshair className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    LEVEL {progress.storyLevel}/6
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-white group-hover:text-cyan-300 transition-colors">
                  STORY ADVENTURE
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1">
                  Battle waves of hammer warriors, archers, artillery, flying drones, and the 6th level Titan Boss.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  PLAY STORY MODE <ArrowRight className="w-4 h-4" />
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              </div>
            </div>

            {/* 2. RACE MODE CARD */}
            <div
              onClick={onStartRaceMode}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900/90 to-slate-950 border border-amber-500/50 shadow-xl cursor-pointer hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Flag className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    {progress.totalWins} WINS
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-white group-hover:text-amber-300 transition-colors">
                  ROOFTOP RACE
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1">
                  Compete against 3 elite AI ninja racers with sprint cadence, turbo boosts, and hurdle leaps.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  START RACE MODE <ArrowRight className="w-4 h-4" />
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
              </div>
            </div>
          </div>

          {/* Armory & Shop Utility Cards */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onOpenInventory}
              className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center gap-3 transition-all text-left shadow-md group"
            >
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 group-hover:scale-105 transition-transform">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono font-bold text-xs text-slate-200 block">
                  INVENTORY & SKINS
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Equip guns, suits, and auras
                </span>
              </div>
            </button>

            <button
              onClick={onOpenShop}
              className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center gap-3 transition-all text-left shadow-md group"
            >
              <div className="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono font-bold text-xs text-slate-200 block">
                  ARMORY SHOP
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Spend coins for weapons & gear
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER TELEMETRY STRIP */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>CONTROLLER: <strong className="text-cyan-400">VIRTUAL CONSOLE & MOUSE</strong></span>
          <span>·</span>
          <span>WEAPON: <strong className="text-amber-400 uppercase">GUN (PRIMARY)</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="hover:text-cyan-400 transition-colors"
          >
            CONTROLS SETTINGS
          </button>
          <span>·</span>
          <button
            onClick={onOpenHowToPlay}
            className="hover:text-cyan-400 transition-colors"
          >
            TACTICAL GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
