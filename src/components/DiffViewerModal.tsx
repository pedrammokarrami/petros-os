import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitStatus, DiffData } from '../types';
import { parseGitDiff } from '../utils/diffParser';
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  RefreshCw,
  X,
  FileCode2,
  Check,
  GripHorizontal,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefreshGitStatus: () => void;
  embedded?: boolean;
}

export function DiffViewerModal({ isOpen, onClose, onRefreshGitStatus, embedded = false }: Props) {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [diffs, setDiffs] = useState<DiffData[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const [commitFeedback, setCommitFeedback] = useState<string | null>(null);

  const fetchStatusAndDiff = async () => {
    setLoading(true);
    try {
      const [statusRes, diffRes] = await Promise.all([
        fetch('/api/git/status'),
        fetch('/api/git/diff'),
      ]);
      const statusData = await statusRes.json();
      const diffData = await diffRes.json();

      if (statusData.success) {
        setGitStatus(statusData);
      }

      if (diffData.success && diffData.diff) {
        const parsed = parseGitDiff(diffData.diff);
        setDiffs(parsed);
        if (parsed.length > 0 && !selectedFile) {
          setSelectedFile(parsed[0].file);
        }
      } else {
        setDiffs([]);
      }
    } catch (err) {
      console.error('Failed to load git status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndDiff();
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

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setCommitting(true);
    setCommitFeedback(null);
    try {
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setCommitFeedback(`Committed: ${data.output || 'Success'}`);
        setCommitMessage('');
        fetchStatusAndDiff();
        onRefreshGitStatus();
      } else {
        setCommitFeedback(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setCommitFeedback(`Error: ${err.message}`);
    } finally {
      setCommitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDiff = diffs.find((d) => d.file === selectedFile) || diffs[0];

  const content = (
    <div className={`w-full ${embedded ? 'h-full' : 'h-[85vh] max-w-5xl ice-glass-window rounded-3xl border border-white/90 shadow-2xl'} flex flex-col overflow-hidden text-slate-800 bg-white/95 cursor-default select-none`}>
      {/* Header */}
      <div className={`px-6 py-3.5 border-b border-white/60 flex items-center justify-between bg-white/40 ${embedded ? '' : 'cursor-grab active:cursor-grabbing'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-wider flex items-center gap-1.5">
                <span>GIT CHANGES & DIFF REVIEW</span>
                {!embedded && <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
                {gitStatus?.branch || 'main'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Review line-by-line modifications, staging, and commit history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStatusAndDiff}
            disabled={loading}
            className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-sm border border-white"
            title="Refresh Git Diff"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shadow-sm border border-white"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden bg-white/60">
          {/* File list sidebar */}
          <div className="w-64 border-r border-white/60 bg-white/40 flex flex-col">
            <div className="p-3 border-b border-white/60 text-xs font-bold text-slate-700 flex justify-between items-center">
              <span>MODIFIED FILES ({diffs.length})</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {diffs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-sans">
                  Working tree clean. No uncommitted modifications.
                </div>
              ) : (
                diffs.map((d) => (
                  <button
                    key={d.file}
                    onClick={() => setSelectedFile(d.file)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition flex items-center gap-2 ${
                      selectedFile === d.file
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'text-slate-700 hover:bg-white/80'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate flex-1">{d.file}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Diff viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 text-slate-200">
            {currentDiff ? (
              <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
                <div className="text-slate-400 mb-3 font-semibold pb-2 border-b border-slate-700">
                  {currentDiff.file}
                </div>
                {currentDiff.hunks.map((hunk, hIdx) => (
                  <div key={hIdx} className="mb-4">
                    <div className="text-cyan-400 bg-slate-800/80 px-2 py-0.5 rounded text-[11px] mb-1">
                      @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                    </div>
                    {hunk.lines.map((line, lIdx) => (
                      <div
                        key={lIdx}
                        className={`px-2 py-0.5 flex ${
                          line.type === 'add'
                            ? 'bg-emerald-950/60 text-emerald-300'
                            : line.type === 'del'
                            ? 'bg-rose-950/60 text-rose-300'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="w-6 text-slate-600 select-none">
                          {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                        </span>
                        <span className="flex-1 whitespace-pre">{line.content}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-sans text-xs">
                Select a file to inspect diff hunks
              </div>
            )}
          </div>
        </div>

        {/* Footer with Commit Form */}
        <div className="p-4 border-t border-white/60 bg-white/40 flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter conventional commit message (e.g., feat: polish ice-glass theme)..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-blue-500 shadow-inner"
            />
            <button
              onClick={handleCommit}
              disabled={committing || !commitMessage.trim()}
              className="px-4 py-2 rounded-xl coral-pill-btn font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40"
            >
              <GitCommitIcon className="w-3.5 h-3.5" />
              <span>{committing ? 'Committing...' : 'Commit'}</span>
            </button>
          </div>

          {commitFeedback && (
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {commitFeedback}
            </span>
          )}
        </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/35 backdrop-blur-xs"
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-full max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
