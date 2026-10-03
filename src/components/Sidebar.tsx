import { useState, useEffect } from 'react';
import {
  Layers,
  Terminal,
  MonitorPlay,
  Fuel,
  CircleDollarSign,
  Sparkles,
  Bot,
} from 'lucide-react';
import { AgentMode } from '../types';
import { Language, translations } from '../utils/translations';

interface Props {
  currentMode?: AgentMode;
  onSelectMode?: (mode: AgentMode) => void;
  onNewTask?: () => void;
  onOpenQueue: () => void;
  onOpenChanges?: () => void;
  onOpenWorkspaces?: () => void;
  onOpenEditor?: () => void;
  onOpenTerminal: () => void;
  onOpenPreview?: () => void;
  onOpenBilling?: () => void;
  onOpenFuel?: () => void;
  onOpenSpace2?: () => void;
  onOpenSettings?: () => void;
  isQueueActive?: boolean;
  isChangesActive?: boolean;
  isWorkspacesActive?: boolean;
  isEditorActive?: boolean;
  isTerminalActive?: boolean;
  isBillingActive?: boolean;
  isFuelActive?: boolean;
  isSpace2Active?: boolean;
  isPreviewActive?: boolean;
  isExecuting?: boolean;
  language?: Language;
}

export function Sidebar({
  onOpenQueue,
  onOpenTerminal,
  onOpenPreview,
  onOpenBilling,
  onOpenFuel,
  onOpenSpace2,
  isQueueActive = false,
  isTerminalActive = false,
  isBillingActive = false,
  isFuelActive = false,
  isSpace2Active = false,
  isPreviewActive = false,
  isExecuting = false,
  language = 'en',
}: Props) {
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';
  const [queueCount, setQueueCount] = useState<number>(0);

  // Poll queue stats for dynamic badges with visibility throttling
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const taskRes = await fetch('/api/tasks');
        const taskData = await taskRes.json();

        if (isMounted) {
          if (taskData.success && Array.isArray(taskData.tasks)) {
            const pending = taskData.tasks.filter(
              (task: any) => task.status === 'running' || task.status === 'queued'
            ).length;
            setQueueCount(pending);
          }
        }
      } catch {
        // Silent fallback
      }
    };

    fetchStats();
    const timer = setInterval(fetchStats, 6000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const navSections = [
    {
      id: 'queue',
      title: t.queue,
      enTitle: 'Queue',
      desc: t.queueDesc,
      icon: <Layers className="w-4 h-4" />,
      action: onOpenQueue,
      badge: isExecuting || queueCount > 0 ? (isExecuting ? t.running : `${queueCount}`) : undefined,
      badgeStyle: isExecuting
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
        : 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
      activeBtnBg: 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 ring-2 ring-indigo-400/80 scale-105',
      activeInnerBg: 'bg-white/20 text-white border-white/40 shadow-inner',
      inactiveInnerBg: 'bg-indigo-50/90 text-indigo-600 border-indigo-200/90 shadow-2xs group-hover/btn:border-indigo-400 group-hover/btn:bg-indigo-100',
      active: isQueueActive,
      hasDot: isExecuting,
      dotColor: 'bg-amber-400',
    },
    {
      id: 'terminal',
      title: isFa ? 'ترمینال و تغییرات کد' : 'Terminal & Code Changes',
      enTitle: 'Terminal',
      desc: isFa ? 'مشاهده کدهای تولیدشده، تاریخچه تغییرات و اجرای دستورات' : 'View generated code changes, execution logs & terminal commands',
      icon: <Terminal className="w-4 h-4" />,
      action: onOpenTerminal,
      badge: isFa ? 'ترمینال فعال' : 'Terminal Active',
      badgeStyle: isTerminalActive
        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60 font-bold'
        : 'bg-slate-900 text-emerald-400 border-slate-700',
      activeBtnBg: 'bg-gradient-to-tr from-slate-950 via-slate-900 to-[#07172b] text-emerald-400 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400 scale-105 border border-emerald-500/40',
      activeInnerBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-inner',
      inactiveInnerBg: 'bg-[#080f1d] text-emerald-400 border-slate-700/80 shadow-2xs group-hover/btn:border-emerald-500/50 group-hover/btn:shadow-emerald-500/10',
      active: isTerminalActive,
      hasDot: isTerminalActive,
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'preview',
      title: isFa ? 'پیش‌نمایش زنده اپلیکیشن' : 'Live Application Preview',
      enTitle: 'Live',
      desc: isFa ? 'مشاهده زنده سایت و برنامه‌های ساخته شده' : 'Interactive live rendering of built apps & components',
      icon: <MonitorPlay className="w-4 h-4" />,
      action: onOpenPreview,
      badge: 'Live Sandbox',
      badgeStyle: isPreviewActive
        ? 'bg-teal-500/25 text-teal-300 border-teal-400/60 font-bold'
        : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
      activeBtnBg: 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/35 ring-2 ring-emerald-300 scale-105 font-bold',
      activeInnerBg: 'bg-white/30 text-slate-950 border-white/50 shadow-inner',
      inactiveInnerBg: 'bg-teal-50/90 text-teal-600 border-teal-200/90 shadow-2xs group-hover/btn:border-teal-400 group-hover/btn:bg-teal-100',
      active: isPreviewActive,
      hasDot: isPreviewActive,
      dotColor: 'bg-teal-400',
    },
    {
      id: 'fuel',
      title: t.fuelAndModels,
      enTitle: 'Fuel',
      desc: t.fuelAndModelsDesc,
      icon: <Fuel className="w-4 h-4" />,
      action: onOpenFuel,
      badge: '100% Ready',
      badgeStyle: isFuelActive
        ? 'bg-orange-500/25 text-orange-300 border-orange-400/60 font-bold'
        : 'bg-orange-950/80 text-orange-300 border-orange-700/50',
      activeBtnBg: 'bg-gradient-to-tr from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/35 ring-2 ring-rose-300 scale-105',
      activeInnerBg: 'bg-white/20 text-white border-white/40 shadow-inner',
      inactiveInnerBg: 'bg-orange-50/90 text-orange-600 border-orange-200/90 shadow-2xs group-hover/btn:border-orange-400 group-hover/btn:bg-orange-100',
      active: isFuelActive,
      hasDot: false,
      dotColor: 'bg-orange-400',
    },
    {
      id: 'space2',
      title: isFa ? 'یودا (صفحه اصلی)' : 'YODAW (Home)',
      enTitle: 'YODAW',
      desc: isFa ? 'میز پذیرش هوشمند و استودیو ۴ سرویسه (تولید عکس، فیلم، سایت، کد)' : 'Smart Concierge & 4-Service Studio (Image, Video, Web, Code)',
      icon: <Bot className="w-4 h-4" />,
      action: onOpenSpace2,
      badge: isFa ? 'یودا' : 'YODAW',
      badgeStyle: isSpace2Active
        ? 'bg-rose-500/25 text-rose-300 border-rose-400/60 font-bold'
        : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50',
      activeBtnBg: 'bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-500 text-white shadow-lg shadow-rose-500/35 ring-2 ring-rose-300 scale-105 font-bold',
      activeInnerBg: 'bg-white/20 text-white border-white/40 shadow-inner',
      inactiveInnerBg: 'bg-rose-50/90 text-rose-700 border-rose-200/90 shadow-2xs group-hover/btn:border-rose-400 group-hover/btn:bg-rose-100',
      active: isSpace2Active,
      hasDot: !isSpace2Active,
      dotColor: 'bg-rose-400',
    },
  ];

  return (
    <aside
      id="freebuff-sidebar"
      className={`h-auto my-1 md:my-auto ${
        isFa ? 'md:mr-4 md:ml-0' : 'md:ml-4 md:mr-0'
      } rounded-2xl md:rounded-[30px] ice-glass-dock flex flex-row md:flex-col items-center justify-around md:justify-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:shadow-[0_18px_50px_rgba(0,0,0,0.14)] z-40 select-none pointer-events-auto border border-white/95 backdrop-blur-2xl shrink-0 w-[96%] sm:w-auto md:w-16 py-1.5 px-2 md:py-3.5 md:px-2 mx-auto`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Navigation List */}
      <div className="w-full flex flex-row md:flex-col gap-2 sm:gap-3 md:gap-2 relative items-center justify-around md:justify-center">
        {navSections.map((item) => {
          return (
            <div key={item.id} className="relative group/nav flex items-center justify-center">
              <button
                type="button"
                onClick={item.action}
                className={`relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 group/btn ${
                  item.active
                    ? item.activeBtnBg
                    : 'ice-glass-btn text-slate-700 hover:bg-white hover:shadow-md'
                }`}
              >
                {/* Micro Icon Squircle Container */}
                <div
                  className={`w-6.5 h-6.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 border ${
                    item.active
                      ? item.activeInnerBg
                      : `${item.inactiveInnerBg} group-hover/btn:scale-108`
                  }`}
                >
                  {item.icon}
                </div>

                {/* Status Dot */}
                {item.hasDot && (
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${item.dotColor} shadow-xs animate-pulse`}
                  />
                )}
              </button>

              {/* High-Tech Crystal Floating Tooltip Card */}
              <div
                className={`absolute hidden sm:block ${
                  isFa
                    ? 'md:right-full md:mr-3.5 md:left-auto md:origin-right'
                    : 'md:left-full md:ml-3.5 md:right-auto md:origin-left'
                } bottom-full mb-2.5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-1/2 -translate-x-1/2 md:translate-x-0 pointer-events-none opacity-0 group-hover/nav:opacity-100 transition-all duration-200 z-[100]`}
                dir={isFa ? 'rtl' : 'ltr'}
              >
                <div className="rounded-2xl p-3 bg-slate-950/95 text-white shadow-2xl border border-white/20 backdrop-blur-2xl min-w-[170px] max-w-[230px] ring-1 ring-black/50">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
                    <span className="font-bold text-white text-xs tracking-tight">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold opacity-80">
                      {item.enTitle}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    {item.desc}
                  </p>
                  {item.badge && (
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{isFa ? 'وضعیت:' : 'Status:'}</span>
                      <span className={`px-1.5 py-0.5 rounded-md border font-mono font-bold text-[9px] ${item.badgeStyle}`}>
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
