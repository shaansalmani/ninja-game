import React, { useRef, useEffect } from 'react';
import {
  WeaponType,
  ElementalSkin,
  GunSkinId,
  OutfitId,
  StoryPhase,
  Enemy,
  BossState,
  Projectile,
  Particle,
  FloatingText,
  TreasureChest,
  Platform,
  HealthPickup,
  PowerConfig,
} from '../types/game';
import {
  ELEMENTAL_SKIN_DATA,
  GUN_SKIN_DATA,
  OUTFIT_DATA,
  GUN_POWERS,
  BOW_POWERS,
} from '../utils/combatConfig';
import { inputManager } from '../utils/inputManager';
import { sound } from '../utils/audio';

interface StoryCanvasProps {
  level: number;
  phase: StoryPhase;
  playerHealth: number;
  playerMaxHealth: number;
  equippedWeapon: WeaponType;
  equippedSkin: ElementalSkin;
  equippedGunSkin?: GunSkinId;
  equippedOutfit?: OutfitId;
  activeSpecialIndex: number;
  onPlayerDamage: (dmg: number) => void;
  onPlayerHeal: (amt: number) => void;
  onAddCoins: (amt: number) => void;
  onWaveComplete: () => void;
  onLevelComplete: () => void;
  onBossDefeated: () => void;
  onOpenChest: (weapon: WeaponType) => void;
  setCanOpenChest: (can: boolean) => void;
  setCanClimb: (can: boolean) => void;
  setBossStateForHUD: (boss: BossState | null) => void;
}

const BG_FOREST_URL = '/src/assets/images/fantasy_forest_mountain_1793398627705.jpg';
const BG_BOSS_URL = '/src/assets/images/fantasy_boss_arena_1793398628093.jpg';

