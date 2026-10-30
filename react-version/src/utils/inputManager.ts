import { GameAction, KeyMapping } from '../types/game';

export const DEFAULT_KEY_MAPPING: KeyMapping = {
  UP: 'KeyW',
  DOWN: 'KeyS',
  LEFT: 'KeyA',
  RIGHT: 'KeyD',
  JUMP: 'Space',
  ATTACK: 'KeyJ',
  SPECIAL: 'KeyK',
  DASH: 'KeyL',
  L1: 'KeyQ',
  R1: 'KeyE',
  SELECT: 'Tab',
  START: 'Enter',
};

// Friendly display labels for keys
export function getKeyDisplayLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'Space') return 'SPACE';
  if (code === 'Enter') return 'ENTER';
  if (code === 'Tab') return 'TAB';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'SHIFT';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'CTRL';
  if (code === 'AltLeft' || code === 'AltRight') return 'ALT';
  if (code === 'ArrowUp') return 'UP ARROW';
  if (code === 'ArrowDown') return 'DOWN ARROW';
  if (code === 'ArrowLeft') return 'LEFT ARROW';
  if (code === 'ArrowRight') return 'RIGHT ARROW';
  if (code === 'Escape') return 'ESC';
  return code;
}

export interface InputSnapshot {
  axisX: number; // -1 to 1
  axisY: number; // -1 to 1
  held: Record<GameAction, boolean>;
  justPressed: Record<GameAction, boolean>;
}

class UnifiedInputManager {
  private keyMapping: KeyMapping = { ...DEFAULT_KEY_MAPPING };
  
  // Current input state
  private activeKeys = new Set<string>();
  private heldActions: Record<GameAction, boolean> = {
    UP: false,
    DOWN: false,
    LEFT: false,
    RIGHT: false,
    JUMP: false,
    ATTACK: false,
    SPECIAL: false,
    DASH: false,
    L1: false,
    R1: false,
    SELECT: false,
    START: false,
  };

  private justPressedActions: Record<GameAction, boolean> = {
    UP: false,
    DOWN: false,
    LEFT: false,
    RIGHT: false,
    JUMP: false,
    ATTACK: false,
    SPECIAL: false,
    DASH: false,
    L1: false,
    R1: false,
    SELECT: false,
    START: false,
  };

  // Virtual Joystick state
  private joystickVector = { x: 0, y: 0 };
  private touchHeldActions: Partial<Record<GameAction, boolean>> = {};

  // Touch pointer tracking
  private activePointers = new Map<number, { type: 'joystick' | 'button'; action?: GameAction }>();

