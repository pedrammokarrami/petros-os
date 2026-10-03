import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Monitor,
  Check,
  Copy,
  X,
  Zap,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Play,
  HardDrive,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Code,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export function LocalBridgeModal({ isOpen, onClose, language = 'fa' }: Props) {
  const isFa = language === 'fa';
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [bridgeData, setBridgeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Command Execution Test State
  const [testCmd, setTestCmd] = useState<string>('node -v && git --version');
  const [cmdOutput, setCmdOutput] = useState<any>(null);
  const [executing, setExecuting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchBridgeStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchBridgeStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/local-bridge/status');
      const data = await res.json();
      if (data.success) {
        setIsConnected(data.connected);
        setBridgeData(data.bridge);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/local-bridge/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceMode: !isConnected }),
      });
      const data = await res.json();
      if (data.success) {
        setIsConnected(data.connected);
        setBridgeData(data.bridge);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRunTestCmd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCmd.trim() || executing) return;

    setExecuting(true);
    setCmdOutput(null);
    try {
      const res = await fetch('/api/local-bridge/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: testCmd }),
      });
      const data = await res.json();
      setCmdOutput(data);
    } catch (err: any) {
      setCmdOutput({ success: false, stderr: err.message });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  const npmCmd = 'npm install -g codgar-cli && codgar connect --port 4000';
  const winCmd = 'iwr -useb https://codgar.ai/install.ps1 | iex';
  const macCmd = 'curl -sSL https://codgar.ai/install.sh | bash';

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl rounded-[28px] ice-glass-card border border-white/90 shadow-[0_25px_60px_rgba(37,99,235,0.22)] overflow-hidden text-slate-800 p-5 sm:p-6 dir-auto"
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-blue-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 p-[1px] shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center text-emerald-400">
                  <Terminal className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{isFa ? 'اتصال مستقیم به ترمینال ویندوز و مک (Codgar OS Bridge)' : 'Direct OS Terminal Bridge'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    v1.4 CLI
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFa
                    ? 'امکان دسترسی مستقیم کدگر به ترمینال کامپیوتر شخصی شما برای ساخت، ویرایش و اجرای دستورات'
                    : 'Grant Codgar direct access to your local Windows or macOS terminal'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status & Connection Switcher */}
          <div className="mt-4 p-4 rounded-2xl bg-white/80 border border-white/95 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {isConnected
                      ? isFa ? 'کدگر به ترمینال سیستم محلی متصل است' : 'Connected to Local OS Terminal'
                      : isFa ? 'حالت کامپایلر ابری (Cloud Sandbox)' : 'Cloud Sandbox Mode'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {bridgeData?.os || 'Windows/macOS'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Port: 4000 &bull; Mode: {isConnected ? 'Direct System FS Access' : 'Isolated Container'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleConnect}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm ${
                isConnected
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : isConnected ? (
                <span>{isFa ? 'تغییر به ابری' : 'Switch to Cloud'}</span>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{isFa ? 'فعال‌سازی اتصال محلی' : 'Enable Local Access'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Command Installation */}
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>{isFa ? 'دستورات نصب CLI روی کامپیوتر شما (ویندوز و مک):' : 'CLI Installation Commands for Local OS:'}</span>
            </h4>

            {/* NPM */}
            <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700/80 font-mono text-xs flex items-center justify-between gap-2 shadow-inner dir-ltr">
              <div className="flex items-center gap-2 overflow-x-auto text-sky-300">
                <span className="text-emerald-400 font-bold">$</span>
                <span className="whitespace-nowrap">{npmCmd}</span>
              </div>
              <button
                onClick={() => handleCopy('npm', npmCmd)}
                className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/50 text-sky-200 text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
              >
                {copiedKey === 'npm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-sky-300" />}
                <span>{copiedKey === 'npm' ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی' : 'Copy')}</span>
              </button>
            </div>

            {/* Windows PowerShell */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/80 font-mono text-[11px] flex items-center justify-between gap-1 dir-ltr">
                <div className="truncate text-amber-300">
                  <span className="text-blue-400 font-bold">PS&gt; </span>
                  <span>{winCmd}</span>
                </div>
                <button
                  onClick={() => handleCopy('win', winCmd)}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
                  title="Windows PowerShell Quick Install"
                >
                  {copiedKey === 'win' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* macOS Terminal */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700/80 font-mono text-[11px] flex items-center justify-between gap-1 dir-ltr">
                <div className="truncate text-cyan-300">
                  <span className="text-emerald-400 font-bold">macOS: </span>
                  <span>{macCmd}</span>
                </div>
                <button
                  onClick={() => handleCopy('mac', macCmd)}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
                  title="macOS Terminal Quick Install"
                >
                  {copiedKey === 'mac' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Test Command Execution */}
          <div className="mt-4 pt-3 border-t border-blue-200/60">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>{isFa ? 'تست زنده اجرای دستور ترمینال:' : 'Test Live Terminal Command Execution:'}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{isFa ? 'تست دسترسی مستقیم' : 'Direct CLI Execution Test'}</span>
            </h4>

            <form onSubmit={handleRunTestCmd} className="flex gap-2">
              <input
                type="text"
                value={testCmd}
                onChange={(e) => setTestCmd(e.target.value)}
                placeholder="e.g. dir, ls -la, node -v, git status"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs dir-ltr"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={executing}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 shrink-0"
              >
                {executing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isFa ? 'اجرا' : 'Run'}</span>
                  </>
                )}
              </button>
            </form>

            {cmdOutput && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto border border-slate-800 dir-ltr text-left">
                <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
                  <span>Executed on: {cmdOutput.executedOn}</span>
                  <span>Exit: {cmdOutput.exitCode}</span>
                </div>
                <pre className="whitespace-pre-wrap break-all text-slate-100">
                  {cmdOutput.stdout || cmdOutput.stderr || 'No output returned.'}
                </pre>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-blue-200/50 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isFa ? 'دارای لایه محافظتی و تأیید اجرا روی ویندوز و مک' : 'Secured sandbox permissions on Windows & macOS'}</span>
            </span>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
