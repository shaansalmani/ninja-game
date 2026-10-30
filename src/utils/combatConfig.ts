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
  gun: 0, // Default weapon
  bow: 15000,
  sword: 0, // Legacy fallback
};

export const ELEMENTAL_SKIN_DATA: Record<ElementalSkin, { name: string; color: string; glow: string; desc: string }> = {
  lightning: {
    name: 'Lightning Shinobi',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.9)',
    desc: 'Electric energy trails, blue-white plasma sparks and lightning agility.',
  },
  fire: {
    name: 'Flame Ronin',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.9)',
    desc: 'Blazing muzzle flares, burning embers and scorched earth shockwaves.',
  },
  water: {
    name: 'Tidal Phantom',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.9)',
    desc: 'Fluid energy arcs, azure splashes and cleansing tidal velocity.',
  },
  diamond: {
    name: 'Crystal Shadow',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.9)',
    desc: 'Prismatic crystal muzzle flashes and sparkling diamond lasers.',
  },
  rock: {
    name: 'Earthen Striker',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.9)',
    desc: 'Heavy kinetic impact slugs, earthquake tremors and boulder shockwaves.',
  },
};

export const GUN_SKIN_DATA: Record<
  import('../types/game').GunSkinId,
  { name: string; color: string; glow: string; bulletColor: string; price: number; desc: string }
> = {
  plasma_cyan: {
    name: 'Plasma Carbine',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.9)',
    bulletColor: '#22d3ee',
    price: 0,
    desc: 'Default military issue plasma firearm with accelerated ionized bolts.',
  },
  crimson_fury: {
    name: 'Crimson Fury',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.9)',
    bulletColor: '#fb7185',
    price: 2500,
    desc: 'Thermobaric incendiary rounds with explosive muzzle flares.',
  },
  neon_emerald: {
    name: 'Hyper Emerald',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.9)',
    bulletColor: '#34d399',
    price: 4000,
    desc: 'Overcharged kinetic slugs with boosted muzzle velocity and rapid cycling.',
  },
  golden_viper: {
    name: 'Golden Viper',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.9)',
    bulletColor: '#facc15',
    price: 7000,
    desc: 'Hand-crafted gold-titanium receiver firing heavy armor-piercing slugs.',
  },
  void_purple: {
    name: 'Void Pulsar',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.9)',
    bulletColor: '#c084fc',
    price: 10000,
    desc: 'Experimental dark matter cannon firing devastating concentrated void beams.',
  },
};

export const OUTFIT_DATA: Record<
  import('../types/game').OutfitId,
  { name: string; primaryColor: string; accentColor: string; price: number; desc: string }
> = {
  tactical_stealth: {
    name: 'Tactical Shinobi',
    primaryColor: '#090e1a',
    accentColor: '#06b6d4',
    price: 0,
    desc: 'Matte ballistic composite weave engineered for silent covert operations.',
  },
  cyber_spec_ops: {
    name: 'Cyber Commando',
    primaryColor: '#06201b',
    accentColor: '#10b981',
    price: 3000,
    desc: 'Ceramic exoclad torso with integrated power cells and tactical pouches.',
  },
  crimson_ronin: {
    name: 'Crimson Ronin',
    primaryColor: '#3b0d11',
    accentColor: '#f43f5e',
    price: 4500,
    desc: 'Vanguard combat gear infused with volcanic heat-shielded weaves.',
  },
  shadow_wraith: {
    name: 'Shadow Wraith',
    primaryColor: '#20083b',
    accentColor: '#c084fc',
    price: 6000,
    desc: 'Adaptive nanoweave shroud that bends light and disperses projectile impact.',
  },
  golden_warlord: {
    name: 'Golden Vanguard',
    primaryColor: '#2b1704',
    accentColor: '#facc15',
    price: 8500,
    desc: 'Gilded ceremonial power armor awarded to master sharpshooters.',
  },
};

export const CHARACTER_DATA: Record<
  import('../types/game').CharacterModelId,
  { name: string; title: string; price: number; desc: string }
> = {
  myraa_hunter: {
    name: 'Myraa Hunter',
    title: 'Tactical Gunslinger',
    price: 0,
    desc: 'Elite operative combining shinobi mobility with deadly firearm marksmanship.',
  },
  shadow_commando: {
    name: 'Shadow Commando',
    title: 'Heavy Specialist',
    price: 5000,
    desc: 'Reinforced assault unit trained in continuous suppressive fire and heavy ordnance.',
  },
  kunoichi_sniper: {
    name: 'Kunoichi Sniper',
    title: 'Phantom Scout',
    price: 7500,
    desc: 'Lethal marksman specialized in acrobatic leaps and long-range piercing strikes.',
  },
};
