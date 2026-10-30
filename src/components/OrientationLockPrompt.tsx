import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Maximize, X } from 'lucide-react';

export const OrientationLockPrompt: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;
      const isMobile = window.innerWidth <= 840 || 'ontouchstart' in window;
      const portrait = window.innerHeight > window.innerWidth && isMobile;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleRequestLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch (e) {
      console.warn('Orientation lock fallback active', e);
    }
  };

  if (!isPortrait || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-fade-in text-center select-none">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#090e1a] border border-cyan-500/50 p-6 shadow-2xl flex flex-col items-center">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-slate-500 hover:text-white p-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <RotateCw className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <h3 className="font-display font-black text-xl text-slate-100 tracking-wider">
          ROTATE TO LANDSCAPE
        </h3>

        <p className="text-xs text-slate-400 mt-2 font-sans max-w-xs">
          For the optimal console gameplay experience with dual thumbsticks, please turn your device sideways into landscape mode.
        </p>

        <div className="mt-5 flex flex-col gap-2 w-full">
          <button
            onClick={handleRequestLandscape}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <Maximize className="w-4 h-4" />
            <span>ENTER FULLSCREEN LANDSCAPE</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2 px-4 rounded-xl font-mono text-[11px] text-slate-500 hover:text-slate-300"
          >
            Continue in Portrait
          </button>
        </div>
      </div>
    </div>
  );
};
