import React from 'react';
import { PlayerProgress, GameSettings, DifficultyMode } from '../types/game';
import { Play, Flag, ShoppingBag, Shield, HelpCircle, Settings2, Trophy, Zap, Target, Volume2, VolumeX, Coins, Sword, Award } from 'lucide-react';

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

const LOGO_URL = '/src/assets/images/ninja_game_logo_1793389959170.jpg';
const BG_URL = '/src/assets/images/fantasy_forest_mountain_1793398627705.jpg';

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
  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between py-6 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* Background Ambience */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-25 pointer-events-none filter blur-[1px]"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />

      {/* Top Bar on Start Screen */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-300">
            NINJA SHADOWS · TYPING ADVENTURE
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Purse */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 font-mono text-xs font-bold text-amber-400">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="tabular-nums">{progress.coins.toLocaleString()} COINS</span>
          </div>

          <button
            onClick={onToggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {settings.soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>SOUND ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>SOUND OFF</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GUIDE</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Brand Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center my-4">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3 rounded-2xl overflow-hidden border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.4)]">
          <img
            src={LOGO_URL}
            alt="Ninja Typing Race Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-amber-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          NINJA SHADOWS
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl font-sans">
          Type lethal martial commands to conquer 6 Story adventure levels, defeat the Titan Boss, and sprint in high-speed 4-racer rooftop championships.
        </p>

        {/* Player Lifetime Stats Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl text-xs font-mono">
          <div className="flex flex-col p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Sword className="w-3.5 h-3.5 text-cyan-400" /> STORY PROGRESS
            </span>
            <span className="text-lg font-bold text-cyan-400 mt-1">
              LEVEL {progress.storyLevel}/6
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> BEST RACE WPM
            </span>
            <span className="text-lg font-bold text-amber-400 mt-1 tabular-nums">
              {progress.bestWpm > 0 ? `${progress.bestWpm}` : '—'}
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" /> RACE WINS
            </span>
            <span className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
              {progress.totalWins}
            </span>
          </div>

          <div className="flex flex-col p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-purple-400" /> EQUIPPED WEAPON
            </span>
            <span className="text-lg font-bold text-purple-300 mt-1 uppercase truncate">
              {progress.equippedWeapon}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Modes Grid */}
      <div className="relative z-10 w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STORY MODE CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-xl text-cyan-300 flex items-center gap-2">
                <Sword className="w-5 h-5 text-cyan-400" />
                STORY ADVENTURE
              </span>
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                6 LEVELS + BOSS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-sans">
              Battle waves of swordsmen, hammer giants, archers, cannons, laser drones, and the Kage-Ryu Titan across floating mountain paths and treasure temples.
            </p>
          </div>

          <button
            onClick={onStartStoryMode}
            className="mt-5 w-full py-3.5 px-6 rounded-xl font-display font-black text-sm tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>PLAY STORY MODE</span>
          </button>
        </div>

        {/* RACE MODE CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-amber-500/40 shadow-[0_0_25px_rgba(251,191,36,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-xl text-amber-300 flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-400" />
                TYPING RACE MODE
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded">
                4 NINJA RACERS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-sans">
              Compete against Blaze, Jade, and Golden Viper in high-speed 1000m rooftop sprints. Type English words at lightning speed with momentum multipliers.
            </p>
          </div>

          <button
            onClick={onStartRaceMode}
            className="mt-5 w-full py-3.5 px-6 rounded-xl font-display font-black text-sm tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-300 hover:to-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Flag className="w-4 h-4" />
            <span>PLAY RACE MODE</span>
          </button>
        </div>
      </div>

      {/* Auxiliary Shop & Inventory Navigation Bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={onOpenShop}
          className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>WEAPON SHOP (POWERS, GUN, BOW)</span>
        </button>

        <button
          onClick={onOpenInventory}
          className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>INVENTORY & 5 ELEMENTAL SKINS</span>
        </button>
      </div>
    </div>
  );
};
