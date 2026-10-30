import React, { useRef, useEffect } from 'react';
import {
  WeaponType,
  ElementalSkin,
  StoryPhase,
  Enemy,
  BossState,
  Projectile,
  Particle,
  FloatingText,
  TreasureChest,
  Platform,
  HealthPickup,
} from '../types/game';
import { ELEMENTAL_SKIN_DATA } from '../utils/combatConfig';
import { sound } from '../utils/audio';

interface StoryCanvasProps {
  level: number;
  phase: StoryPhase;
  playerHealth: number;
  playerMaxHealth: number;
  equippedWeapon: WeaponType;
  equippedSkin: ElementalSkin;
  onPlayerDamage: (dmg: number) => void;
  onPlayerHeal: (amt: number) => void;
  onAddCoins: (amt: number) => void;
  onWaveComplete: () => void;
  onLevelComplete: () => void;
  onBossDefeated: () => void;
  onOpenChest: (weapon: WeaponType) => void;
  currentCommand: string | null;
  onClearCommand: () => void;
  setCanOpenChest: (can: boolean) => void;
  setCanClimb: (can: boolean) => void;
  setIsBusy: (busy: boolean) => void;
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
  onPlayerDamage,
  onPlayerHeal,
  onAddCoins,
  onWaveComplete,
  onLevelComplete,
  onBossDefeated,
  onOpenChest,
  currentCommand,
  onClearCommand,
  setCanOpenChest,
  setCanClimb,
  setIsBusy,
  setBossStateForHUD,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background images
  const forestBgRef = useRef<HTMLImageElement | null>(null);
  const bossBgRef = useRef<HTMLImageElement | null>(null);

  // Game World State Refs (held across requestAnimationFrame)
  const playerRef = useRef({
    x: 200,
    y: 380,
    vx: 0,
    vy: 0,
    width: 32,
    height: 52,
    facing: 'right' as 'left' | 'right',
    grounded: true,
    climbing: false,
    animState: 'idle' as 'idle' | 'running' | 'jumping' | 'attacking' | 'climbing',
    attackType: null as string | null,
    attackTimer: 0,
    invulnerableTimer: 0,
    spinAngle: 0,
  });

  const cameraRef = useRef({ x: 0, y: 0 });
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const platformsRef = useRef<Platform[]>([]);
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

  // Initialize or Reset Level World
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
    cameraRef.current.x = 0;

    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    enemiesRef.current = [];

