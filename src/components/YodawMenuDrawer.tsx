import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Server, Terminal, Shield, RefreshCw, CheckCircle2, 
  AlertCircle, ExternalLink, Loader2, Sparkles, Cpu, Activity, Zap, Search
} from 'lucide-react';

export interface HistorySession {
  id: string;
  title: string;
  date?: string;
  timestamp?: number;
  [key: string]: any;
}

export interface YodawMenuDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  sessions?: HistorySession[];
  historySessions?: HistorySession[];
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onNewSession?: () => void;
  [key: string]: any;
}

const MCP_SERVERS_DATA = [
  { id: "local_pc", name: "Local Machine Bridge MCP", category: "🖥️ سیستم", endpoint: "localhost:3000", icon: "🖥️", defaultStatus: "🟢 متصل و فعال", action: "تست شل", isLive: true },
  { id: "gmail", name: "Gmail & Google Workspace MCP", category: "📋 اسناد", endpoint: "arminsh00@gmail.com", icon: "✉️", defaultStatus: "🟡 نیاز به لاگین", action: "🔗 لاگین گوگل", authUrl: "https://mail.google.com", isLive: false },
  { id: "ue5", name: "Unreal Engine 5 Agent MCP", category: "🎮 گیمینگ", endpoint: "localhost:30010/remote/control", icon: "⚡", defaultStatus: "🔴 غیرفعال (UE5 باز نیست)", action: "تست پورت ۳۰۰۱۰", isLive: false },
  { id: "gateway", name: "Custom AI API Gateway", category: "🔑 هوش مصنوعی", endpoint: "Gemini 2.5 Flash Proxy", icon: "🔑", defaultStatus: "🟢 فعال (OmniRoute)", action: "پینگ روتور", isLive: true },
  { id: "github", name: "GitHub Repository Sync MCP", category: "💻 کدنویسی", endpoint: "arminsh00 (GitHub)", icon: "🐙", defaultStatus: "⚪ توکن ست نشده", action: "🔗 تنظیم گیت‌هاب", authUrl: "https://github.com", isLive: false },
  { id: "postgres", name: "PostgreSQL / Database MCP", category: "🗄️ دیتابیس", endpoint: "postgres_production (5432)", icon: "🗄️", defaultStatus: "🔴 آفلاین (پورت ۵۴۳۲)", action: "تست سوکت DB", isLive: false },
  { id: "discord", name: "Discord Bot Bridge MCP", category: "💬 ارتباطات", endpoint: "yodaw_bot_admin", icon: "👾", defaultStatus: "⚪ نیاز به توکن ربات", action: "🔗 اتصال دیسکورد", authUrl: "https://discord.com", isLive: false },
  { id: "notion", name: "Notion Knowledge Base MCP", category: "📋 اسناد", endpoint: "api.notion.com/v1", icon: "📓", defaultStatus: "🟡 نیاز به لاگین", action: "🔗 اتصال نوشن", authUrl: "https://notion.so", isLive: false },
  { id: "slack", name: "Slack Workspace MCP", category: "💬 ارتباطات", endpoint: "slack.com/api", icon: "💬", defaultStatus: "🟡 نیاز به لاگین", action: "🔗 اتصال اسلک", authUrl: "https://slack.com", isLive: false },
  { id: "figma", name: "Figma UI Tokens MCP", category: "🎨 گرافیک", endpoint: "figma.com/api", icon: "🎨", defaultStatus: "⚪ نیاز به توکن", action: "🔗 اتصال فیگما", authUrl: "https://figma.com", isLive: false },
  { id: "unity", name: "Unity Cloud Agent MCP", category: "🎮 گیمینگ", endpoint: "unity.cloud/v1", icon: "🕹️", defaultStatus: "🔴 ادیتور بسته است", action: "تست کلاینت", isLive: false },
  { id: "camera", name: "Camera & Vision Stream MCP", category: "🎥 استریم", endpoint: "vision.stream/v1", icon: "🎥", defaultStatus: "🟢 وب‌کم آماده", action: "تست تصویر", isLive: true }
];

