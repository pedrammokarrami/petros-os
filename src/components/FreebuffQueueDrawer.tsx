import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListOrdered,
  Play,
  X,
  CheckCircle2,
  Clock,
  ArrowUp,
  Trash2,
  RotateCcw,
  Plus,
  Boxes,
  Zap,
  Activity,
  Layers,
  GripHorizontal,
} from 'lucide-react';
import { TaskRecord } from '../types';
import { Language } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
  onEnqueueTask?: (prompt: string) => void;
  isExecuting?: boolean;
}

export function FreebuffQueueDrawer({
  isOpen,
  onClose,
  language = 'fa',
  onEnqueueTask,
  isExecuting = false,
}: Props) {
  const isFa = language === 'fa';
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [filter, setFilter] = useState<'all' | 'running' | 'queued' | 'completed'>('all');

  const fetchTasks = async (showLoadingIndicator = false) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch {
      // Fallback local mock if offline
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTasks(true);
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchTasks(false);
        }
      }, 5000);
      return () => clearInterval(interval);
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

  const handleCancelTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}/cancel`, { method: 'POST' });
      fetchTasks();
    } catch (err) {
      console.error('Cancel task failed:', err);
    }
  };

  const handleMoveToTop = (index: number) => {
    if (index <= 0) return;
    setTasks((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const handleAddNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    if (onEnqueueTask) {
      onEnqueueTask(newPrompt.trim());
    } else {
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: newPrompt.trim(), mode: 'agent' }),
        });
      } catch (err) {
        console.error('Failed to enqueue:', err);
      }
    }

    setNewPrompt('');
    setTimeout(fetchTasks, 400);
  };

  if (!isOpen) return null;

  const runningTasks = tasks.filter((t) => t.status === 'running' || (isExecuting && t.status === 'queued'));
  const queuedTasks = tasks.filter((t) => t.status === 'queued' && !isExecuting);
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled');

  const displayedTasks = tasks.filter((t) => {
    if (filter === 'running') return t.status === 'running';
    if (filter === 'queued') return t.status === 'queued';
    if (filter === 'completed') return t.status === 'completed' || t.status === 'failed';
    return true;
  });

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/35 backdrop-blur-xs"
        dir={isFa ? 'rtl' : 'ltr'}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-xl h-[85vh] ice-glass-window rounded-3xl flex flex-col overflow-hidden border border-white/90 shadow-2xl text-slate-800 bg-white/95 cursor-default select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Draggable Header */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-slate-50/80 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <ListOrdered className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{isFa ? 'صف وظایف ایجنت‌ها' : 'CODGAR Task Queue'}</span>
                    <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  </h2>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isFa ? 'موازی' : 'Parallel'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  {isFa ? 'مدیریت و اولویت‌بندی اجرای کدهای ایجنت' : 'Manage parallel task scheduling'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fetchTasks(true)}
                className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title={isFa ? 'به‌روزرسانی' : 'Refresh'}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shadow-2xs"
                title={isFa ? 'بستن پنجره' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Parallel Workers Status Bar */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Boxes className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{isFa ? 'ایجنت کدنویس:' : 'Coder Worker:'}</span>
              <span className="font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded text-[10px]">
                {isExecuting ? (isFa ? 'در حال اجرا' : 'Executing') : (isFa ? 'آماده' : 'Standby')}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{isFa ? 'ایجنت بازبینی:' : 'Review Worker:'}</span>
              <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]">
                {isFa ? 'فعال' : 'Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <span>{tasks.length} {isFa ? 'وظیفه ثبت‌شده' : 'tasks recorded'}</span>
          </div>
        </div>

        {/* Fast Task Enqueue Form */}
        <form onSubmit={handleAddNewTask} className="p-4 border-b border-slate-200/70 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder={isFa ? 'افزودن دستور جدید به صف ایجنت...' : 'Add a prompt to the agent queue...'}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-slate-800 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!newPrompt.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isFa ? 'افزودن به صف' : 'Add to Queue'}</span>
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isFa ? 'همه' : 'All'} ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'running'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {isFa ? 'در حال اجرا' : 'Running'} ({runningTasks.length})
          </button>
          <button
            onClick={() => setFilter('queued')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              filter === 'queued'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isFa ? 'در صف انتظار' : 'Queued'} ({queuedTasks.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              filter === 'completed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isFa ? 'تکمیل‌شده' : 'Completed'} ({completedTasks.length})
          </button>
        </div>

        {/* Task List / Queue Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Layers className="w-12 h-12 stroke-[1.2] text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-600">
                {isFa ? 'هیچ وظیفه‌ای در این وضعیت نیست' : 'No tasks in this queue state'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {isFa
                  ? 'دستورات جدید را از نوار بالا وارد کرده یا از طریق چت ارسال نمایید.'
                  : 'Enqueue new tasks using the top bar or send instructions from chat.'}
              </p>
            </div>
          ) : (
            displayedTasks.map((task, idx) => {
              const isRunning = task.status === 'running' || (isExecuting && idx === 0);
              const isQueued = task.status === 'queued';
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id || idx}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                    isRunning
                      ? 'bg-blue-50/80 border-blue-200 shadow-md ring-1 ring-blue-300/50'
                      : isQueued
                      ? 'bg-white border-slate-200 hover:border-blue-200 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="mt-0.5">
                        {isRunning ? (
                          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center animate-spin">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </div>
                        ) : isDone ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-mono font-bold">
                            #{idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {task.title || task.prompt || (isFa ? 'وظیفه پردازشی ایجنت' : 'Agent Execution Task')}
                          </h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isRunning
                                ? 'bg-blue-600 text-white'
                                : isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {task.prompt}
                        </p>

                        {/* Progress or Tool info */}
                        {task.plan && task.plan.steps && (
                          <div className="mt-2 text-[10px] text-slate-600 bg-white/80 p-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>
                              {task.plan.steps.filter((s) => s.status === 'completed').length} /{' '}
                              {task.plan.steps.length} {isFa ? 'مرحله انجام شده' : 'steps completed'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Freebuff Actions: Move to Top, Cancel */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isQueued && (
                        <button
                          type="button"
                          onClick={() => handleMoveToTop(idx)}
                          className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title={isFa ? 'انتقال به ابتدای صف (Move to Top)' : 'Move to top of queue'}
                        >
                          <ArrowUp className="w-3 h-3" />
                          <span className="hidden sm:inline">{isFa ? 'اول صف' : 'Top'}</span>
                        </button>
                      )}

                      {isRunning && (
                        <button
                          type="button"
                          onClick={() => handleCancelTask(task.id)}
                          className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          title={isFa ? 'لغو وظیفه' : 'Cancel task'}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">{isFa ? 'لغو' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isFa ? 'صف خودکار با پردازش پس‌زمینه فعال است' : 'Automated background agent pipeline active'}</span>
          </div>
          <button
            onClick={() => setTasks([])}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer"
          >
            {isFa ? 'پاکسازی تاریخچه' : 'Clear history'}
          </button>
        </div>
      </motion.div>
    </div>
    </AnimatePresence>
  );
}
