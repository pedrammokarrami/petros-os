import React from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Layers,
  Palette,
  Mic,
  Volume2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { VisualMode, ColorTheme } from './SiriVisualMotionEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visualMode: VisualMode;
  onSelectMode: (mode: VisualMode) => void;
  colorTheme: ColorTheme;
  onSelectTheme: (theme: ColorTheme) => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  language?: string;
  onLanguageChange: (lang: string) => void;
}

export function SiriMotionControlsModal({
  isOpen,
  onClose,
  visualMode,
  onSelectMode,
  colorTheme,
  onSelectTheme,
  sensitivity,
  onSensitivityChange,
  language = 'fa',
  onLanguageChange,
}: Props) {
  const isFa = language === 'fa';
  if (!isOpen) return null;

  const MODES: { id: VisualMode; nameFa: string; nameEn: string; descFa: string; descEn: string }[] = [
    {
      id: 'ribbons',
      nameFa: 'روبان‌های رنگین کمانی سیری (طرح دریبل)',
      nameEn: 'Siri Chromatic Ribbons (Dribbble)',
      descFa: 'حرکت ارگانیک و مواج روبان‌های نوری چندرنگ با ترکیب نوری روان',
      descEn: 'Ultra-fluid intertwining chromatic harmonic sine ribbons',
    },
    {
      id: 'orb',
      nameFa: 'گوی سه‌بعدی نوری (3D Orb)',
      nameEn: 'Volumetric 3D Siri Sphere',
      descFa: 'کره درخشان سه‌بعدی با حلقه‌های نئونی گردان و لنز شیشه‌ای',
      descEn: 'Pulsating volumetric spherical halo with glass core',
    },
    {
      id: 'particles',
      nameFa: 'سحابی ذرات شناور (Particle Nebula)',
      nameEn: 'Fluid Particle Nebula',
      descFa: 'مارپیچ‌های مواج از صدها ذره شناور کیهانی',
      descEn: 'Swirling stellar filaments and fluid light fields',
    },
    {
      id: 'waveform',
      nameFa: 'طیف هولوگرافیک صدا (Holo Spectrum)',
      nameEn: 'Holographic Soundwave Spectrum',
      descFa: 'اکولایزر خطی با انکسار نوری و پاسخ فوری به صدا',
      descEn: 'Dynamic multi-octave spectrum analyzer bars',
    },
    {
      id: 'eclipse',
      nameFa: 'خورشیدگرفتگی نئونی (Liquid Eclipse)',
      nameEn: 'Liquid Neon Eclipse Corona',
      descFa: 'مرکز تاریک ابسیدین با تاج‌های خورشیدی شعله‌ور نئونی',
      descEn: 'Deep obsidian core with turbulent solar chromatic flares',
    },
  ];

  const THEMES: { id: ColorTheme; nameFa: string; nameEn: string; colors: string[] }[] = [
    {
      id: 'classic',
      nameFa: 'کلاسیک اپل سیری',
      nameEn: 'Apple Siri Classic',
      colors: ['#00f0ff', '#ff2d75', '#8a2be2', '#ffffff'],
    },
    {
      id: 'neon',
      nameFa: 'سایبرپانک نئون',
      nameEn: 'Cyberpunk Neon',
      colors: ['#ff007f', '#00f0ff', '#9d00ff', '#00ff88'],
    },
    {
      id: 'solar',
      nameFa: 'فوران خورشیدی',
      nameEn: 'Solar Flare Gold',
      colors: ['#ff9500', '#ff2d55', '#ffd60a', '#ffffff'],
    },
    {
      id: 'aurora',
      nameFa: 'شفق قطبی زمردی',
      nameEn: 'Emerald Aurora',
      colors: ['#30d158', '#00f0ff', '#5856d6', '#ffffff'],
    },
    {
      id: 'deepspace',
      nameFa: 'فضای کیهانی عمیق',
      nameEn: 'Deep Space Void',
      colors: ['#0a84ff', '#bf5af2', '#5e5ce6', '#00ffff'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xl animate-fade-in pointer-events-auto select-none">
      <div className="w-full max-w-xl max-h-[85vh] rounded-[32px] bg-[#0d121c]/90 border border-white/15 backdrop-blur-3xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative">
        {/* Glowing Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-pink-500 p-[1.5px] shadow-[0_0_16px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center text-cyan-300">
                <Sliders className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">
                {isFa ? 'تنظیمات جلوه بصری و موشن سیری' : 'Siri Motion & Audio Engine Settings'}
              </h3>
              <p className="text-[11px] text-white/50 font-mono">
                Dribbble 3975272 Reimagined
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 p-5 overflow-y-auto space-y-6 text-sm"
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Visual Mode Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFa ? 'حالت گرافیکی موشن (Visual Mode)' : 'Visual Motion Mode'}</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id)}
                  className={`p-3 rounded-2xl text-right transition cursor-pointer flex items-center justify-between border ${
                    visualMode === mode.id
                      ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-white">
                      {isFa ? mode.nameFa : mode.nameEn}
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      {isFa ? mode.descFa : mode.descEn}
                    </div>
                  </div>
                  {visualMode === mode.id && (
                    <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span>{isFa ? 'پالت رنگی (Color Theme)' : 'Color Theme'}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-between border ${
                    colorTheme === theme.id
                      ? 'bg-pink-500/20 border-pink-400/60 text-white shadow-[0_0_20px_rgba(255,45,117,0.15)]'
                      : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-xs font-medium">{isFa ? theme.nameFa : theme.nameEn}</span>
                  <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
                    {theme.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Sensitivity Slider */}
          <div className="space-y-2.5 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/70 flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-yellow-400" />
                <span>{isFa ? 'حساسیت امواج به صدا' : 'Audio Waveform Reactivity'}</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={sensitivity}
              onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-white/70">
              {isFa ? 'زبان دستیار هوشمند' : 'Assistant Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onLanguageChange('fa')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  language === 'fa'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                    : 'bg-white/[0.04] border-white/10 text-white/70'
                }`}
              >
                🇮🇷 فارسی (Persian)
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  language === 'en'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                    : 'bg-white/[0.04] border-white/10 text-white/70'
                }`}
              >
                🇺🇸 English (US)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition cursor-pointer"
          >
            {isFa ? 'تایید و بستن' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