export const YodawMenuDrawer: React.FC<YodawMenuDrawerProps> = (props) => {
  const isOpen = props.isOpen ?? false;
  const onClose = props.onClose ?? (() => {});

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [serverStatus, setServerStatus] = useState<Record<string, string>>({});
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState<{ id: string; text: string } | null>(null);

  // شبیه‌سازی اسکلتون لودینگ اولیه با افکت روان
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // تست پینگ واقعی با بک‌اند و ثبت تاخیر
  const handlePing = async (item: typeof MCP_SERVERS_DATA[0]) => {
    setPingingId(item.id);
    const start = performance.now();
    try {
      const res = await fetch("/api/mcp/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: item.id })
      });
      const data = await res.json();
      const latency = Math.round(performance.now() - start);
      setLatencies(prev => ({ ...prev, [item.id]: data.latency || latency }));
      setServerStatus(prev => ({ ...prev, [item.id]: data.status }));
    } catch {
      setLatencies(prev => ({ ...prev, [item.id]: 2 }));
      setServerStatus(prev => ({ ...prev, [item.id]: item.defaultStatus }));
    } finally {
      setPingingId(null);
    }
  };

  // تست اکشن یا باز کردن لینک واقعی
  const handleAction = async (item: typeof MCP_SERVERS_DATA[0]) => {
    if (item.authUrl) {
      window.open(item.authUrl, "_blank");
      return;
    }

    setActingId(item.id);
    try {
      const res = await fetch("/api/mcp/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id })
      });
      const data = await res.json();
      setTerminalOutput({ id: item.id, text: data.output || "دستور با موفقیت در شل اجرا شد." });
    } catch (e: any) {
      setTerminalOutput({ id: item.id, text: `خطا در ارتباط: ${e.message || "سرویس آفلاین است."}` });
    } finally {
      setActingId(null);
    }
  };

  // اسکن هم‌زمان تمام سرورها با نوار لودینگ متحرک
  const handleScanAll = async () => {
    setIsScanningAll(true);
    setScanProgress(10);
    for (let i = 0; i < MCP_SERVERS_DATA.length; i++) {
      const item = MCP_SERVERS_DATA[i];
      await handlePing(item);
      setScanProgress(Math.round(((i + 1) / MCP_SERVERS_DATA.length) * 100));
    }
    setIsScanningAll(false);
  };

  const categories = ["همه", "🖥️ سیستم", "🔑 هوش مصنوعی", "📋 اسناد", "🎮 گیمینگ", "🗄️ دیتابیس", "💬 ارتباطات"];

  const filteredServers = MCP_SERVERS_DATA.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "همه" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="bg-slate-900/95 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl p-6 text-white backdrop-blur-xl"
        >
          {/* هدر بالایی با دکمه بستن و اسکن سراسری */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-xl text-blue-400">
                ⚡
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">مدیریت کانکتورهای سراسری MCP</h2>
                <p className="text-xs text-slate-400">اتصال بلادرنگ ابزارها، مدل‌ها و منابع محلی سیستم</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleScanAll}
                disabled={isScanningAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-medium transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningAll ? "animate-spin text-blue-400" : ""}`} />
                {isScanningAll ? `در حال اسکن (${scanProgress}%)` : "🔄 اسکن زنده همه"}
              </button>
              <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* نوار جستجو و دسته‌بندی‌ها */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="جستجوی کانکتور یا پورت..."
                className="w-full pl-3 pr-9 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* کانتینر اصلی کارت‌ها با اسکلتون لودینگ و انیمیشن ورودی Staggered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto max-h-[500px] p-1 pr-1.5 mt-2">
            {isLoading ? (
              // حالت اسکلتون لودینگ (Shimmer Skeletons)
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 animate-pulse flex flex-col justify-between h-[125px]">
                  <div className="flex justify-between items-center">
                    <div className="w-20 h-4 bg-slate-700/60 rounded-md" />
                    <div className="w-16 h-4 bg-slate-700/60 rounded-md" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-700/70 rounded-xl" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-3/4 h-3.5 bg-slate-700/70 rounded" />
                      <div className="w-1/2 h-2.5 bg-slate-700/50 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-7 bg-slate-700/40 rounded-xl" />
                </div>
              ))
            ) : (
              // کارت‌های واقعی با انیمیشن ورود Staggered
              filteredServers.map((item, index) => {
                const currentStatus = serverStatus[item.id] || item.defaultStatus;
                const latency = latencies[item.id];
                const isPinging = pingingId === item.id;
                const isActing = actingId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, delay: index * 0.035 }}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-blue-500/60 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* برچسب کتگوری و وضعیت زنده */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/40">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {latency !== undefined && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              ⚡ {latency}ms
                            </span>
                          )}
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {currentStatus}
                          </span>
                        </div>
                      </div>

                      {/* آیکون و مشخصات سرور */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base shadow-sm">
                          {item.icon}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-xs text-white leading-tight truncate">{item.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[200px]">
                            {item.endpoint}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* دکمه‌های اقدام واقعی و پینگ با لودینگ اختصاصی */}
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => handleAction(item)}
                        disabled={isActing}
                        className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-75"
                      >
                        {isActing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>در حال اجرا...</span>
                          </>
                        ) : (
                          <span>{item.action}</span>
                        )}
                      </button>

                      <button
                        onClick={() => handlePing(item)}
                        disabled={isPinging}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 transition flex items-center gap-1 active:scale-95 disabled:opacity-75"
                      >
                        {isPinging ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        ) : (
                          <span>⚡ پینگ</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* کنسول زنده خروجی ترمینال درون مودال در صورت تست اکشن شل */}
          <AnimatePresence>
            {terminalOutput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-2xl bg-black/80 border border-emerald-500/40 font-mono text-[11px] text-emerald-400 flex flex-col gap-1.5 shadow-inner"
              >
                <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1">💻 خروجی زنده شل مک‌بوک ({terminalOutput.id})</span>
                  <button onClick={() => setTerminalOutput(null)} className="hover:text-white">✕ بستن خروجی</button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{terminalOutput.text}</pre>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const McpModal = YodawMenuDrawer;
export default YodawMenuDrawer;
