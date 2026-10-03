import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Send, Sparkles, Check } from 'lucide-react';
import { SiriVisualMotionEngine } from './SiriVisualMotionEngine';
import { Language, translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  isListening: boolean;
  audioLevel: number;
  onConfirmSend: (text: string) => void;
  language?: Language;
}

export function SiriMiniBottomDock({
  isOpen,
  onClose,
  transcript,
  isListening,
  audioLevel,
  onConfirmSend,
  language = 'en',
}: Props) {
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.88,
            filter: 'blur(10px)',
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            y: 35,
            scale: 0.9,
            filter: 'blur(8px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 26,
            mass: 0.8,
          }}
          style={{
            willChange: 'transform, opacity, filter',
            backfaceVisibility: 'hidden',
          }}
          className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[340px] sm:max-w-xl pointer-events-auto select-none transform-gpu"
        >
          {/* Liquid Glass Pill Container */}
          <div className="relative rounded-[20px] sm:rounded-[28px] bg-[#0c101a]/90 border border-amber-400/35 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.92),0_0_30px_rgba(0,240,255,0.25)] p-2 sm:p-4 overflow-hidden">
            {/* Glowing Top Specular Rim */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-pink-500 pointer-events-none animate-pulse" />

            {/* Ambient Subtle Background Bloom */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-amber-500/10 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3">
              {/* Mini Siri Chromatic Visual Waveform Engine (Compact Dribbble 3975272 Motion) */}
              <div className="w-12 h-10 sm:w-20 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0 relative shadow-inner">
                <SiriVisualMotionEngine
                  visualMode="ribbons"
                  colorTheme="classic"
                  agentState={isListening ? 'listening' : 'thinking'}
                  audioLevel={audioLevel}
                  sensitivity={1.4}
                  interactive={false}
                  className="w-full h-full scale-125"
                />
              </div>

              {/* Transcript & Status Feed */}
              <div className="flex-1 min-w-0" dir={isFa ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-mono text-cyan-300 font-semibold mb-0.5">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500 animate-ping" />
                  <span>
                    {isListening
                      ? t.listening
                      : t.processingSpeech}
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm font-sans text-white/90 truncate font-medium">
                  {transcript ? `“${transcript}”` : t.speakNow}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {transcript && (
                  <button
                    type="button"
                    onClick={() => onConfirmSend(transcript)}
                    className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.5)] transition cursor-pointer active:scale-95"
                    title={t.sendAndType}
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition cursor-pointer"
                  title={t.close}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
