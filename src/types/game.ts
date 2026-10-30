export type GameMode = 'MENU' | 'STORY' | 'RACE' | 'SHOP' | 'INVENTORY';

export type GameState = 'START_SCREEN' | 'COUNTDOWN' | 'RACING' | 'FINISHED' | 'PAUSED';

export type StoryPhase = 'COMBAT' | 'ADVENTURE' | 'BOSS' | 'GAME_OVER' | 'VICTORY';

export type WeaponType = 'sword' | 'gun' | 'bow';

export type ElementalSkin = 'lightning' | 'fire' | 'water' | 'diamond' | 'rock';

export type DifficultyMode = 'casual' | 'normal' | 'hardcore' | 'master';

// Unified Controller Actions
export type GameAction =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'JUMP'
  | 'ATTACK'
  | 'SPECIAL'
  | 'DASH'
  | 'L1'
  | 'R1'
  | 'SELECT'
  | 'START';

export type KeyMapping = Record<GameAction, string>;

export type MovementCommand = 'LEFT' | 'RIGHT' | 'JUMP' | 'CLIMB' | 'DOWN' | 'OPEN';

export interface ControllerSettings {
  enabled: boolean;
  visibility: 'always' | 'touch_only' | 'hidden';
  buttonSize: 'small' | 'medium' | 'large';
  joystickSensitivity: number; // 0.5 to 2.0
  opacity: number; // 0.3 to 1.0
  buttonOpacity?: number;
}

export type SwordPower = 'HIT' | 'SPIN' | 'SKY' | 'PULL' | 'RAIN';
export type GunPower = 'FIRE' | 'TRIPLE' | 'RAPID' | 'LASER' | 'STORM';
export type BowPower = 'ARROW' | 'AIR' | 'VOLLEY' | 'PIERCE' | 'GIANT';

export type WeaponPower = SwordPower | GunPower | BowPower;

export interface PowerConfig {
  id: WeaponPower;
  name: string;
  command: string; // Action display label
  description: string;
  cooldown: number; // in seconds
  damage: number;
  unlocked: boolean;
  price?: number;
}

export interface Enemy {
  id: string;
  type: 'sword' | 'hammer' | 'archer' | 'cannon' | 'drone' | 'boss' | 'recovery';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  maxHealth: number;
  health: number;
  damage: number;
  attackCooldown: number;
  attackTimer: number;
  state: 'idle' | 'walking' | 'attacking' | 'knockdown' | 'dying';
  knockdownTimer?: number;
  hasKnockdownHappened?: boolean; // For hammer enemy 50% health behavior
  
  targetX?: number;
  targetY?: number;
  laserCharging?: boolean;
  laserProgress?: number;
  aimTimer?: number;
}

export interface BossState {
  name: string;
  maxHealth: number;
  health: number;
  x: number;
  y: number;
  width: number;
  height: number;
  heartX: number;
  heartY: number;
  heartRadius: number;
  heartPulsing: number;
  state: 'rising' | 'active' | 'eye_laser' | 'shockwave' | 'defeated';
  laserBeamX: number;
  laserDirection: 'left' | 'right';
  laserSweeping: boolean;
  attackTimer: number;
  entranceProgress: number;
}

export interface Projectile {
  id: string;
  source: 'player' | 'enemy' | 'boss';
  type: 'bullet' | 'laser' | 'arrow' | 'giant_arrow' | 'piercing_arrow' | 'cannonball' | 'energy_strike' | 'falling_sword';
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  color: string;
  piercing?: boolean;
  hitEnemies?: string[];
  targetX?: number;
  targetY?: number;
  lifespan: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  type?: 'spark' | 'smoke' | 'fire' | 'lightning' | 'crystal' | 'water' | 'coin' | 'dust' | 'slash_trail' | 'dash_ghost';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
}

export interface TreasureChest {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wooden' | 'iron' | 'silver' | 'purple' | 'golden';
  state: 'closed' | 'opening' | 'open';
  weaponReward: WeaponType;
  openAnimTimer: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'floating' | 'wooden' | 'ladder' | 'stairs' | 'bridge';
}

export interface HealthPickup {
  x: number;
  y: number;
  collected: boolean;
  healAmount: number;
}

export interface Racer {
  id: string;
  name: string;
  role: 'human' | 'ai';
  color: string;
  glowColor: string;
  accentColor: string;
  badgeClass: string;
  laneIndex: number;
  distance: number;
  currentSpeed: number;
  targetSpeed: number;
  baseSpeed: number;
  state: 'idle' | 'running' | 'stumble' | 'boost' | 'victory' | 'defeated' | 'jump';
  finishTime: number | null;
  rank: number;
  frameIndex: number;
  frameTimer: number;
  dustTimer: number;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  completedWords: number;
  currentStreak: number;
  maxStreak: number;
  raceTime: number;
  playerRank: number;
  instantCpm: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  bgMusicEnabled: boolean;
  soundVolume: number; // 0 to 1
  difficulty: DifficultyMode;
  countdownEnabled: boolean;
  language: 'English';
  controllerSettings: ControllerSettings;
  keyMapping: KeyMapping;
}

export type GunSkinId = 'plasma_cyan' | 'crimson_fury' | 'neon_emerald' | 'golden_viper' | 'void_purple';

export type OutfitId = 'tactical_stealth' | 'cyber_spec_ops' | 'crimson_ronin' | 'shadow_wraith' | 'golden_warlord';

export type CharacterModelId = 'myraa_hunter' | 'shadow_commando' | 'kunoichi_sniper';

export interface PlayerProgress {
  coins: number;
  highestLevelUnlocked: number;
  storyLevel: number;
  highestStoryCompleted: number;
  equippedWeapon: WeaponType;
  equippedSkin: ElementalSkin;
  unlockedSkins: ElementalSkin[];
  equippedGunSkin: GunSkinId;
  unlockedGunSkins: GunSkinId[];
  equippedOutfit: OutfitId;
  unlockedOutfits: OutfitId[];
  characterModel: CharacterModelId;
  unlockedCharacters: CharacterModelId[];
  unlockedWeapons: WeaponType[];
  unlockedPowers: string[];
  temporaryWeapon: WeaponType | null;
  temporaryWeaponExpiresAt: number | null;
  
  // Race stats
  bestWpm: number;
  bestAccuracy: number;
  totalWins: number;
  totalRaces: number;
  totalWordsTyped: number;
}
