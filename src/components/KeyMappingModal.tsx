import React, { useState, useEffect } from 'react';
import { GameAction, KeyMapping } from '../types/game';
import { DEFAULT_KEY_MAPPING, getKeyDisplayLabel } from '../utils/inputManager';
import { sound } from '../utils/audio';
import { Keyboard, X, RotateCcw, AlertTriangle, Check, Shield } from 'lucide-react';

interface KeyMappingModalProps {
  currentMapping: KeyMapping;
  onSaveMapping: (newMapping: KeyMapping) => void;
  onClose: () => void;
}

const ACTION_DESCRIPTIONS: Record<GameAction, { label: string; desc: string }> = {
  UP: { label: 'Move Up / Climb', desc: 'Climb ladders or aim upward while leaping' },
  DOWN: { label: 'Move Down / Drop', desc: 'Descend ladders or drop down from platforms' },
  LEFT: { label: 'Move Left', desc: 'Run and face left' },
  RIGHT: { label: 'Move Right', desc: 'Run and face right' },
  JUMP: { label: 'Jump', desc: 'Perform athletic vertical or directional jump' },
  ATTACK: { label: 'Attack', desc: 'Primary sword slash, gunshot or arrow release' },
  SPECIAL: { label: 'Special Power', desc: 'Cast equipped elemental power / heavy art' },
  DASH: { label: 'Dash / Dodge', desc: 'Swift invulnerable ninja dash with speed trail' },
  L1: { label: 'L1 (Previous)', desc: 'Cycle to previous weapon or special power' },
  R1: { label: 'R1 (Next)', desc: 'Cycle to next weapon or special power' },
  SELECT: { label: 'SELECT', desc: 'Open inventory, equipment and elemental skins' },
  START: { label: 'START / PAUSE', desc: 'Pause game or access system menu' },
};

export const KeyMappingModal: React.FC<KeyMappingModalProps> = ({
  currentMapping,
  onSaveMapping,
  onClose,
}) => {
  const [mapping, setMapping] = useState<KeyMapping>({ ...currentMapping });
  const [listeningAction, setListeningAction] = useState<GameAction | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    newKey: string;
    conflictingAction: GameAction;
    targetAction: GameAction;
  } | null>(null);

  // Listen for keydown when rebinding
  useEffect(() => {
    if (!listeningAction) return;

    const handleRebindKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newCode = e.code;
      if (newCode === 'Escape') {
        setListeningAction(null);
        return;
      }

      // Check for duplicate key assignment
      let conflictingAction: GameAction | null = null;
      for (const [actKey, code] of Object.entries(mapping)) {
        if (actKey !== listeningAction && code === newCode) {
          conflictingAction = actKey as GameAction;
          break;
        }
      }

      if (conflictingAction) {
        sound.playMistake();
        setDuplicateWarning({
          newKey: newCode,
          conflictingAction,
          targetAction: listeningAction,
        });
        setListeningAction(null);
      } else {
        sound.playKeyPress();
        const updated = { ...mapping, [listeningAction]: newCode };
        setMapping(updated);
        onSaveMapping(updated);
        setListeningAction(null);
      }
    };

    window.addEventListener('keydown', handleRebindKeyDown);
    return () => window.removeEventListener('keydown', handleRebindKeyDown);
  }, [listeningAction, mapping, onSaveMapping]);

  // Confirm replacing duplicate key
  const handleConfirmSwap = () => {
    if (!duplicateWarning) return;
    const { newKey, conflictingAction, targetAction } = duplicateWarning;

    // Swap the keys
    const previousTargetKey = mapping[targetAction];
    const updated: KeyMapping = {
      ...mapping,
      [targetAction]: newKey,
      [conflictingAction]: previousTargetKey, // Swap
    };

    sound.playKeyPress();
    setMapping(updated);
    onSaveMapping(updated);
    setDuplicateWarning(null);
  };

  const handleResetToDefault = () => {
    sound.playKeyPress();
    const defaults = { ...DEFAULT_KEY_MAPPING };
    setMapping(defaults);
    onSaveMapping(defaults);
    setDuplicateWarning(null);
  };

  const actionsList = Object.keys(ACTION_DESCRIPTIONS) as GameAction[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-slate-100">
                KEYBOARD CONTROLS CONFIGURATION
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Customize every console action to match your playstyle. No typing words required!
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

        {/* Duplicate Warning Dialog */}
        {duplicateWarning && (
          <div className="mb-4 p-4 rounded-xl bg-amber-950/60 border border-amber-500/60 flex flex-col gap-2 animate-fade-in text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Key &quot;{getKeyDisplayLabel(duplicateWarning.newKey)}&quot; is already bound to{' '}
                {duplicateWarning.conflictingAction}!
              </span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Do you want to swap the keys between these two actions?
            </p>
            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmSwap}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 font-bold shadow-sm"
              >
                SWAP & ASSIGN KEY
              </button>
            </div>
          </div>
        )}

        {/* Rebinding Status Notice */}
        {listeningAction && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/80 text-cyan-300 text-xs font-mono text-center animate-pulse flex items-center justify-center gap-2">
            <span>
              PRESS ANY KEY FOR <strong>{listeningAction}</strong> (OR ESCAPE TO CANCEL)...
            </span>
          </div>
        )}

        {/* Action Mappings List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {actionsList.map((action) => {
              const code = mapping[action];
              const displayKey = getKeyDisplayLabel(code);
              const info = ACTION_DESCRIPTIONS[action];
              const isListening = listeningAction === action;

              return (
                <div
                  key={action}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isListening
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col max-w-[65%]">
                    <span className="font-bold text-slate-200">{info.label}</span>
                    <span className="text-[10px] text-slate-500 font-sans truncate">
                      {info.desc}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playKeyPress();
                      setListeningAction(action);
                      setDuplicateWarning(null);
                    }}
                    className={`min-w-[70px] py-1.5 px-3 rounded-lg font-bold text-center transition-all ${
                      isListening
                        ? 'bg-cyan-500 text-black shadow-md animate-bounce'
                        : 'bg-slate-900 border border-slate-700 text-cyan-400 hover:border-cyan-500 hover:text-white'
                    }`}
                  >
                    {isListening ? '...' : displayKey}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TO DEFAULTS</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-sm"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
