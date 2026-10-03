import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiffViewerModal } from './DiffViewerModal';
import { TerminalPanel } from './TerminalPanel';
import { FileExplorer } from './FileExplorer';
import { SkillsModal } from './SkillsModal';
import {
  Code2,
  Terminal,
  FolderGit2,
  X,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ListTodo,
  FileCode,
  Sparkles,
  Bot,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { Message } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  initialTab?: 'editor' | 'terminal' | 'files' | 'agents';
  hasCodeDiff?: boolean;
  messages?: Message[];
  onRefreshWorkspace?: () => void;
  onSelectContextFile?: (path: string) => void;
}

export function AnimatedCodeDrawer({
  isOpen,
  onClose,
  language,
  initialTab = 'editor',
  hasCodeDiff = false,
  messages = [],
  onRefreshWorkspace,
  onSelectContextFile,
}: Props) {
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'files' | 'agents'>(initialTab);
  const [isExpanded, setIsExpanded] = useState(false);
  const t = translations[(language as Language) in translations ? (language as Language) : 'en'] || translations.en;

  // Sync tab when initialTab changes or drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/45 backdrop-blur-md transition-all"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 16,
            }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
              mass: 0.85,
            }}
            className={`w-full ice-glass-window border border-white/95 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden ${
              isExpanded ? 'h-[96vh] max-w-7xl' : 'h-[84vh] max-w-5xl'
            }`}
          >
            {/* Drawer Header with Clean Liquid Tabs */}
            <div className="h-14 border-b border-white/80 px-4 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                <div className="p-1.5 rounded-xl bg-blue-600 text-white flex-shrink-0 shadow-sm">
                  <Code2 className="w-4 h-4" />
                </div>
                <span className="font-sans text-xs font-bold text-slate-900 tracking-wide whitespace-nowrap hidden sm:inline-block">
                  {t.inspectCode}
                </span>

                {/* Tab navigation pills */}
                <div className="flex items-center gap-1.5 ml-2 sm:ml-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'editor'
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : 'ice-glass-btn text-slate-700 hover:text-blue-600 hover:bg-white'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>{t.diff}</span>
                    {hasCodeDiff && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('terminal')}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'terminal'
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : 'ice-glass-btn text-slate-700 hover:text-blue-600 hover:bg-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{t.terminal}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('files')}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'files'
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : 'ice-glass-btn text-slate-700 hover:text-blue-600 hover:bg-white'
                    }`}
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>{t.tree}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('agents')}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'agents'
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : 'ice-glass-btn text-slate-700 hover:text-blue-600 hover:bg-white'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{t.skills}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-blue-600 hover:bg-white cursor-pointer shadow-xs"
                  title={isExpanded ? 'Restore size' : 'Expand full screen'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shadow-xs"
                  title={language === 'fa' ? 'بستن پنجره' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'editor' && (
                <div className="w-full h-full p-2">
                  <DiffViewerModal
                    isOpen={true}
                    embedded={true}
                    onClose={onClose}
                    onRefreshGitStatus={onRefreshWorkspace || (() => {})}
                  />
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="w-full h-full p-2 sm:p-3 flex flex-col min-h-0">
                  <TerminalPanel isOpen={true} onToggle={onClose} language={language} messages={messages} />
                </div>
              )}

              {activeTab === 'files' && (
                <div className="w-full h-full p-2">
                  <FileExplorer
                    isOpen={true}
                    embedded={true}
                    onClose={onClose}
                    onSelectFileForContext={onSelectContextFile || (() => {})}
                  />
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="w-full h-full p-2">
                  <SkillsModal
                    isOpen={true}
                    embedded={true}
                    onClose={onClose}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
