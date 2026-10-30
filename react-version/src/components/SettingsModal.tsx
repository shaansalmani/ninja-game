import React, { useState } from 'react';
import { GameSettings, DifficultyMode, ControllerSettings } from '../types/game';
import {
  X,
  Settings2,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCcw,
  Gamepad2,
  Keyboard,
  Maximize,
  Sliders,
  Eye,
  SlidersHorizontal,
  Menu,
} from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onRestartRace: () => void;
  onOpenKeyMapping: () => void;
  onReturnToMenu?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onRestartRace,
  onOpenKeyMapping,
  onReturnToMenu,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleDifficultyChange = (diff: DifficultyMode) => {
    onUpdateSettings({ ...settings, difficulty: diff });
  };

  const handleToggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleToggleCountdown = () => {
    onUpdateSettings({ ...settings, countdownEnabled: !settings.countdownEnabled });
  };

  const updateControllerSetting = <K extends keyof ControllerSettings>(
    key: K,
    value: ControllerSettings[K]
  ) => {
    onUpdateSettings({
      ...settings,
      controllerSettings: {
        ...settings.controllerSettings,
        [key]: value,
      },
    });
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed', e);
    }
  };

  const handleConfirmReset = () => {
    onResetProgress();
    setConfirmReset(false);
  };

  const ctrl = settings.controllerSettings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#090e1a] border border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-slate-100 tracking-wider">
              GAME & CONTROLS SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings List */}
        <div className="py-3 space-y-3.5 text-xs font-mono overflow-y-auto pr-1">
          {/* Virtual Controller Settings Section Header */}
          <div className="flex items-center gap-2 pt-1 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4" />
            <span>Virtual Console Touch Controller</span>
          </div>

          {/* Controller Visibility */}
          <div className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">TOUCH CONTROLLER VISIBILITY</span>
              <span className="text-cyan-400 font-bold uppercase">{ctrl.visibility.replace('_', ' ')}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(
                [
                  { id: 'always', label: 'ALWAYS ON' },
                  { id: 'touch_only', label: 'TOUCH ONLY' },
                  { id: 'hidden', label: 'HIDDEN' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateControllerSetting('visibility', opt.id)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    ctrl.visibility === opt.id
                      ? 'bg-cyan-500 text-black shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Button Size & Opacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button Size */}
            <div className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">BUTTON SIZE</span>
                <span className="text-cyan-400 font-bold uppercase">{ctrl.buttonSize}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateControllerSetting('buttonSize', size)}
                    className={`py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      ctrl.buttonSize === size
                        ? 'bg-cyan-500 text-black'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Opacity */}
            <div className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">CONTROLLER OPACITY</span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {Math.round(ctrl.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.25"
                max="1.0"
                step="0.05"
                value={ctrl.opacity}
                onChange={(e) => updateControllerSetting('opacity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Joystick Sensitivity */}
          <div className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 gap-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">ANALOG JOYSTICK SENSITIVITY</span>
                <span className="text-[11px] text-slate-500 font-sans">
                  Movement deadzone responsiveness and deadband tuning
                </span>
              </div>
              <span className="text-cyan-400 font-bold tabular-nums text-sm">
                {ctrl.joystickSensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={ctrl.joystickSensitivity}
              onChange={(e) => updateControllerSetting('joystickSensitivity', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Keyboard Key Mapping CTA */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30">
            <div className="flex items-center gap-2.5">
              <Keyboard className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-bold text-slate-200 block">CUSTOM KEYBOARD MAPPING</span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Rebind W/A/S/D, Jump, Attack, Dash, Powers, L1/R1
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenKeyMapping();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              CONFIGURE KEYS
            </button>
          </div>

          {/* Display & Screen Section */}
          <div className="flex items-center gap-2 pt-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Maximize className="w-4 h-4" />
            <span>Display & Fullscreen</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-bold text-slate-200 block">FULLSCREEN DISPLAY</span>
              <span className="text-[11px] text-slate-500 font-sans">Expand canvas to full display viewport</span>
            </div>
            <button
              onClick={handleToggleFullscreen}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>TOGGLE FULLSCREEN</span>
            </button>
          </div>

          {/* Audio Section Header */}
          <div className="flex items-center gap-2 pt-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>Audio & Sound FX</span>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="font-bold text-slate-200 block">GAME AUDIO & FX</span>
                <span className="text-[11px] text-slate-500 font-sans">Synthesized Web Audio sound effects</span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                settings.soundEnabled ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Difficulty Setting */}
          <div className="flex flex-col p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">AI OPPONENT DIFFICULTY</span>
              <span className="text-cyan-400 font-bold uppercase">{settings.difficulty}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['casual', 'normal', 'hardcore', 'master'] as DifficultyMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleDifficultyChange(mode)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    settings.difficulty === mode
                      ? 'bg-cyan-500 text-black shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Countdown Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-bold text-slate-200 block">RACE COUNTDOWN</span>
              <span className="text-[11px] text-slate-500 font-sans">3 → 2 → 1 → GO animated sequence</span>
            </div>
            <button
              onClick={handleToggleCountdown}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                settings.countdownEnabled ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.countdownEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Restart Current Run / Race */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-bold text-slate-200 block">RESTART CURRENT MATCH</span>
              <span className="text-[11px] text-slate-500 font-sans">Reset track or level to beginning</span>
            </div>
            <button
              onClick={() => {
                onRestartRace();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART</span>
            </button>
          </div>

          {/* Reset Saved Progress */}
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50">
            {!confirmReset ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-300 block">RESET ALL SAVED PROGRESS</span>
                  <span className="text-[11px] text-rose-400/80 font-sans">
                    Clears unlocked levels, coins, weapons, and stats
                  </span>
                </div>
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900 font-bold transition-colors"
                >
                  RESET
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Are you sure? This action cannot be undone.</span>
                </div>
                <div className="flex items-center gap-2 justify-end pt-1">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    CONFIRM RESET
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          {onReturnToMenu ? (
            <button
              onClick={() => {
                onClose();
                onReturnToMenu();
              }}
              className="px-4 py-2 rounded-xl font-mono text-xs font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Menu className="w-3.5 h-3.5 text-amber-400" />
              <span>RETURN TO MAIN MENU</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-mono text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
