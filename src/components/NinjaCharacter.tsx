import React, { useEffect, useRef, useState } from 'react';
import { Racer } from '../types/game';

interface NinjaCharacterProps {
  racer: Racer;
  isLeader?: boolean;
}

// Path to generated sprite sheet
const SPRITE_SHEET_URL = new URL('../assets/images/ninja_spritesheet_1793389959838.jpg', import.meta.url).href;

// Offscreen cache for processed chroma-keyed frames per player color
type ProcessedFrames = {
  runFrames: HTMLCanvasElement[];
  sprintFrames: HTMLCanvasElement[];
  jumpFrame: HTMLCanvasElement | null;
  victoryFrame: HTMLCanvasElement | null;
  stumbleFrame: HTMLCanvasElement | null;
};

const frameCache = new Map<string, ProcessedFrames>();
let isExtractingSprites = false;
const extractionCallbacks: (() => void)[] = [];

function extractSpriteFrames(onComplete: () => void) {
  if (frameCache.size > 0) {
    onComplete();
    return;
  }
  if (isExtractingSprites) {
    extractionCallbacks.push(onComplete);
    return;
  }
  isExtractingSprites = true;
  extractionCallbacks.push(onComplete);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = SPRITE_SHEET_URL;

  img.onload = () => {
    try {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = img.naturalWidth || img.width;
      sourceCanvas.height = img.naturalHeight || img.height;
      const ctx = sourceCanvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
      const data = imgData.data;

      // Chroma-key: remove pure white/near white background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Near-white detection threshold
        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0; // Transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Grid dimensions (approx 6 cols x 4 rows)
      const cols = 6;
      const rows = 4;
      const frameW = Math.floor(sourceCanvas.width / cols);
      const frameH = Math.floor(sourceCanvas.height / rows);

      // Color tints for 4 racers
      const tints = [
        { key: 'human', hueShift: 0, glow: '#06b6d4' },     // Cyan / Electric Blue
        { key: 'ai_1', hueShift: 140, glow: '#f43f5e' },    // Crimson / Red
        { key: 'ai_2', hueShift: 270, glow: '#10b981' },    // Emerald / Jade
        { key: 'ai_3', hueShift: 60, glow: '#eab308' },     // Gold / Yellow
      ];

      tints.forEach(({ key, hueShift }) => {
        const racerFrames: ProcessedFrames = {
          runFrames: [],
          sprintFrames: [],
          jumpFrame: null,
          victoryFrame: null,
          stumbleFrame: null,
        };

        // Extract run frames (Row 1)
        for (let c = 0; c < 6; c++) {
          const fc = document.createElement('canvas');
          fc.width = frameW;
          fc.height = frameH;
          const fctx = fc.getContext('2d');
          if (fctx) {
            fctx.filter = hueShift !== 0 ? `hue-rotate(${hueShift}deg)` : 'none';
            fctx.drawImage(sourceCanvas, c * frameW, 0, frameW, frameH, 0, 0, frameW, frameH);
            racerFrames.runFrames.push(fc);
          }
        }

        // Extract sprint frames (Row 2)
        for (let c = 0; c < 6; c++) {
          const fc = document.createElement('canvas');
          fc.width = frameW;
          fc.height = frameH;
          const fctx = fc.getContext('2d');
          if (fctx) {
            fctx.filter = hueShift !== 0 ? `hue-rotate(${hueShift}deg)` : 'none';
            fctx.drawImage(sourceCanvas, c * frameW, frameH, frameW, frameH, 0, 0, frameW, frameH);
            racerFrames.sprintFrames.push(fc);
          }
        }

        // Extract jump/stumble (Row 3, cols 1, 2)
        const jc = document.createElement('canvas');
        jc.width = frameW;
        jc.height = frameH;
        const jctx = jc.getContext('2d');
        if (jctx) {
          jctx.filter = hueShift !== 0 ? `hue-rotate(${hueShift}deg)` : 'none';
          jctx.drawImage(sourceCanvas, 2 * frameW, 2 * frameH, frameW, frameH, 0, 0, frameW, frameH);
          racerFrames.jumpFrame = jc;
        }

        const sc = document.createElement('canvas');
        sc.width = frameW;
        sc.height = frameH;
        const sctx = sc.getContext('2d');
        if (sctx) {
          sctx.filter = hueShift !== 0 ? `hue-rotate(${hueShift}deg)` : 'none';
          sctx.drawImage(sourceCanvas, 0, 2 * frameH, frameW, frameH, 0, 0, frameW, frameH);
          racerFrames.stumbleFrame = sc;
        }

        // Victory (Row 4, col 0)
        const vc = document.createElement('canvas');
        vc.width = frameW;
        vc.height = frameH;
        const vctx = vc.getContext('2d');
        if (vctx) {
          vctx.filter = hueShift !== 0 ? `hue-rotate(${hueShift}deg)` : 'none';
          vctx.drawImage(sourceCanvas, 0, 3 * frameH, frameW, frameH, 0, 0, frameW, frameH);
          racerFrames.victoryFrame = vc;
        }

        frameCache.set(key, racerFrames);
      });
    } catch (e) {
      console.warn('Canvas sprite extraction skipped; vector engine active', e);
    } finally {
      isExtractingSprites = false;
      extractionCallbacks.forEach((cb) => cb());
      extractionCallbacks.length = 0;
    }
  };

  img.onerror = () => {
    isExtractingSprites = false;
    extractionCallbacks.forEach((cb) => cb());
    extractionCallbacks.length = 0;
  };
}

