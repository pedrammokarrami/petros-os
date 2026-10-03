import React, { useState } from 'react';
import { X, Sparkles, Orbit, Maximize2, Minimize2 } from 'lucide-react';
import { CosmicOrbitalHackerCanvas } from './CosmicOrbitalHackerCanvas';
import { AgentState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  agentState?: AgentState;
  isExecuting?: boolean;
}

export function CosmicAvatarModal({
  isOpen,
  onClose,
  language,
  agentState = 'idle',
  isExecuting = false,
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const isFa = language === 'fa';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${
          isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-4xl max-h-[92vh] rounded-[36px]'
        } ice-glass-window border border-white/90 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 text-slate-800`}
        onClick={(e) => e.stopPropagation()}
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/60 bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Orbit className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{isFa ? 'هسته‌ی زنده کیان (Cosmic Hacker & Orbital Halos)' : 'Cosmic Coder & Orbital Halos'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold">
                  60 FPS 3D
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                {isFa
                  ? 'رندرینگ سه‌بعدی ذرات گرد غبار کیهانی، عینک با انعکاس نور و استریم‌های نوری چرخان'
                  : 'Real-time 3D stardust particle physics, luminous glasses & swirling orbital light filaments'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-full ice-glass-btn text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer shadow-sm border border-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer shadow-sm border border-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Canvas Visualizer Area */}
        <div className="flex-1 relative flex items-center justify-center p-4 min-h-[420px] sm:min-h-[520px] bg-slate-950">
          <CosmicOrbitalHackerCanvas
            agentState={agentState}
            isExecuting={isExecuting}
            width={720}
            height={640}
            interactive={true}
            className="w-full h-full max-w-[700px] max-h-[620px]"
          />

          {/* Floating Subtle Stats Pills */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-black/75 border border-blue-500/30 backdrop-blur-md text-[11px] text-blue-200 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>{isFa ? '۳۸۰ ذره ریز معلق در مدار' : '380 Orbital Micro-Particles'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-md text-[11px] text-slate-300 flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>{isFa ? 'نورپردازی نقره‌ای و رفلکس شیشه‌ای' : 'Silver Rim-light & Glass Reflection'}</span>
            </div>
          </div>
        </div>

        {/* Footer info & interactive controls */}
        <div className="px-6 py-3.5 border-t border-white/60 bg-white/50 flex items-center justify-between text-xs text-slate-600 font-sans">
          <span>{isFa ? 'برای چرخش زاویه دید و زاویه سر، ماوس را روی تصویر حرکت دهید.' : 'Hover and move mouse across avatar to interact with 3D parallax.'}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full coral-pill-btn text-white font-bold shadow-md transition cursor-pointer"
          >
            {isFa ? 'بستن پنجره' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
