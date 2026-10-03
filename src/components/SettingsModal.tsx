import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, SUPPORTED_LANGUAGES } from '../utils/translations';
import { Settings, X, Check } from 'lucide-react';
import { PermissionPolicy, ProjectInfo, AgentConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage?: (lang: Language) => void;
  // Optional backwards-compatible props
  projectInfo?: ProjectInfo | null;
  policy?: PermissionPolicy;
  onUpdatePolicy?: (policy: PermissionPolicy) => void;
  agentConfig?: AgentConfig;
  onUpdateAgentConfig?: (config: AgentConfig) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  policy,
  onUpdatePolicy,
  agentConfig,
  onUpdateAgentConfig,
}: Props) {
  const isFa = language === 'fa';

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleAutoSaveAndClose();
      }
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-save on close or any selection
  const handleAutoSaveAndClose = () => {
    if (policy && onUpdatePolicy) {
      onUpdatePolicy(policy);
    }
    if (agentConfig && onUpdateAgentConfig) {
      onUpdateAgentConfig(agentConfig);
    }
    onClose();
  };

  const handleSelect = (langCode: Language) => {
    if (onSelectLanguage) {
      onSelectLanguage(langCode);
    }
    if (policy && onUpdatePolicy) {
      onUpdatePolicy(policy);
    }
    if (agentConfig && onUpdateAgentConfig) {
      onUpdateAgentConfig(agentConfig);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) handleAutoSaveAndClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="w-full max-w-[340px] sm:max-w-[360px] rounded-[32px] border border-white/95 shadow-[0_20px_60px_rgba(37,99,235,0.22),0_4px_16px_rgba(15,23,42,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] bg-gradient-to-b from-white/98 via-sky-50/90 to-blue-50/80 backdrop-blur-3xl text-slate-800 overflow-hidden cursor-default select-none flex flex-col"
          onClick={(e) => e.stopPropagation()}
          dir="ltr"
        >
          {/* Circular 3D Tactile Top Bar */}
          <div className="px-5 py-4 border-b border-sky-100/80 flex items-center justify-between bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {/* Circular 3D Settings Badge */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 p-[2px] shadow-[0_3px_12px_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.6)] shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-600 shadow-inner">
                  <Settings className="w-5 h-5 text-blue-600 stroke-[2.2]" />
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-[14px] sm:text-base text-slate-900 leading-tight">
                  {isFa ? 'تنظیمات زبان' : 'Language Settings'}
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
                  {isFa ? 'زبان محیط کاربری و هوش مصنوعی' : 'Select app & AI language'}
                </p>
              </div>
            </div>

            {/* Circular 3D Close Button (Auto-saves on click) */}
            <button
              type="button"
              onClick={handleAutoSaveAndClose}
              className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-500 hover:text-blue-700 border border-sky-200/90 hover:border-sky-400 flex items-center justify-center transition-all duration-200 shadow-[0_2px_8px_rgba(37,99,235,0.08),inset_0_1px_0.5px_#fff] hover:shadow-[0_4px_12px_rgba(37,99,235,0.18)] active:scale-95 cursor-pointer"
              title={isFa ? 'بستن و ذخیره' : 'Close & Auto-Save'}
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Clean Circular Language Grid */}
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {SUPPORTED_LANGUAGES.map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => handleSelect(langItem.code)}
                    className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none transition-transform active:scale-95"
                    title={langItem.name}
                  >
                    {/* Completely Circular 3D Tactile Disc */}
                    <div
                      className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white shadow-[0_6px_18px_rgba(37,99,235,0.38),inset_0_1.5px_2px_rgba(255,255,255,0.6)] ring-2.5 ring-blue-500 ring-offset-2 ring-offset-white scale-105'
                          : 'bg-white hover:bg-sky-50/80 text-slate-700 border border-sky-200/80 hover:border-sky-400/90 shadow-[0_3px_10px_rgba(37,99,235,0.08),inset_0_1px_1px_#fff] hover:shadow-[0_6px_16px_rgba(37,99,235,0.14)] hover:scale-102'
                      }`}
                    >
                      {/* Flag Emoji inside Round Disc */}
                      <span className="text-xl sm:text-2xl leading-none select-none filter drop-shadow-xs">
                        {langItem.flag}
                      </span>

                      {/* Active Check Indicator Dot */}
                      {isSelected && (
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Language Native Label */}
                    <span
                      className={`text-[11px] font-bold text-center tracking-tight truncate max-w-full leading-tight transition-colors ${
                        isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {langItem.nativeName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
