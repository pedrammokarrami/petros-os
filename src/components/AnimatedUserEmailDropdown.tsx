import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  User,
  KeyRound,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface Props {
  userEmail?: string;
  userName?: string;
  language?: Language;
  onOpenCodeDrawer?: () => void;
  onOpenTerminal?: () => void;
  onOpenExplorer?: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
  onReturnHome?: () => void;
}

export function AnimatedUserEmailDropdown({
  language = 'en',
}: Props) {
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeKeyMask, setActiveKeyMask] = useState('');

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      fetchKeyStatus();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const fetchKeyStatus = () => {
    fetch('/api/keys/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.keyMask) {
          setActiveKeyMask(data.keyMask);
        }
      })
      .catch(() => {});
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSubmitting(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/keys/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        setActiveKeyMask(data.keyMask || 'AIzaSy...');
        setApiKey('');
        setStatusMsg(isFa ? 'کلید API با موفقیت متصل شد' : 'API Key connected successfully');
        setTimeout(() => {
          setIsSaved(false);
          setStatusMsg('');
        }, 3000);
      } else {
        setStatusMsg(data.error || (isFa ? 'خطا در اتصال کلید' : 'Failed to connect key'));
      }
    } catch {
      setStatusMsg(isFa ? 'خطای شبکه' : 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Top Left Profile Trigger Button: Labeled Profile with user icon */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-9 px-3 rounded-full border transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 shrink-0 ${
          isOpen
            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
            : 'ice-glass-btn text-slate-800 hover:text-blue-600'
        }`}
        title={t.profile}
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center text-[10px] font-bold shadow-inner ring-1 ring-white/70">
          <User className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-bold font-sans tracking-wide">
          {t.profile}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Floating Liquid Glass Overlay */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop Layer with full blur */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9998] bg-slate-950/25 backdrop-blur-md pointer-events-auto"
                  onClick={() => setIsOpen(false)}
                />

                {/* Floating Top-Left Overlay Dock */}
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
                  className={`fixed top-16 sm:top-18 ${
                    isFa ? 'right-3 sm:right-6' : 'left-3 sm:left-6'
                  } z-[9999] w-[90%] sm:w-88 max-w-sm pointer-events-auto select-none`}
                  dir={isFa ? 'rtl' : 'ltr'}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative rounded-3xl bg-white/95 border border-white/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-4 sm:p-5 overflow-hidden flex flex-col gap-3.5">
                    {/* Header: Profile & Close */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-tight">
                            {t.profile}
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            {t.signInApiKey}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                        title={t.close}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Active Status Badge */}
                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        {t.activeKey}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                        {activeKeyMask || t.configuredInEnv}
                      </span>
                    </div>

                    {/* ONLY OPTION: Sign in with API Key */}
                    <form onSubmit={handleSaveApiKey} className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-800">
                        {t.signInApiKey}
                      </label>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {t.enterApiKeyDesc}
                      </p>

                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                          <KeyRound className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-mono transition shadow-inner"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {statusMsg && (
                        <div
                          className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{statusMsg}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!apiKey.trim() || isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <KeyRound className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isSubmitting
                            ? t.connecting
                            : t.signInWithKey}
                        </span>
                      </button>
                    </form>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
