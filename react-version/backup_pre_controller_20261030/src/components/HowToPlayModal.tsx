import React, { useState } from 'react';
import { X, Keyboard, Zap, Flame, ShieldAlert, Award, Sword, Crosshair, PackageOpen, Heart } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'story' | 'weapons' | 'race'>('story');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-slate-100">
              NINJA SHADOWS · HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs font-mono">
          <button
            onClick={() => setTab('story')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
              tab === 'story' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            STORY MODE (6 LEVELS)
          </button>
          <button
            onClick={() => setTab('weapons')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
              tab === 'weapons' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WEAPONS & POWERS
          </button>
          <button
            onClick={() => setTab('race')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
              tab === 'race' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TYPING RACE MODE
          </button>
        </div>

        {/* Tab 1: Story Mode */}
        {tab === 'story' && (
          <div className="space-y-3.5 text-xs font-sans text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <Sword className="w-4 h-4 text-cyan-400" />
                1. Dual Typing Consoles
              </strong>
              <p className="text-slate-400">
                You control the ninja entirely by typing English commands! Type <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">LEFT</code>, <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">RIGHT</code>, <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">JUMP</code>, <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">CLIMB</code> to navigate, and type weapon attacks on the right console. Press <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">Backspace</code> to clear.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                2. Enemies & Tactics Across 6 Levels
              </strong>
              <ul className="text-slate-400 space-y-1 list-disc list-inside mt-1">
                <li><strong>Level 1 (Sword Warriors)</strong>: Fast repeated attacks, 2-3 hits to kill.</li>
                <li><strong>Level 2 (Hammer Warriors)</strong>: Slow heavy strikes. At 50% health, they fall down (knockdown animation), then get back up for 1 final hit!</li>
                <li><strong>Level 3 (Archers)</strong>: Shoot horizontal arrows. Jump to avoid incoming projectiles.</li>
                <li><strong>Level 4 (Cannons)</strong>: Identify your ground location, lock a targeting circle, and launch cannonballs. Dodge away from the marked spot!</li>
                <li><strong>Level 5 (Drones)</strong>: Search laser tracks you, narrows into a locked line, and fires a devastating beam at that locked position.</li>
                <li><strong>Level 6 (Shadow Titan Boss)</strong>: Rising titan with glowing eyes. Avoid sweeping eye lasers by jumping. Attack the glowing heart weak point in its chest!</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <PackageOpen className="w-4 h-4 text-purple-400" />
                3. Mountain Transitions & Treasure Chests
              </strong>
              <p className="text-slate-400">
                Between combat levels, travel along floating islands, stone stairs, wooden ladders, and bridges. Approach treasure chests and type <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">OPEN</code> to gain temporary access to Gun or Bow weapons for 90 seconds! Health pickups spawn if your health drops below 50%.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Weapons & Powers */}
        {tab === 'weapons' && (
          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-cyan-300 text-sm block mb-1">SHINOBI SWORD (Default)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] text-slate-400">
                <div>HIT: 35 DMG (Melee)</div>
                <div>SPIN: 65 DMG (360°)</div>
                <div>SKY: 110 DMG (Storm)</div>
                <div>PULL: 75 DMG (Magnet)</div>
                <div>RAIN: 190 DMG (Blades)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-rose-400 text-sm block mb-1">PLASMA REVOLVER (Gun · 10,000c)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] text-slate-400">
                <div>FIRE: 55 DMG</div>
                <div>TRIPLE: 120 DMG</div>
                <div>RAPID: 180 DMG</div>
                <div>LASER: 210 DMG</div>
                <div>STORM: 280 DMG</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-emerald-400 text-sm block mb-1">ANCESTRAL GREATBOW (Bow · 20,000c)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] text-slate-400">
                <div>ARROW: 48 DMG</div>
                <div>AIR: 105 DMG</div>
                <div>VOLLEY: 140 DMG</div>
                <div>PIERCE: 160 DMG</div>
                <div>GIANT: 230 DMG</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-amber-400 text-sm block mb-1">5 ELEMENTAL SKINS</strong>
              <p className="text-[11px] text-slate-400 font-sans">
                Lightning (Cyan Sparks), Fire (Blazing Embers), Water (Tidal Arcs), Diamond (Prismatic Crystals), Rock (Stone Shocks). Equip any skin freely in Inventory!
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Race Mode */}
        {tab === 'race' && (
          <div className="space-y-3.5 text-xs font-sans text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                1. 4-Racer Rooftop Championship
              </strong>
              <p className="text-slate-400">
                Race against Blaze, Jade, and Golden Viper. Type the displayed words as quickly as possible to increase your running velocity.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                2. Momentum Streaks & Mistakes
              </strong>
              <p className="text-slate-400">
                Chaining accurate words builds momentum and super dashes. Incorrect keystrokes cause a stumble penalty, but you can immediately recover by typing correctly!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-sm"
          >
            ENTER ARENA
          </button>
        </div>
      </div>
    </div>
  );
};
