import React, { useState } from 'react';

export interface ProjectTask {
  id: string;
  day: number;
  title: string;
  category: 'video' | 'image' | 'social' | 'telegram' | 'gmail' | 'seo' | 'github';
  status: 'completed' | 'in_progress' | 'pending';
  description: string;
  connector: string;
}

export interface ProjectPhase {
  id: number;
  title: string;
  days: string;
  targetUsers: string;
  tasks: ProjectTask[];
}

export const defaultPhases: ProjectPhase[] = [
  {
    id: 1,
    title: "فاز ۱: هویت بصری، ویدیو و راه‌اندازی کانال‌ها",
    days: "روز ۱ تا ۵",
    targetUsers: "۵,۰۰۰ کاربر",
    tasks: [
      { id: "t1", day: 1, title: "رندر نشان تجاری و کاورهای گرافیکی 4K با موتور FLUX", category: "image", status: "completed", description: "تولید متریال شیشه‌ای، لوگوی سه‌بعدی و بنرهای توییتر با پرامپت اختصاصی", connector: "FLUX Cinema Engine" },
      { id: "t2", day: 2, title: "تولید تیزر ویدیویی سینمایی ۶۰ ثانیه‌ای", category: "video", status: "completed", description: "رندر صحنه هوایی و شات‌های سینمایی با هوش مصنوعی و حرکت دوربین داینامیک", connector: "FLUX Video Motion" },
      { id: "t3", day: 3, title: "افتتاح کانال رسمی تلگرام و اتصال ربات برادکست", category: "telegram", status: "in_progress", description: "ایجاد کانال اطلاع‌رسانی، انتشار پست پین‌شده و ارسال اولین دموی ویدیویی", connector: "Telegram Bot API" },
      { id: "t4", day: 4, title: "پیکربندی هویت اینستاگرام و ریلزهای مقایسه‌ای", category: "social", status: "in_progress", description: "تولید ۹ پست شبکه‌ای و ریلزهای وایرال از سرعت اجرای کدها روی اپل سیلیکون", connector: "Media Synthesizer" },
      { id: "t5", day: 5, title: "اتوماسیون جیمیل و سیستم ایمیل مارکتینگ بتا", category: "gmail", status: "pending", description: "اتصال به Workspace MCP برای ارسال دعوت‌نامه بتای توسعه‌دهندگان", connector: "Gmail Workspace MCP" },
    ]
  },
  {
    id: 2,
    title: "فاز ۲: پکیج نصبی، گیت‌هاب و سئوی برنامه‌نویسی‌شده",
    days: "روز ۶ تا ۱۲",
    targetUsers: "۱۵,۰۰۰ کاربر",
    tasks: [
      { id: "t6", day: 6, title: "ساخت فرمول Homebrew Cask برای ترمینال مک", category: "github", status: "pending", description: "ایجاد پکیج یک‌خطی brew install yadow جهت به صفر رساندن اصطکاک نصب", connector: "Terminal Host MCP" },
      { id: "t7", day: 8, title: "انتشار اولین ریلیز رسمی گیت‌هاب v1.0.0 Universal DMG", category: "github", status: "pending", description: "خروجی فایل نصبی مک با پشتیبانی کامل از اینتل و اپل سیلیکون", connector: "GitHub Actions MCP" },
      { id: "t8", day: 10, title: "انتشار ۳۰ مقاله سئو تخصصی در Dev.to و Medium", category: "seo", status: "pending", description: "پوشش کلمات کلیدی طلایی نظیر Cursor alternative و Local Coding Agent", connector: "Programmatic SEO MCP" },
      { id: "t9", day: 12, title: "ارسال پول‌ریکوئست به ۵۰ ریپازیتوری برتر Awesome-AI", category: "github", status: "pending", description: "ثبت رسمی Yadow در لیست ابزارهای پیشرو هوش مصنوعی متن‌باز", connector: "GitHub API MCP" },
    ]
  },
  {
    id: 3,
    title: "فاز ۳: طوفان لانچ در Product Hunt و ردیت",
    days: "روز ۱۳ تا ۲۱",
    targetUsers: "۳۵,۰۰۰ کاربر",
    tasks: [
      { id: "t10", day: 14, title: "کمپین اصلی لانچ در Product Hunt (کسب رتبه ۱)", category: "social", status: "pending", description: "مدیریت روز لانچ، کامنت سازنده، گالری ویدیوها و پاسخ‌دهی به بازخوردها", connector: "Product Hunt Suite" },
      { id: "t11", day: 16, title: "انتشار فنی در Hacker News (Show HN)", category: "seo", status: "pending", description: "کالبدشکافی معماری بومی مک و صفر کردن هزینه مصرف توکن‌ها", connector: "Hacker News MCP" },
      { id: "t12", day: 18, title: "کیس‌استادی‌های تخصصی در ساب‌ردیت‌های ردیت", category: "social", status: "pending", description: "پست‌های تخصصی در r/LocalLLaMA، r/macapps و r/programming", connector: "Reddit Community API" },
      { id: "t13", day: 20, title: "رونمایی از ویدیوهای کوتاه در توییتر و یوتیوب", category: "video", status: "pending", description: "انتشار روزانه شورت‌های تکنیکال از قابلیت‌های شگفت‌انگیز کانکتورهای MCP", connector: "Video Distribution" },
    ]
  },
  {
    id: 4,
    title: "فاز ۴: شبکه‌سازی، اکوسیستم و رسیدن به ۵۰k+",
    days: "روز ۲۲ تا ۳۰",
    targetUsers: "۵۰,۰۰۰+ کاربر نهایی",
    tasks: [
      { id: "t14", day: 23, title: "مکاتبه ایمیلی مستقیم با ۱۰۰ خبرنامه بزرگ هوش مصنوعی", category: "gmail", status: "pending", description: "معرفی پروژه به خبرنامه‌های معتبر نظیر TLDR AI، Ben\'s Bites و The Rundown", connector: "Gmail Workspace MCP" },
      { id: "t15", day: 26, title: "افتتاح مارکت‌پلیس رسمی کانکتورهای جامع MCP", category: "github", status: "pending", description: "دعوت از دولوپرها برای توسعه اکوسیستم و ایجاد کانکتورهای اختصاصی", connector: "MCP Registry" },
      { id: "t16", day: 30, title: "تکمیل هدف ۵۰,۰۰۰ کاربر و انتشار گزارش رشد شفاف", category: "seo", status: "pending", description: "انتشار آمار شفاف رشد ارگانیک و تثبیت پایداری زیرساخت کلاینت", connector: "Analytics Engine" },
    ]
  }
];

