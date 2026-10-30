import { PowerConfig, WeaponType, ElementalSkin } from '../types/game';

export const SWORD_POWERS: PowerConfig[] = [
  {
    id: 'HIT',
    name: 'Normal Strike',
    command: 'HIT',
    description: 'Rapid sword slash combo dealing solid melee damage.',
    cooldown: 0.4,
    damage: 35,
    unlocked: true,
    price: 1000,
  },
  {
    id: 'SPIN',
    name: 'Spinning Blade',
    command: 'SPIN',
    description: '360° spinning whirlwind that slices all surrounding enemies.',
    cooldown: 2.5,
    damage: 65,
    unlocked: false,
    price: 2000,
  },
  {
    id: 'SKY',
    name: 'Sky Storm',
    command: 'SKY',
    description: 'Raises blade to summon thunder and elemental strikes from above.',
    cooldown: 4.5,
    damage: 110,
    unlocked: false,
    price: 3000,
  },
  {
    id: 'PULL',
    name: 'Energy Pull',
    command: 'PULL',
    description: 'Emits a gravity beam that pulls enemies inward into sword range.',
    cooldown: 3.5,
    damage: 75,
    unlocked: false,
    price: 4000,
  },
  {
    id: 'RAIN',
    name: 'Sword Rain',
    command: 'RAIN',
    description: 'Calls a storm of mystical blades crashing down across the arena.',
    cooldown: 6.0,
    damage: 190,
    unlocked: false,
    price: 5000,
  },
];

export const GUN_POWERS: PowerConfig[] = [
  {
    id: 'FIRE',
    name: 'Pistol Shot',
    command: 'FIRE',
    description: 'High velocity single round fired straight or angled while leaping.',
    cooldown: 0.35,
    damage: 55,
    unlocked: true,
  },
  {
    id: 'TRIPLE',
    name: 'Triple Burst',
    command: 'TRIPLE',
    description: 'Fires three spreading bullets covering a wide horizontal zone.',
    cooldown: 1.8,
    damage: 120, // 3x40
    unlocked: true,
  },
  {
    id: 'RAPID',
    name: 'Rapid Fire',
    command: 'RAPID',
    description: 'Automatic high-speed volley of 10 bullets that shreds incoming waves.',
    cooldown: 3.5,
    damage: 180, // 10x18
    unlocked: true,
  },
  {
    id: 'LASER',
    name: 'Charged Laser',
    command: 'LASER',
    description: 'Gathers energy at the barrel and fires a devastating piercing laser beam.',
    cooldown: 4.5,
    damage: 210,
    unlocked: true,
  },
  {
    id: 'STORM',
    name: 'Bullet Storm',
    command: 'STORM',
    description: 'Tosses gun aloft to blanket the entire arena with a rain of bullets.',
    cooldown: 6.5,
    damage: 280,
    unlocked: true,
  },
];

export const BOW_POWERS: PowerConfig[] = [
  {
    id: 'ARROW',
    name: 'Swift Arrow',
    command: 'ARROW',
    description: 'Accurate high-damage arrow shot with clean trajectory.',
    cooldown: 0.45,
    damage: 48,
    unlocked: true,
  },
  {
    id: 'AIR',
    name: 'Air Leap Shot',
    command: 'AIR',
    description: 'Leaps into the air and fires 3 descending arrows covering ground targets.',
    cooldown: 2.0,
    damage: 105,
    unlocked: true,
  },
  {
    id: 'VOLLEY',
    name: 'Arrow Volley',
    command: 'VOLLEY',
    description: 'Shoots high into the sky, raining smaller arrows over enemies.',
    cooldown: 3.8,
    damage: 140,
    unlocked: true,
  },
  {
    id: 'PIERCE',
    name: 'Piercing Arrow',
    command: 'PIERCE',
    description: 'Channeled energy arrow that slices cleanly through all foes in its path.',
    cooldown: 4.0,
    damage: 160,
    unlocked: true,
  },
  {
    id: 'GIANT',
    name: 'Giant Arrow',
    command: 'GIANT',
    description: 'Calls massive ancestral arrows crashing down with heavy shockwaves.',
    cooldown: 6.0,
    damage: 230,
    unlocked: true,
  },
];

export const WEAPON_PRICES: Record<WeaponType, number> = {
  sword: 0,
  gun: 10000,
  bow: 20000,
};

export const ELEMENTAL_SKIN_DATA: Record<ElementalSkin, { name: string; color: string; glow: string; desc: string }> = {
  lightning: {
    name: 'Lightning Shinobi',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.9)',
    desc: 'Electric sword trails, blue-white plasma sparks and lightning agility.',
  },
  fire: {
    name: 'Flame Ronin',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.9)',
    desc: 'Blazing sword trails, burning embers and scorched earth shockwaves.',
  },
  water: {
    name: 'Tidal Phantom',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.9)',
    desc: 'Fluid water blade arcs, azure splashes and cleansing tidal energy.',
  },
  diamond: {
    name: 'Crystal Shadow',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.9)',
    desc: 'Prismatic crystal blade flashes and sparkling diamond shrapnel.',
  },
  rock: {
    name: 'Earthen Striker',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.9)',
    desc: 'Heavy stone debris, earthquake tremors and boulder impact shocks.',
  },
};
