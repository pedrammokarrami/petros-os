import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Zap,
  Flame,
  Users,
  Gift,
  Check,
  Copy,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface Props {
  onBackToChat: () => void;
  userEmail?: string;
  userName?: string;
  language?: Language;
}

export function FuelApiKeyView({
  onBackToChat,
  userEmail = 'arminsh00@gmail.com',
  language = 'en',
}: Props) {
  const t = translations[language] || translations.en;
  // Fuel calibration percentage (synced with backend /api/fuel/status)
  const [fuelPercentage, setFuelPercentage] = useState<number>(58);
  const [isRevving, setIsRevving] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'claim' | 'boost' | 'invite' | 'perks' | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [boostActive, setBoostActive] = useState<boolean>(false);
  const [claimedTokens, setClaimedTokens] = useState<number>(41325);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<{ totalKeys: number; activeKeyMask: string; rotationsCount: number } | null>(null);

  // Sync with live backend fuel & key status on mount
  useEffect(() => {
    fetch('/api/fuel/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (typeof data.percentage === 'number') setFuelPercentage(data.percentage);
          if (typeof data.dailyClaimed === 'boolean') setDailyClaimed(data.dailyClaimed);
          if (typeof data.boostActive === 'boolean') setBoostActive(data.boostActive);
          if (typeof data.claimedTokens === 'number') setClaimedTokens(data.claimedTokens);
          setKeyStatus({
            totalKeys: data.totalKeys || 1,
            activeKeyMask: data.activeKeyMask || 'READY',
            rotationsCount: data.rotationsCount || 0,
          });
        }
      })
      .catch((err) => console.warn('Fuel status sync error:', err));
  }, []);

  // Keyboard navigation: Escape closes modal if open, or returns to chat
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else {
          onBackToChat();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, onBackToChat]);

  // Dynamic token balance calculated from fuel percentage & claimed tokens
  const tokenBalance = useMemo(() => {
    const total = claimedTokens || (fuelPercentage * 712.5);
    return Math.round(total).toLocaleString('en-US');
  }, [fuelPercentage, claimedTokens]);

  // Needle angle for gauge animation:
  // -90 deg at EMPTY (0%), 0 deg at HALF (50%), +90 deg at FULL (100%)
  const baseNeedleAngle = -90 + (fuelPercentage / 100) * 180;
  const needleAngle = isRevving ? Math.min(96, baseNeedleAngle + 14) : baseNeedleAngle;

  const triggerRev = () => {
    setIsRevving(true);
    setTimeout(() => setIsRevving(false), 700);
  };

  const handleDailyClaim = async () => {
    if (!dailyClaimed) {
      try {
        const res = await fetch('/api/fuel/claim', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setDailyClaimed(true);
          setFuelPercentage(data.percentage);
          setClaimedTokens(data.claimedTokens);
          triggerRev();
        }
      } catch {
        setDailyClaimed(true);
        setFuelPercentage((prev) => Math.min(100, prev + 15));
        setClaimedTokens((prev) => prev + 10500);
        triggerRev();
      }
    }
  };

  const handleTurboBoost = async () => {
    try {
      const res = await fetch('/api/fuel/boost', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBoostActive(true);
        setFuelPercentage(data.percentage || 100);
        setClaimedTokens(data.claimedTokens || 65000);
        triggerRev();
      }
    } catch {
      setBoostActive(true);
      setFuelPercentage(100);
      setClaimedTokens((prev) => prev + 25000);
      triggerRev();
    }
  };

  // Luxury 3-Tier Radial Graduation (25 ticks across 180° - No Protractor Rail)
  const tickCount = 25;
  const radialTicks = useMemo(() => {
    const cx = 210;
    const cy = 210;
    const rOuter = 168;

    const list = [];
    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1);
      const rad = Math.PI * (1 - t);

      // 3-Tier Hierarchy: Major (Quarters), Medium (Eighths), Minor (Sixteenths)
      const isQuarter = i % 6 === 0; // i = 0 (E), 6, 12 (Apex), 18, 24 (F)
      const isApex = i === 12; // 50% Top Apex
      const isEighth = i % 3 === 0 && !isQuarter; // i = 3, 9, 15, 21
      const isMinor = !isQuarter && !isEighth; // all other micro-dashes

      // Distinct size hierarchy: Major 22px (Apex 25px), Medium 13px, Minor 5.5px
      let length = 5.5;
      let strokeWidth = 1.7;
      let opacity = 0.52;

      if (isApex) {
        length = 25;
        strokeWidth = 3.8;
        opacity = 1;
      } else if (isQuarter) {
        length = 22;
        strokeWidth = 3.4;
        opacity = 0.98;
      } else if (isEighth) {
        length = 13;
        strokeWidth = 2.4;
        opacity = 0.85;
      }

      // Red Warning Zone: First 4 ticks (i = 0, 1, 2, 3 - representing low fuel reserve)
      const isLow = i <= 3;

      const rInner = rOuter - length;

      const x1 = cx + rOuter * Math.cos(rad);
      const y1 = cy - rOuter * Math.sin(rad);
      const x2 = cx + rInner * Math.cos(rad);
      const y2 = cy - rInner * Math.sin(rad);

      // Luminous Station Pip for Major Posts (at r = 136)
      const hasPip = isQuarter;
      const pipR = 136;
      const pipX = cx + pipR * Math.cos(rad);
      const pipY = cy - pipR * Math.sin(rad);

      list.push({
        index: i,
        x1,
        y1,
        x2,
        y2,
        isQuarter,
        isApex,
        isEighth,
        isMinor,
        isLow,
        strokeWidth,
        opacity,
        hasPip,
        pipX,
        pipY,
        t,
      });
    }
    return list;
  }, [tickCount]);

  // Render Helper for Orbital Satellite Button 1: Daily Claim (Amber floating soap bubble)
  const renderDailyClaimBtn = (extraClasses = '') => (
    <motion.div
      animate={{
        y: [0, -11, 5, -9, 3, 0],
        x: [0, 6, -7, 5, -4, 0],
        scale: [1, 1.04, 0.97, 1.03, 0.985, 1],
        rotate: [0, 2, -1.6, 1.8, -1, 0],
      }}
      transition={{
        duration: 12.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="relative will-change-transform"
    >
      <button
        type="button"
        onClick={handleDailyClaim}
        title={t.dailyClaim}
        className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-[130px] lg:h-[130px] rounded-full aspect-square p-2 sm:p-2.5 bg-gradient-to-br from-white/98 via-amber-50/50 to-white/85 border-[2.5px] border-white/95 text-slate-800 shadow-[0_24px_50px_-8px_rgba(245,158,11,0.38),0_10px_22px_rgba(15,23,42,0.08),inset_0_4px_10px_#ffffff,inset_0_-8px_18px_rgba(245,158,11,0.22)] backdrop-blur-3xl flex flex-col items-center justify-between text-center transition-all duration-500 cursor-pointer active:scale-95 active:translate-y-1 hover:scale-108 hover:-translate-y-1 hover:shadow-[0_30px_60px_-6px_rgba(245,158,11,0.52),inset_0_4px_12px_#ffffff] group ${extraClasses}`}
      >
        {/* Soap Bubble Optical Specular Reflection Arcs */}
        <div className="absolute top-1 inset-x-3 h-8 sm:h-10 rounded-full bg-gradient-to-b from-white/95 via-white/35 to-transparent pointer-events-none" />
        <div className="absolute top-1.5 sm:top-2 w-4 h-1 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] pointer-events-none" />
        <div className="absolute inset-0 rounded-full pointer-events-none border border-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(245,158,11,0.25)]" />

        <div className="relative z-10 mt-1 sm:mt-1.5 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 border border-amber-200/90 flex items-center justify-center text-amber-950 shadow-[0_8px_18px_rgba(245,158,11,0.45),inset_0_2px_4px_#fff] group-hover:rotate-6 transition-transform shrink-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-950 text-amber-950" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-1 mb-0.5 sm:mb-1">
          <span className="text-[9px] sm:text-[10px] md:text-[10.5px] font-black tracking-wider uppercase text-slate-900 leading-none">
            {t.dailyClaim}
          </span>
          <span className="text-[8px] sm:text-[8.5px] md:text-[9.5px] font-bold text-amber-700 mt-0.5 sm:mt-1 leading-none px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200 shadow-sm truncate max-w-full">
            {dailyClaimed ? t.claimed : '+15% BOOST'}
          </span>
        </div>
      </button>
    </motion.div>
  );

  // Render Helper for Orbital Satellite Button 2: Turbo Boost (Rose/Flame floating soap bubble)
  const renderTurboBoostBtn = (extraClasses = '') => (
    <motion.div
      animate={{
        y: [0, 10, -6, 9, -4, 0],
        x: [0, -7, 6, -5, 3, 0],
        scale: [1, 0.97, 1.045, 0.98, 1.025, 1],
        rotate: [0, -2.2, 1.8, -1.4, 1.1, 0],
      }}
      transition={{
        duration: 14.0,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1.5,
      }}
      className="relative will-change-transform"
    >
      <button
        type="button"
        onClick={handleTurboBoost}
        title={t.turboBoost}
        className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-[130px] lg:h-[130px] rounded-full aspect-square p-2 sm:p-2.5 bg-gradient-to-br from-white/98 via-rose-50/50 to-white/85 border-[2.5px] border-white/95 text-slate-800 shadow-[0_24px_50px_-8px_rgba(244,63,94,0.38),0_10px_22px_rgba(15,23,42,0.08),inset_0_4px_10px_#ffffff,inset_0_-8px_18px_rgba(244,63,94,0.22)] backdrop-blur-3xl flex flex-col items-center justify-between text-center transition-all duration-500 cursor-pointer active:scale-95 active:translate-y-1 hover:scale-108 hover:-translate-y-1 hover:shadow-[0_30px_60px_-6px_rgba(244,63,94,0.52),inset_0_4px_12px_#ffffff] group ${extraClasses}`}
      >
        {/* Soap Bubble Optical Specular Reflection Arcs */}
        <div className="absolute top-1 inset-x-3 h-8 sm:h-10 rounded-full bg-gradient-to-b from-white/95 via-white/35 to-transparent pointer-events-none" />
        <div className="absolute top-1.5 sm:top-2 w-4 h-1 rounded-full bg-rose-400 shadow-[0_0_10px_#f43f5e] pointer-events-none" />
        <div className="absolute inset-0 rounded-full pointer-events-none border border-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(244,63,94,0.25)]" />

        <div className="relative z-10 mt-1 sm:mt-1.5 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-200 border border-rose-200/90 flex items-center justify-center text-white shadow-[0_8px_18px_rgba(244,63,94,0.45),inset_0_2px_4px_#fff] group-hover:rotate-6 transition-transform shrink-0">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-1 mb-0.5 sm:mb-1">
          <span className="text-[9px] sm:text-[10px] md:text-[10.5px] font-black tracking-wider uppercase text-slate-900 leading-none">
            {t.turboBoost}
          </span>
          <span className="text-[8px] sm:text-[8.5px] md:text-[9.5px] font-bold text-rose-700 mt-0.5 sm:mt-1 leading-none px-2 py-0.5 rounded-full bg-rose-100/80 border border-rose-200 shadow-sm truncate max-w-full">
            {boostActive ? 'OVERDRIVE ⚡' : 'MAX (2.0x)'}
          </span>
        </div>
      </button>
    </motion.div>
  );

  // Render Helper for Orbital Satellite Button 3: Invite Group (Sky/Cyan floating soap bubble)
  const renderInviteGroupBtn = (extraClasses = '') => (
    <motion.div
      animate={{
        y: [0, -12, 6, -8, 4, 0],
        x: [0, -6, 7, -4, 5, 0],
        scale: [1, 1.035, 0.965, 1.04, 0.98, 1],
        rotate: [0, -1.8, 2.2, -1.5, 1.2, 0],
      }}
      transition={{
        duration: 13.2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2.8,
      }}
      className="relative will-change-transform"
    >
      <button
        type="button"
        onClick={() => setActiveModal('invite')}
        title={t.inviteGroup}
        className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-[130px] lg:h-[130px] rounded-full aspect-square p-2 sm:p-2.5 bg-gradient-to-br from-white/98 via-sky-50/50 to-white/85 border-[2.5px] border-white/95 text-slate-800 shadow-[0_24px_50px_-8px_rgba(2,132,199,0.38),0_10px_22px_rgba(15,23,42,0.08),inset_0_4px_10px_#ffffff,inset_0_-8px_18px_rgba(2,132,199,0.22)] backdrop-blur-3xl flex flex-col items-center justify-between text-center transition-all duration-500 cursor-pointer active:scale-95 active:translate-y-1 hover:scale-108 hover:-translate-y-1 hover:shadow-[0_30px_60px_-6px_rgba(2,132,199,0.52),inset_0_4px_12px_#ffffff] group ${extraClasses}`}
      >
        {/* Soap Bubble Optical Specular Reflection Arcs */}
        <div className="absolute top-1 inset-x-3 h-8 sm:h-10 rounded-full bg-gradient-to-b from-white/95 via-white/35 to-transparent pointer-events-none" />
        <div className="absolute top-1.5 sm:top-2 w-4 h-1 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] pointer-events-none" />
        <div className="absolute inset-0 rounded-full pointer-events-none border border-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(2,132,199,0.25)]" />

        <div className="relative z-10 mt-1 sm:mt-1.5 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-blue-600 via-sky-400 to-cyan-200 border border-sky-200/90 flex items-center justify-center text-white shadow-[0_8px_18px_rgba(2,132,199,0.45),inset_0_2px_4px_#fff] group-hover:rotate-6 transition-transform shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-1 mb-0.5 sm:mb-1">
          <span className="text-[9px] sm:text-[10px] md:text-[10.5px] font-black tracking-wider uppercase text-slate-900 leading-none">
            {t.inviteGroup}
          </span>
          <span className="text-[8px] sm:text-[8.5px] md:text-[9.5px] font-bold text-blue-700 mt-0.5 sm:mt-1 leading-none px-2 py-0.5 rounded-full bg-blue-100/80 border border-blue-200 shadow-sm truncate max-w-full">
            BOOST (1.5x)
          </span>
        </div>
      </button>
    </motion.div>
  );

  // Render Helper for Orbital Satellite Button 4: Redeem Perks (Purple/Dev Pass floating soap bubble)
  const renderRedeemPerksBtn = (extraClasses = '') => (
    <motion.div
      animate={{
        y: [0, 9, -5, 8, -4, 0],
        x: [0, 5, -5, 6, -3, 0],
        scale: [1, 0.98, 1.04, 0.97, 1.025, 1],
        rotate: [0, 2.2, -1.8, 1.5, -1.1, 0],
      }}
      transition={{
        duration: 15.0,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 4.1,
      }}
      className="relative will-change-transform"
    >
      <button
        type="button"
        onClick={() => setActiveModal('perks')}
        title={t.redeemPerks}
        className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-[130px] lg:h-[130px] rounded-full aspect-square p-2 sm:p-2.5 bg-gradient-to-br from-white/98 via-purple-50/50 to-white/85 border-[2.5px] border-white/95 text-slate-800 shadow-[0_24px_50px_-8px_rgba(192,38,211,0.38),0_10px_22px_rgba(15,23,42,0.08),inset_0_4px_10px_#ffffff,inset_0_-8px_18px_rgba(192,38,211,0.22)] backdrop-blur-3xl flex flex-col items-center justify-between text-center transition-all duration-500 cursor-pointer active:scale-95 active:translate-y-1 hover:scale-108 hover:-translate-y-1 hover:shadow-[0_30px_60px_-6px_rgba(192,38,211,0.52),inset_0_4px_12px_#ffffff] group ${extraClasses}`}
      >
        {/* Soap Bubble Optical Specular Reflection Arcs */}
        <div className="absolute top-1 inset-x-3 h-8 sm:h-10 rounded-full bg-gradient-to-b from-white/95 via-white/35 to-transparent pointer-events-none" />
        <div className="absolute top-1.5 sm:top-2 w-4 h-1 rounded-full bg-fuchsia-400 shadow-[0_0_10px_#c026d3] pointer-events-none" />
        <div className="absolute inset-0 rounded-full pointer-events-none border border-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(192,38,211,0.25)]" />

        <div className="relative z-10 mt-1 sm:mt-1.5 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-400 to-pink-200 border border-fuchsia-200/90 flex items-center justify-center text-white shadow-[0_8px_18px_rgba(192,38,211,0.45),inset_0_2px_4px_#fff] group-hover:rotate-6 transition-transform shrink-0">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-1 mb-0.5 sm:mb-1">
          <span className="text-[9px] sm:text-[10px] md:text-[10.5px] font-black tracking-wider uppercase text-slate-900 leading-none">
            {t.redeemPerks}
          </span>
          <span className="text-[8px] sm:text-[8.5px] md:text-[9.5px] font-bold text-purple-700 mt-0.5 sm:mt-1 leading-none px-2 py-0.5 rounded-full bg-purple-100/80 border border-purple-200 shadow-sm truncate max-w-full">
            DEV PASS
          </span>
        </div>
      </button>
    </motion.div>
  );

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-3 sm:gap-5 px-3 sm:px-6 py-2 sm:py-3 select-none font-sans text-slate-800"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
    >
      {/* ========================================================================= */}
      {/* TOP BAR: RETURN TO CHAT                                                   */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 pt-1 pb-1 sm:pb-2">
        <div className="relative w-full flex items-center justify-between">
          {/* Back to Home/Chat Button */}
          <div className="flex items-center z-10 shrink-0">
            <button
              type="button"
              onClick={onBackToChat}
              title={t.returnToChat}
              className="flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2 rounded-2xl bg-white/85 hover:bg-white text-slate-800 hover:text-blue-600 font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(37,99,235,0.16),0_2px_6px_rgba(0,0,0,0.04)] border border-white/95 backdrop-blur-xl transition-all active:scale-95 active:translate-y-0.5 cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-1 transition-transform" />
              <span>{t.returnToChat}</span>
            </button>
          </div>

          {/* Symmetrical spacer on the right */}
          <div className="hidden sm:block w-28 md:w-36 lg:w-40 z-0 pointer-events-none shrink-0" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CENTER STAGE: ORBITAL 3D LIQUID GLASS SATELLITES FRAMING CENTRAL GAUGE    */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-6xl xl:max-w-7xl flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-14 xl:gap-20 my-auto py-1 sm:py-2">
        {/* DESKTOP/TABLET LEFT ORBITAL WING: 2 SCULPTED CRYSTAL PODS (hidden on mobile, visible md+) */}
        <div className="hidden md:flex flex-col items-center justify-between h-[360px] md:h-[390px] lg:h-[420px] py-2 shrink-0">
          {renderDailyClaimBtn()}
          {renderTurboBoostBtn()}
        </div>

        {/* CENTER: MASTER 3D LIQUID GLASS FUEL GAUGE (CENTRAL COCKPIT PIECE) */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className="relative w-[270px] xs:w-[290px] sm:w-[350px] md:w-[390px] lg:w-[430px] max-w-[90vw] aspect-square flex items-center justify-center">
            {/* High-Intensity Ambient Caustic Atmospheric Glow */}
            <div
              className="absolute inset-0 rounded-full blur-3xl pointer-events-none opacity-65"
              style={{
                background:
                  'radial-gradient(circle at 50% 35%, rgba(56, 189, 248, 0.7) 0%, rgba(37, 99, 235, 0.5) 45%, rgba(15, 23, 42, 0.2) 75%)',
              }}
            />

            {/* OUTER 3D TOROIDAL LIQUID GLASS BEZEL (DEEP 3D SHADOWS, TEXTURED CHAMFER & SPECULAR EDGES) */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center p-3.5 sm:p-4.5 backdrop-blur-3xl transition-all"
              style={{
                background: `
                  radial-gradient(circle at 32% 16%, rgba(255, 255, 255, 1) 0%, rgba(240, 249, 255, 0.96) 20%, rgba(199, 227, 254, 0.9) 45%, rgba(147, 197, 253, 0.75) 75%, rgba(96, 165, 250, 0.6) 100%)
                `,
                boxShadow: `
                  0 50px 110px -15px rgba(2, 132, 199, 0.55),
                  0 30px 60px -10px rgba(15, 23, 42, 0.4),
                  inset 0 7px 16px rgba(255, 255, 255, 1),
                  inset 0 -10px 24px rgba(15, 23, 42, 0.45),
                  inset 6px 0 14px rgba(255, 255, 255, 0.95),
                  inset -6px 0 14px rgba(96, 165, 250, 0.6)
                `,
                border: '4.5px solid rgba(255, 255, 255, 1)',
              }}
            >
              {/* Luxury Tactile Leather Micro-Grain Texture (Maintains Original Color) */}
              <div
                className="absolute inset-[3px] rounded-full pointer-events-none opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.45) 0.8px, transparent 1px),
                    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.6) 0.6px, transparent 1.2px),
                    radial-gradient(circle at 75% 65%, rgba(0, 0, 0, 0.35) 0.7px, transparent 1.1px),
                    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px, transparent 3.5px),
                    repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 0, rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px, transparent 3.5px)
                  `,
                  backgroundSize: '4px 4px, 5px 5px, 6px 6px, 6px 6px, 6px 6px',
                }}
              />

              {/* Inner Optical Refraction Chamfer Ring with High Contrast Edge */}
              <div
                className="absolute inset-[6px] rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 35% 20%, rgba(255, 255, 255, 0.98) 0%, rgba(219, 234, 254, 0.8) 55%, rgba(147, 197, 253, 0.85) 100%)',
                  boxShadow:
                    'inset 0 4px 10px rgba(255, 255, 255, 1), inset 0 -6px 16px rgba(30, 64, 175, 0.6), 0 0 0 1.5px rgba(255, 255, 255, 0.9)',
                  border: '2px solid rgba(255, 255, 255, 0.95)',
                }}
              />

              {/* RECESSED CELESTIAL SKY-BLUE DIAL ENCLOSURE (ENHANCED HIGH-CONTRAST CAVITY) */}
              <div
                className="relative w-[92%] h-[92%] rounded-full flex items-center justify-center overflow-hidden border-2 border-white/95 cursor-pointer select-none"
                onClick={triggerRev}
                title="Click to rev fuel needle"
                style={{
                  background: `
                    radial-gradient(circle at 50% 28%, #4a9ff5 0%, #2578e8 28%, #1355b8 62%, #082d70 100%)
                  `,
                  boxShadow: `
                    inset 0 35px 70px rgba(4, 18, 55, 0.85),
                    inset 0 -20px 40px rgba(255, 255, 255, 0.75),
                    inset 0 0 45px rgba(5, 35, 95, 0.7),
                    0 20px 50px rgba(37, 99, 235, 0.35)
                  `,
                }}
              >
                {/* SVG DIAL TICKS, HARMONIOUS 3D BACKGROUND, EMPTY, FULL, AND SEAMLESS FUEL PUMP */}
                <svg
                  viewBox="0 0 420 420"
                  className="relative z-10 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient id="pivotGradient" cx="40%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="45%" stopColor="#cbd5e1" />
                      <stop offset="85%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#334155" />
                    </radialGradient>

                    {/* 3D Concave Dial Cavity Bowl Glow (Smoothly Faded Highlights) */}
                    <radialGradient id="dialCavityGlow" cx="50%" cy="30%" r="65%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                      <stop offset="35%" stopColor="#2563eb" stopOpacity="0.22" />
                      <stop offset="70%" stopColor="#1e3a8a" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.55" />
                    </radialGradient>

                    {/* Upper Soft Highlight Crescent */}
                    <radialGradient id="dialTopCrescent" cx="50%" cy="16%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.26" />
                      <stop offset="45%" stopColor="#93c5fd" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                    </radialGradient>

                    {/* Soft Pump Ambient Backglow */}
                    <radialGradient id="pumpAmbientGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
                      <stop offset="60%" stopColor="#1e40af" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                    </radialGradient>

                    {/* Pump Body Metallic Gradient */}
                    <linearGradient id="pumpBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>

                    {/* Soft Glow Filter for Red Reserve */}
                    <filter id="softRedGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff1744" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {/* 3D SCULPTED CONCAVE DISH HIGHLIGHTS (SMOOTHLY BLENDED & FADED) */}
                  <circle cx="210" cy="210" r="176" fill="url(#dialCavityGlow)" />
                  <ellipse cx="210" cy="130" rx="140" ry="85" fill="url(#dialTopCrescent)" />

                  {/* 1. RADIAL GRADUATION TICKS (LUXURY 3-TIER HIERARCHY - NO PROTRACTOR RAIL) */}
                  <g>
                    {radialTicks.map((tick) => (
                      <g key={tick.index}>
                        <line
                          x1={tick.x1}
                          y1={tick.y1}
                          x2={tick.x2}
                          y2={tick.y2}
                          stroke={tick.isLow ? '#ff1744' : '#ffffff'}
                          strokeWidth={tick.strokeWidth}
                          strokeOpacity={tick.opacity}
                          strokeLinecap="round"
                          className={
                            tick.isLow
                              ? 'drop-shadow-[0_0_8px_#ff1744]'
                              : tick.isQuarter
                              ? 'drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)] drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                              : 'drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.65)]'
                          }
                        />
                        {tick.hasPip && (
                          <circle
                            cx={tick.pipX}
                            cy={tick.pipY}
                            r={1.75}
                            fill={tick.isLow ? '#ff1744' : '#ffffff'}
                            className={
                              tick.isLow
                                ? 'drop-shadow-[0_0_6px_#ff1744]'
                                : 'drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]'
                            }
                          />
                        )}
                      </g>
                    ))}
                  </g>

                  {/* 2. LEFT: EMPTY (REFINED BESPOKE LUXURY TYPOGRAPHY) */}
                  <g transform="translate(94, 204)">
                    <text
                      x="0"
                      y="0"
                      fill="#ff2a55"
                      fontSize="22"
                      fontWeight="900"
                      fontFamily="'Inter', 'Plus Jakarta Sans', system-ui, sans-serif"
                      letterSpacing="0.04em"
                      textAnchor="middle"
                      className="drop-shadow-[0_0_14px_rgba(255,42,85,0.95)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                    >
                      E
                    </text>
                    <text
                      x="0"
                      y="17"
                      fill="#ff4d6d"
                      fontSize="9"
                      fontWeight="800"
                      fontFamily="'Inter', 'Plus Jakarta Sans', system-ui, sans-serif"
                      letterSpacing="0.22em"
                      textAnchor="middle"
                      className="drop-shadow-[0_0_8px_rgba(255,42,85,0.85)]"
                    >
                      EMPTY
                    </text>
                  </g>

                  {/* 3. RIGHT: FULL (REFINED BESPOKE LUXURY TYPOGRAPHY) */}
                  <g transform="translate(326, 204)">
                    <text
                      x="0"
                      y="0"
                      fill="#ffffff"
                      fontSize="22"
                      fontWeight="900"
                      fontFamily="'Inter', 'Plus Jakarta Sans', system-ui, sans-serif"
                      letterSpacing="0.04em"
                      textAnchor="middle"
                      className="drop-shadow-[0_2px_6px_rgba(4,18,55,0.95)] drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                    >
                      F
                    </text>
                    <text
                      x="0"
                      y="17"
                      fill="#ffffff"
                      fillOpacity="0.88"
                      fontSize="9"
                      fontWeight="800"
                      fontFamily="'Inter', 'Plus Jakarta Sans', system-ui, sans-serif"
                      letterSpacing="0.22em"
                      textAnchor="middle"
                      className="drop-shadow-[0_2px_6px_rgba(4,18,55,0.95)]"
                    >
                      FULL
                    </text>
                  </g>

                  {/* 6. HARMONIOUS FUEL PUMP ILLUSTRATION (NO BOUNDING BOX / SEAMLESS 3D EMBLEM) */}
                  <g transform="translate(210, 310)">
                    {/* Soft Ambient Backglow Fading into Celestial Blue */}
                    <circle cx="0" cy="0" r="26" fill="url(#pumpAmbientGlow)" pointerEvents="none" />

                    {/* Standalone Fuel Dispenser Illustration */}
                    <g transform="translate(-13, -15) scale(1.35)">
                      {/* Dispenser Body */}
                      <path
                        d="M3 4C3 2.89543 3.89543 2 5 2H13C14.1046 2 15 2.89543 15 4V19C15 19.5523 14.5523 20 14 20H4C3.44772 20 3 19.5523 3 19V4Z"
                        fill="url(#pumpBodyGradient)"
                        filter="drop-shadow(0 3px 6px rgba(2, 10, 30, 0.65))"
                      />
                      {/* Meter Window */}
                      <rect x="5.2" y="4.5" width="7.6" height="4.2" rx="0.8" fill="#082f49" />
                      <rect x="5.8" y="5.1" width="6.4" height="2.8" rx="0.4" fill="#38bdf8" opacity="0.9" />
                      {/* Base Footing Accent */}
                      <rect x="3" y="18" width="12" height="1.4" rx="0.5" fill="rgba(255, 255, 255, 0.45)" />

                      {/* Flexible Hose and Fuel Nozzle Handle */}
                      <path
                        d="M15 5.5H16.2C17.4 5.5 18.2 6.4 18.2 7.6V14.2C18.2 15.6 19.4 16.5 20.4 16.5C21.4 16.5 22.2 15.6 22.2 14.4V9.5L20.8 8.1"
                        fill="none"
                        stroke="url(#pumpBodyGradient)"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="drop-shadow(0 2px 4px rgba(2, 10, 30, 0.6))"
                      />
                      {/* Fuel Droplet Accent */}
                      <circle cx="20.8" cy="8.1" r="0.9" fill="#38bdf8" className="drop-shadow-[0_0_4px_#38bdf8]" />
                    </g>
                  </g>
                </svg>

                {/* 8. BOLD DYNAMIC 3D FUEL NEEDLE (SUBMERGED UNDER GLASS DOME) */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-transform duration-700 ease-out"
                  style={{
                    transform: `rotate(${needleAngle}deg)`,
                    filter: 'drop-shadow(0 14px 18px rgba(5, 15, 40, 0.75)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.55))',
                  }}
                >
                  {/* Bolder Saturated Ruby-Neon Red Needle Blade with Intense Glow */}
                  <div
                    className="absolute"
                    style={{
                      bottom: '50%',
                      width: '7.5px',
                      height: '43.5%',
                      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                      background:
                        'linear-gradient(to top, #9f1239 0%, #e11d48 18%, #ff0f3d 52%, #ff2a55 82%, #ffffff 100%)',
                      boxShadow:
                        '0 0 28px rgba(255, 15, 61, 1), 0 0 14px rgba(255, 42, 85, 0.95), 0 0 6px #ffffff',
                    }}
                  />

                  {/* Longitudinal Crisp Light Spine Highlight */}
                  <div
                    className="absolute"
                    style={{
                      bottom: '50%',
                      width: '2px',
                      height: '42%',
                      background: 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, #ffffff 60%, #ffffff 100%)',
                      borderRadius: '1px',
                      boxShadow: '0 0 6px rgba(255, 255, 255, 0.9)',
                    }}
                  />

                  {/* Needle Base Counterbalance */}
                  <div
                    className="absolute"
                    style={{
                      top: '50%',
                      width: '8.5px',
                      height: '14%',
                      borderRadius: '0 0 3px 3px',
                      background: 'linear-gradient(to bottom, #1e293b, #090d16)',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderTop: 'none',
                    }}
                  />

                  {/* Chrome Central Hub & Pivot Cap with High-End Automotive Spherical Reflection */}
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white/95 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_2.5px_5px_#fff]"
                    style={{
                      background:
                        'radial-gradient(circle at 35% 28%, #ffffff 0%, #cbd5e1 32%, #64748b 68%, #1e293b 100%)',
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-600 shadow-inner flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-sky-400 opacity-95 blur-[0.3px] shadow-[0_0_6px_#38bdf8]" />
                    </div>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 6. 3D LIQUID GLASS DOME OPTICAL OVERLAYS (Z-INDEX 30+)            */}
                {/* ================================================================= */}

                {/* LAYER A: CONVEX SPHERICAL REFRACTION */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none z-30"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 20%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.18) 35%, transparent 68%)',
                    boxShadow: `
                      inset 0 2px 5px rgba(255, 255, 255, 1),
                      inset 0 -5px 16px rgba(2, 132, 199, 0.45),
                      inset 4px 0 8px rgba(255, 255, 255, 0.75),
                      inset -4px 0 8px rgba(2, 132, 199, 0.35)
                    `,
                  }}
                />

                {/* LAYER B: ULTRA-GLOSSY CRESCENT SPECULAR HIGHLIGHT (LIGHT SOURCE STRIKE) */}
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    top: '4%',
                    left: '10%',
                    width: '78%',
                    height: '46%',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(175deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.55) 28%, rgba(255, 255, 255, 0.12) 60%, transparent 90%)',
                    transform: 'rotate(-16deg)',
                    filter: 'blur(0.8px)',
                  }}
                />

                {/* LAYER C: INTENSE PINPOINT SPECULAR HOTSPOT (SUN/LIGHTBULB) */}
                <div
                  className="absolute pointer-events-none z-35"
                  style={{
                    top: '11%',
                    left: '24%',
                    width: '34px',
                    height: '22px',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse at center, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 30%, rgba(255, 255, 255, 0) 75%)',
                    transform: 'rotate(-25deg)',
                    filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 1))',
                  }}
                />

                {/* LAYER D: DIAGONAL CAUSTIC LIGHT BEAM */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none z-30 mix-blend-screen opacity-45"
                  style={{
                    background:
                      'linear-gradient(125deg, transparent 22%, rgba(255, 255, 255, 0.1) 32%, rgba(255, 255, 255, 0.65) 42%, rgba(255, 255, 255, 0.18) 48%, transparent 58%)',
                  }}
                />

                {/* LAYER E: SECONDARY BOTTOM RIM CAUSTIC BOUNCE */}
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    bottom: '3%',
                    left: '22%',
                    width: '56%',
                    height: '24%',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse at 50% 90%, rgba(255, 255, 255, 0.8) 0%, rgba(186, 230, 253, 0.55) 40%, transparent 80%)',
                    filter: 'blur(1.2px)',
                  }}
                />

                {/* LAYER F: 3D PERIMETER GLASS RIM HIGHLIGHT */}
                <div
                  className="absolute inset-[2px] rounded-full pointer-events-none z-35"
                  style={{
                    border: '1.5px solid rgba(255, 255, 255, 0.75)',
                    boxShadow: 'inset 0 1.5px 4px rgba(255, 255, 255, 1), inset 0 -2.5px 6px rgba(2, 132, 199, 0.4)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP/TABLET RIGHT ORBITAL WING: 2 SCULPTED CRYSTAL PODS (hidden on mobile, visible md+) */}
        <div className="hidden md:flex flex-col items-center justify-between h-[360px] md:h-[390px] lg:h-[420px] py-2 shrink-0">
          {renderInviteGroupBtn()}
          {renderRedeemPerksBtn()}
        </div>

        {/* MOBILE BALANCED 2x2 QUADRANT GRID (< md viewports) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 w-full max-w-[270px] sm:max-w-xs mx-auto md:hidden justify-items-center pt-2">
          {renderDailyClaimBtn()}
          {renderInviteGroupBtn()}
          {renderTurboBoostBtn()}
          {renderRedeemPerksBtn()}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: DAILY CLAIM, TURBO BOOST, INVITE GROUP, REDEEM PERKS             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveModal(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="w-full max-w-md rounded-3xl p-6 bg-white/95 border-2 border-white shadow-2xl backdrop-blur-3xl flex flex-col gap-4 text-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-sm text-slate-900 tracking-wide uppercase">
                    {activeModal === 'invite' && `${t.inviteGroup} & BOOST`}
                    {activeModal === 'perks' && `${t.redeemPerks} & DEV PASS`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title={t.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              {activeModal === 'invite' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-slate-600">
                    {t.inviteTeamDesc}
                  </span>
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-900 truncate">
                      https://codgar.io/join?ref={userEmail.split('@')[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://codgar.io/join?ref=${userEmail.split('@')[0]}`
                        );
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="p-2 rounded-xl bg-white shadow-xs text-blue-600 shrink-0 ml-2 cursor-pointer hover:bg-blue-50"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'perks' && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs text-slate-600">
                    {t.exclusiveQuota}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs block text-slate-800">
                          Gemini 2.5 Pro High-Speed Execution Pass
                        </span>
                        <span className="text-[10px] text-slate-500">Active · 500 Req/min</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        {t.activeStatus}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs block text-slate-800">
                          Extended Context Window (1M Tokens)
                        </span>
                        <span className="text-[10px] text-slate-500">Verified Developer Tier</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                        {t.unlocked}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer mt-1"
              >
                {t.close}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
