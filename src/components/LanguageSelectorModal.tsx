import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Globe, X } from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES, translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export function LanguageSelectorModal({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}: Props) {
  const t = translations[currentLanguage] || translations.en;
  const isFa = currentLanguage === 'fa';

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-Screen Backdrop Layer: Blurs everything behind the modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-slate-950/25 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />

          {/* Floating Top Card Overlay - Matching Profile and Siri Record design */}
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
              scale: 0.95,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              y: -12,
              scale: 0.96,
              filter: 'blur(6px)',
            }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 26,
            }}
            id="language-selector-dropdown-menu"
            className={`fixed top-14 sm:top-16 ${
              isFa ? 'left-3 sm:left-20' : 'right-3 sm:right-20'
            } z-[9999] w-[86%] max-w-[275px] sm:w-[290px] pointer-events-auto select-none`}
            dir={isFa ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl sm:rounded-[22px] bg-white/95 border border-sky-200/80 backdrop-blur-2xl shadow-[0_16px_40px_rgba(15,23,42,0.18)] p-2.5 sm:p-3 overflow-hidden flex flex-col gap-2">
              {/* Header: Title, Locales Count & Close Button */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11.5px] sm:text-xs font-bold text-slate-900 leading-tight">
                      {t.selectLanguage}
                    </h3>
                    <p className="text-[9px] text-slate-500">
                      {SUPPORTED_LANGUAGES.length} {t.localesCount}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  title={t.close}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Language Options List */}
              <div className="flex flex-col gap-1 max-h-56 sm:max-h-64 overflow-y-auto pr-0.5 custom-scrollbar">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isActive = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        onClose();
                      }}
                      className={`w-full px-2 py-1.5 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-xs scale-[1.01]'
                          : 'bg-slate-50/80 hover:bg-blue-50/60 text-slate-700 hover:text-slate-900 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-sm shadow-2xs ${
                            isActive ? 'bg-white/20' : 'bg-white border border-slate-200/70'
                          }`}
                        >
                          <span>{lang.flag}</span>
                        </div>

                        <div className={isFa ? 'text-right' : 'text-left'}>
                          <div className="flex items-center gap-1">
                            <span className={`text-[11px] sm:text-[11.5px] font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                              {lang.nativeName}
                            </span>
                          </div>
                          <div className={`text-[9px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {lang.name}
                          </div>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-white/25 text-white">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>{lang.code.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded-md bg-white border border-slate-200/60">
                          {lang.code.toUpperCase()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