export const StoryCanvas: React.FC<StoryCanvasProps> = ({
  level,
  phase,
  playerHealth,
  playerMaxHealth,
  equippedWeapon,
  equippedSkin,
  equippedGunSkin = 'plasma_cyan',
  equippedOutfit = 'tactical_stealth',
  activeSpecialIndex,
  onPlayerDamage,
  onPlayerHeal,
  onAddCoins,
  onWaveComplete,
  onLevelComplete,
  onBossDefeated,
  onOpenChest,
  setCanOpenChest,
  setCanClimb,
  setBossStateForHUD,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background assets
  const forestBgRef = useRef<HTMLImageElement | null>(null);
  const bossBgRef = useRef<HTMLImageElement | null>(null);

  // Entities
  const playerRef = useRef({
    x: 180,
    y: 380,
    width: 32,
    height: 48,
    vx: 0,
    vy: 0,
    facing: 'right' as 'left' | 'right',
    grounded: true,
    climbing: false,
    activeLadderId: null as number | null,
    attackTimer: 0,
    attackType: null as string | null,
    recoilTimer: 0,
    muzzleFlashTimer: 0,
    dashTimer: 0,
    invulnerableTimer: 0,
    animState: 'idle' as 'idle' | 'running' | 'jumping' | 'climbing' | 'attacking',
    animTimer: 0,
    comboIndex: 0,
  });

  const cameraRef = useRef({ x: 0, y: 0 });
  const platformsRef = useRef<Platform[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const chestRef = useRef<TreasureChest | null>(null);
  const healthPickupRef = useRef<HealthPickup | null>(null);
  const bossRef = useRef<BossState | null>(null);

  const waveEnemiesSpawnedRef = useRef(0);
  const waveEnemiesTotalRef = useRef(10);
  const waveTimerRef = useRef(0);
  const recoveryEnemyTimerRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const screenShakeRef = useRef(0);

  // Load Background Images
  useEffect(() => {
    const img1 = new Image();
    img1.src = BG_FOREST_URL;
    img1.onload = () => { forestBgRef.current = img1; };

    const img2 = new Image();
    img2.src = BG_BOSS_URL;
    img2.onload = () => { bossBgRef.current = img2; };
  }, []);

  // Initialize Level World with UNIQUE HANDCRAFTED PATHS for every transition
  useEffect(() => {
    const isBossLevel = level === 6;
    const isAdventure = phase === 'ADVENTURE';

    // Reset player position
    playerRef.current.x = 180;
    playerRef.current.y = 380;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.grounded = true;
    playerRef.current.climbing = false;
    playerRef.current.dashTimer = 0;
    playerRef.current.recoilTimer = 0;
    playerRef.current.muzzleFlashTimer = 0;
    cameraRef.current.x = 0;

    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    enemiesRef.current = [];

    if (isAdventure) {
      // =========================================================================
      // REQUIREMENT 6: SEPARATE, UNIQUE TRANSITION PATHS FOR EACH LEVEL TRANSITION
      // =========================================================================
      let adventurePlatforms: Platform[] = [];
      let chestX = 1380;
      let chestY = 240;

      if (level === 1) {
        // --- LEVEL 1 -> 2: EASY TRANSITION ---
        // Wide green hills, low stepping stones, short ladder, wide floating bridge
        adventurePlatforms = [
          { x: 0, y: 440, width: 480, height: 120, type: 'ground' },
          { x: 530, y: 390, width: 180, height: 30, type: 'wooden' },
          { x: 740, y: 330, width: 22, height: 110, type: 'ladder' }, // Short 110px ladder
          { x: 720, y: 330, width: 200, height: 35, type: 'floating' },
          { x: 970, y: 320, width: 220, height: 35, type: 'floating' },
          { x: 1240, y: 360, width: 240, height: 30, type: 'wooden' }, // Chest location
          { x: 1530, y: 400, width: 180, height: 30, type: 'wooden' },
          { x: 1760, y: 440, width: 700, height: 120, type: 'ground' },
        ];
        chestX = 1340;
        chestY = 320;
      } else if (level === 2) {
        // --- LEVEL 2 -> 3: SLIGHTLY HARDER ---
        // Terraced stone platforms, sheer cliff with vertical ladder, dual floating islands with medium gap
        adventurePlatforms = [
          { x: 0, y: 440, width: 380, height: 120, type: 'ground' },
          { x: 420, y: 380, width: 150, height: 30, type: 'floating' },
          { x: 610, y: 320, width: 150, height: 30, type: 'floating' },
          { x: 810, y: 170, width: 24, height: 150, type: 'ladder' }, // 150px ladder
          { x: 790, y: 170, width: 210, height: 30, type: 'floating' },
          { x: 1050, y: 220, width: 160, height: 30, type: 'wooden' },
          { x: 1260, y: 270, width: 170, height: 30, type: 'floating' }, // Chest location
          { x: 1480, y: 350, width: 180, height: 30, type: 'wooden' },
          { x: 1720, y: 440, width: 700, height: 120, type: 'ground' },
        ];
        chestX = 1320;
        chestY = 230;
      } else if (level === 3) {
        // --- LEVEL 3 -> 4: MEDIUM DIFFICULTY ---
        // Floating rocky islands over mist, staggered ladders, suspension bridge
        adventurePlatforms = [
          { x: 0, y: 440, width: 320, height: 120, type: 'ground' },
          { x: 370, y: 380, width: 130, height: 28, type: 'floating' },
          { x: 550, y: 320, width: 140, height: 28, type: 'floating' },
          { x: 730, y: 180, width: 24, height: 140, type: 'ladder' }, // Ascent ladder
          { x: 710, y: 180, width: 180, height: 30, type: 'floating' },
          { x: 940, y: 220, width: 170, height: 25, type: 'wooden' },
          { x: 1160, y: 230, width: 24, height: 110, type: 'ladder' }, // Descent ladder
          { x: 1140, y: 340, width: 210, height: 30, type: 'floating' }, // Chest location
          { x: 1410, y: 380, width: 160, height: 28, type: 'wooden' },
          { x: 1640, y: 440, width: 700, height: 120, type: 'ground' },
        ];
        chestX = 1220;
        chestY = 300;
      } else if (level === 4) {
        // --- LEVEL 4 -> 5: HARD DIFFICULTY ---
        // Narrow crags, tall cliff ascent, precision wind jumps requiring dash
        adventurePlatforms = [
          { x: 0, y: 440, width: 260, height: 120, type: 'ground' },
          { x: 310, y: 370, width: 120, height: 28, type: 'floating' },
          { x: 480, y: 300, width: 120, height: 28, type: 'floating' },
          { x: 650, y: 130, width: 24, height: 170, type: 'ladder' }, // Tall 170px ladder
          { x: 630, y: 130, width: 170, height: 30, type: 'floating' },
          { x: 860, y: 180, width: 130, height: 28, type: 'wooden' },
          { x: 1050, y: 240, width: 140, height: 28, type: 'floating' }, // Chest location
          { x: 1250, y: 300, width: 130, height: 28, type: 'wooden' },
          { x: 1440, y: 370, width: 140, height: 28, type: 'floating' },
          { x: 1650, y: 440, width: 700, height: 120, type: 'ground' },
        ];
        chestX = 1100;
        chestY = 200;
      } else {
        // --- LEVEL 5 -> 6: VERY HARD (TITAN SUMMIT ASCENT) ---
        // Steep mountain peak ascent, dual ladders, floating crystal pillars
        adventurePlatforms = [
          { x: 0, y: 440, width: 240, height: 120, type: 'ground' },
          { x: 290, y: 370, width: 100, height: 26, type: 'floating' },
          { x: 440, y: 310, width: 110, height: 26, type: 'floating' },
          { x: 590, y: 190, width: 24, height: 120, type: 'ladder' }, // Mid-ascent ladder
          { x: 570, y: 190, width: 140, height: 28, type: 'floating' },
          { x: 760, y: 220, width: 100, height: 26, type: 'floating' },
          { x: 910, y: 80, width: 24, height: 140, type: 'ladder' }, // Summit peak ladder!
          { x: 890, y: 80, width: 200, height: 30, type: 'floating' }, // Summit gate (Chest)
          { x: 1150, y: 160, width: 130, height: 28, type: 'wooden' },
          { x: 1340, y: 250, width: 140, height: 28, type: 'floating' },
          { x: 1540, y: 350, width: 150, height: 28, type: 'wooden' },
          { x: 1760, y: 440, width: 700, height: 120, type: 'ground' },
        ];
        chestX = 970;
        chestY = 40;
      }

      platformsRef.current = adventurePlatforms;

      const chestTypes: ('wooden' | 'iron' | 'silver' | 'purple' | 'golden')[] = [
        'wooden', 'iron', 'silver', 'purple', 'golden'
      ];
      const chestType = chestTypes[(level - 1) % chestTypes.length];
      const rewardWeapon: WeaponType = level % 2 === 0 ? 'gun' : 'bow';

      chestRef.current = {
        x: chestX,
        y: chestY,
        width: 44,
        height: 38,
        type: chestType,
        state: 'closed',
        weaponReward: rewardWeapon,
        openAnimTimer: 0,
      };

      if (playerHealth < playerMaxHealth * 0.5) {
        healthPickupRef.current = {
          x: chestX - 200,
          y: chestY + 50,
          collected: false,
          healAmount: 40,
        };
      } else {
        healthPickupRef.current = null;
      }
      bossRef.current = null;
      setBossStateForHUD(null);
    } else if (isBossLevel) {
      platformsRef.current = [
        { x: 0, y: 450, width: 1200, height: 120, type: 'ground' },
        { x: 150, y: 330, width: 160, height: 25, type: 'floating' },
        { x: 750, y: 330, width: 160, height: 25, type: 'floating' },
      ];
      chestRef.current = null;
      healthPickupRef.current = null;

      const boss: BossState = {
        name: 'KAGE-RYU SHADOW TITAN',
        maxHealth: 1500,
        health: 1500,
        x: 480,
        y: 120,
        width: 180,
        height: 240,
        heartX: 570,
        heartY: 230,
        heartRadius: 26,
        heartPulsing: 0,
        state: 'rising',
        laserBeamX: 100,
        laserDirection: 'right',
        laserSweeping: false,
        attackTimer: 4.0,
        entranceProgress: 0,
      };
      bossRef.current = boss;
      setBossStateForHUD(boss);
      sound.playBossAlert();
    } else {
      platformsRef.current = [
        { x: 0, y: 440, width: 1000, height: 120, type: 'ground' },
        { x: 220, y: 320, width: 150, height: 25, type: 'floating' },
        { x: 620, y: 320, width: 150, height: 25, type: 'floating' },
      ];
      chestRef.current = null;
      healthPickupRef.current = null;
      bossRef.current = null;
      setBossStateForHUD(null);

      waveEnemiesSpawnedRef.current = 0;
      waveEnemiesTotalRef.current = 6 + level * 2;
      waveTimerRef.current = 1.0;
    }
  }, [level, phase, playerHealth, playerMaxHealth, setBossStateForHUD]);

  // Particle & FX helper functions
  const spawnDust = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
        color: '#94a3b8',
        size: 3 + Math.random() * 3,
        alpha: 0.7,
        decay: 0.04,
        type: 'dust',
      });
    }
  };

  const spawnParticles = (x: number, y: number, color: string, count: number, type: any = 'spark') => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7,
        color,
        size: 3 + Math.random() * 3,
        alpha: 0.9,
        decay: 0.035,
        type,
      });
    }
  };

  const spawnFloatingText = (text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -1.6,
      color,
      alpha: 1.0,
    });
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = (time: number) => {
      const rawDt = (time - lastTimeRef.current) / 1000;
      const dt = Math.min(rawDt, 0.05);
      lastTimeRef.current = time;

      const p = playerRef.current;
      const skin = ELEMENTAL_SKIN_DATA[equippedSkin] || ELEMENTAL_SKIN_DATA.lightning;
      const gunInfo = GUN_SKIN_DATA[equippedGunSkin] || GUN_SKIN_DATA.plasma_cyan;
      const outfitInfo = OUTFIT_DATA[equippedOutfit] || OUTFIT_DATA.tactical_stealth;

      if (screenShakeRef.current > 0) {
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      // ==========================================
      // --- PLAYER INPUT & KINEMATICS ENGINE ---
      // ==========================================
      const input = inputManager.getSnapshot();

      // Recoil & Muzzle Flash timers decay
      if (p.recoilTimer > 0) p.recoilTimer = Math.max(0, p.recoilTimer - dt * 6);
      if (p.muzzleFlashTimer > 0) p.muzzleFlashTimer = Math.max(0, p.muzzleFlashTimer - dt * 10);

      // Dash (Y button / L key)
      if (input.justPressed.DASH && p.dashTimer === 0) {
        p.dashTimer = 0.35;
        p.invulnerableTimer = 0.45;
        p.vx = p.facing === 'right' ? 14.0 : -14.0;
        p.vy = 0;
        p.climbing = false;
        sound.playBoost();
        screenShakeRef.current = 6;
        spawnParticles(p.x + p.width / 2, p.y + p.height / 2, skin.color, 15, 'smoke');
      }

      if (p.dashTimer > 0) {
        p.dashTimer -= dt;
        particlesRef.current.push({
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          color: skin.color,
          size: p.width,
          alpha: 0.5,
          decay: 0.08,
          type: 'dash_ghost',
        });
      } else {
        // =========================================================================
        // REQUIREMENT 5: FIXED LADDER CLIMBING SYSTEM WITH ACCURATE TOP/BOTTOM BOUNDS
        // =========================================================================
        // Check ladder overlap
        const overlappingLadder = platformsRef.current.find(
          (plat) =>
            plat.type === 'ladder' &&
            p.x + p.width > plat.x - 14 &&
            p.x < plat.x + plat.width + 14 &&
            p.y + p.height >= plat.y - 4 &&
            p.y <= plat.y + plat.height + 4
        );

        setCanClimb(overlappingLadder !== undefined);

        const pushUp = input.held.UP || input.axisY < -0.3;
        const pushDown = input.held.DOWN || input.axisY > 0.3;

        // Enter ladder climbing
        if (overlappingLadder && (pushUp || pushDown)) {
          p.climbing = true;
          // Align horizontally to ladder center
          p.x = overlappingLadder.x + overlappingLadder.width / 2 - p.width / 2;
          p.vx = 0;
        }

        if (p.climbing && overlappingLadder) {
          p.animState = 'climbing';

          if (pushUp) {
            p.vy = -3.8;

            // TOP ENDPOINT DETECTION: Player reached the top of the ladder!
            // When player feet reach or cross plat.y (the top platform surface)
            if (p.y + p.height <= overlappingLadder.y + 6) {
              p.y = overlappingLadder.y - p.height; // Place cleanly standing on top platform!
              p.vy = 0;
              p.climbing = false;
              p.grounded = true;
              p.animState = 'idle';
              sound.playLanding();
            }
          } else if (pushDown) {
            p.vy = 3.8;

            // BOTTOM ENDPOINT DETECTION: Player reached ground at ladder bottom
            if (p.y + p.height >= overlappingLadder.y + overlappingLadder.height) {
              p.y = overlappingLadder.y + overlappingLadder.height - p.height;
              p.vy = 0;
              p.climbing = false;
              p.grounded = true;
              p.animState = 'idle';
            }
          } else {
            // When climb controls are released, hold position securely on the ladder!
            p.vy = 0;
          }

          // Jump off ladder
          if (input.justPressed.JUMP) {
            p.climbing = false;
            p.vy = -12.0;
            p.vx = p.facing === 'right' ? 4.5 : -4.5;
            p.animState = 'jumping';
            sound.playJump();
          }

          // If user moves strongly left/right while near the top, dismount onto floor
          if (Math.abs(input.axisX) > 0.4 || input.held.LEFT || input.held.RIGHT) {
            if (p.y + p.height <= overlappingLadder.y + 12) {
              p.y = overlappingLadder.y - p.height;
              p.climbing = false;
              p.grounded = true;
            }
          }
        } else {
          // If not climbing, gravity applies
          p.climbing = false;

          // Normal Left / Right Movement from joystick or WASD / D-PAD buttons
          const moveLeft = input.held.LEFT || input.axisX < -0.15;
          const moveRight = input.held.RIGHT || input.axisX > 0.15;

          if (moveRight) {
            p.vx = Math.max(input.axisX * 5.2, 4.8);
            p.facing = 'right';
            if (p.grounded && p.attackTimer === 0) p.animState = 'running';
          } else if (moveLeft) {
            p.vx = Math.min(input.axisX * 5.2, -4.8);
            p.facing = 'left';
            if (p.grounded && p.attackTimer === 0) p.animState = 'running';
          } else {
            p.vx *= 0.82;
            if (Math.abs(p.vx) < 0.1) p.vx = 0;
            if (p.grounded && p.attackTimer === 0) p.animState = 'idle';
          }

          // Jump (A button / Space)
          if (input.justPressed.JUMP && p.grounded) {
            p.vy = -12.0;
            p.grounded = false;
            p.animState = 'jumping';
            sound.playJump();
            spawnDust(p.x + p.width / 2, p.y + p.height, 8);
          }

          // Normal gravity
          p.vy = Math.min(14, p.vy + 28 * dt);
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // Invulnerability countdown
      if (p.invulnerableTimer > 0) {
        p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
      }

      // Attack countdown
      if (p.attackTimer > 0) {
        p.attackTimer = Math.max(0, p.attackTimer - dt);
        if (p.attackTimer === 0) p.attackType = null;
      }

      // Platform Collisions (Solid platforms)
      if (!p.climbing) {
        p.grounded = false;
        platformsRef.current.forEach((plat) => {
          if (
            plat.type !== 'ladder' &&
            p.x + p.width > plat.x &&
            p.x < plat.x + plat.width &&
            p.y + p.height >= plat.y &&
            p.y + p.height <= plat.y + 16 &&
            p.vy >= 0
          ) {
            if (!p.grounded && p.vy > 4) {
              spawnDust(p.x + p.width / 2, plat.y, 6);
              sound.playLanding();
            }
            p.y = plat.y - p.height;
            p.vy = 0;
            p.grounded = true;
          }
        });

        // Floor safety bound
        if (p.y > 450 - p.height) {
          p.y = 450 - p.height;
          p.vy = 0;
          p.grounded = true;
        }
      }

      // Arena boundaries
      const isAdventure = phase === 'ADVENTURE';
      if (!isAdventure) {
        if (p.x < 20) p.x = 20;
        if (p.x > 940) p.x = 940;
      } else {
        if (p.x < 20) p.x = 20;
        // Reach finish marker
        if (p.x > 2100) {
          sound.playVictory();
          onLevelComplete();
        }
      }

      // Check proximity to treasure chest
      const ch = chestRef.current;
      const canOpen = ch !== null && ch.state === 'closed' && Math.abs(p.x - ch.x) < 70;
      setCanOpenChest(canOpen);

      // =========================================================================
      // REQUIREMENT 1 & 9: GUN SHOOTING ACTIONS & RECOIL ANIMATION
      // =========================================================================
      // Primary Shoot Action (X Button / J key / Mouse Click)
      if (input.justPressed.ATTACK && p.attackTimer === 0) {
        if (canOpen && ch) {
          ch.state = 'opening';
          ch.openAnimTimer = 1.2;
          sound.playChestOpen();
          onOpenChest(ch.weaponReward);
          spawnParticles(ch.x + 20, ch.y + 10, '#facc15', 25, 'spark');
          spawnFloatingText(`UNLOCKED ${ch.weaponReward.toUpperCase()}!`, ch.x, ch.y - 20, '#facc15');
        } else {
          // Fire Gun Weapon!
          p.attackTimer = 0.22;
          p.recoilTimer = 1.0;
          p.muzzleFlashTimer = 1.0;
          p.animState = 'attacking';

          sound.playLaserFire();
          screenShakeRef.current = 4;

          const muzzleX = p.facing === 'right' ? p.x + p.width + 18 : p.x - 18;
          const muzzleY = p.y + 24;

          // Spawn High-Velocity Gun Bullet
          projectilesRef.current.push({
            id: Math.random().toString(),
            source: 'player',
            type: 'bullet',
            x: muzzleX,
            y: muzzleY,
            vx: p.facing === 'right' ? 18.0 : -18.0,
            vy: (Math.random() - 0.5) * 0.8,
            damage: 60,
            radius: 5,
            color: gunInfo.bulletColor,
            lifespan: 1.5,
          });

          // Muzzle smoke particle
          spawnParticles(muzzleX, muzzleY, gunInfo.bulletColor, 6, 'spark');
        }
      }

      // Special Gun Art Action (B Button / K key)
      if (input.justPressed.SPECIAL && p.attackTimer === 0) {
        p.attackTimer = 0.45;
        p.recoilTimer = 1.4;
        p.muzzleFlashTimer = 1.2;
        sound.playLaserFire();
        screenShakeRef.current = 10;

        const muzzleX = p.facing === 'right' ? p.x + p.width + 18 : p.x - 18;
        const muzzleY = p.y + 24;
        const dir = p.facing === 'right' ? 1 : -1;

        if (activeSpecialIndex === 1) {
          // Triple Burst
          [-0.2, 0, 0.2].forEach((spread) => {
            projectilesRef.current.push({
              id: Math.random().toString(),
              source: 'player',
              type: 'bullet',
              x: muzzleX,
              y: muzzleY,
              vx: dir * 16.0,
              vy: spread * 8.0,
              damage: 45,
              radius: 6,
              color: gunInfo.color,
              lifespan: 1.5,
            });
          });
          spawnFloatingText('TRIPLE BURST!', p.x, p.y - 20, gunInfo.color);
        } else if (activeSpecialIndex === 2) {
          // Rapid Fire Volley
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              projectilesRef.current.push({
                id: Math.random().toString(),
                source: 'player',
                type: 'bullet',
                x: muzzleX + dir * i * 8,
                y: muzzleY + (Math.random() - 0.5) * 4,
                vx: dir * 20.0,
                vy: (Math.random() - 0.5) * 1.5,
                damage: 38,
                radius: 4,
                color: gunInfo.bulletColor,
                lifespan: 1.2,
              });
            }, i * 40);
          }
          spawnFloatingText('RAPID VOLLEY!', p.x, p.y - 20, gunInfo.color);
        } else if (activeSpecialIndex === 3) {
          // High-Energy Piercing Laser Beam
          p.attackType = 'laser';
          screenShakeRef.current = 14;
          const originX = p.facing === 'right' ? p.x + p.width : p.x - 680;
          const beamW = 680;

          enemiesRef.current.forEach((en) => {
            if (en.x + en.width >= originX && en.x <= originX + beamW && Math.abs(en.y - p.y) < 60) {
              en.health -= 210;
              sound.playEnemyHit();
              spawnParticles(en.x + en.width / 2, en.y + en.height / 2, gunInfo.color, 16);
              spawnFloatingText('-210', en.x, en.y - 10, gunInfo.color);
            }
          });

          const boss = bossRef.current;
          if (boss && Math.abs(boss.heartY - (p.y + p.height / 2)) < 70) {
            boss.health -= 210;
            sound.playHeartHit();
            spawnParticles(boss.heartX, boss.heartY, gunInfo.color, 24);
            spawnFloatingText('-210', boss.heartX, boss.heartY - 20, gunInfo.color);
          }
          spawnFloatingText('CHARGED LASER!', p.x, p.y - 20, gunInfo.color);
        } else {
          // Overcharged Cannonball Shot
          projectilesRef.current.push({
            id: Math.random().toString(),
            source: 'player',
            type: 'laser',
            x: muzzleX,
            y: muzzleY,
            vx: dir * 22.0,
            vy: 0,
            damage: 130,
            radius: 9,
            color: gunInfo.color,
            lifespan: 1.5,
          });
          spawnFloatingText('PLASMA CANNON!', p.x, p.y - 20, gunInfo.color);
        }
      }

      // Camera Follow Smooth Tracking
      const targetCamX = Math.max(0, p.x - 380);
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;

      // Check Health Pickup
      const pickup = healthPickupRef.current;
      if (pickup && !pickup.collected && Math.abs(p.x - pickup.x) < 40 && Math.abs(p.y - pickup.y) < 50) {
        pickup.collected = true;
        onPlayerHeal(pickup.healAmount);
        sound.playCoin();
        spawnFloatingText(`+${pickup.healAmount} HP`, pickup.x, pickup.y - 20, '#34d399');
        spawnParticles(pickup.x, pickup.y, '#10b981', 15);
      }

      // --- ENEMY WAVE SPAWNER ---
      if (phase === 'COMBAT') {
        waveTimerRef.current -= dt;
        if (waveTimerRef.current <= 0 && waveEnemiesSpawnedRef.current < waveEnemiesTotalRef.current) {
          waveTimerRef.current = 2.4 - Math.min(1.2, level * 0.18);
          waveEnemiesSpawnedRef.current++;

          let type: Enemy['type'] = 'sword';
          if (level === 2 && Math.random() < 0.45) type = 'hammer';
          else if (level === 3 && Math.random() < 0.4) type = 'archer';
          else if (level === 4 && Math.random() < 0.35) type = 'cannon';
          else if (level === 5 && Math.random() < 0.4) type = 'drone';
          else if (level > 2) {
            const roll = Math.random();
            if (roll < 0.25) type = 'hammer';
            else if (roll < 0.5) type = 'archer';
            else if (roll < 0.75) type = 'drone';
            else type = 'cannon';
          }

          const spawnFromRight = Math.random() > 0.5;
          const spawnX = spawnFromRight ? 960 : 40;
          // DRONES SPAWN IN MID-AIR (y = 140 to 180)
          const spawnY = type === 'drone' ? 140 + Math.random() * 40 : 380;

          enemiesRef.current.push({
            id: Math.random().toString(),
            type,
            name: type.toUpperCase(),
            x: spawnX,
            y: spawnY,
            width: type === 'hammer' ? 44 : type === 'drone' ? 44 : 32,
            height: type === 'hammer' ? 52 : type === 'drone' ? 30 : 48,
            vx: 0,
            vy: 0,
            facing: spawnFromRight ? 'left' : 'right',
            maxHealth: type === 'hammer' ? 130 : type === 'cannon' ? 110 : type === 'drone' ? 90 : 65,
            health: type === 'hammer' ? 130 : type === 'cannon' ? 110 : type === 'drone' ? 90 : 65,
            damage: type === 'hammer' ? 22 : type === 'drone' ? 18 : 14,
            attackCooldown: type === 'cannon' ? 3.5 : type === 'drone' ? 2.8 : 1.8,
            attackTimer: 1.5,
            state: 'walking',
          });
        }

        // Wave Completion
        if (
          waveEnemiesSpawnedRef.current >= waveEnemiesTotalRef.current &&
          enemiesRef.current.length === 0
        ) {
          onWaveComplete();
        }
      }

      // --- BOSS BATTLE LOGIC (LEVEL 6) ---
      const boss = bossRef.current;
      if (boss && phase === 'BOSS') {
        boss.heartPulsing += 0.08;

        if (boss.state === 'rising') {
          boss.entranceProgress += dt * 0.7;
          boss.y = 350 - boss.entranceProgress * 230;
          if (boss.entranceProgress >= 1.0) {
            boss.state = 'active';
            boss.y = 120;
          }
        } else if (boss.state === 'active') {
          boss.attackTimer -= dt;
          if (boss.attackTimer <= 0) {
            boss.attackTimer = 5.0;
            const roll = Math.random();
            if (roll < 0.6) {
              boss.state = 'eye_laser';
              boss.laserSweeping = true;
              boss.laserDirection = p.x > boss.heartX ? 'left' : 'right';
              boss.laserBeamX = boss.laserDirection === 'left' ? 950 : 50;
              sound.playBossEyeLaser();
            } else {
              screenShakeRef.current = 14;
              sound.playCannonFire();
              for (let i = 0; i < 4; i++) {
                projectilesRef.current.push({
                  id: Math.random().toString(),
                  source: 'boss',
                  type: 'energy_strike',
                  x: 100 + i * 220 + Math.random() * 50,
                  y: 40,
                  vx: 0,
                  vy: 9,
                  damage: 30,
                  radius: 12,
                  color: '#c084fc',
                  lifespan: 2.0,
                });
              }
            }
          }
        } else if (boss.state === 'eye_laser') {
          const sweepSpeed = 450 * dt;
          if (boss.laserDirection === 'right') {
            boss.laserBeamX += sweepSpeed;
            if (boss.laserBeamX > 950) {
              boss.state = 'active';
              boss.laserSweeping = false;
            }
          } else {
            boss.laserBeamX -= sweepSpeed;
            if (boss.laserBeamX < 50) {
              boss.state = 'active';
              boss.laserSweeping = false;
            }
          }

          if (
            Math.abs(p.x + p.width / 2 - boss.laserBeamX) < 30 &&
            p.y + p.height > 300 &&
            p.invulnerableTimer === 0
          ) {
            p.invulnerableTimer = 1.2;
            onPlayerDamage(35);
            sound.playPlayerDamage();
            screenShakeRef.current = 12;
            spawnParticles(p.x, p.y + p.height / 2, '#f43f5e', 15);
          }
        }

        if (boss.health <= 0) {
          boss.health = 0;
          boss.state = 'defeated';
          sound.playVictory();
          onAddCoins(5000);
          spawnFloatingText('+5,000 COINS! BOSS DEFEATED', boss.heartX, boss.heartY - 40, '#facc15');
          onBossDefeated();
        }
      }

      // =========================================================================
      // REQUIREMENT 7: ENEMY AI WITH PROPER AIRBORNE DRONE FLIGHT SIMULATION
      // =========================================================================
      enemiesRef.current = enemiesRef.current.filter((en) => {
        if (en.health <= 0) {
          const coinReward = en.type === 'hammer' ? 60 : en.type === 'cannon' ? 90 : en.type === 'drone' ? 75 : 30;
          onAddCoins(coinReward);
          sound.playCoin();
          spawnFloatingText(`+${coinReward}c`, en.x, en.y - 10, '#facc15');
          spawnParticles(en.x + en.width / 2, en.y + en.height / 2, '#facc15', 12, 'coin');
          return false;
        }

        const dx = p.x + p.width / 2 - (en.x + en.width / 2);
        en.facing = dx > 0 ? 'right' : 'left';

        if (en.type === 'drone') {
          // --- AIRBORNE DRONE HOVERING & FLIGHT ENGINE ---
          // Hovering altitude: never touches ground, stays between y = 140 and y = 200
          const baseHoverY = 160;
          const hoverWave = Math.sin(time * 0.005 + Number(en.id.slice(-2) || 0)) * 14;
          en.y += (baseHoverY + hoverWave - en.y) * 0.06;

          // Horizontal tracking towards player
          en.x += Math.sign(dx) * 2.2;

          en.attackTimer -= dt;
          if (en.attackTimer <= 1.2 && !en.laserCharging) {
            en.laserCharging = true;
            en.targetX = p.x + p.width / 2;
            sound.playLaserCharge();
          }

          if (en.attackTimer <= 0) {
            en.attackTimer = en.attackCooldown;
            en.laserCharging = false;
            sound.playLaserFire();
            const beamX = en.targetX || p.x;
            if (Math.abs(p.x + p.width / 2 - beamX) < 28 && p.invulnerableTimer === 0) {
              p.invulnerableTimer = 1.2;
              onPlayerDamage(en.damage);
              sound.playPlayerDamage();
            }
            spawnParticles(beamX, 420, '#f43f5e', 14);
          }
        } else if (en.type === 'cannon') {
          en.x += Math.sign(dx) * 0.5;
          en.attackTimer -= dt;
          if (en.attackTimer <= 1.2 && en.targetX === undefined) {
            en.targetX = p.x;
          }
          if (en.attackTimer <= 0) {
            en.attackTimer = en.attackCooldown;
            sound.playCannonFire();
            const groundX = en.targetX || p.x;
            en.targetX = undefined;
            projectilesRef.current.push({
              id: Math.random().toString(),
              source: 'enemy',
              type: 'cannonball',
              x: en.x + (en.facing === 'right' ? en.width : 0),
              y: en.y + 10,
              vx: (groundX - en.x) * 0.03,
              vy: -7.5,
              damage: en.damage,
              radius: 9,
              color: '#475569',
              targetX: groundX,
              lifespan: 2.5,
            });
          }
        } else if (en.type === 'archer') {
          if (Math.abs(dx) > 280) en.x += Math.sign(dx) * 1.5;
          else if (Math.abs(dx) < 180) en.x -= Math.sign(dx) * 1.5;
          en.attackTimer -= dt;
          if (en.attackTimer <= 0) {
            en.attackTimer = en.attackCooldown;
            sound.playBowShot();
            projectilesRef.current.push({
              id: Math.random().toString(),
              source: 'enemy',
              type: 'arrow',
              x: en.x + (en.facing === 'right' ? en.width : -4),
              y: en.y + en.height / 2 - 4,
              vx: en.facing === 'right' ? 8.5 : -8.5,
              vy: 0,
              damage: en.damage,
              radius: 4,
              color: '#94a3b8',
              lifespan: 2.2,
            });
          }
        } else {
          // Sword & Hammer melee units
          if (Math.abs(dx) > 24) {
            en.x += Math.sign(dx) * 2.0;
          } else {
            en.attackTimer -= dt;
            if (en.attackTimer <= 0) {
              en.attackTimer = en.attackCooldown;
              if (p.invulnerableTimer === 0) {
                p.invulnerableTimer = 1.0;
                onPlayerDamage(en.damage);
                sound.playPlayerDamage();
                screenShakeRef.current = 8;
                spawnParticles(p.x, p.y + p.height / 2, '#f43f5e', 12);
              }
            }
          }
        }

        return true;
      });

      // --- PROJECTILE PHYSICS & HIT DETECTION ---
      projectilesRef.current = projectilesRef.current.filter((proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.lifespan -= dt;

        if (proj.type === 'cannonball') {
          proj.vy += 18 * dt; // gravity arc
        }

        if (proj.lifespan <= 0) return false;

        if (proj.source === 'player') {
          // Check collision against all enemies (including flying drones!)
          for (let i = 0; i < enemiesRef.current.length; i++) {
            const en = enemiesRef.current[i];
            if (
              proj.x >= en.x &&
              proj.x <= en.x + en.width &&
              proj.y >= en.y &&
              proj.y <= en.y + en.height
            ) {
              en.health -= proj.damage;
              sound.playEnemyHit();
              spawnParticles(proj.x, proj.y, proj.color, 10);
              spawnFloatingText(`-${proj.damage}`, en.x, en.y - 12, proj.color);
              return false; // Bullet consumed
            }
          }

          // Check collision against Titan Boss weak point
          const boss = bossRef.current;
          if (boss && Math.hypot(proj.x - boss.heartX, proj.y - boss.heartY) < proj.radius + boss.heartRadius) {
            boss.health -= proj.damage;
            sound.playHeartHit();
            spawnParticles(boss.heartX, boss.heartY, proj.color, 15);
            spawnFloatingText(`-${proj.damage}`, boss.heartX, boss.heartY - 20, '#facc15');
            return false;
          }
        } else {
          // Enemy projectile hits player
          if (
            Math.abs(proj.x - (p.x + p.width / 2)) < p.width / 2 + proj.radius &&
            Math.abs(proj.y - (p.y + p.height / 2)) < p.height / 2 + proj.radius &&
            p.invulnerableTimer === 0
          ) {
            p.invulnerableTimer = 1.0;
            onPlayerDamage(proj.damage);
            sound.playPlayerDamage();
            screenShakeRef.current = 10;
            spawnParticles(p.x, p.y + p.height / 2, '#f43f5e', 14);
            return false;
          }
        }

        return true;
      });

      // Update particles
      particlesRef.current = particlesRef.current.filter((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        return pt.alpha > 0;
      });

      // Update floating texts
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        return ft.alpha > 0;
      });

      // ==========================================
      // --- RENDERING CANVAS PIPELINE ---
      // ==========================================
      ctx.save();
      if (screenShakeRef.current > 0) {
        ctx.translate(
          (Math.random() - 0.5) * screenShakeRef.current,
          (Math.random() - 0.5) * screenShakeRef.current
        );
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const camX = cameraRef.current.x;

      // 1. Far Parallax Background
      const bgImg = level === 6 ? bossBgRef.current : forestBgRef.current;
      if (bgImg) {
        const parallaxX = -(camX * 0.22) % canvas.width;
        ctx.drawImage(bgImg, parallaxX, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, parallaxX + canvas.width, 0, canvas.width, canvas.height);
      }

      // 2. Radiant Atmospheric Lighting
      const sunGrad = ctx.createRadialGradient(canvas.width * 0.85, 45, 15, canvas.width * 0.85, 45, 380);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      sunGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.1)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // World Camera Space
      ctx.save();
      ctx.translate(-camX, 0);

      // 3. Terrain, Floating Platforms & Ladders
      platformsRef.current.forEach((plat) => {
        // Soft ground contact shadow under floating platforms
        if (plat.type === 'floating' || plat.type === 'wooden') {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(plat.x + plat.width / 2, 442, plat.width / 2, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (plat.type === 'ground') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(plat.x, plat.y, plat.width, 8);
          ctx.fillStyle = '#047857';
          ctx.fillRect(plat.x, plat.y + 8, plat.width, 4);
        } else if (plat.type === 'floating') {
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(plat.x + 4, plat.y, plat.width - 8, 4);
        } else if (plat.type === 'wooden') {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fill();
          ctx.fillStyle = '#b45309';
          ctx.fillRect(plat.x + 2, plat.y, plat.width - 4, 3);
        } else if (plat.type === 'ladder') {
          // Render High-Contrast Wooden Ladder with Rungs
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 4;
          // Rails
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
          // Rungs
          for (let ry = plat.y + 12; ry < plat.y + plat.height; ry += 18) {
            ctx.beginPath();
            ctx.moveTo(plat.x + 2, ry);
            ctx.lineTo(plat.x + plat.width - 2, ry);
            ctx.stroke();
          }
          // Top Ladder Endpoint Cap Plate
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(plat.x - 3, plat.y - 2, plat.width + 6, 4);
        }
      });

      // 4. Treasure Chest
      if (ch) {
        ctx.save();
        ctx.fillStyle = ch.type === 'golden' ? '#eab308' : ch.type === 'purple' ? '#a855f7' : '#92400e';
        ctx.fillRect(ch.x, ch.y, ch.width, ch.height);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(ch.x + ch.width / 2 - 4, ch.y + 12, 8, 10);
        if (ch.state === 'closed') {
          ctx.font = 'bold 11px Plus Jakarta Sans';
          ctx.fillStyle = '#facc15';
          ctx.fillText('PRESS SHOOT TO OPEN', ch.x - 26, ch.y - 12);
        }
        ctx.restore();
      }

      // 5. Health Pickup
      if (pickup && !pickup.collected) {
        ctx.save();
        const pulse = Math.sin(time * 0.006) * 4;
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pickup.x, pickup.y + pulse, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Plus Jakarta Sans';
        ctx.fillText('+', pickup.x - 4, pickup.y + pulse + 4);
        ctx.restore();
      }

      // =========================================================================
      // REQUIREMENT 7: RENDER FLYING DRONES & GROUND ENEMIES
      // =========================================================================
      enemiesRef.current.forEach((en) => {
        ctx.save();
        const ecx = en.x + en.width / 2;

        if (en.type === 'drone') {
          // --- REALISTIC QUAD-ROTOR GUNSHIP DRONE IN FLIGHT ---
          // 1. Soft Realistic Ground Shadow (projected at y = 440 with depth scaling)
          const altitude = 440 - (en.y + en.height);
          const shadowScale = Math.max(0.4, 1 - altitude / 450);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(ecx, 442, (en.width / 2) * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Targeting Laser search beam
          if (en.laserCharging && en.targetX !== undefined) {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(ecx, en.y + en.height);
            ctx.lineTo(en.targetX, 440);
            ctx.stroke();

            // Target reticle on ground
            ctx.strokeStyle = '#f43f5e';
            ctx.strokeRect(en.targetX - 12, 436, 24, 6);
            ctx.shadowBlur = 0;
          }

          // 3. Drone Twin Plasma Thruster Jets
          const thrustFlicker = Math.sin(time * 0.03) * 3;
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.fillRect(en.x + 8, en.y + en.height - 2, 4, 8 + thrustFlicker);
          ctx.fillRect(en.x + en.width - 12, en.y + en.height - 2, 4, 8 + thrustFlicker);
          ctx.shadowBlur = 0;

          // 4. Drone Armored Chassis
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(en.x + 4, en.y + 6, en.width - 8, en.height - 10, 6);
          ctx.fill();
          ctx.stroke();

          // 5. Glowing Red Optical Sensor / Visor
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(en.facing === 'right' ? en.x + en.width - 10 : en.x + 10, en.y + 14, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // 6. Spinning Rotor Blur Discs on Left & Right pylons
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(en.x + 6, en.y + 4, 12, 3, 0, 0, Math.PI * 2);
          ctx.ellipse(en.x + en.width - 6, en.y + 4, 12, 3, 0, 0, Math.PI * 2);
          ctx.stroke();

          // 7. Underslung Dual Laser Guns
          ctx.fillStyle = '#475569';
          ctx.fillRect(en.facing === 'right' ? en.x + en.width - 2 : en.x - 8, en.y + en.height - 10, 10, 3);
        } else {
          // Ground Enemies (Hammer, Archer, Cannon, Sword)
          // Ground contact shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(ecx, en.y + en.height, en.width / 2, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          if (en.type === 'cannon' && en.targetX !== undefined) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
            ctx.beginPath();
            ctx.arc(en.targetX, 435, 20, 0, Math.PI * 2);
            ctx.fill();
          }

          const enColor =
            en.type === 'hammer'
              ? '#b91c1c'
              : en.type === 'cannon'
              ? '#334155'
              : en.type === 'recovery'
              ? '#059669'
              : '#dc2626';

          ctx.fillStyle = enColor;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.width, en.height, 6);
          ctx.fill();

          // Visor / eyes
          ctx.fillStyle = '#f8fafc';
          if (en.facing === 'right') {
            ctx.fillRect(en.x + en.width - 6, en.y + 12, 6, 3);
          } else {
            ctx.fillRect(en.x, en.y + 12, 6, 3);
          }
        }

        // Health Bar above enemy
        const hpPercent = Math.max(0, en.health / en.maxHealth);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(en.x, en.y - 10, en.width, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : '#f43f5e';
        ctx.fillRect(en.x, en.y - 10, en.width * hpPercent, 4);
        ctx.restore();
      });

      // 7. Titan Boss (Level 6)
      if (boss && phase === 'BOSS') {
        ctx.save();
        ctx.fillStyle = '#1e1b4b';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(boss.x, boss.y, boss.width, boss.height, 24);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(boss.x + 60, boss.y + 55, 10, 0, Math.PI * 2);
        ctx.arc(boss.x + boss.width - 60, boss.y + 55, 10, 0, Math.PI * 2);
        ctx.fill();

        if (boss.state === 'eye_laser') {
          ctx.save();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 14;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.moveTo(boss.x + boss.width / 2, boss.y + 55);
          ctx.lineTo(boss.laserBeamX, 440);
          ctx.stroke();
          ctx.restore();
        }

        const pulse = Math.sin(boss.heartPulsing) * 3;
        ctx.save();
        ctx.fillStyle = '#e11d48';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 20 + pulse * 2;
        ctx.beginPath();
        ctx.arc(boss.heartX, boss.heartY, boss.heartRadius + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      // =========================================================================
      // REQUIREMENT 8 & 9: ARTICULATED PLAYER BODY & GUN-HOLDING WEAPON SYSTEM
      // =========================================================================
      ctx.save();
      const pcx = p.x + p.width / 2;

      // Realistic Dynamic Ground Shadow
      const footY = p.y + p.height;
      const groundDist = Math.max(0, 440 - footY);
      const playerShadowScale = Math.max(0.35, 1 - groundDist / 260);

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(pcx - (p.facing === 'right' ? 4 : -4), Math.min(442, footY + groundDist), 16 * playerShadowScale, 4.5 * playerShadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Invulnerability damage flash
      if (p.invulnerableTimer > 0 && Math.floor(time * 0.02) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      // --- LEGS & RUNNING / JUMPING / CLIMBING ANIMATION ---
      const hipY = p.y + p.height - 18;
      const legStride = p.animState === 'running' ? Math.sin(time * 0.018) * 9 : 0;
      const climbLeg = p.animState === 'climbing' ? Math.sin(time * 0.015) * 6 : 0;

      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.strokeStyle = '#05070d';
      ctx.lineWidth = 2;

      // Left Leg
      ctx.beginPath();
      ctx.roundRect(pcx - 7 - legStride + climbLeg, hipY, 6, 18, 3);
      ctx.fill();
      ctx.stroke();

      // Right Leg
      ctx.beginPath();
      ctx.roundRect(pcx + 2 + legStride - climbLeg, hipY, 6, 18, 3);
      ctx.fill();
      ctx.stroke();

      // Boots
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.fillRect(pcx - 8 - legStride + climbLeg, hipY + 14, 8, 4);
      ctx.fillRect(pcx + 1 + legStride - climbLeg, hipY + 14, 8, 4);

      // --- TORSO & CHEST ARMOR ---
      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.beginPath();
      ctx.roundRect(p.x + 3, p.y + 14, p.width - 6, 22, 5);
      ctx.fill();
      ctx.stroke();

      // Chest Accent Plate with Elemental Core
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.fillRect(p.x + 8, p.y + 17, p.width - 16, 10);
      ctx.fillStyle = skin.color;
      ctx.fillRect(pcx - 2, p.y + 20, 4, 4);

      // Belt
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x + 4, p.y + 32, p.width - 8, 4);

      // --- HEAD, VISOR & BILLOWING SCARF ---
      // Head Cowl
      ctx.fillStyle = '#090e17';
      ctx.beginPath();
      ctx.arc(pcx, p.y + 8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Anime Visor Slit
      ctx.fillStyle = skin.color;
      ctx.shadowColor = skin.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.facing === 'right' ? pcx : pcx - 6, p.y + 6, 6, 3);
      ctx.shadowBlur = 0;

      // Dynamic Trailing Anime Scarf Ribbons
      ctx.strokeStyle = skin.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = skin.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      const scarfWave = Math.sin(time * 0.014) * 6;
      const scarfOriginX = p.facing === 'right' ? p.x + 2 : p.x + p.width - 2;
      const scarfDir = p.facing === 'right' ? -1 : 1;
      ctx.moveTo(scarfOriginX, p.y + 8);
      ctx.quadraticCurveTo(
        scarfOriginX + scarfDir * 14,
        p.y + 10 + scarfWave,
        scarfOriginX + scarfDir * 28,
        p.y + 6 - scarfWave
      );
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- ARMS & GUN WEAPON MODEL IN HAND (SWORD REMOVED!) ---
      const recoilPush = p.recoilTimer * 7;
      const recoilRot = p.recoilTimer * (p.facing === 'right' ? -0.2 : 0.2);

      ctx.save();
      // Shoulder pivot
      ctx.translate(pcx + (p.facing === 'right' ? 6 : -6), p.y + 18);
      ctx.rotate(recoilRot);

      // Gun Holding Hand Position
      const handOffsetX = (p.facing === 'right' ? 12 : -12) - (p.facing === 'right' ? recoilPush : -recoilPush);
      const handOffsetY = 4;

      // Forearm stretching toward weapon
      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.beginPath();
      ctx.roundRect(p.facing === 'right' ? 0 : -10, 0, 10, 14, 3);
      ctx.fill();
      ctx.stroke();

      // Tactical Glove holding gun grip
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(handOffsetX, handOffsetY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // RENDER GUN MODEL ATTACHED TO HAND
      ctx.save();
      ctx.translate(handOffsetX, handOffsetY);
      if (p.facing === 'left') ctx.scale(-1, 1);

      // Gun Receiver
      ctx.fillStyle = gunInfo.color;
      ctx.strokeStyle = '#05070d';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = gunInfo.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(-2, -6, 20, 8);
      ctx.strokeRect(-2, -6, 20, 8);
      ctx.shadowBlur = 0;

      // Gun Grip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 2, 5, 8);

      // Gun Barrel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(18, -4, 12, 5);

      // Muzzle Brake
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(30, -5, 3, 7);

      // Energy line on gun body
      ctx.fillStyle = gunInfo.bulletColor;
      ctx.fillRect(4, -4, 10, 2);

      // Muzzle Flash Effect!
      if (p.muzzleFlashTimer > 0) {
        const flashX = 34;
        const flashY = -1.5;
        const flashSize = 12 * p.muzzleFlashTimer;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = gunInfo.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(flashX, flashY, flashSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = gunInfo.bulletColor;
        ctx.beginPath();
        ctx.arc(flashX + 2, flashY, flashSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore(); // end gun model
      ctx.restore(); // end arm rotation

      // High-Power Laser Beam Visual Effect
      if (p.attackType === 'laser') {
        ctx.save();
        ctx.strokeStyle = gunInfo.color;
        ctx.lineWidth = 10;
        ctx.shadowColor = gunInfo.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        const beamStartX = p.facing === 'right' ? p.x + p.width + 30 : p.x - 30;
        ctx.moveTo(beamStartX, p.y + 24);
        ctx.lineTo(beamStartX + (p.facing === 'right' ? 700 : -700), p.y + 24);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore(); // end player

      // 9. Projectiles
      projectilesRef.current.forEach((proj) => {
        ctx.save();
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 10. Particles
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 11. Floating Combat Numbers
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 13px Plus Jakarta Sans';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore(); // end camera
      ctx.restore(); // end screen shake

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    level,
    phase,
    playerHealth,
    playerMaxHealth,
    equippedWeapon,
    equippedSkin,
    equippedGunSkin,
    equippedOutfit,
    activeSpecialIndex,
    onPlayerDamage,
    onPlayerHeal,
    onAddCoins,
    onWaveComplete,
    onLevelComplete,
    onBossDefeated,
    onOpenChest,
    setCanOpenChest,
    setCanClimb,
  ]);

  return (
    <div className="relative w-full h-[480px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-2xl touch-none">
      <canvas
        ref={canvasRef}
        width={960}
        height={520}
        className="w-full h-full object-contain cursor-crosshair"
      />
    </div>
  );
};
