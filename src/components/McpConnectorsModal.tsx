import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Mail,
  Github,
  Database,
  Terminal,
  Cpu,
  Check,
  X,
  Zap,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Lock,
  Unlock,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

interface McpConnector {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'disconnected' | 'authenticating';
  protocol: 'mcp' | 'oauth' | 'websocket' | 'stdio';
  endpoint: string;
  icon: string;
  toolsCount: number;
}

export function McpConnectorsModal({ isOpen, onClose, language = 'fa' }: Props) {
  const isFa = language === 'fa';
  const [connectors, setConnectors] = useState<McpConnector[]>([
    {
      id: 'gmail',
      name: 'Gmail & Google Workspace',
      category: 'Communication & Cloud',
      description: isFa ? 'اتصال مستقیم ام‌سی‌پی به صندوق جیمیل برای خواندن، تحلیل و پاسخ خودکار به ایمیل‌ها' : 'Direct MCP connection to Gmail inbox for reading, analyzing, and automated replies',
      status: 'connected',
      protocol: 'mcp',
      endpoint: 'https://mcp.google.com/v1/gmail/arminsh00@gmail.com',
      icon: 'mail',
      toolsCount: 5,
    },
    {
      id: 'github',
      name: 'GitHub Enterprise MCP',
      category: 'Source Code & CI/CD',
      description: isFa ? 'همگام‌سازی ریپازیتوری‌ها، کامیت‌ها، پول‌ریکوئست‌ها و وضعیت بیلد' : 'Sync repositories, commits, pull requests, and CI/CD status',
      status: 'connected',
      protocol: 'mcp',
      endpoint: 'https://mcp.github.com/v2/arminsh00/codgar',
      icon: 'github',
      toolsCount: 8,
    },
    {
      id: 'database',
      name: 'PostgreSQL / Supabase DB',
      category: 'Relational Data Storage',
      description: isFa ? 'اجرای کوئری‌های SQL، بازرسی اسکیما و مدیریت پایگاه داده' : 'Execute SQL queries, schema inspection, and database management',
      status: 'connected',
      protocol: 'mcp',
      endpoint: 'postgresql://db.supabase.co:5432/codgar_prod',
      icon: 'database',
      toolsCount: 6,
    },
    {
      id: 'unreal',
      name: 'Unreal Engine 5.5 Remote',
      category: '3D Game Engine & XR',
      description: isFa ? 'کنترل ریموت ادیتور UE5، کامپایل بلپریینت و اسپاون آکتورها' : 'UE5 Remote Control editor, Blueprint compilation, and actor spawning',
      status: 'connected',
      protocol: 'websocket',
      endpoint: 'ws://localhost:30010/remote/control',
      icon: 'cpu',
      toolsCount: 12,
    },
    {
      id: 'pc',
      name: 'Local OS Terminal Bridge',
      category: 'System Daemon',
      description: isFa ? 'دسترسی امن به ترمینال محلی ویندوز و مک برای اجرای CLI و مدیریت فایل' : 'Secure local Windows & macOS terminal bridge for CLI and file ops',
      status: 'connected',
      protocol: 'stdio',
      endpoint: 'stdio://localhost:4000/daemon',
      icon: 'terminal',
      toolsCount: 10,
    },
  ]);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleConnect = async (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const newStatus = c.status === 'connected' ? 'disconnected' : 'connected';
            return { ...c, status: newStatus };
          }
          return c;
        })
      );
      setLoadingId(null);
    }, 600);
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-3xl rounded-[32px] ice-glass-card border border-white/90 shadow-[0_25px_60px_rgba(37,99,235,0.25)] overflow-hidden text-slate-800 p-5 sm:p-7 max-h-[90vh] flex flex-col"
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-blue-200/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 p-[1.5px] shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
                  <Server className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{isFa ? 'مدیریت کانکتورها و پروتکل MCP (Claude & Codex Style)' : 'MCP Connectors Hub (Claude & Codex Style)'}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    Active Bridge
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFa
                    ? 'اتصال مستقیم به سرویس‌های ابری و محلی از طریق استاندارد Model Context Protocol'
                    : 'Direct bi-directional connections via Model Context Protocol'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connectors List */}
          <div className="mt-4 space-y-3 overflow-y-auto pr-1 flex-1">
            {connectors.map((conn) => {
              const isConnected = conn.status === 'connected';
              const isLoading = loadingId === conn.id;

              return (
                <div
                  key={conn.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isConnected
                      ? 'bg-white/95 border-blue-200/80 shadow-[0_4px_20px_rgba(37,99,235,0.06)]'
                      : 'bg-slate-50/70 border-slate-200/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                        conn.id === 'gmail'
                          ? 'bg-rose-500 text-white'
                          : conn.id === 'github'
                          ? 'bg-slate-900 text-white'
                          : conn.id === 'database'
                          ? 'bg-indigo-600 text-white'
                          : conn.id === 'unreal'
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {conn.id === 'gmail' && <Mail className="w-5 h-5" />}
                      {conn.id === 'github' && <Github className="w-5 h-5" />}
                      {conn.id === 'database' && <Database className="w-5 h-5" />}
                      {conn.id === 'unreal' && <Cpu className="w-5 h-5" />}
                      {conn.id === 'pc' && <Terminal className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{conn.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {conn.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200 uppercase">
                          {conn.protocol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{conn.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10.5px] font-mono text-slate-400">
                        <span>Endpoint: {conn.endpoint}</span>
                        <span>&bull;</span>
                        <span className="text-blue-600 font-bold">{conn.toolsCount} Tools Ready</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`} />
                      <span className={`text-xs font-bold ${isConnected ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {isConnected ? (isFa ? 'متصل (Connected)' : 'Connected') : (isFa ? 'قطع (Disconnected)' : 'Disconnected')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleConnect(conn.id)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm ${
                        isConnected
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                      }`}
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : isConnected ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>{isFa ? 'قطع اتصال' : 'Disconnect'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isFa ? 'اتصال مجدد' : 'Connect'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-blue-200/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isFa ? 'پروتکل امن استاندارد Model Context Protocol نسخه ۱.۰' : 'Model Context Protocol v1.0 Secure Standard'}</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-600/30 active:scale-95"
            >
              {isFa ? 'تایید و بستن' : 'Done & Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
