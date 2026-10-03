import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Boxes,
  X,
  Plus,
  GitBranch,
  Cpu,
  Layers,
  Terminal,
  FolderGit2,
  Trash2,
  GripHorizontal,
} from 'lucide-react';
import { Language } from '../utils/translations';

interface Workspace {
  id: string;
  name: string;
  branch: string;
  agentModel: string;
  status: 'active' | 'idle' | 'executing';
  filesChanged: number;
  memoryMb: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export function FreebuffWorkspacesModal({
  isOpen,
  onClose,
  language = 'fa',
}: Props) {
  const isFa = language === 'fa';
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws-1');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'ws-1',
      name: 'main-isolated-sandbox',
      branch: 'main',
      agentModel: 'Gemini 2.5 Flash (Coder Agent)',
      status: 'active',
      filesChanged: 3,
      memoryMb: 128,
    },
    {
      id: 'ws-2',
      name: 'feature-parallel-agent',
      branch: 'feature/diff-queue',
      agentModel: 'DeepSeek V4.1 Flash (Worker #2)',
      status: 'idle',
      filesChanged: 0,
      memoryMb: 64,
    },
    {
      id: 'ws-3',
      name: 'linter-and-tests-runner',
      branch: 'tests/unit-suite',
      agentModel: 'GLM 5.3 Flash (Review Agent)',
      status: 'idle',
      filesChanged: 1,
      memoryMb: 85,
    },
  ]);
  const [newWsName, setNewWsName] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: newWsName.trim().toLowerCase().replace(/\s+/g, '-'),
      branch: 'feature/agent-task',
      agentModel: 'Gemini 2.5 Flash',
      status: 'idle',
      filesChanged: 0,
      memoryMb: 48,
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setNewWsName('');
    setActiveWorkspaceId(newWs.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (workspaces.length <= 1) return;
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (activeWorkspaceId === id) {
      const remaining = workspaces.filter((w) => w.id !== id);
      if (remaining[0]) setActiveWorkspaceId(remaining[0].id);
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/35 backdrop-blur-xs"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-2xl h-auto max-h-[85vh] ice-glass-window rounded-3xl flex flex-col overflow-hidden border border-white/90 shadow-2xl text-slate-800 bg-white/95 cursor-default select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-cyan-50/80 via-white to-blue-50/80 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/25 shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{isFa ? 'ورک‌اسپیس‌های ایزوله' : 'CODGAR Parallel Workspaces'}</span>
                    <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  </h2>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-200">
                    Isolated Agents
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  {isFa
                    ? 'اجرای همزمان چندین ایجنت در محیط‌های ایزوله محلی بدون تداخل تغییرات'
                    : 'Run parallel coding agents in isolated local workspaces without file conflicts'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shadow-2xs"
              title={isFa ? 'بستن' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        {/* Create New Workspace Bar */}
        <form onSubmit={handleAddWorkspace} className="p-4 border-b border-slate-200/70 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder={isFa ? 'نام ورک‌اسپیس جدید (مثلا: bugfix-login)...' : 'New workspace name (e.g. bugfix-login)...'}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:border-cyan-500 outline-none text-slate-800 shadow-inner"
            />
            <button
              type="submit"
              disabled={!newWsName.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isFa ? 'ایجاد ورک‌اسپیس' : 'New Workspace'}</span>
            </button>
          </div>
        </form>

        {/* Workspaces Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {workspaces.map((ws) => {
            const isSelected = activeWorkspaceId === ws.id;

            return (
              <div
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-50/80 border-cyan-300 shadow-md ring-2 ring-cyan-400/40'
                    : 'bg-white border-slate-200 hover:border-cyan-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <FolderGit2 className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 font-mono">
                          {ws.name}
                        </h3>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white">
                            {isFa ? 'ورک‌اسپیس فعال' : 'Active Workspace'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3 text-cyan-600" />
                          <span className="font-mono">{ws.branch}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-slate-500" />
                          <span>{ws.agentModel}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                      {ws.memoryMb} MB
                    </span>
                    {workspaces.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(ws.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title={isFa ? 'حذف ورک‌اسپیس' : 'Delete workspace'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-600" />
            <span>
              {isFa
                ? 'هر ورک‌اسپیس دارای سشن مستقل، ترمینال و فایل‌های قرنطینه می‌باشد.'
                : 'Each workspace contains isolated sessions, terminal, and sandbox sandbox.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            {isFa ? 'انتخاب و بستن' : 'Select & Close'}
          </button>
        </div>
      </motion.div>
    </div>
    </AnimatePresence>
  );
}
