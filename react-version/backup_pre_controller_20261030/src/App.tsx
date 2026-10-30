import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  GameState,
  StoryPhase,
  Racer,
  GameStats,
  GameSettings,
  PlayerProgress,
  DifficultyMode,
  WeaponType,
  BossState,
  PowerConfig,
} from './types/game';
import { sound } from './utils/audio';
import { getWordQueueForLevel } from './utils/words';
import {
  loadProgress,
  loadSettings,
  saveSettings,
  saveProgress,
  recordRaceResult,
  addCoins,
  resetAllData,
} from './utils/storage';
import {
  SWORD_POWERS,
  GUN_POWERS,
  BOW_POWERS,
} from './utils/combatConfig';

import { StartScreen } from './components/StartScreen';
import { StoryHUD } from './components/StoryHUD';
import { StoryCanvas } from './components/StoryCanvas';
import { CommandConsole } from './components/CommandConsole';

import { GameHeader } from './components/GameHeader';
import { RaceTrack } from './components/RaceTrack';
import { TypingArea } from './components/TypingArea';

import { ShopModal } from './components/ShopModal';
import { InventoryModal } from './components/InventoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';

// Initial Race Racers generator
const createInitialRacers = (level: number, difficulty: DifficultyMode): Racer[] => {
  const diffMultiplier =
    difficulty === 'casual'
      ? 0.8
      : difficulty === 'normal'
      ? 1.0
      : difficulty === 'hardcore'
      ? 1.2
      : 1.4;

  const levelSpeedBonus = (level - 1) * 0.45;
  const cpu1Base = (2.6 + levelSpeedBonus) * diffMultiplier;
  const cpu2Base = (2.9 + levelSpeedBonus) * diffMultiplier;
  const cpu3Base = (3.2 + levelSpeedBonus) * diffMultiplier;

  return [
    {
      id: 'p1_human',
      name: 'SHINOBI SHADOW',
      role: 'human',
      color: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.75)',
      accentColor: '#22d3ee',
      badgeClass: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      laneIndex: 0,
      distance: 0,
      currentSpeed: 0,
      targetSpeed: 0,
      baseSpeed: 0.8,
      state: 'idle',
      finishTime: null,
      rank: 1,
      frameIndex: 0,
      frameTimer: 0,
      dustTimer: 0,
    },
    {
      id: 'p2_blaze',
      name: 'BLAZE RONIN',
      role: 'ai',
      color: '#f43f5e',
      glowColor: 'rgba(244, 63, 94, 0.75)',
      accentColor: '#fb7185',
      badgeClass: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
      laneIndex: 1,
      distance: 0,
      currentSpeed: 0,
      targetSpeed: cpu1Base,
      baseSpeed: cpu1Base,
      state: 'idle',
      finishTime: null,
      rank: 2,
      frameIndex: 0,
      frameTimer: 0,
      dustTimer: 0,
    },
    {
      id: 'p3_jade',
      name: 'JADE PHANTOM',
      role: 'ai',
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.75)',
      accentColor: '#34d399',
      badgeClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      laneIndex: 2,
      distance: 0,
      currentSpeed: 0,
      targetSpeed: cpu2Base,
      baseSpeed: cpu2Base,
      state: 'idle',
      finishTime: null,
      rank: 3,
      frameIndex: 0,
      frameTimer: 0,
      dustTimer: 0,
    },
    {
      id: 'p4_viper',
      name: 'GOLDEN VIPER',
      role: 'ai',
      color: '#eab308',
      glowColor: 'rgba(234, 179, 8, 0.75)',
      accentColor: '#facc15',
      badgeClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
      laneIndex: 3,
      distance: 0,
      currentSpeed: 0,
      targetSpeed: cpu3Base,
      baseSpeed: cpu3Base,
      state: 'idle',
      finishTime: null,
      rank: 4,
      frameIndex: 0,
      frameTimer: 0,
      dustTimer: 0,
    },
  ];
};

