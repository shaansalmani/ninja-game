import React, { useRef, useState, useCallback } from 'react';
import { GameAction, ControllerSettings } from '../types/game';
import { inputManager } from '../utils/inputManager';
import {
  Crosshair,
  Zap,
  Wind,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Pause,
  Shirt,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface VirtualControllerProps {
  settings: ControllerSettings;
  activeWeaponName?: string;
  activeSpecialName?: string;
  onSelectAction?: () => void;
  onStartAction?: () => void;
  onCyclePower?: (direction: 'next' | 'prev') => void;
}

export const VirtualController: React.FC<VirtualControllerProps> = ({
  settings,
  activeWeaponName = 'GUN',
  activeSpecialName = 'TRIPLE BURST',
  onSelectAction,
  onStartAction,
  onCyclePower,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickPointerIdRef = useRef<number | null>(null);

  // Joystick visual state
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isStickActive, setIsStickActive] = useState(false);

  // Button pressed states for visual feedback
  const [pressedButtons, setPressedButtons] = useState<Partial<Record<GameAction, boolean>>>({});

  const maxRadius = settings.buttonSize === 'small' ? 36 : settings.buttonSize === 'large' ? 52 : 44;

  // Joystick Pointer Handlers
  const handleJoystickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickPointerIdRef.current !== null) return;

    joystickPointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsStickActive(true);
    updateJoystickPos(e.clientX, e.clientY);
  };

  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateJoystickPos(e.clientX, e.clientY);
  };

  const handleJoystickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickPointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    joystickPointerIdRef.current = null;
    setIsStickActive(false);
    setStickPos({ x: 0, y: 0 });
    inputManager.setJoystickVector(0, 0);
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    let finalX = dx;
    let finalY = dy;

    if (dist > maxRadius) {
      finalX = (dx / dist) * maxRadius;
      finalY = (dy / dist) * maxRadius;
    }

    setStickPos({ x: finalX, y: finalY });

    // Send normalized vector (-1 to 1) to input manager
    const normX = finalX / maxRadius;
    const normY = finalY / maxRadius;
    inputManager.setJoystickVector(normX, normY, settings.joystickSensitivity);
  };

  // Button Pointer Handlers (Multi-Touch & Mouse Click Support)
  const handleButtonDown = useCallback(
    (action: GameAction, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } catch (err) {
        // ignore fallback for older browsers
      }

      setPressedButtons((prev) => ({ ...prev, [action]: true }));
      inputManager.setTouchAction(action, true);

      // Trigger high-level callbacks
      if (action === 'L1') onCyclePower?.('prev');
      if (action === 'R1') onCyclePower?.('next');
      if (action === 'SELECT') onSelectAction?.();
      if (action === 'START') onStartAction?.();
    },
    [onCyclePower, onSelectAction, onStartAction]
  );

  const handleButtonUp = useCallback(
    (action: GameAction, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setPressedButtons((prev) => ({ ...prev, [action]: false }));
      inputManager.setTouchAction(action, false);
    },
    []
  );

  if (!settings.enabled || settings.visibility === 'hidden') {
    return null;
  }

  const opacityVal = settings.opacity ?? settings.buttonOpacity ?? 0.9;

  return (
    <div
      className="w-full max-w-6xl mx-auto px-2 sm:px-6 select-none touch-none z-30 transition-opacity duration-200 pointer-events-auto"
      style={{ opacity: opacityVal }}
    >
      {/* 1. TOP UTILITY STRIP (L1, INVENTORY, PAUSE / SETTINGS, R1) */}
      <div className="flex items-center justify-between pb-2 px-2 sm:px-6">
        <button
          onPointerDown={(e) => handleButtonDown('L1', e)}
          onPointerUp={(e) => handleButtonUp('L1', e)}
          onPointerCancel={(e) => handleButtonUp('L1', e)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
            pressedButtons.L1
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
          }`}
          aria-label="L1 Previous Power"
          title="Previous Special Power (Q key)"
        >
          <span>L1</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">PREV</span>
        </button>

        {/* Center Utilities: Inventory & Pause */}
        <div className="flex items-center gap-2">
          {/* Quick Inventory Button */}
          <button
            onPointerDown={(e) => handleButtonDown('SELECT', e)}
            onPointerUp={(e) => handleButtonUp('SELECT', e)}
            onPointerCancel={(e) => handleButtonUp('SELECT', e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all active:scale-95 cursor-pointer shadow-md ${
              pressedButtons.SELECT
                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : 'bg-slate-950/90 text-amber-300 border-amber-500/40 hover:bg-amber-950/40 hover:border-amber-400'
            }`}
            aria-label="Open Inventory / Armory"
            title="Open Armory (Tab key)"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>INVENTORY</span>
          </button>

          {/* Pause / Settings Button */}
          <button
            onPointerDown={(e) => handleButtonDown('START', e)}
            onPointerUp={(e) => handleButtonUp('START', e)}
            onPointerCancel={(e) => handleButtonUp('START', e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all active:scale-95 cursor-pointer shadow-md ${
              pressedButtons.START
                ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'bg-slate-950/90 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Pause / Menu"
            title="Pause / Settings (Enter key)"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>PAUSE</span>
          </button>
        </div>

        <button
          onPointerDown={(e) => handleButtonDown('R1', e)}
          onPointerUp={(e) => handleButtonUp('R1', e)}
          onPointerCancel={(e) => handleButtonUp('R1', e)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
            pressedButtons.R1
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
          }`}
          aria-label="R1 Next Power"
          title="Next Special Power (E key)"
        >
          <span className="text-[10px] text-slate-400 hidden sm:inline">NEXT</span>
          <span>R1</span>
        </button>
      </div>

      {/* 2. MAIN DUAL CONTROLLER ZONE */}
      <div className="flex items-center justify-between pb-2 px-1 sm:px-4 gap-2">
        {/* ========================================================= */}
        {/* LEFT: ANALOG JOYSTICK + D-PAD DIRECTION BUTTONS (HYBRID)  */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Circular Analog Stick with Multi-Touch Pointer Capture */}
          <div className="relative flex flex-col items-center">
            <div
              ref={joystickBaseRef}
              onPointerDown={handleJoystickDown}
              onPointerMove={handleJoystickMove}
              onPointerUp={handleJoystickUp}
              onPointerCancel={handleJoystickUp}
              className={`relative rounded-full border-2 cursor-pointer flex items-center justify-center transition-shadow ${
                isStickActive
                  ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] bg-cyan-950/40'
                  : 'border-slate-700/80 bg-slate-950/80 shadow-xl'
              }`}
              style={{
                width: maxRadius * 2 + 20,
                height: maxRadius * 2 + 20,
              }}
              title="Drag analog stick to move and climb"
            >
              {/* Directional Cardinal Crosshairs */}
              <div className="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-center">
                <div className="w-full h-[1px] bg-cyan-400" />
                <div className="absolute h-full w-[1px] bg-cyan-400" />
              </div>

              {/* Inner Movable Thumbstick Ball */}
              <div
                className={`rounded-full shadow-lg transition-transform pointer-events-none border-2 flex items-center justify-center ${
                  isStickActive
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-105'
                    : 'bg-gradient-to-br from-slate-700 to-slate-900 border-cyan-500/50'
                }`}
                style={{
                  width: maxRadius * 0.85,
                  height: maxRadius * 0.85,
                  transform: `translate3d(${stickPos.x}px, ${stickPos.y}px, 0)`,
                }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400/50 pointer-events-none" />
              </div>
            </div>

            <span className="mt-0.5 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              ANALOG
            </span>
          </div>

          {/* Explicit Directional Buttons (Left, Right, Climb Up, Climb Down) for 100% reliable mouse clicking */}
          <div className="grid grid-cols-3 gap-1 w-28 sm:w-32">
            <div />
            {/* CLIMB UP */}
            <button
              onPointerDown={(e) => handleButtonDown('UP', e)}
              onPointerUp={(e) => handleButtonUp('UP', e)}
              onPointerCancel={(e) => handleButtonUp('UP', e)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                pressedButtons.UP
                  ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/90 text-cyan-300 border-slate-700 hover:border-cyan-500 hover:bg-slate-800'
              }`}
              title="Climb Up (W key)"
            >
              <ChevronUp className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[8px] font-mono font-black -mt-1">CLIMB</span>
            </button>
            <div />

            {/* MOVE LEFT */}
            <button
              onPointerDown={(e) => handleButtonDown('LEFT', e)}
              onPointerUp={(e) => handleButtonUp('LEFT', e)}
              onPointerCancel={(e) => handleButtonUp('LEFT', e)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                pressedButtons.LEFT
                  ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/90 text-cyan-300 border-slate-700 hover:border-cyan-500 hover:bg-slate-800'
              }`}
              title="Move Left (A key)"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[8px] font-mono font-black -mt-0.5">LEFT</span>
            </button>

            {/* CLIMB DOWN */}
            <button
              onPointerDown={(e) => handleButtonDown('DOWN', e)}
              onPointerUp={(e) => handleButtonUp('DOWN', e)}
              onPointerCancel={(e) => handleButtonUp('DOWN', e)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                pressedButtons.DOWN
                  ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/90 text-cyan-300 border-slate-700 hover:border-cyan-500 hover:bg-slate-800'
              }`}
              title="Climb Down / Descend (S key)"
            >
              <ChevronDown className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[8px] font-mono font-black -mt-1">DOWN</span>
            </button>

            {/* MOVE RIGHT */}
            <button
              onPointerDown={(e) => handleButtonDown('RIGHT', e)}
              onPointerUp={(e) => handleButtonUp('RIGHT', e)}
              onPointerCancel={(e) => handleButtonUp('RIGHT', e)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
                pressedButtons.RIGHT
                  ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/90 text-cyan-300 border-slate-700 hover:border-cyan-500 hover:bg-slate-800'
              }`}
              title="Move Right (D key)"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[8px] font-mono font-black -mt-0.5">RIGHT</span>
            </button>
          </div>
        </div>

        {/* Center Weapon Status Display */}
        <div className="hidden lg:flex flex-col items-center text-center px-3 font-mono">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">
            ARMED WEAPON
          </span>
          <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            {activeWeaponName}
          </span>
          {activeSpecialName && (
            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full mt-1">
              {activeSpecialName}
            </span>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT: ACTION BUTTONS (SHOOT, JUMP, SPECIAL, DASH)        */}
        {/* ========================================================= */}
        <div className="relative flex items-center justify-center">
          <div
            className="relative flex items-center justify-center"
            style={{
              width: maxRadius * 2 + 50,
              height: maxRadius * 2 + 50,
            }}
          >
            {/* 1. TOP BUTTON: SPECIAL GUN ART (K key) */}
            <button
              onPointerDown={(e) => handleButtonDown('SPECIAL', e)}
              onPointerUp={(e) => handleButtonUp('SPECIAL', e)}
              onPointerCancel={(e) => handleButtonUp('SPECIAL', e)}
              className={`absolute top-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 cursor-pointer ${
                pressedButtons.SPECIAL
                  ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                  : 'bg-slate-900/90 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(251,191,36,0.25)] hover:border-amber-400 hover:bg-slate-800'
              }`}
              title="Special Gun Ability (K key)"
              aria-label="Special Gun Ability"
            >
              <Zap className="w-5 h-5" />
              <span className="text-[8px] font-mono font-black mt-0.5">SPECIAL</span>
            </button>

            {/* 2. LEFT BUTTON: PRIMARY SHOOT (J key / Mouse Click) */}
            <button
              onPointerDown={(e) => handleButtonDown('ATTACK', e)}
              onPointerUp={(e) => handleButtonUp('ATTACK', e)}
              onPointerCancel={(e) => handleButtonUp('ATTACK', e)}
              className={`absolute left-0 w-13 h-13 sm:w-15 sm:h-15 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 cursor-pointer ${
                pressedButtons.ATTACK
                  ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_22px_rgba(244,63,94,0.9)]'
                  : 'bg-slate-900/95 text-rose-400 border-rose-500/70 shadow-[0_0_14px_rgba(244,63,94,0.3)] hover:border-rose-400 hover:bg-slate-800'
              }`}
              title="Shoot Gun (J key)"
              aria-label="Shoot Gun"
            >
              <Crosshair className="w-6 h-6" />
              <span className="text-[9px] font-mono font-black mt-0.5">SHOOT</span>
            </button>

            {/* 3. RIGHT BUTTON: DASH / DODGE (L key) */}
            <button
              onPointerDown={(e) => handleButtonDown('DASH', e)}
              onPointerUp={(e) => handleButtonUp('DASH', e)}
              onPointerCancel={(e) => handleButtonUp('DASH', e)}
              className={`absolute right-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 cursor-pointer ${
                pressedButtons.DASH
                  ? 'bg-purple-500 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.8)]'
                  : 'bg-slate-900/90 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)] hover:border-purple-400 hover:bg-slate-800'
              }`}
              title="Ninja Dash / Dodge (L key)"
              aria-label="Dash / Dodge"
            >
              <Wind className="w-5 h-5" />
              <span className="text-[8px] font-mono font-black mt-0.5">DASH</span>
            </button>

            {/* 4. BOTTOM BUTTON: JUMP (Spacebar) */}
            <button
              onPointerDown={(e) => handleButtonDown('JUMP', e)}
              onPointerUp={(e) => handleButtonUp('JUMP', e)}
              onPointerCancel={(e) => handleButtonUp('JUMP', e)}
              className={`absolute bottom-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 cursor-pointer ${
                pressedButtons.JUMP
                  ? 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                  : 'bg-slate-900/90 text-emerald-400 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:border-emerald-400 hover:bg-slate-800'
              }`}
              title="Jump (Spacebar)"
              aria-label="Jump"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[8px] font-mono font-black mt-0.5">JUMP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