export const ProjectTimelineDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phases, setPhases] = useState<ProjectPhase[]>(defaultPhases);
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar'>('timeline');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = phases.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'completed').length, 0);
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const handleToggleTask = (taskId: string) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(t => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : t.status === 'pending' ? 'in_progress' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    })));
  };

  const handleExecuteTask = async (task: ProjectTask) => {
    setExecutingTaskId(task.id);
    try {
      await fetch('/api/project/timeline/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, title: task.title, category: task.category })
      });
      setPhases(prev => prev.map(p => ({
        ...p,
        tasks: p.tasks.map(t => t.id === task.id ? { ...t, status: 'completed' } : t)
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setExecutingTaskId(null);
    }
  };

  const getDotColor = (cat: string) => {
    switch (cat) {
      case 'video': return 'bg-rose-400';
      case 'image': return 'bg-emerald-400';
      case 'telegram': return 'bg-sky-400';
      case 'social': return 'bg-pink-400';
      case 'gmail': return 'bg-amber-400';
      case 'seo': return 'bg-purple-400';
      default: return 'bg-blue-400';
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'video': return { label: '🎬 ویدیو', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'image': return { label: '🎨 عکس FLUX', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'telegram': return { label: '📢 تلگرام', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'social': return { label: '📱 اینستاگرام', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'gmail': return { label: '✉️ جیمیل', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'seo': return { label: '🔍 سئو', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'github': return { label: '🐙 گیت‌هاب', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      default: return { label: 'تسک', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 group flex items-center gap-2 px-3 py-3 rounded-l-2xl bg-slate-900/85 hover:bg-slate-800/95 border-y border-l border-cyan-500/40 hover:border-cyan-400 backdrop-blur-xl shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:pr-4 hover:scale-105"
        title="تقویم و تایم‌لاین پروژه (Roadmap 50k Users)"
      >
        <div className="relative">
          <svg className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-xl h-full bg-slate-950/95 border-l border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Autonomous Project Engine
                  </span>
                  <span className="text-xs text-slate-400">تارگت: ۵۰,۰۰۰ کاربر در ۳۰ روز</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  📅 تقویم و تایم‌لاین اجرایی Yadow
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-3 bg-slate-900/30 border-b border-slate-800/50 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>پیشرفت کلی تسک‌ها</span>
                  <span className="font-bold text-cyan-400">{progressPercent}٪ ({completedTasks} از {totalTasks})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              
              <div className="flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${activeTab === 'timeline' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  تایم‌لاین
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${activeTab === 'calendar' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  تقویم ۳۰ روزه
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === 'timeline' ? (
                phases.map(phase => (
                  <div key={phase.id} className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <div>
                        <h3 className="text-sm font-bold text-cyan-300">{phase.title}</h3>
                        <span className="text-[11px] text-slate-400">{phase.days} • هدف: {phase.targetUsers}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {phase.tasks.filter(t => t.status === 'completed').length} / {phase.tasks.length} تسک
                      </span>
                    </div>

                    <div className="space-y-2">
                      {phase.tasks.map(task => {
                        const badge = getCategoryBadge(task.category);
                        const isDone = task.status === 'completed';
                        const isInProgress = task.status === 'in_progress';
                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border transition-all ${isDone ? 'bg-emerald-950/20 border-emerald-500/30' : isInProgress ? 'bg-cyan-950/30 border-cyan-500/40' : 'bg-slate-900/60 border-slate-800/80'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <button
                                  onClick={() => handleToggleTask(task.id)}
                                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-colors ${isDone ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-600 hover:border-cyan-400'}`}
                                >
                                  {isDone ? '✓' : ''}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-100">{task.title}</span>
                                    <span className={`text-[10px] px-2 py-0.2 rounded-full border ${badge.color}`}>
                                      {badge.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">روز {task.day}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                                  <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1 font-mono">
                                    <span>کانکتور:</span>
                                    <span className="text-cyan-400">{task.connector}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleExecuteTask(task)}
                                disabled={executingTaskId === task.id || isDone}
                                className={`text-[11px] px-2.5 py-1 rounded-md font-medium border transition-all whitespace-nowrap ${isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default' : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-600/20 active:scale-95'}`}
                              >
                                {executingTaskId === task.id ? 'در حال اجرا...' : isDone ? 'انجام شد' : 'اجرای خودکار'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                    بر روی هر روز کلیک کنید تا تسک‌های تخصیص‌یافته به همان تاریخ را مشاهده فرمایید.
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(dayNum => {
                      const dayTasks = phases.flatMap(p => p.tasks).filter(t => t.day === dayNum);
                      const isSelected = selectedDay === dayNum;

                      return (
                        <button
                          key={dayNum}
                          onClick={() => setSelectedDay(dayNum)}
                          className={`p-2.5 rounded-lg border flex flex-col items-center justify-between min-h-[58px] transition-all ${isSelected ? 'bg-cyan-900/40 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
                        >
                          <span className="text-[11px] font-mono text-slate-300 font-bold">روز {dayNum}</span>
                          <div className="flex gap-1 mt-1">
                            {dayTasks.map(t => (
                              <span
                                key={t.id}
                                className={`w-1.5 h-1.5 rounded-full ${getDotColor(t.category)}`}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedDay && (
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 mt-4 space-y-2">
                      <h4 className="text-xs font-bold text-cyan-300">برنامه‌های روز {selectedDay}:</h4>
                      {phases.flatMap(p => p.tasks).filter(t => t.day === selectedDay).map(t => (
                        <div key={t.id} className="text-xs p-2 rounded bg-slate-800/60 border border-slate-700">
                          <span className="font-semibold text-white">{t.title}</span>
                          <p className="text-slate-400 text-[11px] mt-0.5">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-400">اتصال ۱۲ کانکتور فعال</span>
              <button
                onClick={() => {
                  fetch('/api/project/timeline/decompose', { method: 'POST' });
                  alert('موتور تفکیک خودکار Yadow مجدداً اجرا و برنامه‌ریزی ۳۰ روزه بروزرسانی شد.');
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                ⚡ بروزرسانی و همگام‌سازی خودکار
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
