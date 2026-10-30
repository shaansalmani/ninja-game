import React, { useRef, useEffect, useState } from 'react';
import { ElementalSkin, GunSkinId, OutfitId, CharacterModelId } from '../types/game';
import { ELEMENTAL_SKIN_DATA, GUN_SKIN_DATA, OUTFIT_DATA, CHARACTER_DATA } from '../utils/combatConfig';
import { Sparkles, Crosshair } from 'lucide-react';

interface CharacterPreviewProps {
  skin: ElementalSkin;
  gunSkin: GunSkinId;
  outfit: OutfitId;
  characterModel?: CharacterModelId;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  skin,
  gunSkin,
  outfit,
  characterModel = 'myraa_hunter',
  width = 320,
  height = 420,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFiring, setIsFiring] = useState(false);
  const recoilRef = useRef(0);
  const muzzleFlashRef = useRef(0);

  const skinInfo = ELEMENTAL_SKIN_DATA[skin] || ELEMENTAL_SKIN_DATA.lightning;
  const gunInfo = GUN_SKIN_DATA[gunSkin] || GUN_SKIN_DATA.plasma_cyan;
  const outfitInfo = OUTFIT_DATA[outfit] || OUTFIT_DATA.tactical_stealth;
  const charInfo = CHARACTER_DATA[characterModel] || CHARACTER_DATA.myraa_hunter;

  const handleTestShot = () => {
    recoilRef.current = 1.0;
    muzzleFlashRef.current = 1.0;
    setIsFiring(true);
    setTimeout(() => setIsFiring(false), 250);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Recoil & Muzzle flash decay
      if (recoilRef.current > 0) {
        recoilRef.current = Math.max(0, recoilRef.current - 0.08);
      }
      if (muzzleFlashRef.current > 0) {
        muzzleFlashRef.current = Math.max(0, muzzleFlashRef.current - 0.15);
      }

      const cx = canvas.width / 2;
      const groundY = canvas.height - 65;

      // Subtle natural idle breathing animation
      const breath = Math.sin(time * 0.003) * 3;
      const breathArm = Math.sin(time * 0.003 + 0.5) * 1.5;

      // 1. Futuristic Glowing Hologram Floor Podium
      ctx.save();
      const podiumGrad = ctx.createRadialGradient(cx, groundY, 10, cx, groundY, 110);
      podiumGrad.addColorStop(0, `${skinInfo.color}33`);
      podiumGrad.addColorStop(0.6, `${skinInfo.color}11`);
      podiumGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = podiumGrad;
      ctx.beginPath();
      ctx.ellipse(cx, groundY, 100, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer Hologram Rings
      ctx.strokeStyle = skinInfo.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = skinInfo.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(cx, groundY, 82, 20, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Soft Ground Contact Shadow under character feet
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(cx, groundY - 2, 42, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Character Body Proportions & Stance
      // Base player origin
      const px = cx;
      const py = groundY - 180 + breath;

      ctx.save();

      // Ambient Elemental Spark Particles floating around player
      for (let i = 0; i < 4; i++) {
        const pTime = time * 0.002 + i * 1.57;
        const sparkX = cx + Math.cos(pTime) * (45 + (i % 2) * 20);
        const sparkY = py + 70 + Math.sin(pTime * 1.8) * 60;
        ctx.fillStyle = skinInfo.color;
        ctx.shadowColor = skinInfo.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- LEGS & BOOTS ---
      const hipY = py + 95;
      const legWidth = 14;

      // Left Leg (Back stance)
      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.strokeStyle = '#05070d';
      ctx.lineWidth = 2.5;

      // Left thigh
      ctx.beginPath();
      ctx.roundRect(px - 26, hipY, legWidth, 42, 6);
      ctx.fill();
      ctx.stroke();

      // Left calf & boot
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(px - 28, hipY + 38, legWidth + 2, 44, 5);
      ctx.fill();
      ctx.stroke();

      // Left boot plate (Accent)
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.fillRect(px - 30, hipY + 74, 18, 8);

      // Right Leg (Front ready stance)
      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.beginPath();
      ctx.roundRect(px + 8, hipY, legWidth, 42, 6);
      ctx.fill();
      ctx.stroke();

      // Right calf & armored greave
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(px + 6, hipY + 38, legWidth + 2, 44, 5);
      ctx.fill();
      ctx.stroke();

      // Right knee armor plate
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.shadowColor = outfitInfo.accentColor;
      ctx.shadowBlur = 6;
      ctx.fillRect(px + 7, hipY + 34, legWidth, 6);

      // Right boot toe
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + 4, hipY + 74, 20, 8);
      ctx.shadowBlur = 0;

      // --- TORSO & CHEST ARMOR ---
      const torsoY = py + 38;
      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.strokeStyle = '#05070d';
      ctx.lineWidth = 2.5;

      // Armored tactical flak jacket
      ctx.beginPath();
      ctx.roundRect(px - 22, torsoY, 44, 58, 8);
      ctx.fill();
      ctx.stroke();

      // Chest Armor Plate with Elemental Crest
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.shadowColor = outfitInfo.accentColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(px - 14, torsoY + 8, 28, 22, 5);
      ctx.fill();
      ctx.stroke();

      // Inner glowing core badge
      ctx.fillStyle = skinInfo.color;
      ctx.beginPath();
      ctx.arc(px, torsoY + 19, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tactical Utility Belt & Holster
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(px - 23, torsoY + 48, 46, 8);
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.fillRect(px - 6, torsoY + 47, 12, 10);
      // Ammo pouches
      ctx.fillStyle = '#334155';
      ctx.fillRect(px - 20, torsoY + 49, 7, 7);
      ctx.fillRect(px + 13, torsoY + 49, 7, 7);

      // --- LEFT ARM (Bracing Support) ---
      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.beginPath();
      ctx.roundRect(px - 34, torsoY + 6 + breathArm, 13, 30, 5);
      ctx.fill();
      ctx.stroke();

      // Left forearm angled toward gun handle
      ctx.beginPath();
      ctx.roundRect(px - 30, torsoY + 32 + breathArm, 26, 12, 4);
      ctx.fill();
      ctx.stroke();

      // Left tactical glove holding gun base
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(px - 2, torsoY + 38 + breathArm, 6, 0, Math.PI * 2);
      ctx.fill();

      // --- HEAD, MASK & VISOR ---
      const headY = py + 12;

      // Ninja Cowl / Helmet
      ctx.fillStyle = '#090e17';
      ctx.strokeStyle = '#05070d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, headY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Forehead Protector Plate
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.fillRect(px - 14, headY - 8, 28, 5);

      // Glowing Anime Visor Slit
      ctx.fillStyle = skinInfo.color;
      ctx.shadowColor = skinInfo.color;
      ctx.shadowBlur = 12;
      ctx.fillRect(px - 10, headY, 20, 4.5);
      ctx.shadowBlur = 0;

      // Scarf Neck Collar
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.beginPath();
      ctx.roundRect(px - 15, headY + 12, 30, 10, 4);
      ctx.fill();

      // Dynamic Flowing Anime Scarf Tails (Billowing in the wind)
      ctx.strokeStyle = skinInfo.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.shadowColor = skinInfo.color;
      ctx.shadowBlur = 8;
      const scarfW1 = Math.sin(time * 0.008) * 8;
      const scarfW2 = Math.cos(time * 0.009) * 10;
      ctx.beginPath();
      ctx.moveTo(px - 12, headY + 16);
      ctx.quadraticCurveTo(px - 35, headY + 22 + scarfW1, px - 60, headY + 10 + scarfW2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px - 12, headY + 18);
      ctx.quadraticCurveTo(px - 30, headY + 30 + scarfW2, px - 52, headY + 32 + scarfW1);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- RIGHT ARM & GUN IN HAND ---
      const recoilOffset = recoilRef.current * 7;
      const recoilAngle = recoilRef.current * -0.15;

      ctx.save();
      // Shoulder pivot point
      ctx.translate(px + 18, torsoY + 10);
      ctx.rotate(recoilAngle);

      // Right Upper Arm
      ctx.fillStyle = outfitInfo.primaryColor;
      ctx.strokeStyle = '#05070d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-4, 0, 14, 28, 5);
      ctx.fill();
      ctx.stroke();

      // Shoulder Pauldron
      ctx.fillStyle = outfitInfo.accentColor;
      ctx.fillRect(-6, -2, 16, 6);

      // Forearm extending forward to hold the gun
      ctx.beginPath();
      ctx.roundRect(0, 24, 28, 13, 4);
      ctx.fill();
      ctx.stroke();

      // Hand / Tactical Glove firmly gripping the gun
      const handX = 26 - recoilOffset;
      const handY = 28;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(handX, handY + 2, 7, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // DETAILED GUN MODEL IN HAND
      // ==========================================
      const gunOriginX = handX - 8;
      const gunOriginY = handY - 14;

      // 1. Gun Grip
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(gunOriginX + 6, gunOriginY + 10, 9, 18, 2);
      ctx.fill();
      ctx.stroke();

      // 2. Trigger Guard
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(gunOriginX + 14, gunOriginY + 12, 6, 8);

      // 3. Gun Main Receiver & Body
      ctx.fillStyle = gunInfo.color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.shadowColor = gunInfo.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(gunOriginX, gunOriginY, 44, 15, 3);
      ctx.fill();
      ctx.stroke();

      // 4. Energy Magazine Cell
      ctx.fillStyle = gunInfo.bulletColor;
      ctx.fillRect(gunOriginX + 12, gunOriginY + 3, 16, 4);

      // 5. Extended Heavy Barrel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(gunOriginX + 44, gunOriginY + 3, 26, 9);
      ctx.strokeRect(gunOriginX + 44, gunOriginY + 3, 26, 9);

      // 6. Vented Muzzle Brake
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(gunOriginX + 68, gunOriginY + 1.5, 7, 12);
      ctx.fillStyle = gunInfo.color;
      ctx.fillRect(gunOriginX + 69, gunOriginY + 4, 3, 7);

      // 7. Tactical Top Rail & Red Dot Sight
      ctx.fillStyle = '#334155';
      ctx.fillRect(gunOriginX + 10, gunOriginY - 5, 20, 5);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(gunOriginX + 22, gunOriginY - 6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle Flash Effect when fired!
      if (muzzleFlashRef.current > 0) {
        const flashX = gunOriginX + 78;
        const flashY = gunOriginY + 7.5;
        const flashSize = 16 * muzzleFlashRef.current;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = gunInfo.color;
        ctx.shadowBlur = 25;

        // Central white flare
        ctx.beginPath();
        ctx.arc(flashX, flashY, flashSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // 4-Point Starburst
        ctx.fillStyle = gunInfo.bulletColor;
        ctx.beginPath();
        ctx.moveTo(flashX + flashSize * 1.8, flashY);
        ctx.lineTo(flashX + flashSize * 0.4, flashY + flashSize * 0.3);
        ctx.lineTo(flashX, flashY + flashSize * 1.5);
        ctx.lineTo(flashX - flashSize * 0.4, flashY + flashSize * 0.3);
        ctx.lineTo(flashX - flashSize * 1.2, flashY);
        ctx.lineTo(flashX - flashSize * 0.4, flashY - flashSize * 0.3);
        ctx.lineTo(flashX, flashY - flashSize * 1.5);
        ctx.lineTo(flashX + flashSize * 0.4, flashY - flashSize * 0.3);
        ctx.closePath();
        ctx.fill();

        // High velocity bullet streak
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(flashX + flashSize, flashY);
        ctx.lineTo(flashX + flashSize + 45, flashY);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore(); // end arm & gun

      ctx.restore(); // end player

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skin, gunSkin, outfit, characterModel, skinInfo, gunInfo, outfitInfo]);

  return (
    <div className="relative flex flex-col items-center justify-center p-3 select-none">
      {/* Canvas Viewport */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#090e1a] via-[#050811] to-[#04060c] border border-slate-800 shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-auto cursor-pointer"
          onClick={interactive ? handleTestShot : undefined}
          title={interactive ? 'Click character to fire gun test shot!' : undefined}
        />

        {/* Character Title Overlay */}
        <div className="absolute top-3 left-3 flex flex-col pointer-events-none">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            {charInfo.title}
          </span>
          <span className="text-sm font-display font-black text-slate-100 flex items-center gap-1.5">
            {charInfo.name}
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </span>
        </div>

        {/* Gun & Outfit Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono pointer-events-none">
          <span
            className="px-2 py-0.5 rounded-md font-bold uppercase border shadow-sm"
            style={{
              backgroundColor: `${gunInfo.color}22`,
              color: gunInfo.color,
              borderColor: `${gunInfo.color}66`,
            }}
          >
            {gunInfo.name}
          </span>
          <span className="text-slate-400 font-semibold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            {outfitInfo.name}
          </span>
        </div>

        {/* Click to fire interactive prompt */}
        {interactive && (
          <button
            onClick={handleTestShot}
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all shadow-md active:scale-95"
            title="Fire Gun Recoil Test"
          >
            <Crosshair className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            <span>TEST FIRE</span>
          </button>
        )}
      </div>
    </div>
  );
};