  private isEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      window.addEventListener('blur', this.handleBlur);
    }
  }

  public setMapping(mapping: KeyMapping) {
    this.keyMapping = { ...mapping };
  }

  public getMapping(): KeyMapping {
    return { ...this.keyMapping };
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) this.clearAll();
  }

  // --- Virtual Joystick input ---
  public setJoystickVector(x: number, y: number, sensitivity = 1.0) {
    const clampedX = Math.max(-1, Math.min(1, x * sensitivity));
    const clampedY = Math.max(-1, Math.min(1, y * sensitivity));
    this.joystickVector = { x: clampedX, y: clampedY };

    // Update directional actions
    const threshold = 0.35;
    this.touchHeldActions.LEFT = clampedX < -threshold;
    this.touchHeldActions.RIGHT = clampedX > threshold;
    this.touchHeldActions.UP = clampedY < -threshold;
    this.touchHeldActions.DOWN = clampedY > threshold;
  }

  // --- Virtual Touch Buttons input ---
  public setTouchAction(action: GameAction, isDown: boolean) {
    if (!this.isEnabled) return;
    
    if (isDown && !this.touchHeldActions[action]) {
      this.justPressedActions[action] = true;
    }
    this.touchHeldActions[action] = isDown;
  }

  // --- Keyboard handlers ---
  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.isEnabled) return;

    // Ignore typing in input fields
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    const code = e.code;
    this.activeKeys.add(code);

    // Find mapped actions (support alternate arrow keys as well)
    for (const [actionKey, mappedCode] of Object.entries(this.keyMapping)) {
      const action = actionKey as GameAction;
      const isMapped =
        code === mappedCode ||
        (action === 'UP' && code === 'ArrowUp') ||
        (action === 'DOWN' && code === 'ArrowDown') ||
        (action === 'LEFT' && code === 'ArrowLeft') ||
        (action === 'RIGHT' && code === 'ArrowRight');

      if (isMapped) {
        if (!this.heldActions[action]) {
          this.justPressedActions[action] = true;
        }
        this.heldActions[action] = true;

        // Prevent browser scrolling on Space/Arrow keys/Tab during gameplay
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(code)) {
          e.preventDefault();
        }
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const code = e.code;
    this.activeKeys.delete(code);

    for (const [actionKey, mappedCode] of Object.entries(this.keyMapping)) {
      const action = actionKey as GameAction;
      const isMapped =
        code === mappedCode ||
        (action === 'UP' && code === 'ArrowUp') ||
        (action === 'DOWN' && code === 'ArrowDown') ||
        (action === 'LEFT' && code === 'ArrowLeft') ||
        (action === 'RIGHT' && code === 'ArrowRight');

      if (isMapped) {
        this.heldActions[action] = false;
      }
    }
  };

  private handleBlur = () => {
    this.clearAll();
  };

  public clearAll() {
    this.activeKeys.clear();
    this.joystickVector = { x: 0, y: 0 };
    this.touchHeldActions = {};
    for (const key of Object.keys(this.heldActions) as GameAction[]) {
      this.heldActions[key] = false;
      this.justPressedActions[key] = false;
    }
    this.activePointers.clear();
  }

  // Poll snapshot for game loop
  public getSnapshot(): InputSnapshot {
    // Combine keyboard + virtual joystick directional axes
    let axisX = this.joystickVector.x;
    let axisY = this.joystickVector.y;

    const isLeft = this.heldActions.LEFT || this.touchHeldActions.LEFT;
    const isRight = this.heldActions.RIGHT || this.touchHeldActions.RIGHT;
    const isUp = this.heldActions.UP || this.touchHeldActions.UP;
    const isDown = this.heldActions.DOWN || this.touchHeldActions.DOWN;

    if (isLeft && !isRight) axisX = -1;
    else if (isRight && !isLeft) axisX = 1;

    if (isUp && !isDown) axisY = -1;
    else if (isDown && !isUp) axisY = 1;

    // Combine actions
    const held: Record<GameAction, boolean> = {
      UP: Boolean(isUp),
      DOWN: Boolean(isDown),
      LEFT: Boolean(isLeft),
      RIGHT: Boolean(isRight),
      JUMP: Boolean(this.heldActions.JUMP || this.touchHeldActions.JUMP),
      ATTACK: Boolean(this.heldActions.ATTACK || this.touchHeldActions.ATTACK),
      SPECIAL: Boolean(this.heldActions.SPECIAL || this.touchHeldActions.SPECIAL),
      DASH: Boolean(this.heldActions.DASH || this.touchHeldActions.DASH),
      L1: Boolean(this.heldActions.L1 || this.touchHeldActions.L1),
      R1: Boolean(this.heldActions.R1 || this.touchHeldActions.R1),
      SELECT: Boolean(this.heldActions.SELECT || this.touchHeldActions.SELECT),
      START: Boolean(this.heldActions.START || this.touchHeldActions.START),
    };

    const justPressed = { ...this.justPressedActions };
    // Clear justPressed for next tick
    for (const key of Object.keys(this.justPressedActions) as GameAction[]) {
      this.justPressedActions[key] = false;
    }

    return {
      axisX,
      axisY,
      held,
      justPressed,
    };
  }
}

export const inputManager = new UnifiedInputManager();
