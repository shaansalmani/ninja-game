# Ninja Typing Race

A fast-paced 2D arcade typing race where you type words at hyper speed to outrun 3 computer rival ninjas across neon rooftops.

## Features
- **4 Distinct Racers**:
  - **Player 1 (You)**: Shinobi Shadow (Electric Cyan)
  - **Player 2 (AI)**: Blaze Ronin (Crimson Flame)
  - **Player 3 (AI)**: Jade Phantom (Emerald Mist)
  - **Player 4 (AI)**: Golden Viper (Electric Lightning)
- **Typing Mechanics**:
  - Live character-by-character color highlighting (green for correct, red for mistake).
  - Speed boost upon accurate typing.
  - Consecutive word momentum combos.
  - Stumble & speed reduction upon typos with instant recovery upon typing correctly.
  - Case-insensitive typing support.
- **Independent AI Opponents**:
  - 3 autonomous rivals with independent pacing and organic speed variance.
  - Higher opponent speeds as levels increase.
- **Animated Countdown**: 3 → 2 → 1 → GO!
- **Procedural Web Audio Synthesizer**: 8-bit sound effects for typing, countdown, correct words, mistakes, boosts, and victory/defeat fanfares.
- **Progression & Storage**: LocalStorage saves highest level unlocked, best WPM, accuracy, total wins, and total races.

## How to Play in Google Chrome
1. Double-click or open `index.html` directly in Google Chrome (or any modern web browser).
2. Click **START RACE** or press `ENTER` / `SPACE`.
3. Type the English words displayed below the track as fast and accurately as possible.
4. Cross the 1000m finish line in 1st place to unlock the next level!

## Project Structure
```
Ninja-Typing-Race/
├── index.html        # Main standalone HTML5 game file
├── style.css         # Arcade cyberpunk styling
├── script.js         # Vanilla JavaScript game engine & physics
├── assets/           # Sprite sheet, background, and logo images
│   ├── ninja-sprite.jpg
│   ├── background.jpg
│   └── logo.jpg
└── README.md         # Instructions and documentation
```
