/**
 * Ninja Typing Race - Standalone Vanilla JS Edition
 */

(function () {
  'use strict';

  // Words Database
  const WORDS_BY_LEVEL = {
    1: ['NINJA', 'RUN', 'FAST', 'JUMP', 'FIGHT', 'POWER', 'SPEED', 'HERO', 'DASH', 'BLADE', 'KICK', 'WIND', 'LEAP', 'EDGE', 'SWIFT', 'FIRE', 'ZOOM', 'DART', 'FLOW', 'RUSH', 'STAR'],
    2: ['SHADOW', 'ATTACK', 'STRIKE', 'MASTER', 'DANGER', 'SILENCE', 'REFLEX', 'SPIRIT', 'DRAGON', 'COMBAT', 'KATANA', 'STEALTH', 'CHAKRA', 'MOTION', 'TARGET', 'AGILITY', 'IMPACT', 'ENERGY'],
    3: ['WARRIOR', 'LIGHTNING', 'SURVIVAL', 'TRAINING', 'VICTORY', 'ASSASSIN', 'ACROBATIC', 'SHURIKEN', 'PHANTOM', 'FORTITUDE', 'REACTION', 'VELOCITY', 'PRECISION', 'FOCUSING'],
    4: ['ACCELERATION', 'UNSTOPPABLE', 'SUPERSONIC', 'CONCENTRATION', 'INVINCIBLE', 'MASTERY', 'TRANSCENDENCE', 'OVERWHELMING', 'DETERMINATION', 'PERFORMANCE', 'THUNDERSTORM']
  };

  // Web Audio Synthesizer
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    tick(count) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(count === 1 ? 880 : 660, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    go() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [1046, 1318, 1567].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + idx * 0.03);
        gain.gain.setValueAtTime(0.12, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + 0.35);
      });
    }

    keyPress() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }

    wordComplete() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [659, 880, 1174].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);
        gain.gain.setValueAtTime(0.1, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.22);
      });
    }

    mistake() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }

    victory() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523, 659, 783, 1046].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.1);
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    }

    defeat() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [440, 415, 392, 349].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.15);
        gain.gain.setValueAtTime(0.1, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.3);
      });
    }
  }

  const sfx = new SoundFX();

  // Storage
  const STORAGE_KEY = 'ninja_typing_standalone_prog';
  function loadProg() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        highestLevel: data.highestLevel || 1,
        bestWpm: data.bestWpm || 0,
        bestAcc: data.bestAcc || 0,
        wins: data.wins || 0,
        races: data.races || 0,
        difficulty: data.difficulty || 'normal',
        sound: data.sound !== undefined ? data.sound : true,
        countdown: data.countdown !== undefined ? data.countdown : true
      };
    } catch (e) {
      return { highestLevel: 1, bestWpm: 0, bestAcc: 0, wins: 0, races: 0, difficulty: 'normal', sound: true, countdown: true };
    }
  }

  function saveProg(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {}
  }

  const prog = loadProg();
  sfx.enabled = prog.sound;

  // DOM Elements
  const startScreen = document.getElementById('startScreen');
  const raceArena = document.getElementById('raceArena');
  const btnStartRace = document.getElementById('btnStartRace');
  const levelButtonsContainer = document.getElementById('levelButtonsContainer');
  const levelTag = document.getElementById('levelTag');
  const trackTitle = document.getElementById('trackTitle');
  const lanesContainer = document.getElementById('lanesContainer');
  const wordDisplay = document.getElementById('wordDisplay');
  const nextWordsQueue = document.getElementById('nextWordsQueue');
  const hiddenTypingInput = document.getElementById('hiddenTypingInput');
  const typingContainer = document.getElementById('typingContainer');
  const countdownOverlay = document.getElementById('countdownOverlay');
  const countdownText = document.getElementById('countdownText');
  const streakBadge = document.getElementById('streakBadge');
  const cadenceVal = document.getElementById('cadenceVal');
  const mistakeNotice = document.getElementById('mistakeNotice');

  // Top stats
  const statPos = document.getElementById('statPos');
  const statWpm = document.getElementById('statWpm');
  const statAcc = document.getElementById('statAcc');
  const statWords = document.getElementById('statWords');
  const statTimer = document.getElementById('statTimer');

  // Overview stats
  const dispBestWpm = document.getElementById('dispBestWpm');
  const dispBestAcc = document.getElementById('dispBestAcc');
  const dispTotalWins = document.getElementById('dispTotalWins');
  const dispTotalRaces = document.getElementById('dispTotalRaces');

  // Modals
  const gameOverModal = document.getElementById('gameOverModal');
  const howToPlayModal = document.getElementById('howToPlayModal');
  const settingsModal = document.getElementById('settingsModal');

  let currentLevel = 1;
  let gameState = 'MENU';
  let racers = [];
  let words = [];
  let wordIdx = 0;
  let typed = '';
  let streak = 0;
  let maxStreak = 0;
  let correctChars = 0;
  let mistakeChars = 0;
  let completedWords = 0;
  let raceStartTime = 0;
  let lastFrameTime = performance.now();
  let animFrameId = null;
  let hasFinished = false;
  let keystrokeTimestamps = [];

  function updateOverviewStatsUI() {
    dispBestWpm.textContent = prog.bestWpm;
    dispBestAcc.textContent = prog.bestAcc ? `${prog.bestAcc}%` : '0%';
    dispTotalWins.textContent = prog.wins;
    dispTotalRaces.textContent = prog.races;
  }

  function renderLevelButtons() {
    levelButtonsContainer.innerHTML = '';
    const maxLvl = Math.max(prog.highestLevel, 1);
    for (let l = 1; l <= Math.min(8, Math.max(4, maxLvl)); l++) {
      const btn = document.createElement('button');
      btn.className = `lvl-btn ${l === currentLevel ? 'active' : ''}`;
      btn.textContent = l;
      btn.disabled = l > prog.highestLevel;
      btn.onclick = () => {
        if (l <= prog.highestLevel) {
          currentLevel = l;
          renderLevelButtons();
        }
      };
      levelButtonsContainer.appendChild(btn);
    }
  }

  function setupRacers(lvl) {
    const mult = prog.difficulty === 'casual' ? 0.8 : prog.difficulty === 'hardcore' ? 1.2 : prog.difficulty === 'master' ? 1.4 : 1.0;
    const bonus = (lvl - 1) * 0.45;

    racers = [
      { id: 'p1', name: 'SHINOBI SHADOW', role: 'human', color: '#06b6d4', glow: 'rgba(6,182,212,0.8)', dist: 0, speed: 0, baseSpeed: 0.8, finish: null, rank: 1 },
      { id: 'p2', name: 'BLAZE RONIN', role: 'ai', color: '#f43f5e', glow: 'rgba(244,63,94,0.8)', dist: 0, speed: 0, baseSpeed: (2.6 + bonus) * mult, finish: null, rank: 2 },
      { id: 'p3', name: 'JADE PHANTOM', role: 'ai', color: '#10b981', glow: 'rgba(16,185,129,0.8)', dist: 0, speed: 0, baseSpeed: (2.9 + bonus) * mult, finish: null, rank: 3 },
      { id: 'p4', name: 'GOLDEN VIPER', role: 'ai', color: '#eab308', glow: 'rgba(234,179,8,0.8)', dist: 0, speed: 0, baseSpeed: (3.2 + bonus) * mult, finish: null, rank: 4 }
    ];

    renderLanes();
  }

  function renderLanes() {
    lanesContainer.innerHTML = '';
    racers.forEach((r, idx) => {
      const lane = document.createElement('div');
      lane.className = `lane ${r.role === 'human' ? 'player-lane' : ''}`;
      lane.id = `lane_${r.id}`;

      lane.innerHTML = `
        <div class="lane-info">
          <span class="lane-name" style="color: ${r.color}">${r.name}</span>
          <span class="lane-stats" id="info_${r.id}">0% · 0 km/h</span>
        </div>
        <div class="lane-runway">
          <div class="runway-strip">
            <div class="runway-fill" id="fill_${r.id}" style="width: 0%; background: ${r.color}; box-shadow: 0 0 10px ${r.glow}"></div>
          </div>
          <div class="ninja-runner" id="runner_${r.id}" style="left: 0%;">
            <canvas id="canvas_${r.id}" width="54" height="50"></canvas>
          </div>
        </div>
        <div class="finish-gate">🏁</div>
      `;
      lanesContainer.appendChild(lane);
    });
  }

  function drawNinja(canvas, color, frame, isRunning) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const legAngle = isRunning ? Math.sin(frame * 0.2) * 0.7 : 0;

    // Scarf tail
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 10);
    ctx.lineTo(cx - 16, cy - 8 + Math.sin(frame * 0.3) * 3);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 6, cy - 8, 12, 14);

    // Belt
    ctx.fillStyle = color;
    ctx.fillRect(cx - 6, cy + 2, 12, 3);

    // Head
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy - 14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Headband
    ctx.fillStyle = color;
    ctx.fillRect(cx - 6, cy - 18, 14, 3);

    // Eye slit
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(cx + 1, cy - 15, 5, 2.5);

    // Legs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy + 6);
    ctx.lineTo(cx - 2 + Math.sin(legAngle) * 9, cy + 18);
    ctx.moveTo(cx + 2, cy + 6);
    ctx.lineTo(cx + 2 - Math.sin(legAngle) * 9, cy + 18);
    ctx.stroke();
  }

  function getWords(lvl) {
    const pool = WORDS_BY_LEVEL[lvl] || WORDS_BY_LEVEL[1];
    const res = [];
    while (res.length < 60) {
      const shuf = [...pool].sort(() => Math.random() - 0.5);
      res.push(...shuf);
    }
    return res;
  }

  function renderWordDisplay() {
    const word = words[wordIdx] || 'NINJA';
    wordDisplay.innerHTML = '';

    for (let i = 0; i < word.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = word[i];

      if (i < typed.length) {
        if (typed[i].toUpperCase() === word[i]) {
          span.classList.add('correct');
        } else {
          span.classList.add('mistake');
        }
      } else if (i === typed.length) {
        span.classList.add('current');
      }

      wordDisplay.appendChild(span);
    }

    nextWordsQueue.innerHTML = '';
    const upcoming = words.slice(wordIdx + 1, wordIdx + 4);
    upcoming.forEach(w => {
      const s = document.createElement('span');
      s.textContent = w;
      nextWordsQueue.appendChild(s);
    });
  }

  function startRace(lvl) {
    currentLevel = lvl;
    levelTag.textContent = `LVL ${lvl}`;
    trackTitle.textContent = `ROOFTOP SPEEDWAY · LEVEL ${lvl}`;

    setupRacers(lvl);
    words = getWords(lvl);
    wordIdx = 0;
    typed = '';
    streak = 0;
    maxStreak = 0;
    correctChars = 0;
    mistakeChars = 0;
    completedWords = 0;
    hasFinished = false;
    keystrokeTimestamps = [];

    renderWordDisplay();

    startScreen.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    raceArena.classList.remove('hidden');

    if (prog.countdown) {
      gameState = 'COUNTDOWN';
      countdownOverlay.classList.remove('hidden');
      countdownText.textContent = '3';
      sfx.tick(3);

      setTimeout(() => {
        countdownText.textContent = '2';
        sfx.tick(2);
      }, 900);

      setTimeout(() => {
        countdownText.textContent = '1';
        sfx.tick(1);
      }, 1800);

      setTimeout(() => {
        countdownText.textContent = 'GO!';
        sfx.go();
      }, 2700);

      setTimeout(() => {
        countdownOverlay.classList.add('hidden');
        gameState = 'RACING';
        raceStartTime = performance.now();
        lastFrameTime = performance.now();
        hiddenTypingInput.focus();
      }, 3400);
    } else {
      gameState = 'RACING';
      raceStartTime = performance.now();
      lastFrameTime = performance.now();
      hiddenTypingInput.focus();
    }
  }

  function finishRace(winner) {
    if (hasFinished) return;
    hasFinished = true;
    gameState = 'FINISHED';

    const isHuman = winner.role === 'human';
    if (isHuman) sfx.victory();
    else sfx.defeat();

    const elapsed = (performance.now() - raceStartTime) / 1000;
    const wpm = Math.round((correctChars / 5) / (elapsed / 60)) || 0;
    const totalAttempts = correctChars + mistakeChars;
    const acc = totalAttempts > 0 ? Math.round((correctChars / totalAttempts) * 100) : 100;

    prog.races++;
    if (isHuman) {
      prog.wins++;
      if (currentLevel >= prog.highestLevel) {
        prog.highestLevel = currentLevel + 1;
      }
    }
    prog.bestWpm = Math.max(prog.bestWpm, wpm);
    prog.bestAcc = Math.max(prog.bestAcc, acc);
    saveProg(prog);
    updateOverviewStatsUI();
    renderLevelButtons();

    // Show Game Over Modal
    document.getElementById('modalIcon').textContent = isHuman ? '🏆' : '💀';
    document.getElementById('modalTitle').textContent = isHuman ? 'VICTORY!' : 'DEFEATED!';
    document.getElementById('modalDesc').textContent = isHuman
      ? `You dominated Level ${currentLevel} in 1st place!`
      : `${winner.name} crossed the line first!`;

    document.getElementById('finalWpm').textContent = wpm;
    document.getElementById('finalAcc').textContent = `${acc}%`;
    document.getElementById('finalStreak').textContent = maxStreak;
    document.getElementById('finalTime').textContent = formatTime(elapsed);

    const standings = [...racers].sort((a, b) => b.dist - a.dist);
    const list = document.getElementById('finalStandingsList');
    list.innerHTML = '';
    standings.forEach((r, idx) => {
      const row = document.createElement('div');
      row.className = 'standing-row';
      row.innerHTML = `
        <span style="color: ${r.color}"><strong>${idx + 1}.</strong> ${r.name} ${r.role === 'human' ? '(YOU)' : ''}</span>
        <span>${Math.round(r.dist)}%</span>
      `;
      list.appendChild(row);
    });

    const btnNext = document.getElementById('btnNextLevel');
    if (isHuman) btnNext.style.display = 'block';
    else btnNext.style.display = 'none';

    gameOverModal.classList.remove('hidden');
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return `${m.toString().padStart(2, '0')}:${s.padStart(4, '0')}`;
  }

  // Input Handling
  hiddenTypingInput.addEventListener('keydown', (e) => {
    if (gameState !== 'RACING') return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (typed.length > 0) {
        typed = typed.slice(0, -1);
        mistakeNotice.classList.add('hidden');
        renderWordDisplay();
      }
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const targetWord = words[wordIdx] || 'NINJA';
      const targetChar = targetWord[typed.length];
      if (!targetChar) return;

      if (e.key.toUpperCase() === targetChar.toUpperCase()) {
        sfx.keyPress();
        typed += targetChar;
        correctChars++;
        keystrokeTimestamps.push(performance.now());
        mistakeNotice.classList.add('hidden');

        // Human boost
        const p1 = racers.find(r => r.role === 'human');
        if (p1) p1.speed = Math.min(8.0, p1.speed + 0.6);

        // Word completed!
        if (typed.length === targetWord.length) {
          sfx.wordComplete();
          streak++;
          maxStreak = Math.max(maxStreak, streak);
          completedWords++;
          if (p1) p1.speed = Math.min(8.5, p1.speed + 1.2);

          typed = '';
          wordIdx++;
          streakBadge.textContent = `${streak}x STREAK`;
        }
      } else {
        sfx.mistake();
        mistakeChars++;
        streak = 0;
        streakBadge.textContent = 'BUILDING SPEED';
        mistakeNotice.classList.remove('hidden');

        // Human slowdown penalty
        const p1 = racers.find(r => r.role === 'human');
        if (p1) p1.speed = Math.max(0.5, p1.speed * 0.65);
      }

      renderWordDisplay();
    }
  });

  typingContainer.addEventListener('click', () => {
    if (gameState === 'RACING') hiddenTypingInput.focus();
  });

  // Game Animation Loop
  let animTick = 0;
  function update(time) {
    const dt = Math.min((time - lastFrameTime) / 1000, 0.05);
    lastFrameTime = time;
    animTick++;

    if (gameState === 'RACING' && !hasFinished) {
      const elapsed = (time - raceStartTime) / 1000;
      statTimer.textContent = formatTime(elapsed);

      // Instant CPM
      const cutoff = time - 5000;
      keystrokeTimestamps = keystrokeTimestamps.filter(t => t > cutoff);
      const cpm = Math.round((keystrokeTimestamps.length / 5) * 60);
      cadenceVal.textContent = `${cpm} CPM`;

      // Live WPM & Acc
      const wpm = Math.round((correctChars / 5) / (elapsed / 60)) || 0;
      statWpm.textContent = wpm;
      const total = correctChars + mistakeChars;
      statAcc.textContent = total > 0 ? `${Math.round((correctChars / total) * 100)}%` : '100%';
      statWords.textContent = completedWords;

      let raceWinner = null;

      racers.forEach(r => {
        if (r.role === 'human') {
          // Human speed gradual decay
          if (r.speed > r.baseSpeed) r.speed = Math.max(r.baseSpeed, r.speed - 1.2 * dt);
          else r.speed = Math.min(r.baseSpeed, r.speed + 0.4 * dt);
        } else {
          // Autonomous CPU
          r.speed = r.baseSpeed + Math.sin(time * 0.002 + r.rank) * 0.2;
        }

        r.dist = Math.min(100, r.dist + r.speed * dt * 2.8);

        // Update DOM
        const fill = document.getElementById(`fill_${r.id}`);
        const runner = document.getElementById(`runner_${r.id}`);
        const info = document.getElementById(`info_${r.id}`);
        const canvas = document.getElementById(`canvas_${r.id}`);

        if (fill) fill.style.width = `${r.dist}%`;
        if (runner) runner.style.left = `calc(${r.dist}% - 24px)`;
        if (info) info.textContent = `${Math.round(r.dist)}% · ${Math.round(r.speed * 3.6)} km/h`;
        if (canvas) drawNinja(canvas, r.color, animTick, true);

        if (r.dist >= 100 && !raceWinner) {
          raceWinner = r;
        }
      });

      // Update positions
      const sorted = [...racers].sort((a, b) => b.dist - a.dist);
      const p1Rank = sorted.findIndex(r => r.role === 'human') + 1;
      statPos.textContent = p1Rank === 1 ? '1ST' : p1Rank === 2 ? '2ND' : p1Rank === 3 ? '3RD' : '4TH';

      if (raceWinner) {
        finishRace(raceWinner);
      }
    }

    animFrameId = requestAnimationFrame(update);
  }

  animFrameId = requestAnimationFrame(update);

  // Button Listeners
  btnStartRace.addEventListener('click', () => startRace(currentLevel));
  document.getElementById('btnNextLevel').addEventListener('click', () => startRace(currentLevel + 1));
  document.getElementById('btnTryAgain').addEventListener('click', () => startRace(currentLevel));
  document.getElementById('btnMenu').addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    raceArena.classList.add('hidden');
    startScreen.classList.remove('hidden');
    gameState = 'MENU';
  });

  // Settings & How To Play
  document.getElementById('btnHowToPlay').addEventListener('click', () => howToPlayModal.classList.remove('hidden'));
  document.getElementById('btnCloseHowToPlay').addEventListener('click', () => howToPlayModal.classList.add('hidden'));
  document.getElementById('btnGotIt').addEventListener('click', () => howToPlayModal.classList.add('hidden'));

  document.getElementById('btnSettings').addEventListener('click', () => settingsModal.classList.remove('hidden'));
  document.getElementById('btnCloseSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
  document.getElementById('btnCloseSettingsBottom').addEventListener('click', () => settingsModal.classList.add('hidden'));

  document.getElementById('btnSettingSound').addEventListener('click', () => {
    prog.sound = !prog.sound;
    sfx.enabled = prog.sound;
    document.getElementById('btnSettingSound').textContent = prog.sound ? 'ON' : 'OFF';
    saveProg(prog);
  });

  document.getElementById('btnSettingCountdown').addEventListener('click', () => {
    prog.countdown = !prog.countdown;
    document.getElementById('btnSettingCountdown').textContent = prog.countdown ? 'ENABLED' : 'DISABLED';
    saveProg(prog);
  });

  document.getElementById('selectDifficulty').addEventListener('change', (e) => {
    prog.difficulty = e.target.value;
    saveProg(prog);
  });

  document.getElementById('btnResetProgress').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all game data?')) {
      prog.highestLevel = 1;
      prog.bestWpm = 0;
      prog.bestAcc = 0;
      prog.wins = 0;
      prog.races = 0;
      saveProg(prog);
      updateOverviewStatsUI();
      renderLevelButtons();
      settingsModal.classList.add('hidden');
    }
  });

  document.getElementById('btnSound').addEventListener('click', () => {
    prog.sound = !prog.sound;
    sfx.enabled = prog.sound;
    document.getElementById('btnSound').textContent = prog.sound ? '🔊' : '🔇';
    saveProg(prog);
  });

  window.addEventListener('keydown', (e) => {
    if (gameState === 'MENU' && (e.key === 'Enter' || e.key === ' ')) {
      startRace(currentLevel);
    }
  });

  // Init UI
  updateOverviewStatsUI();
  renderLevelButtons();
})();
