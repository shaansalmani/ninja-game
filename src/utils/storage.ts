import { GameSettings, PlayerProgress, WeaponType, ElementalSkin, ControllerSettings } from '../types/game';
import { DEFAULT_KEY_MAPPING } from './inputManager';

const PROGRESS_KEY = 'ninja_shadows_progress_v2';
const SETTINGS_KEY = 'ninja_shadows_settings_v3';

export const DEFAULT_CONTROLLER_SETTINGS: ControllerSettings = {
  enabled: true,
  visibility: 'always',
  buttonSize: 'medium',
  joystickSensitivity: 1.0,
  opacity: 0.85,
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 1500,
  highestLevelUnlocked: 1,
  storyLevel: 1,
  highestStoryCompleted: 0,
  equippedWeapon: 'gun',
  equippedSkin: 'lightning',
  unlockedSkins: ['lightning', 'fire', 'water', 'diamond', 'rock'],
  equippedGunSkin: 'plasma_cyan',
  unlockedGunSkins: ['plasma_cyan'],
  equippedOutfit: 'tactical_stealth',
  unlockedOutfits: ['tactical_stealth'],
  characterModel: 'myraa_hunter',
  unlockedCharacters: ['myraa_hunter'],
  unlockedWeapons: ['gun'],
  unlockedPowers: ['FIRE', 'TRIPLE'],
  temporaryWeapon: null,
  temporaryWeaponExpiresAt: null,
  bestWpm: 0,
  bestAccuracy: 0,
  totalWins: 0,
  totalRaces: 0,
  totalWordsTyped: 0,
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  bgMusicEnabled: true,
  soundVolume: 0.8,
  difficulty: 'normal',
  countdownEnabled: true,
  language: 'English',
  controllerSettings: { ...DEFAULT_CONTROLLER_SETTINGS },
  keyMapping: { ...DEFAULT_KEY_MAPPING },
};

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    
    // Auto-migrate any legacy 'sword' equipped weapon to 'gun'
    const rawWeapon = parsed.equippedWeapon as WeaponType;
    const activeWeapon: WeaponType = rawWeapon === 'sword' || !rawWeapon ? 'gun' : rawWeapon;

    return {
      coins: Math.max(0, Number(parsed.coins) ?? DEFAULT_PROGRESS.coins),
      highestLevelUnlocked: Math.max(1, Number(parsed.highestLevelUnlocked) || 1),
      storyLevel: Math.max(1, Number(parsed.storyLevel) || 1),
      highestStoryCompleted: Math.max(0, Number(parsed.highestStoryCompleted) || 0),
      equippedWeapon: activeWeapon,
      equippedSkin: (parsed.equippedSkin as ElementalSkin) || 'lightning',
      unlockedSkins: Array.isArray(parsed.unlockedSkins) && parsed.unlockedSkins.length > 0
        ? parsed.unlockedSkins
        : DEFAULT_PROGRESS.unlockedSkins,
      equippedGunSkin: parsed.equippedGunSkin || 'plasma_cyan',
      unlockedGunSkins: Array.isArray(parsed.unlockedGunSkins) && parsed.unlockedGunSkins.length > 0
        ? parsed.unlockedGunSkins
        : DEFAULT_PROGRESS.unlockedGunSkins,
      equippedOutfit: parsed.equippedOutfit || 'tactical_stealth',
      unlockedOutfits: Array.isArray(parsed.unlockedOutfits) && parsed.unlockedOutfits.length > 0
        ? parsed.unlockedOutfits
        : DEFAULT_PROGRESS.unlockedOutfits,
      characterModel: parsed.characterModel || 'myraa_hunter',
      unlockedCharacters: Array.isArray(parsed.unlockedCharacters) && parsed.unlockedCharacters.length > 0
        ? parsed.unlockedCharacters
        : DEFAULT_PROGRESS.unlockedCharacters,
      unlockedWeapons: Array.isArray(parsed.unlockedWeapons) && parsed.unlockedWeapons.length > 0
        ? parsed.unlockedWeapons.filter((w: string) => w !== 'sword').concat(['gun'])
        : DEFAULT_PROGRESS.unlockedWeapons,
      unlockedPowers: Array.isArray(parsed.unlockedPowers) && parsed.unlockedPowers.length > 0
        ? parsed.unlockedPowers
        : DEFAULT_PROGRESS.unlockedPowers,
      temporaryWeapon: parsed.temporaryWeapon === 'sword' ? null : parsed.temporaryWeapon || null,
      temporaryWeaponExpiresAt: parsed.temporaryWeaponExpiresAt || null,
      bestWpm: Math.max(0, Number(parsed.bestWpm) || 0),
      bestAccuracy: Math.max(0, Number(parsed.bestAccuracy) || 0),
      totalWins: Math.max(0, Number(parsed.totalWins) || 0),
      totalRaces: Math.max(0, Number(parsed.totalRaces) || 0),
      totalWordsTyped: Math.max(0, Number(parsed.totalWordsTyped) || 0),
    };
  } catch (err) {
    console.warn('Failed to load progress from localStorage', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save progress to localStorage', err);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: parsed.soundEnabled ?? true,
      bgMusicEnabled: parsed.bgMusicEnabled ?? true,
      soundVolume: parsed.soundVolume ?? 0.8,
      difficulty: parsed.difficulty || 'normal',
      countdownEnabled: parsed.countdownEnabled ?? true,
      language: 'English',
      controllerSettings: {
        ...DEFAULT_CONTROLLER_SETTINGS,
        ...(parsed.controllerSettings || {}),
      },
      keyMapping: {
        ...DEFAULT_KEY_MAPPING,
        ...(parsed.keyMapping || {}),
      },
    };
  } catch (err) {
    console.warn('Failed to load settings from localStorage', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage', err);
  }
}

export function addCoins(amount: number): PlayerProgress {
  const current = loadProgress();
  const updated: PlayerProgress = {
    ...current,
    coins: current.coins + amount,
  };
  saveProgress(updated);
  return updated;
}

export function recordRaceResult(
  won: boolean,
  level: number,
  wpm: number,
  accuracy: number,
  wordsTyped: number
): PlayerProgress {
  const current = loadProgress();
  const nextUnlocked = won && level >= current.highestLevelUnlocked ? level + 1 : current.highestLevelUnlocked;
  
  const updated: PlayerProgress = {
    ...current,
    highestLevelUnlocked: nextUnlocked,
    bestWpm: Math.max(current.bestWpm, Math.round(wpm)),
    bestAccuracy: Math.max(current.bestAccuracy, Math.round(accuracy)),
    totalWins: current.totalWins + (won ? 1 : 0),
    totalRaces: current.totalRaces + 1,
    totalWordsTyped: current.totalWordsTyped + wordsTyped,
  };

  saveProgress(updated);
  return updated;
}

export function resetAllData(): PlayerProgress {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    console.warn('Failed to clear localStorage', err);
  }
  return DEFAULT_PROGRESS;
}
