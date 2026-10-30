import React, { useState } from 'react';
import { X, Keyboard, Zap, Flame, ShieldAlert, Award, Sword, Crosshair, PackageOpen, Gamepad2, Compass, Wind } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'controls' | 'story' | 'weapons' | 'race'>('controls');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-slate-100 tracking-wider">
              NINJA ADVENTURE · GAMEPLAY GUIDE
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
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-xs font-mono">
          <button
            onClick={() => setTab('controls')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
              tab === 'controls' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CONTROLS
          </button>
          <button
            onClick={() => setTab('story')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
              tab === 'story' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            STORY (6 LEVELS)
          </button>
          <button
            onClick={() => setTab('weapons')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
              tab === 'weapons' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WEAPONS
          </button>
          <button
            onClick={() => setTab('race')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
              tab === 'race' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RACE MODE
          </button>
        </div>

        {/* Tab 0: Controls */}
        {tab === 'controls' && (
          <div className="space-y-3.5 text-xs font-sans text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1.5 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                Default Keyboard Mapping
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold block">W / A / S / D</span>
                  <span>Move & Climb</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold block">Space</span>
                  <span>Jump</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-rose-400 font-bold block">J Key</span>
                  <span>Attack / Slash</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-amber-400 font-bold block">K Key</span>
                  <span>Special Power</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold block">L Key</span>
                  <span>Ninja Dash</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-purple-400 font-bold block">Q / E</span>
                  <span>L1 / R1 Cycle</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 font-bold block">Tab</span>
                  <span>SELECT (Inventory)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 font-bold block">Enter</span>
                  <span>START (Settings)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans">
                You can rebind every key in <strong className="text-cyan-400">Settings → Configure Keys</strong> with duplicate conflict detection.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1.5 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                Console Touch Controller
              </strong>
              <p className="text-slate-400 leading-relaxed">
                On mobile and touch devices, use the virtual analog joystick on the bottom-left to run, climb, and maneuver smoothly. Use the action cluster on the bottom-right (A, B, X, Y) to jump, attack, cast elemental arts, and dash. Multi-touch is fully supported so you can sprint, jump, and slash simultaneously!
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Story Mode */}
        {tab === 'story' && (
          <div className="space-y-3.5 text-xs font-sans text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Enemies & Tactics Across 6 Levels
              </strong>
              <ul className="text-slate-400 space-y-1.5 list-disc list-inside mt-1">
                <li><strong>Level 1 (Sword Warriors)</strong>: Fast repeated attacks, 2-3 hits to kill.</li>
                <li><strong>Level 2 (Hammer Warriors)</strong>: Heavy strikes. At 50% health, they get knocked down, then stand back up for a fierce final stand!</li>
                <li><strong>Level 3 (Archers)</strong>: Shoot horizontal arrows. Jump or dash through them to close the distance.</li>
                <li><strong>Level 4 (Cannons)</strong>: Ground-targeted artillery shells. Move quickly away from glowing impact zones!</li>
                <li><strong>Level 5 (Drones)</strong>: Laser tracking drones that lock on and fire beams.</li>
                <li><strong>Level 6 (Shadow Titan Boss)</strong>: Giant mountain boss with sweeping eye lasers and shockwaves. Strike the glowing heart weak point!</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <PackageOpen className="w-4 h-4 text-purple-400" />
                Treasure Chests & Platforming
              </strong>
              <p className="text-slate-400">
                Between combat waves, climb wooden ladders, cross stone bridges, and leap across floating islands. Approach glowing chests to unlock 90 seconds of Gun or Bow armaments!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Weapons & Powers */}
        {tab === 'weapons' && (
          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-cyan-300 text-sm block mb-1">PLASMA CARBINE & FIREARMS (Default Weapon)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] text-slate-400">
                <div>Shot: 60 DMG</div>
                <div>Triple: 120 DMG</div>
                <div>Rapid: 180 DMG</div>
                <div>Laser: 210 DMG</div>
                <div>Cannon: 130 DMG</div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-2">
                The player visibly holds the gun in their hand with realistic recoil and muzzle flashes. Unlock new gun skins, ballistic outfits, and hero models in the Armory Shop!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-emerald-400 text-sm block mb-1">ANCESTRAL GREATBOW (Bow · 20,000c)</strong>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] text-slate-400">
                <div>Arrow: 48 DMG</div>
                <div>Air: 105 DMG</div>
                <div>Volley: 140 DMG</div>
                <div>Pierce: 160 DMG</div>
                <div>Giant: 230 DMG</div>
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
                4-Racer Rooftop Championship
              </strong>
              <p className="text-slate-400">
                Sprint against Blaze Ronin, Jade Phantom, and Golden Viper! Hold Joystick Right or the D key to accelerate, press Jump (Space) to leap hurdles, and tap Dash (L key) for high-octane turbo bursts.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white text-sm block mb-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Momentum Multipliers & Turbo
              </strong>
              <p className="text-slate-400">
                Maintain continuous sprint momentum to earn hyper runner streaks and higher speed rewards. Cross 100 meters first to claim tournament victory!
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