export const NinjaCharacter: React.FC<NinjaCharacterProps> = ({ racer, isLeader }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spritesReady, setSpritesReady] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Determine racer key for tinting
  const cacheKey = racer.role === 'human' ? 'human' : `ai_${racer.laneIndex}`;

  useEffect(() => {
    extractSpriteFrames(() => {
      setSpritesReady(true);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrame = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const frames = frameCache.get(cacheKey);

      // Animation speed scaled by runner speed
      const animRate = Math.max(4, Math.min(18, racer.currentSpeed * 0.45));
      localFrame += dt * animRate;

      // Ground shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      const shadowY = canvas.height - 8;
      const shadowW = racer.state === 'jump' ? 24 : 36;
      ctx.ellipse(canvas.width / 2, shadowY, shadowW / 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Motion Blur / Speed Ghost trail when boosting or fast
      if (racer.state === 'boost' || racer.currentSpeed > 22) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = racer.glowColor;
        ctx.shadowColor = racer.glowColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 18, canvas.height / 2, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Check if extracted sprite frames exist
      if (spritesReady && frames && frames.runFrames.length > 0) {
        let frameImg: HTMLCanvasElement;

        if (racer.state === 'victory' && frames.victoryFrame) {
          frameImg = frames.victoryFrame;
        } else if (racer.state === 'stumble' && frames.stumbleFrame) {
          frameImg = frames.stumbleFrame;
        } else if (racer.currentSpeed > 20 && frames.sprintFrames.length > 0) {
          const idx = Math.floor(localFrame) % frames.sprintFrames.length;
          frameImg = frames.sprintFrames[idx];
        } else {
          const idx = Math.floor(localFrame) % frames.runFrames.length;
          frameImg = frames.runFrames[idx];
        }

        ctx.save();
        // Leader subtle glowing highlight
        if (isLeader) {
          ctx.shadowColor = racer.glowColor;
          ctx.shadowBlur = 10;
        }
        const drawW = 56;
        const drawH = 56;
        const drawX = (canvas.width - drawW) / 2;
        const drawY = canvas.height - drawH - 6;

        ctx.drawImage(frameImg, drawX, drawY, drawW, drawH);
        ctx.restore();
      } else {
        // High-definition Procedural Vector Ninja Runner fallback
        renderVectorNinja(ctx, canvas.width, canvas.height, localFrame, racer);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [spritesReady, cacheKey, racer.state, racer.currentSpeed, racer.glowColor, isLeader]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={72}
        height={68}
        className="block select-none pointer-events-none drop-shadow-md"
      />
      {/* Speed / Stumble visual badge */}
      {racer.state === 'boost' && (
        <span className="absolute -top-3 text-[10px] font-bold text-amber-300 tracking-wider animate-bounce font-mono">
          BOOST!
        </span>
      )}
      {racer.state === 'stumble' && (
        <span className="absolute -top-3 text-[10px] font-bold text-rose-400 tracking-wider animate-pulse font-mono">
          SLIP!
        </span>
      )}
    </div>
  );
};

/**
 * Procedural Vector Ninja runner animation
 */
function renderVectorNinja(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  racer: Racer
) {
  ctx.save();
  const cx = width / 2;
  const cy = height / 2 + 2;

  // Running leg cycle
  const legAngle = Math.sin(frame * 1.2) * 0.7;
  const armAngle = -legAngle;

  // Shinobi body colors
  const suitColor = '#0f172a'; // Stealth Black
  const skinColor = '#fed7aa';
  const accentColor = racer.color;

  // Trailing Scarf / Bandana tail that flutters with wind speed
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const scarfWave = Math.sin(frame * 1.6) * 4;
  ctx.moveTo(cx - 4, cy - 14);
  ctx.quadraticCurveTo(cx - 16, cy - 14 + scarfWave, cx - 26, cy - 12 - scarfWave);
  ctx.stroke();
  ctx.restore();

  // Back Leg
  ctx.save();
  ctx.strokeStyle = suitColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 1, cy + 4);
  ctx.lineTo(cx - 1 - Math.sin(-legAngle) * 11, cy + 14);
  ctx.lineTo(cx - 1 - Math.sin(-legAngle) * 11 + 6, cy + 22);
  ctx.stroke();
  ctx.restore();

  // Back Arm
  ctx.save();
  ctx.strokeStyle = suitColor;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - 6);
  ctx.lineTo(cx + 2 - Math.sin(-armAngle) * 8, cy);
  ctx.lineTo(cx + 2 - Math.sin(-armAngle) * 8 + 4, cy + 6);
  ctx.stroke();
  ctx.restore();

  // Torso / Gi
  ctx.fillStyle = suitColor;
  ctx.beginPath();
  ctx.roundRect(cx - 7, cy - 10, 14, 16, 4);
  ctx.fill();

  // Belt / Obi with racer color
  ctx.fillStyle = accentColor;
  ctx.fillRect(cx - 7, cy + 2, 14, 3.5);

  // Front Leg
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy + 4);
  ctx.lineTo(cx + 2 + Math.sin(legAngle) * 11, cy + 14);
  ctx.lineTo(cx + 2 + Math.sin(legAngle) * 11 + 7, cy + 22);
  ctx.stroke();
  ctx.restore();

  // Ninja Head / Mask
  ctx.fillStyle = suitColor;
  ctx.beginPath();
  ctx.arc(cx + 1, cy - 16, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // Headband plate with accent color
  ctx.fillStyle = accentColor;
  ctx.fillRect(cx - 7, cy - 21, 16, 4);

  // Ninja Eye Visor slit
  ctx.fillStyle = skinColor;
  ctx.fillRect(cx + 1, cy - 17, 7, 3);
  // Glowing eye
  ctx.fillStyle = racer.glowColor;
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 15.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Front Arm (pumping)
  ctx.save();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 1, cy - 6);
  ctx.lineTo(cx + 1 + Math.sin(armAngle) * 9, cy - 1);
  ctx.lineTo(cx + 1 + Math.sin(armAngle) * 9 + 6, cy - 7);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
