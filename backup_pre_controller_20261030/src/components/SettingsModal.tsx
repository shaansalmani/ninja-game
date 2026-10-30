import React, { useState } from 'react';
import { GameSettings, DifficultyMode } from '../types/game';
import { X, Settings2, Volume2, VolumeX, AlertTriangle, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onRestartRace: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onRestartRace,
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

  const handleConfirmReset = () => {
    onResetProgress();
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090e1a] border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-slate-100">
              GAME SETTINGS
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

        {/* Settings List */}
        <div className="py-4 space-y-4 text-xs font-mono">
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
                settings.soundEnabled
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-800 text-slate-400'
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
                settings.countdownEnabled
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.countdownEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Language Display */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-bold text-slate-200 block">TYPING WORD LANGUAGE</span>
              <span className="text-[11px] text-slate-500 font-sans">Curated English ninja vocabulary</span>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
              English
            </span>
          </div>

          {/* Restart Race CTA */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="font-bold text-slate-200 block">RESTART CURRENT RACE</span>
              <span className="text-[11px] text-slate-500 font-sans">Reset track and start from 0m</span>
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
                  <span className="text-[11px] text-rose-400/80 font-sans">Clears best scores, unlocked levels, and win counts</span>
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
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