    if (isAdventure) {
      // Adventure Transition platforms across mountain & floating islands
      platformsRef.current = [
        { x: 0, y: 440, width: 450, height: 120, type: 'ground' },
        { x: 500, y: 390, width: 180, height: 30, type: 'wooden' },
        { x: 740, y: 330, width: 220, height: 35, type: 'floating' },
        { x: 800, y: 180, width: 24, height: 150, type: 'ladder' }, // Ladder
        { x: 780, y: 180, width: 190, height: 30, type: 'floating' },
        { x: 1040, y: 220, width: 170, height: 30, type: 'wooden' },
        { x: 1280, y: 290, width: 260, height: 40, type: 'floating' },
        { x: 1600, y: 360, width: 200, height: 30, type: 'wooden' },
        { x: 1860, y: 440, width: 600, height: 120, type: 'ground' }, // Destination arch
      ];

      // Place treasure chest on high platform
      const chestTypes: ('wooden' | 'iron' | 'silver' | 'purple' | 'golden')[] = [
        'wooden', 'iron', 'silver', 'purple', 'golden'
      ];
      const chestType = chestTypes[(level - 1) % chestTypes.length];
      const rewardWeapon: WeaponType = level % 2 === 0 ? 'gun' : 'bow';

      chestRef.current = {
        x: 1380,
        y: 250,
        width: 44,
        height: 38,
        type: chestType,
        state: 'closed',
        weaponReward: rewardWeapon,
        openAnimTimer: 0,
      };

      // Health pickup if player HP < 50%
      if (playerHealth < playerMaxHealth * 0.5) {
        healthPickupRef.current = {
          x: 1080,
          y: 185,
          collected: false,
          healAmount: 40,
        };
      } else {
        healthPickupRef.current = null;
      }
      bossRef.current = null;
      setBossStateForHUD(null);
    } else if (isBossLevel) {
      // Level 6 Boss Arena
      platformsRef.current = [
        { x: 0, y: 450, width: 1200, height: 120, type: 'ground' },
        { x: 150, y: 330, width: 160, height: 25, type: 'floating' },
        { x: 750, y: 330, width: 160, height: 25, type: 'floating' },
      ];
      chestRef.current = null;
      healthPickupRef.current = null;

      // Boss initialization
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
      // Normal Combat Arena (Levels 1 to 5)
      platformsRef.current = [
        { x: 0, y: 440, width: 1000, height: 120, type: 'ground' },
        { x: 220, y: 320, width: 150, height: 25, type: 'floating' },
        { x: 620, y: 320, width: 150, height: 25, type: 'floating' },
      ];
      chestRef.current = null;
      healthPickupRef.current = null;
      bossRef.current = null;
      setBossStateForHUD(null);

      // Waves setup
      waveEnemiesSpawnedRef.current = 0;
      waveEnemiesTotalRef.current = 6 + level * 2; // Progressive wave count
      waveTimerRef.current = 1.0;
    }
  }, [level, phase, playerHealth, playerMaxHealth, setBossStateForHUD]);

  // Execute Typing Command from console/user
  useEffect(() => {
    if (!currentCommand) return;
    const cmd = currentCommand.toUpperCase();
    const p = playerRef.current;
    const skinData = ELEMENTAL_SKIN_DATA[equippedSkin];

    // Movement Commands
    if (cmd === 'LEFT') {
      p.vx = -4.5;
      p.facing = 'left';
      p.animState = 'running';
      sound.playKeyPress();
    } else if (cmd === 'RIGHT') {
      p.vx = 4.5;
      p.facing = 'right';
      p.animState = 'running';
      sound.playKeyPress();
    } else if (cmd === 'JUMP') {
      if (p.grounded || p.climbing) {
        p.vy = -11.5;
        p.grounded = false;
        p.climbing = false;
        p.animState = 'jumping';
        sound.playJump();
        // Takeoff dust particles
        spawnDust(p.x + p.width / 2, p.y + p.height, 8);
      }
    } else if (cmd === 'CLIMB') {
      // Check if near ladder
      const nearLadder = platformsRef.current.some(
        (plat) =>
          plat.type === 'ladder' &&
          p.x + p.width > plat.x - 15 &&
          p.x < plat.x + plat.width + 15 &&
          p.y + p.height >= plat.y &&
          p.y <= plat.y + plat.height
      );
      if (nearLadder) {
        p.climbing = true;
        p.vy = -5.0;
        p.animState = 'climbing';
        sound.playKeyPress();
      }
    } else if (cmd === 'DOWN') {
      p.vy = 6.0;
      p.climbing = false;
      sound.playKeyPress();
    } else if (cmd === 'OPEN') {
      // Check if near treasure chest
      const chest = chestRef.current;
      if (chest && chest.state === 'closed') {
        const dist = Math.abs(p.x - chest.x);
        if (dist < 70) {
          chest.state = 'opening';
          chest.openAnimTimer = 1.2;
          sound.playChestOpen();
          onOpenChest(chest.weaponReward);
          spawnParticles(chest.x + 20, chest.y + 10, '#facc15', 25, 'spark');
          spawnFloatingText(`UNLOCKED ${chest.weaponReward.toUpperCase()}!`, chest.x, chest.y - 20, '#facc15');
        }
      }
    }

    // --- SWORD POWERS ---
    else if (cmd === 'HIT') {
      p.attackType = 'hit';
      p.attackTimer = 0.35;
      sound.playSwordSlash();
      performMeleeAttack(p, 35, 75, skinData.color);
    } else if (cmd === 'SPIN') {
      p.attackType = 'spin';
      p.attackTimer = 0.65;
      sound.playSpinAttack();
      performSpinAttack(p, 65, 110, skinData.color);
    } else if (cmd === 'SKY') {
      p.attackType = 'sky';
      p.attackTimer = 0.8;
      sound.playThunderStrike();
      performSkyThunder(p, 110, skinData.color);
      screenShakeRef.current = 14;
    } else if (cmd === 'PULL') {
      p.attackType = 'pull';
      p.attackTimer = 0.55;
      sound.playEnergyPull();
      performEnergyPull(p, 75, skinData.color);
    } else if (cmd === 'RAIN') {
      p.attackType = 'rain';
      p.attackTimer = 0.9;
      sound.playSwordRain();
      performSwordRain(p, 190, skinData.color);
      screenShakeRef.current = 20;
    }

    // --- GUN POWERS ---
    else if (cmd === 'FIRE') {
      p.attackType = 'fire';
      p.attackTimer = 0.25;
      sound.playGunshot();
      spawnBullet(p, p.facing === 'right' ? 14 : -14, 0, 55, '#f43f5e');
    } else if (cmd === 'TRIPLE') {
      p.attackType = 'triple';
      p.attackTimer = 0.4;
      sound.playGunshot();
      [-2.5, 0, 2.5].forEach((angleY) => {
        spawnBullet(p, p.facing === 'right' ? 14 : -14, angleY, 40, '#f43f5e');
      });
    } else if (cmd === 'RAPID') {
      p.attackType = 'rapid';
      p.attackTimer = 0.8;
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          sound.playGunshot();
          spawnBullet(p, p.facing === 'right' ? 15 : -15, (Math.random() - 0.5) * 2, 25, '#fb7185');
        }, i * 75);
      }
    } else if (cmd === 'LASER') {
      p.attackType = 'laser';
      p.attackTimer = 0.7;
      sound.playLaserCharge();
      setTimeout(() => {
        sound.playLaserFire();
        screenShakeRef.current = 10;
        fireLaserBeam(p, 210, '#f43f5e');
      }, 350);
    } else if (cmd === 'STORM') {
      p.attackType = 'storm';
      p.attackTimer = 0.9;
      sound.playGunshot();
      screenShakeRef.current = 16;
      performGunStorm(p, 280);
    }

    // --- BOW POWERS ---
    else if (cmd === 'ARROW') {
      p.attackType = 'arrow';
      p.attackTimer = 0.35;
      sound.playBowShot();
      spawnArrow(p, p.facing === 'right' ? 13 : -13, -1, 48, '#34d399');
    } else if (cmd === 'AIR') {
      p.attackType = 'air';
      p.attackTimer = 0.6;
      p.vy = -8.5; // Jump up into air
      sound.playBowShot();
      setTimeout(() => {
        [-1, 0, 1].forEach((spread) => {
          spawnArrow(p, (p.facing === 'right' ? 10 : -10) + spread, 5, 35, '#34d399');
        });
      }, 250);
    } else if (cmd === 'VOLLEY') {
      p.attackType = 'volley';
      p.attackTimer = 0.6;
      sound.playBowShot();
      performArrowVolley(p, 140);
    } else if (cmd === 'PIERCE') {
      p.attackType = 'pierce';
      p.attackTimer = 0.5;
      sound.playBowShot();
      spawnPiercingArrow(p, p.facing === 'right' ? 16 : -16, 0, 160, '#10b981');
    } else if (cmd === 'GIANT') {
      p.attackType = 'giant';
      p.attackTimer = 0.85;
      sound.playGiantArrowImpact();
      screenShakeRef.current = 18;
      performGiantArrow(p, 230);
    }

    onClearCommand();
  }, [currentCommand, equippedSkin, onClearCommand, onOpenChest]);

  // Helper spawners
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
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        size: 2 + Math.random() * 4,
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.02,
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
      vy: -1.2,
      color,
      alpha: 1.0,
    });
  };

  const spawnBullet = (p: any, vx: number, vy: number, damage: number, color: string) => {
    projectilesRef.current.push({
      id: Math.random().toString(),
      source: 'player',
      type: 'bullet',
      x: p.x + (p.facing === 'right' ? p.width + 4 : -4),
      y: p.y + p.height / 2 - 4,
      vx,
      vy,
      damage,
      radius: 4,
      color,
      lifespan: 2.5,
    });
  };

  const spawnArrow = (p: any, vx: number, vy: number, damage: number, color: string) => {
    projectilesRef.current.push({
      id: Math.random().toString(),
      source: 'player',
      type: 'arrow',
      x: p.x + (p.facing === 'right' ? p.width + 6 : -6),
      y: p.y + p.height / 2 - 2,
      vx,
      vy,
      damage,
      radius: 5,
      color,
      lifespan: 3.0,
    });
  };

  const spawnPiercingArrow = (p: any, vx: number, vy: number, damage: number, color: string) => {
    projectilesRef.current.push({
      id: Math.random().toString(),
      source: 'player',
      type: 'piercing_arrow',
      x: p.x + (p.facing === 'right' ? p.width + 8 : -8),
      y: p.y + p.height / 2,
      vx,
      vy,
      damage,
      radius: 6,
      color,
      piercing: true,
      hitEnemies: [],
      lifespan: 2.8,
    });
  };

  const fireLaserBeam = (p: any, damage: number, color: string) => {
    const originX = p.facing === 'right' ? p.x + p.width : p.x - 600;
    const beamW = 600;
    const beamY = p.y + p.height / 2 - 10;
    const beamH = 20;

    // Hit enemies in beam
    enemiesRef.current.forEach((en) => {
      if (en.x + en.width >= originX && en.x <= originX + beamW && Math.abs(en.y - beamY) < 40) {
        en.health -= damage;
        sound.playEnemyHit();
        spawnParticles(en.x + en.width / 2, en.y + en.height / 2, color, 14);
        spawnFloatingText(`-${damage}`, en.x, en.y - 10, color);
      }
    });

    // Check boss hit
    const boss = bossRef.current;
    if (boss && Math.abs(boss.heartY - beamY) < 60) {
      boss.health -= damage;
      sound.playHeartHit();
      spawnParticles(boss.heartX, boss.heartY, '#f43f5e', 20);
      spawnFloatingText(`-${damage}`, boss.heartX, boss.heartY - 20, '#f43f5e');
    }
  };

  const performMeleeAttack = (p: any, damage: number, reach: number, color: string) => {
    const attackX = p.facing === 'right' ? p.x + p.width : p.x - reach;

    enemiesRef.current.forEach((en) => {
      if (en.x + en.width >= attackX && en.x <= attackX + reach && Math.abs(en.y - p.y) < 50) {
        en.health -= damage;
        sound.playEnemyHit();
        spawnParticles(en.x + en.width / 2, en.y + en.height / 2, color, 8);
        spawnFloatingText(`-${damage}`, en.x, en.y - 10, color);
      }
    });

    const boss = bossRef.current;
    if (boss) {
      const dist = Math.hypot(p.x + p.width / 2 - boss.heartX, p.y + p.height / 2 - boss.heartY);
      if (dist < reach + boss.heartRadius + 20) {
        boss.health -= damage;
        sound.playHeartHit();
        spawnParticles(boss.heartX, boss.heartY, color, 15);
        spawnFloatingText(`-${damage}`, boss.heartX, boss.heartY - 20, '#facc15');
      }
    }
  };

  const performSpinAttack = (p: any, damage: number, radius: number, color: string) => {
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    enemiesRef.current.forEach((en) => {
      const ecx = en.x + en.width / 2;
      const ecy = en.y + en.height / 2;
      if (Math.hypot(cx - ecx, cy - ecy) < radius) {
        en.health -= damage;
        sound.playEnemyHit();
        spawnParticles(ecx, ecy, color, 10);
        spawnFloatingText(`-${damage}`, ecx, en.y - 10, color);
      }
    });

    const boss = bossRef.current;
    if (boss && Math.hypot(cx - boss.heartX, cy - boss.heartY) < radius + boss.heartRadius) {
      boss.health -= damage;
      sound.playHeartHit();
      spawnParticles(boss.heartX, boss.heartY, color, 14);
      spawnFloatingText(`-${damage}`, boss.heartX, boss.heartY - 15, color);
    }
  };

  const performSkyThunder = (p: any, damage: number, color: string) => {
    enemiesRef.current.forEach((en) => {
      en.health -= damage;
      sound.playEnemyHit();
      spawnParticles(en.x + en.width / 2, en.y + en.height / 2, color, 16, 'lightning');
      spawnFloatingText(`-${damage}`, en.x, en.y - 15, color);
    });

    const boss = bossRef.current;
    if (boss) {
      boss.health -= damage;
      sound.playHeartHit();
      spawnParticles(boss.heartX, boss.heartY, color, 25, 'lightning');
      spawnFloatingText(`-${damage}`, boss.heartX, boss.heartY - 20, color);
    }
  };

  const performEnergyPull = (p: any, damage: number, color: string) => {
    const cx = p.x + p.width / 2;
    enemiesRef.current.forEach((en) => {
      const dir = en.x > cx ? -1 : 1;
      en.x += dir * 120; // Pull inward
      en.health -= damage;
      sound.playEnemyHit();
      spawnParticles(en.x + en.width / 2, en.y + en.height / 2, color, 10);
      spawnFloatingText(`PULLED -${damage}`, en.x, en.y - 10, color);
    });
  };

  const performSwordRain = (p: any, damage: number, color: string) => {
    enemiesRef.current.forEach((en) => {
      en.health -= damage;
      sound.playEnemyHit();
      spawnParticles(en.x + en.width / 2, en.y + en.height / 2, color, 20);
      spawnFloatingText(`-${damage}`, en.x, en.y - 20, color);
    });

    const boss = bossRef.current;
    if (boss) {
      boss.health -= damage;
      sound.playHeartHit();
      spawnParticles(boss.heartX, boss.heartY, color, 30);
      spawnFloatingText(`-${damage}`, boss.heartX, boss.heartY - 30, color);
    }
  };

  const performGunStorm = (p: any, damage: number) => {
    enemiesRef.current.forEach((en) => {
      en.health -= damage;
      sound.playEnemyHit();
      spawnParticles(en.x + en.width / 2, en.y + en.height / 2, '#f43f5e', 22);
      spawnFloatingText(`-${damage}`, en.x, en.y - 15, '#f43f5e');
    });

    const boss = bossRef.current;
    if (boss) {
      boss.health -= damage;
      sound.playHeartHit();
      spawnParticles(boss.heartX, boss.heartY, '#f43f5e', 35);
      spawnFloatingText(`-${damage}`, boss.heartX, boss.heartY - 25, '#f43f5e');
    }
  };

  const performArrowVolley = (p: any, damage: number) => {
    enemiesRef.current.forEach((en) => {
      en.health -= damage;
      sound.playEnemyHit();
      spawnParticles(en.x + en.width / 2, en.y + en.height / 2, '#34d399', 14);
      spawnFloatingText(`-${damage}`, en.x, en.y - 10, '#34d399');
    });
  };

  const performGiantArrow = (p: any, damage: number) => {
    enemiesRef.current.forEach((en) => {
      en.health -= damage;
      sound.playEnemyHit();
      spawnParticles(en.x + en.width / 2, en.y + en.height / 2, '#10b981', 25);
      spawnFloatingText(`-${damage}`, en.x, en.y - 20, '#10b981');
    });
    const boss = bossRef.current;
    if (boss) {
      boss.health -= damage;
      sound.playHeartHit();
      spawnParticles(boss.heartX, boss.heartY, '#10b981', 30);
      spawnFloatingText(`-${damage}`, boss.heartX, boss.heartY - 25, '#10b981');
    }
  };

  // Main 60fps Game Simulation Loop
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

      // Update Screen Shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      // --- PLAYER PHYSICS & MOVEMENT ---
      const p = playerRef.current;
      p.x += p.vx;
      p.y += p.vy;

      // Apply Gravity unless climbing
      if (!p.climbing) {
        p.vy = Math.min(14, p.vy + 26 * dt);
      }

      // Horizontal friction
      p.vx *= 0.88;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;

      // Invulnerability timer countdown
      if (p.invulnerableTimer > 0) {
        p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
      }

      // Attack timer countdown
      if (p.attackTimer > 0) {
        p.attackTimer = Math.max(0, p.attackTimer - dt);
        if (p.attackTimer === 0) p.attackType = null;
      }

      // Platform collisions
      p.grounded = false;
      platformsRef.current.forEach((plat) => {
        // One-way landing on top
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.width &&
          p.y + p.height >= plat.y &&
          p.y + p.height <= plat.y + 18 &&
          p.vy >= 0 &&
          plat.type !== 'ladder'
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.grounded = true;
          p.climbing = false;
        }
      });

      // Ground safety bound
      if (p.y > 450 - p.height) {
        p.y = 450 - p.height;
        p.vy = 0;
        p.grounded = true;
      }

      // Arena boundaries
      const isAdventure = phase === 'ADVENTURE';
      if (!isAdventure) {
        // Locked to arena
        if (p.x < 20) p.x = 20;
        if (p.x > 940) p.x = 940;
      } else {
        // Adventure path
        if (p.x < 20) p.x = 20;
        // Reach finish archway at x > 2100 -> Level complete!
        if (p.x > 2100) {
          sound.playVictory();
          onLevelComplete();
        }
      }

      // Camera Tracking
      const targetCamX = Math.max(0, p.x - 400);
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;

      // Check proximity for chest & ladder affordances
      const chest = chestRef.current;
      const canOpen = chest !== null && chest.state === 'closed' && Math.abs(p.x - chest.x) < 70;
      setCanOpenChest(canOpen);

      const nearLadder = platformsRef.current.some(
        (plat) =>
          plat.type === 'ladder' &&
          p.x + p.width > plat.x - 15 &&
          p.x < plat.x + plat.width + 15 &&
          p.y + p.height >= plat.y &&
          p.y <= plat.y + plat.height
      );
      setCanClimb(nearLadder);

      // Check health pickup collision
      const pickup = healthPickupRef.current;
      if (pickup && !pickup.collected) {
        if (Math.abs(p.x - pickup.x) < 40 && Math.abs(p.y - pickup.y) < 50) {
          pickup.collected = true;
          onPlayerHeal(pickup.healAmount);
          sound.playCoin();
          spawnFloatingText(`+${pickup.healAmount} HP`, pickup.x, pickup.y - 20, '#34d399');
          spawnParticles(pickup.x, pickup.y, '#10b981', 15);
        }
      }

      // --- ENEMY WAVE SPAWNER (COMBAT PHASE) ---
      if (phase === 'COMBAT') {
        waveTimerRef.current -= dt;
        if (
          waveTimerRef.current <= 0 &&
          waveEnemiesSpawnedRef.current < waveEnemiesTotalRef.current
        ) {
          waveTimerRef.current = 2.4 - Math.min(1.2, level * 0.18);
          waveEnemiesSpawnedRef.current++;

          // Select enemy type based on Level
          let type: Enemy['type'] = 'sword';
          if (level === 2 && Math.random() < 0.45) type = 'hammer';
          else if (level === 3 && Math.random() < 0.4) type = 'archer';
          else if (level === 4 && Math.random() < 0.35) type = 'cannon';
          else if (level === 5 && Math.random() < 0.35) type = 'drone';
          else if (level > 2) {
            // Mixed wave
            const roll = Math.random();
            if (roll < 0.3) type = 'hammer';
            else if (roll < 0.55) type = 'archer';
            else if (roll < 0.75) type = 'cannon';
            else type = 'sword';
          }

          const spawnFromRight = Math.random() > 0.5;
          const spawnX = spawnFromRight ? 960 : 40;
          const spawnY = type === 'drone' ? 140 : 380;

          const newEnemy: Enemy = {
            id: Math.random().toString(),
            type,
            name: type.toUpperCase(),
            x: spawnX,
            y: spawnY,
            width: type === 'hammer' ? 44 : type === 'drone' ? 40 : 32,
            height: type === 'hammer' ? 56 : type === 'drone' ? 30 : 50,
            vx: 0,
            vy: 0,
            facing: spawnFromRight ? 'left' : 'right',
            maxHealth: type === 'hammer' ? 140 : type === 'cannon' ? 180 : type === 'drone' ? 100 : 70,
            health: type === 'hammer' ? 140 : type === 'cannon' ? 180 : type === 'drone' ? 100 : 70,
            damage: type === 'hammer' ? 32 : type === 'cannon' ? 40 : type === 'drone' ? 28 : 14,
            attackCooldown: type === 'hammer' ? 3.0 : type === 'cannon' ? 4.2 : type === 'drone' ? 3.5 : 1.2,
            attackTimer: 1.5,
            state: 'walking',
          };

          enemiesRef.current.push(newEnemy);
        }

        // Check if wave is cleared
        if (
          waveEnemiesSpawnedRef.current >= waveEnemiesTotalRef.current &&
          enemiesRef.current.length === 0
        ) {
          onWaveComplete();
        }
      }

      // --- BOSS PHASE SIMULATION (LEVEL 6) ---
      const boss = bossRef.current;
      if (boss && phase === 'BOSS') {
        // Boss entrance rising
        if (boss.state === 'rising') {
          boss.entranceProgress += dt * 0.4;
          boss.y = 350 - boss.entranceProgress * 230;
          boss.heartY = boss.y + 110;
          if (boss.entranceProgress >= 1.0) {
            boss.state = 'active';
            boss.y = 120;
            boss.heartY = 230;
          }
        } else if (boss.state === 'active') {
          boss.heartPulsing += dt * 4;
          boss.attackTimer -= dt;

          if (boss.attackTimer <= 0) {
            boss.attackTimer = 5.0;
            // Random Attack Selection: Eye Laser or Sky Meteors
            if (Math.random() > 0.45) {
              boss.state = 'eye_laser';
              boss.laserSweeping = true;
              boss.laserDirection = p.x > boss.heartX ? 'left' : 'right';
              boss.laserBeamX = boss.laserDirection === 'left' ? 950 : 50;
              sound.playBossEyeLaser();
            } else {
              // Meteor shockwave
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

          // Spawn fast health recovery enemy when player HP < 50%
          if (playerHealth < playerMaxHealth * 0.5) {
            recoveryEnemyTimerRef.current -= dt;
            if (recoveryEnemyTimerRef.current <= 0) {
              recoveryEnemyTimerRef.current = 18.0; // Every 18s
              enemiesRef.current.push({
                id: Math.random().toString(),
                type: 'recovery',
                name: 'MEDIC SHINOBI',
                x: Math.random() > 0.5 ? 950 : 50,
                y: 380,
                width: 30,
                height: 48,
                vx: 0,
                vy: 0,
                facing: 'left',
                maxHealth: 45,
                health: 45,
                damage: 0,
                attackCooldown: 10,
                attackTimer: 10,
                state: 'walking',
              });
            }
          }
        } else if (boss.state === 'eye_laser') {
          // Sweeping eye laser beam
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

          // Damage player if in laser beam and not jumped high enough
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

        // Check boss defeat
        if (boss.health <= 0) {
          boss.health = 0;
          boss.state = 'defeated';
          sound.playVictory();
          onAddCoins(5000); // 5,000 Coin reward target for story completion
          spawnFloatingText('+5,000 COINS! BOSS DEFEATED', boss.heartX, boss.heartY - 40, '#facc15');
          onBossDefeated();
        }
      }

      // --- ENEMY AI & UPDATES ---
      enemiesRef.current = enemiesRef.current.filter((en) => {
        if (en.health <= 0) {
          // Death rewards
          const coinReward = en.type === 'hammer' ? 60 : en.type === 'cannon' ? 90 : en.type === 'drone' ? 75 : 30;
          onAddCoins(coinReward);
          sound.playCoin();
          spawnFloatingText(`+${coinReward}c`, en.x, en.y - 10, '#facc15');
          spawnParticles(en.x + en.width / 2, en.y + en.height / 2, '#facc15', 12, 'coin');

          // Health recovery enemy heals player!
          if (en.type === 'recovery') {
            onPlayerHeal(50);
            spawnFloatingText('+50 HP RECOVERED!', en.x, en.y - 30, '#10b981');
            sound.playVictory();
          }

          return false;
        }

        // Hammer enemy 50% health knockdown behavior
        if (en.type === 'hammer' && en.health <= en.maxHealth * 0.5 && !en.hasKnockdownHappened) {
          en.hasKnockdownHappened = true;
          en.state = 'knockdown';
          en.knockdownTimer = 2.0; // falls to ground for 2 seconds then rises
          spawnFloatingText('KNOCKDOWN!', en.x, en.y - 20, '#fbbf24');
        }

        if (en.state === 'knockdown') {
          en.knockdownTimer = (en.knockdownTimer || 2.0) - dt;
          if (en.knockdownTimer <= 0) {
            en.state = 'walking';
          }
          return true; // Still alive
        }

        // AI Movement toward player
        const dx = p.x + p.width / 2 - (en.x + en.width / 2);
        en.facing = dx > 0 ? 'right' : 'left';

        if (en.type === 'drone') {
          // Drone flies above player
          const targetY = 160;
          en.x += Math.sign(dx) * 2.2;
          en.y += (targetY - en.y) * 0.05;

          en.attackTimer -= dt;
          if (en.attackTimer <= 1.2 && !en.laserCharging) {
            en.laserCharging = true;
            en.targetX = p.x + p.width / 2; // Lock target position!
            sound.playLaserCharge();
          }
          if (en.attackTimer <= 0) {
            en.attackTimer = en.attackCooldown;
            en.laserCharging = false;
            // Fires laser at locked targetX
            sound.playLaserFire();
            const beamX = en.targetX || p.x;
            if (Math.abs(p.x + p.width / 2 - beamX) < 25 && p.invulnerableTimer === 0) {
              p.invulnerableTimer = 1.2;
              onPlayerDamage(en.damage);
              sound.playPlayerDamage();
            }
            spawnParticles(beamX, 420, '#f43f5e', 14);
          }
        } else if (en.type === 'cannon') {
          // Cannon moves very slowly
          en.x += Math.sign(dx) * 0.5;
          en.attackTimer -= dt;
          if (en.attackTimer <= 1.2 && en.targetX === undefined) {
            en.targetX = p.x; // Lock ground target!
          }
          if (en.attackTimer <= 0) {
            en.attackTimer = en.attackCooldown;
            sound.playCannonFire();
            const groundX = en.targetX || p.x;
            en.targetX = undefined;
            // Launch cannonball towards locked target
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
          // Archer stays at distance
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
              vx: en.facing === 'right' ? 8 : -8,
              vy: -0.5,
              damage: en.damage,
              radius: 4,
              color: '#facc15',
              lifespan: 3.0,
            });
          }
        } else if (en.type === 'recovery') {
          // Moves fast across arena to escape!
          en.x += (en.facing === 'right' ? 3.5 : -3.5);
          if (en.x > 1050 || en.x < -50) return false; // Escaped
        } else {
          // Sword & Hammer melee enemies
          const speed = en.type === 'hammer' ? 1.4 : 2.5;
          if (Math.abs(dx) > 40) {
            en.x += Math.sign(dx) * speed;
          } else {
            // Melee strike
            en.attackTimer -= dt;
            if (en.attackTimer <= 0) {
              en.attackTimer = en.attackCooldown;
              if (en.type === 'hammer') sound.playHammerSmash();
              else sound.playSwordSlash();

              if (p.invulnerableTimer === 0) {
                p.invulnerableTimer = 1.2;
                onPlayerDamage(en.damage);
                sound.playPlayerDamage();
                spawnParticles(p.x, p.y + p.height / 2, '#f43f5e', 8);
              }
            }
          }
        }

        return true;
      });

      // --- PROJECTILES SIMULATION ---
      projectilesRef.current = projectilesRef.current.filter((proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Cannonball gravity
        if (proj.type === 'cannonball') {
          proj.vy += 18 * dt;
          if (proj.y >= 430) {
            // Explode on ground
            sound.playCannonFire();
            screenShakeRef.current = 8;
            spawnParticles(proj.x, 430, '#f97316', 18);
            if (Math.abs(p.x + p.width / 2 - proj.x) < 45 && p.invulnerableTimer === 0) {
              p.invulnerableTimer = 1.2;
              onPlayerDamage(proj.damage);
              sound.playPlayerDamage();
            }
            return false;
          }
        }

        proj.lifespan -= dt;
        if (proj.lifespan <= 0) return false;

        // Enemy projectile hits player
        if (proj.source === 'enemy' || proj.source === 'boss') {
          if (
            proj.x > p.x &&
            proj.x < p.x + p.width &&
            proj.y > p.y &&
            proj.y < p.y + p.height
          ) {
            if (p.invulnerableTimer === 0) {
              p.invulnerableTimer = 1.2;
              onPlayerDamage(proj.damage);
              sound.playPlayerDamage();
              spawnParticles(proj.x, proj.y, '#f43f5e', 10);
            }
            return false;
          }
        }

        // Player projectile hits enemies
        if (proj.source === 'player') {
          for (const en of enemiesRef.current) {
            if (
              proj.x > en.x &&
              proj.x < en.x + en.width &&
              proj.y > en.y &&
              proj.y < en.y + en.height
            ) {
              if (proj.piercing) {
                if (!proj.hitEnemies?.includes(en.id)) {
                  proj.hitEnemies?.push(en.id);
                  en.health -= proj.damage;
                  sound.playEnemyHit();
                  spawnParticles(proj.x, proj.y, proj.color, 8);
                  spawnFloatingText(`-${proj.damage}`, en.x, en.y - 10, proj.color);
                }
              } else {
                en.health -= proj.damage;
                sound.playEnemyHit();
                spawnParticles(proj.x, proj.y, proj.color, 8);
                spawnFloatingText(`-${proj.damage}`, en.x, en.y - 10, proj.color);
                return false;
              }
            }
          }

          // Player projectile hits boss heart
          const boss = bossRef.current;
          if (boss) {
            const dist = Math.hypot(proj.x - boss.heartX, proj.y - boss.heartY);
            if (dist < proj.radius + boss.heartRadius) {
              boss.health -= proj.damage;
              sound.playHeartHit();
              spawnParticles(boss.heartX, boss.heartY, proj.color, 15);
              spawnFloatingText(`-${proj.damage}`, boss.heartX, boss.heartY - 20, '#facc15');
              return false;
            }
          }
        }

        return true;
      });

      // --- PARTICLES UPDATE ---
      particlesRef.current = particlesRef.current.filter((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        return pt.alpha > 0;
      });

      // --- FLOATING TEXTS UPDATE ---
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        return ft.alpha > 0;
      });

      // ==========================================
      // --- RENDERING PIPELINE (2D CANVAS) ---
      // ==========================================
      ctx.save();

      // Screen Shake translation
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const camX = cameraRef.current.x;

      // 1. Far Background Parallax Layer
      const bgImg = level === 6 ? bossBgRef.current : forestBgRef.current;
      if (bgImg) {
        const parallaxX = -(camX * 0.25) % canvas.width;
        ctx.drawImage(bgImg, parallaxX, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, parallaxX + canvas.width, 0, canvas.width, canvas.height);
      } else {
        // Fallback atmospheric gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Fixed Directional Sunlight & Ray Beams
      const sunX = canvas.width * 0.85;
      const sunY = 50;
      ctx.save();
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 350);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      sunGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.1)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // World Camera Space
      ctx.save();
      ctx.translate(-camX, 0);

      // 3. Render Platforms & Terrain
      platformsRef.current.forEach((plat) => {
        // Cast directional shadow along Sun vector (angle from top-right)
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.moveTo(plat.x - 30, plat.y + plat.height + 15);
        ctx.lineTo(plat.x + plat.width - 15, plat.y + plat.height + 15);
        ctx.lineTo(plat.x + plat.width, plat.y + plat.height);
        ctx.lineTo(plat.x, plat.y + plat.height);
        ctx.fill();
        ctx.restore();

        // Platform surface
        if (plat.type === 'ground') {
          // Lush grass top over earthy stone
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#10b981'; // Vibrant mossy grass
          ctx.fillRect(plat.x, plat.y, plat.width, 8);
          ctx.fillStyle = '#059669';
          ctx.fillRect(plat.x, plat.y + 8, plat.width, 4);
        } else if (plat.type === 'floating') {
          // Floating Rock formation
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fill();
          ctx.fillStyle = '#34d399';
          ctx.fillRect(plat.x + 4, plat.y, plat.width - 8, 5);
        } else if (plat.type === 'wooden') {
          // Wooden bridge plank
          ctx.fillStyle = '#78350f';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(plat.x, plat.y, plat.width, 4);
        } else if (plat.type === 'ladder') {
          // Vertical ladder rungs
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 4;
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
          for (let ry = plat.y + 15; ry < plat.y + plat.height; ry += 20) {
            ctx.beginPath();
            ctx.moveTo(plat.x, ry);
            ctx.lineTo(plat.x + plat.width, ry);
            ctx.stroke();
          }
        }
      });

      // 4. Render Treasure Chest
      const ch = chestRef.current;
      if (ch) {
        ctx.save();
        ctx.fillStyle = ch.type === 'golden' ? '#eab308' : ch.type === 'purple' ? '#a855f7' : '#92400e';
        ctx.fillRect(ch.x, ch.y, ch.width, ch.height);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(ch.x + ch.width / 2 - 4, ch.y + 12, 8, 10); // Latch
        if (ch.state === 'closed') {
          // Floating 'OPEN' prompt
          ctx.font = 'bold 11px JetBrains Mono';
          ctx.fillStyle = '#facc15';
          ctx.fillText('TYPE: OPEN', ch.x - 8, ch.y - 12);
        }
        ctx.restore();
      }

      // 5. Render Health Pickup
      const hp = healthPickupRef.current;
      if (hp && !hp.collected) {
        ctx.save();
        const pulse = Math.sin(time * 0.006) * 4;
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(hp.x, hp.y + pulse, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Plus Jakarta Sans';
        ctx.fillText('+', hp.x - 4, hp.y + pulse + 4);
        ctx.restore();
      }

      // 6. Render Enemies
      enemiesRef.current.forEach((en) => {
        ctx.save();
        const ecx = en.x + en.width / 2;
        const ecy = en.y + en.height / 2;

        // Ground contact shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(ecx, en.y + en.height, en.width / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Enemy Drone Laser Aim Beam
        if (en.type === 'drone' && en.laserCharging && en.targetX !== undefined) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ecx, en.y + en.height);
          ctx.lineTo(en.targetX, 440);
          ctx.stroke();
          // Target ground ring
          ctx.strokeStyle = '#f43f5e';
          ctx.strokeRect(en.targetX - 12, 436, 24, 6);
        }

        // Cannon ground indicator
        if (en.type === 'cannon' && en.targetX !== undefined) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.beginPath();
          ctx.arc(en.targetX, 435, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.stroke();
        }

        // Render Enemy Sprite
        if (en.state === 'knockdown') {
          // Hammer enemy lying down
          ctx.fillStyle = '#475569';
          ctx.fillRect(en.x, en.y + en.height - 18, en.height, 18);
        } else {
          // Standard standing / walking enemy
          const enColor =
            en.type === 'hammer'
              ? '#b91c1c'
              : en.type === 'cannon'
              ? '#334155'
              : en.type === 'drone'
              ? '#0284c7'
              : en.type === 'recovery'
              ? '#059669'
              : '#dc2626';

          ctx.fillStyle = enColor;
          ctx.beginPath();
          ctx.roundRect(en.x, en.y, en.width, en.height, 6);
          ctx.fill();

          // Weapon indicator
          ctx.fillStyle = '#cbd5e1';
          if (en.facing === 'right') {
            ctx.fillRect(en.x + en.width - 4, en.y + 16, 14, 4);
          } else {
            ctx.fillRect(en.x - 10, en.y + 16, 14, 4);
          }
        }

        // Enemy Health Bar
        const hpPercent = Math.max(0, en.health / en.maxHealth);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(en.x, en.y - 10, en.width, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : '#f43f5e';
        ctx.fillRect(en.x, en.y - 10, en.width * hpPercent, 4);

        ctx.restore();
      });

      // 7. Render Boss (Level 6)
      if (boss && phase === 'BOSS') {
        ctx.save();

        // Giant Monster Silhouette & Body
        ctx.fillStyle = '#1e1b4b'; // Dark Void Purple
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(boss.x, boss.y, boss.width, boss.height, 24);
        ctx.fill();

        // Glowing Eyes
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(boss.x + 60, boss.y + 55, 10, 0, Math.PI * 2);
        ctx.arc(boss.x + boss.width - 60, boss.y + 55, 10, 0, Math.PI * 2);
        ctx.fill();

        // Sweeping Eye Laser Beam
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

        // Weak Point Pulsating Heart
        const pulse = Math.sin(boss.heartPulsing) * 3;
        ctx.save();
        ctx.fillStyle = '#e11d48';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 20 + pulse * 2;
        ctx.beginPath();
        ctx.arc(boss.heartX, boss.heartY, boss.heartRadius + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fecdd3';
        ctx.beginPath();
        ctx.arc(boss.heartX, boss.heartY, (boss.heartRadius + pulse) * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      // 8. Render Player Ninja
      ctx.save();
      const pcx = p.x + p.width / 2;
      const pcy = p.y + p.height / 2;

      // Ground Contact Shadow reacting to jump height
      const groundY = 440;
      const jumpHeight = Math.max(0, groundY - (p.y + p.height));
      const shadowScale = Math.max(0.4, 1.0 - jumpHeight / 200);
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * shadowScale})`;
      ctx.beginPath();
      // Directional displacement from Sun (Sun at top-right casts shadow to bottom-left)
      const sunShadowOffsetX = -jumpHeight * 0.35;
      ctx.ellipse(pcx + sunShadowOffsetX, groundY, (p.width / 2) * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Invulnerability Flash (blinks when hurt)
      if (p.invulnerableTimer > 0 && Math.floor(time * 0.02) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Elemental Skin colors
      const skin = ELEMENTAL_SKIN_DATA[equippedSkin];

      // Draw Ninja Body
      ctx.fillStyle = '#0f172a'; // Stealth suit
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + 12, p.width, p.height - 12, 6);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(pcx, p.y + 8, 12, 0, Math.PI * 2);
      ctx.fill();

      // Elemental Headband with Glowing Scarf Tail
      ctx.fillStyle = skin.color;
      ctx.fillRect(p.x + 2, p.y + 2, p.width - 4, 4);

      // Flapping Scarf Tail
      ctx.strokeStyle = skin.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const wave = Math.sin(time * 0.01) * 6;
      ctx.moveTo(p.facing === 'right' ? p.x : p.x + p.width, p.y + 4);
      ctx.quadraticCurveTo(
        p.facing === 'right' ? p.x - 14 : p.x + p.width + 14,
        p.y + 4 + wave,
        p.facing === 'right' ? p.x - 28 : p.x + p.width + 28,
        p.y + 2 - wave
      );
      ctx.stroke();

      // Elemental Belt
      ctx.fillStyle = skin.color;
      ctx.fillRect(p.x + 2, p.y + 28, p.width - 4, 4);

      // Sword Slash Trail Animation
      if (p.attackType === 'hit' || p.attackType === 'spin') {
        ctx.save();
        ctx.strokeStyle = skin.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = skin.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        const slashRadius = 45;
        const startAng = p.facing === 'right' ? -0.8 : Math.PI - 0.8;
        ctx.arc(pcx, pcy, slashRadius, startAng, startAng + 1.8);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore(); // end player

      // 9. Render Projectiles
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

      // 10. Render Particles
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

      // 11. Render Floating Combat Damage / Reward Numbers
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore(); // end camera translate
      ctx.restore(); // end screen shake

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [level, phase, playerHealth, playerMaxHealth, equippedSkin, onPlayerDamage, onPlayerHeal, onAddCoins, onWaveComplete, onLevelComplete, onBossDefeated, setCanOpenChest, setCanClimb]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-2xl">
      <canvas
        ref={canvasRef}
        width={1000}
        height={520}
        className="w-full h-full block select-none"
      />
    </div>
  );
};