export default function App() {
  // App Mode
  const [gameMode, setGameMode] = useState<GameMode>('MENU');

  // Progress & Settings
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);

  // Modals
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // --- STORY MODE STATE ---
  const [storyLevel, setStoryLevel] = useState<number>(1);
  const [storyPhase, setStoryPhase] = useState<StoryPhase>('COMBAT');
  const [playerHealth, setPlayerHealth] = useState<number>(100);
  const [playerMaxHealth] = useState<number>(100);
  const [waveIndex, setWaveIndex] = useState<number>(1);
  const [totalWaves] = useState<number>(3);
  const [bossStateForHUD, setBossStateForHUD] = useState<BossState | null>(null);

  // Story typing buffer
  const [storyTypedBuffer, setStoryTypedBuffer] = useState<string>('');
  const [activeStoryCommand, setActiveStoryCommand] = useState<string | null>(null);
  const [powerCooldowns, setPowerCooldowns] = useState<Record<string, number>>({});
  const [isBusy, setIsBusy] = useState(false);
  const [canOpenChest, setCanOpenChest] = useState(false);
  const [canClimb, setCanClimb] = useState(false);

  // --- RACE MODE STATE ---
  const [raceLevel, setRaceLevel] = useState<number>(1);
  const [raceState, setRaceState] = useState<GameState>('START_SCREEN');
  const [raceCountdown, setRaceCountdown] = useState<number | null>(null);
  const [racers, setRacers] = useState<Racer[]>(() => createInitialRacers(1, settings.difficulty));
  const [wordQueue, setWordQueue] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [typedInput, setTypedInput] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [winner, setWinner] = useState<Racer | null>(null);

  // Race Statistics
  const [raceStats, setRaceStats] = useState<GameStats>({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    completedWords: 0,
    currentStreak: 0,
    maxStreak: 0,
    raceTime: 0,
    playerRank: 1,
    instantCpm: 0,
  });

  const lastRaceTimeRef = useRef(performance.now());
  const raceStartTimeRef = useRef(0);
  const hasRaceFinishedRef = useRef(false);
  const charTimestampsRef = useRef<number[]>([]);
  const isErrorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Audio Settings
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Check temporary weapon expiration
  useEffect(() => {
    const timer = setInterval(() => {
      if (progress.temporaryWeapon && progress.temporaryWeaponExpiresAt) {
        if (Date.now() >= progress.temporaryWeaponExpiresAt) {
          const updated: PlayerProgress = {
            ...progress,
            temporaryWeapon: null,
            temporaryWeaponExpiresAt: null,
            equippedWeapon: 'sword', // Revert to sword
          };
          setProgress(updated);
          saveProgress(updated);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [progress]);

  // Determine active weapon (temporary weapon takes precedence if active)
  const activeWeapon: WeaponType =
    progress.temporaryWeapon && progress.temporaryWeaponExpiresAt && Date.now() < progress.temporaryWeaponExpiresAt
      ? progress.temporaryWeapon
      : progress.equippedWeapon;

  // Available powers for the active weapon
  const availablePowers: PowerConfig[] =
    activeWeapon === 'sword'
      ? SWORD_POWERS
      : activeWeapon === 'gun'
      ? GUN_POWERS
      : BOW_POWERS;

  // Decrement power cooldowns
  useEffect(() => {
    const cdInterval = setInterval(() => {
      setPowerCooldowns((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (v > 0) {
            next[k] = Math.max(0, v - 0.1);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 100);
    return () => clearInterval(cdInterval);
  }, []);

  // --- STORY MODE HANDLERS ---
  const handleStartStory = () => {
    setStoryLevel(progress.storyLevel || 1);
    setStoryPhase(progress.storyLevel === 6 ? 'BOSS' : 'COMBAT');
    setPlayerHealth(100);
    setWaveIndex(1);
    setGameMode('STORY');
    setStoryTypedBuffer('');
  };

  const handlePlayerDamage = (dmg: number) => {
    setPlayerHealth((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next === 0) {
        // Game Over!
        setStoryPhase('GAME_OVER');
        sound.playDefeat();
      }
      return next;
    });
  };

  const handlePlayerHeal = (amt: number) => {
    setPlayerHealth((prev) => Math.min(playerMaxHealth, prev + amt));
  };

  const handleAddCoins = (amt: number) => {
    const updated = addCoins(amt);
    setProgress(updated);
  };

  const handleWaveComplete = () => {
    if (storyLevel === 6) {
      // Handled by boss defeat
      return;
    }
    // Transition to Adventure phase between levels!
    sound.playVictory();
    setStoryPhase('ADVENTURE');
  };

  const handleLevelComplete = () => {
    // Adventure completed, advance to next level!
    const nextLvl = storyLevel + 1;
    const updated: PlayerProgress = {
      ...progress,
      storyLevel: nextLvl > 6 ? 6 : nextLvl,
      highestStoryCompleted: Math.max(progress.highestStoryCompleted, storyLevel),
    };
    setProgress(updated);
    saveProgress(updated);

    if (nextLvl > 6) {
      setStoryPhase('VICTORY');
    } else {
      setStoryLevel(nextLvl);
      setStoryPhase(nextLvl === 6 ? 'BOSS' : 'COMBAT');
      setWaveIndex(1);
    }
  };

  const handleBossDefeated = () => {
    sound.playVictory();
    const updated: PlayerProgress = {
      ...progress,
      highestStoryCompleted: 6,
    };
    setProgress(updated);
    saveProgress(updated);
    setStoryPhase('VICTORY');
  };

  const handleOpenChest = (rewardWeapon: WeaponType) => {
    // 90 seconds temporary weapon access
    const expiresAt = Date.now() + 90 * 1000;
    const updated: PlayerProgress = {
      ...progress,
      temporaryWeapon: rewardWeapon,
      temporaryWeaponExpiresAt: expiresAt,
    };
    setProgress(updated);
    saveProgress(updated);
  };

  // Execute Story typing command
  const executeStoryCommand = useCallback(
    (commandStr: string) => {
      const cmd = commandStr.toUpperCase();

      // Check if command is a power
      const power = availablePowers.find((p) => p.command === cmd);
      if (power) {
        // Check if unlocked
        const isUnlocked = activeWeapon !== 'sword' || progress.unlockedPowers.includes(power.id);
        if (!isUnlocked) {
          sound.playMistake();
          return;
        }
        // Check cooldown
        if ((powerCooldowns[power.id] || 0) > 0) {
          sound.playMistake();
          return;
        }

        // Trigger cooldown
        setPowerCooldowns((prev) => ({
          ...prev,
          [power.id]: power.cooldown,
        }));
      }

      setActiveStoryCommand(cmd);
      setStoryTypedBuffer('');
    },
    [availablePowers, activeWeapon, progress.unlockedPowers, powerCooldowns]
  );

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showShop) setShowShop(false);
        if (showInventory) setShowInventory(false);
        if (showHowToPlay) setShowHowToPlay(false);
        if (showSettings) setShowSettings(false);
        setStoryTypedBuffer('');
        return;
      }

      // --- STORY MODE TYPING COMMAND MATCHER ---
      if (gameMode === 'STORY') {
        if (e.key === 'Backspace') {
          setStoryTypedBuffer((prev) => prev.slice(0, -1));
          return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const nextBuffer = (storyTypedBuffer + e.key).toUpperCase();
          setStoryTypedBuffer(nextBuffer);

          // All possible commands
          const movementCmds = ['LEFT', 'RIGHT', 'JUMP', 'CLIMB', 'DOWN', 'OPEN'];
          const powerCmds = availablePowers.map((p) => p.command);
          const allCmds = [...movementCmds, ...powerCmds];

          // Check exact match
          const exactMatch = allCmds.find((c) => c === nextBuffer);
          if (exactMatch) {
            executeStoryCommand(exactMatch);
          } else {
            // Check if buffer is a valid prefix of any command
            const hasPrefix = allCmds.some((c) => c.startsWith(nextBuffer));
            if (!hasPrefix) {
              // Mis-typed letter!
              sound.playMistake();
              setTimeout(() => setStoryTypedBuffer(''), 150);
            } else {
              sound.playKeyPress();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, storyTypedBuffer, availablePowers, executeStoryCommand, showShop, showInventory, showHowToPlay, showSettings]);

  // --- RACE MODE METHODS ---
  const startRace = useCallback(
    (lvl: number = raceLevel) => {
      setRaceLevel(lvl);
      const newRacers = createInitialRacers(lvl, settings.difficulty);
      const newWords = getWordQueueForLevel(lvl, 80);

      setRacers(newRacers);
      setWordQueue(newWords);
      setCurrentWordIndex(0);
      setTypedInput('');
      setIsError(false);
      setCurrentStreak(0);
      setMaxStreak(0);
      setWinner(null);
      hasRaceFinishedRef.current = false;
      charTimestampsRef.current = [];

      setRaceStats({
        wpm: 0,
        accuracy: 100,
        correctChars: 0,
        incorrectChars: 0,
        completedWords: 0,
        currentStreak: 0,
        maxStreak: 0,
        raceTime: 0,
        playerRank: 1,
        instantCpm: 0,
      });

      if (settings.countdownEnabled) {
        setRaceState('COUNTDOWN');
        setRaceCountdown(3);
        sound.playCountdownTick(3);

        setTimeout(() => {
          setRaceCountdown(2);
          sound.playCountdownTick(2);
        }, 900);

        setTimeout(() => {
          setRaceCountdown(1);
          sound.playCountdownTick(1);
        }, 1800);

        setTimeout(() => {
          setRaceCountdown(0);
          sound.playCountdownGo();
        }, 2700);

        setTimeout(() => {
          setRaceCountdown(null);
          setRaceState('RACING');
          raceStartTimeRef.current = performance.now();
          lastRaceTimeRef.current = performance.now();
        }, 3400);
      } else {
        setRaceState('RACING');
        raceStartTimeRef.current = performance.now();
        lastRaceTimeRef.current = performance.now();
      }
    },
    [raceLevel, settings.difficulty, settings.countdownEnabled]
  );

  const finishRace = useCallback(
    (raceWinner: Racer, currentRacers: Racer[], finalStats: GameStats) => {
      if (hasRaceFinishedRef.current) return;
      hasRaceFinishedRef.current = true;

      setRaceState('FINISHED');
      setWinner(raceWinner);

      const isHumanWin = raceWinner.role === 'human';
      if (isHumanWin) {
        sound.playVictory();
      } else {
        sound.playDefeat();
      }

      const updated = recordRaceResult(
        isHumanWin,
        raceLevel,
        finalStats.wpm,
        finalStats.accuracy,
        finalStats.completedWords
      );
      setProgress(updated);
    },
    [raceLevel]
  );

  // Race Physics Loop
  useEffect(() => {
    if (gameMode !== 'RACE') return;

    let animId: number;
    const gameLoop = (time: number) => {
      const rawDt = (time - lastRaceTimeRef.current) / 1000;
      const dt = Math.min(rawDt, 0.05);
      lastRaceTimeRef.current = time;

      if (raceState === 'RACING' && !hasRaceFinishedRef.current) {
        const elapsedSecs = Math.max(0.1, (time - raceStartTimeRef.current) / 1000);

        const cutoff = time - 5000;
        charTimestampsRef.current = charTimestampsRef.current.filter((ts) => ts > cutoff);
        const instantCpm = Math.round((charTimestampsRef.current.length / 5) * 60);

        setRacers((prevRacers) => {
          let updatedWinner: Racer | null = null;

          const nextRacers = prevRacers.map((racer) => {
            let nextSpeed = racer.currentSpeed;
            let nextDist = racer.distance;
            let nextState = racer.state;

            if (racer.role === 'human') {
              const decayRate = 1.2;
              if (racer.currentSpeed > racer.baseSpeed) {
                nextSpeed = Math.max(racer.baseSpeed, racer.currentSpeed - decayRate * dt);
              } else {
                nextSpeed = Math.min(racer.baseSpeed, racer.currentSpeed + 0.5 * dt);
              }
              if (racer.currentSpeed > 4.5 || currentStreak >= 5) {
                nextState = 'boost';
              } else {
                nextState = 'running';
              }
            } else {
              const organicVariance = Math.sin(time * 0.002 + racer.laneIndex * 1.5) * 0.25;
              nextSpeed = racer.baseSpeed + organicVariance;
              nextState = 'running';
            }

            nextDist = Math.min(100, racer.distance + nextSpeed * dt * 2.8);
            let finishTime = racer.finishTime;
            if (nextDist >= 100 && finishTime === null) {
              finishTime = elapsedSecs;
              if (!updatedWinner) {
                updatedWinner = { ...racer, distance: 100, finishTime };
              }
            }

            return {
              ...racer,
              distance: nextDist,
              currentSpeed: nextSpeed,
              state: nextState,
              finishTime,
            };
          });

          const sorted = [...nextRacers].sort((a, b) => {
            if (a.finishTime !== null && b.finishTime !== null) {
              return a.finishTime - b.finishTime;
            }
            if (a.finishTime !== null) return -1;
            if (b.finishTime !== null) return 1;
            return b.distance - a.distance;
          });

          const ranked = nextRacers.map((r) => {
            const rank = sorted.findIndex((s) => s.id === r.id) + 1;
            return { ...r, rank };
          });

          const humanRacer = ranked.find((r) => r.role === 'human');
          if (humanRacer) {
            setRaceStats((prevStats) => {
              const netWpm = Math.round(
                (prevStats.correctChars / 5) / (elapsedSecs / 60)
              ) || 0;
              const totalAttempts = prevStats.correctChars + prevStats.incorrectChars;
              const liveAcc =
                totalAttempts > 0
                  ? Math.round((prevStats.correctChars / totalAttempts) * 100)
                  : 100;

              return {
                ...prevStats,
                raceTime: elapsedSecs,
                wpm: netWpm,
                accuracy: liveAcc,
                playerRank: humanRacer.rank,
                instantCpm,
              };
            });
          }

          if (updatedWinner && !hasRaceFinishedRef.current) {
            const finalHuman = ranked.find((r) => r.role === 'human')!;
            const netWpm = Math.round((raceStats.correctChars / 5) / (elapsedSecs / 60)) || 0;
            const totalAttempts = raceStats.correctChars + raceStats.incorrectChars;
            const finalAcc = totalAttempts > 0 ? Math.round((raceStats.correctChars / totalAttempts) * 100) : 100;
            const finalStats: GameStats = {
              ...raceStats,
              raceTime: elapsedSecs,
              wpm: netWpm,
              accuracy: finalAcc,
              playerRank: finalHuman.rank,
            };
            setTimeout(() => {
              finishRace(updatedWinner!, ranked, finalStats);
            }, 100);
          }

          return ranked;
        });
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameMode, raceState, finishRace, currentStreak, raceStats]);

  const currentWord = wordQueue[currentWordIndex] || 'NINJA';
  const nextWords = wordQueue.slice(currentWordIndex + 1, currentWordIndex + 5);

  const handleRaceCharInput = useCallback(
    (char: string) => {
      if (raceState !== 'RACING') return;
      const targetChar = currentWord[typedInput.length];
      if (!targetChar) return;

      const isMatch = char.toUpperCase() === targetChar.toUpperCase();
      if (isMatch) {
        sound.playKeyPress();
        charTimestampsRef.current.push(performance.now());
        const newTyped = typedInput + targetChar;
        setTypedInput(newTyped);
        setIsError(false);

        setRacers((prev) =>
          prev.map((r) => {
            if (r.role !== 'human') return r;
            const speedBoost = 0.5 + Math.min(2.0, currentStreak * 0.15);
            return {
              ...r,
              currentSpeed: Math.min(7.8, r.currentSpeed + speedBoost),
              state: 'running',
            };
          })
        );

        setRaceStats((prev) => ({
          ...prev,
          correctChars: prev.correctChars + 1,
        }));

        if (newTyped.length === currentWord.length) {
          sound.playWordComplete();
          const nextStreak = currentStreak + 1;
          setCurrentStreak(nextStreak);
          setMaxStreak((prev) => Math.max(prev, nextStreak));

          setRacers((prev) =>
            prev.map((r) => {
              if (r.role !== 'human') return r;
              const bonus = 1.4 + (nextStreak >= 3 ? 1.0 : 0);
              return {
                ...r,
                currentSpeed: Math.min(8.5, r.currentSpeed + bonus),
                state: nextStreak >= 3 ? 'boost' : 'running',
              };
            })
          );

          if (nextStreak % 5 === 0) {
            sound.playBoost();
          }

          setRaceStats((prev) => ({
            ...prev,
            completedWords: prev.completedWords + 1,
            currentStreak: nextStreak,
            maxStreak: Math.max(prev.maxStreak, nextStreak),
          }));

          setTypedInput('');
          setCurrentWordIndex((idx) => idx + 1);
        }
      } else {
        sound.playMistake();
        setIsError(true);
        setCurrentStreak(0);

        if (isErrorTimerRef.current) clearTimeout(isErrorTimerRef.current);
        isErrorTimerRef.current = setTimeout(() => setIsError(false), 500);

        setRacers((prev) =>
          prev.map((r) => {
            if (r.role !== 'human') return r;
            return {
              ...r,
              currentSpeed: Math.max(r.baseSpeed * 0.6, r.currentSpeed * 0.65),
              state: 'stumble',
            };
          })
        );

        setRaceStats((prev) => ({
          ...prev,
          incorrectChars: prev.incorrectChars + 1,
          currentStreak: 0,
        }));
      }
    },
    [raceState, currentWord, typedInput, currentStreak]
  );

  const handleRaceBackspace = useCallback(() => {
    if (raceState !== 'RACING') return;
    if (typedInput.length > 0) {
      setTypedInput((prev) => prev.slice(0, -1));
      setIsError(false);
    }
  }, [raceState, typedInput]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. MAIN MENU SCREEN */}
      {gameMode === 'MENU' && (
        <StartScreen
          progress={progress}
          settings={settings}
          onStartStoryMode={handleStartStory}
          onStartRaceMode={() => {
            setGameMode('RACE');
            startRace(1);
          }}
          onOpenShop={() => setShowShop(true)}
          onOpenInventory={() => setShowInventory(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
          onToggleSound={() => {
            const next = !settings.soundEnabled;
            const updated = { ...settings, soundEnabled: next };
            setSettings(updated);
            saveSettings(updated);
          }}
        />
      )}

      {/* 2. STORY ADVENTURE MODE SCREEN */}
      {gameMode === 'STORY' && (
        <div className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 max-w-6xl w-full mx-auto space-y-3">
          {/* Top HUD */}
          <StoryHUD
            level={storyLevel}
            phase={storyPhase}
            playerHealth={playerHealth}
            playerMaxHealth={playerMaxHealth}
            coins={progress.coins}
            equippedWeapon={activeWeapon}
            equippedSkin={progress.equippedSkin}
            waveIndex={waveIndex}
            totalWaves={totalWaves}
            bossState={bossStateForHUD}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => {
              const next = !settings.soundEnabled;
              const updated = { ...settings, soundEnabled: next };
              setSettings(updated);
              saveSettings(updated);
            }}
            onReturnToMenu={() => setGameMode('MENU')}
          />

          {/* Canvas Viewport */}
          <StoryCanvas
            level={storyLevel}
            phase={storyPhase}
            playerHealth={playerHealth}
            playerMaxHealth={playerMaxHealth}
            equippedWeapon={activeWeapon}
            equippedSkin={progress.equippedSkin}
            onPlayerDamage={handlePlayerDamage}
            onPlayerHeal={handlePlayerHeal}
            onAddCoins={handleAddCoins}
            onWaveComplete={handleWaveComplete}
            onLevelComplete={handleLevelComplete}
            onBossDefeated={handleBossDefeated}
            onOpenChest={handleOpenChest}
            currentCommand={activeStoryCommand}
            onClearCommand={() => setActiveStoryCommand(null)}
            setCanOpenChest={setCanOpenChest}
            setCanClimb={setCanClimb}
            setIsBusy={setIsBusy}
            setBossStateForHUD={setBossStateForHUD}
          />

          {/* Left & Right Typing Command Console */}
          <CommandConsole
            typedBuffer={storyTypedBuffer}
            activeWeapon={activeWeapon}
            availablePowers={availablePowers}
            unlockedPowers={progress.unlockedPowers}
            powerCooldowns={powerCooldowns}
            onExecuteCommand={executeStoryCommand}
            isBusy={isBusy}
            canOpenChest={canOpenChest}
            canClimb={canClimb}
            temporaryWeaponTimeLeft={
              progress.temporaryWeaponExpiresAt
                ? Math.max(0, (progress.temporaryWeaponExpiresAt - Date.now()) / 1000)
                : null
            }
          />
        </div>
      )}

      {/* 3. TYPING RACE MODE SCREEN */}
      {gameMode === 'RACE' && (
        <div className="flex-1 flex flex-col">
          <GameHeader
            stats={raceStats}
            level={raceLevel}
            gameState={raceState}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => {
              const next = !settings.soundEnabled;
              const updated = { ...settings, soundEnabled: next };
              setSettings(updated);
              saveSettings(updated);
            }}
            onOpenSettings={() => setShowSettings(true)}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onRestartRace={() => startRace(raceLevel)}
          />

          <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-6xl w-full mx-auto space-y-4">
            <div className="w-full flex items-center justify-between pb-2">
              <button
                onClick={() => setGameMode('MENU')}
                className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 text-xs font-mono text-slate-300 hover:text-white"
              >
                ← RETURN TO MENU
              </button>
              <span className="font-mono text-xs text-amber-400 font-bold">
                ROOFTOP TYPING CHAMPIONSHIP
              </span>
            </div>

            <RaceTrack
              racers={racers}
              gameState={raceState}
              countdown={raceCountdown}
              level={raceLevel}
            />

            <TypingArea
              currentWord={currentWord}
              nextWords={nextWords}
              typedInput={typedInput}
              isError={isError}
              gameState={raceState}
              currentStreak={currentStreak}
              instantCpm={raceStats.instantCpm}
              onCharacterInput={handleRaceCharInput}
              onBackspace={handleRaceBackspace}
            />
          </main>
        </div>
      )}

      {/* STORY GAME OVER MODAL */}
      {storyPhase === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090e1a] border border-rose-900/60 p-7 text-center shadow-2xl flex flex-col items-center">
            <span className="text-5xl mb-2">💀</span>
            <h2 className="font-display font-black text-3xl text-rose-400">
              FALLEN SHINOBI
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Your health dropped to zero on Level {storyLevel}. Saved coins and purchased armory items remain permanently in your vault.
            </p>
            <div className="flex items-center gap-3 w-full mt-6">
              <button
                onClick={handleStartStory}
                className="flex-1 py-3 rounded-xl font-display font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all"
              >
                RETRY RUN
              </button>
              <button
                onClick={() => setGameMode('MENU')}
                className="flex-1 py-3 rounded-xl font-mono text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORY VICTORY MODAL */}
      {storyPhase === 'VICTORY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090e1a] border border-amber-500/60 p-7 text-center shadow-2xl flex flex-col items-center">
            <span className="text-5xl mb-2">🏆</span>
            <h2 className="font-display font-black text-3xl text-amber-300">
              TITAN DEFEATED!
            </h2>
            <p className="text-xs text-slate-300 mt-2 font-sans">
              You triumphed over the Kage-Ryu Shadow Titan and conquered all 6 Story Levels! You have earned +5,000 Coins.
            </p>
            <button
              onClick={() => {
                setStoryPhase('COMBAT');
                setGameMode('MENU');
              }}
              className="mt-6 w-full py-3.5 rounded-xl font-display font-black text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg"
            >
              COLLECT BOUNTY & RETURN
            </button>
          </div>
        </div>
      )}

      {/* RACE GAME OVER MODAL */}
      {raceState === 'FINISHED' && winner && (
        <GameOverModal
          racers={racers}
          stats={raceStats}
          level={raceLevel}
          winner={winner}
          onNextLevel={() => startRace(raceLevel + 1)}
          onRestartRace={() => startRace(raceLevel)}
          onReturnToMenu={() => setGameMode('MENU')}
        />
      )}

      {/* SHOP MODAL */}
      {showShop && (
        <ShopModal
          progress={progress}
          onUpdateProgress={(updated) => {
            setProgress(updated);
            saveProgress(updated);
          }}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* INVENTORY MODAL */}
      {showInventory && (
        <InventoryModal
          progress={progress}
          onUpdateProgress={(updated) => {
            setProgress(updated);
            saveProgress(updated);
          }}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onResetProgress={() => {
            const empty = resetAllData();
            setProgress(empty);
            setStoryLevel(1);
            setRaceLevel(1);
          }}
          onRestartRace={() => {
            setShowSettings(false);
            if (gameMode === 'RACE') startRace(raceLevel);
            else handleStartStory();
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
