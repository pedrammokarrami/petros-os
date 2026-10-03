import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Square,
  Trash2,
  Copy,
  Check,
  Clock,
  CornerDownLeft,
  FileCode2,
  Code2,
  CheckCircle2,
  WrapText,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Message } from '../types';

interface Props {
  isOpen: boolean;
  onToggle?: () => void;
  language?: string;
  messages?: Message[];
}

export interface CodeChangeItem {
  id: string;
  prompt?: string;
  title: string;
  filePath: string;
  code: string;
  language: string;
  timestamp: number;
  status: 'success' | 'error';
  executionLogs?: string;
  linesCount: number;
}

export interface CommandLog {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  timestamp: number;
}

export function TerminalPanel({ isOpen, language = 'fa', messages = [], onToggle }: Props) {
  const isFa = language === 'fa';
  const [command, setCommand] = useState('');
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([]);
  const [codeHistory, setCodeHistory] = useState<CodeChangeItem[]>([]);
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [wrapLines, setWrapLines] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [running, setRunning] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'code' | 'commands'>('all');
  const [isFilesDropdownOpen, setIsFilesDropdownOpen] = useState(false);

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close files dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFilesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Fetch persistent code history
  const fetchCodeHistory = async () => {
    try {
      const res = await fetch('/api/code/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setCodeHistory(data.history);
        }
      }
    } catch {
      // Fallback
    }
  };

  // 2. Parse code blocks from chat messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const parsedItems: CodeChangeItem[] = [];

      messages.forEach((msg, idx) => {
        if (msg.role === 'agent' && msg.content) {
          const codeBlockRegex = /```(?:tsx|typescript|jsx|javascript|html|python|go|rust|swift)?\s*([\s\S]*?)```/g;
          let match;
          let blockIdx = 0;

          while ((match = codeBlockRegex.exec(msg.content)) !== null) {
            const code = match[1]?.trim();
            if (code && code.length > 50) {
              const isReact = code.includes('import React') || code.includes('useState') || code.includes('export default');
              const lines = code.split('\n').length;
              parsedItems.push({
                id: `msg_code_${msg.id}_${blockIdx}`,
                prompt: `کد مرحله ${idx + 1}`,
                title: isReact ? 'App.tsx' : 'main.ts',
                filePath: isReact ? 'apps/web/App.tsx' : 'apps/main.ts',
                code,
                language: isReact ? 'tsx' : 'typescript',
                timestamp: msg.timestamp || Date.now(),
                status: 'success',
                executionLogs: `Exit 0 (Compiled successfully)`,
                linesCount: lines,
              });
              blockIdx++;
            }
          }
        }
      });

      if (parsedItems.length > 0) {
        setCodeHistory((prev) => {
          const combined = [...prev];
          parsedItems.forEach((newItem) => {
            if (!combined.some((c) => c.code.slice(0, 100) === newItem.code.slice(0, 100))) {
              combined.unshift(newItem);
            }
          });
          return combined;
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchCodeHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    if (codeHistory.length > 0 && (!selectedCodeId || !codeHistory.some((c) => c.id === selectedCodeId))) {
      setSelectedCodeId(codeHistory[0].id);
    }
  }, [codeHistory, selectedCodeId]);

  const activeCodeItem = useMemo(() => {
    if (codeHistory.length === 0) return null;
    return codeHistory.find((c) => c.id === selectedCodeId) || codeHistory[0];
  }, [codeHistory, selectedCodeId]);

  const codeLines = useMemo(() => {
    if (!activeCodeItem?.code) return [];
    return activeCodeItem.code.split('\n');
  }, [activeCodeItem]);

  const handleExecute = async (cmdToRun?: string) => {
    const targetCmd = (cmdToRun || command).trim();
    if (!targetCmd || running) return;

    setHistory((prev) => [...prev.filter((c) => c !== targetCmd), targetCmd]);
    setHistoryIdx(-1);
    setCommand('');
    setRunning(true);

    const startTime = Date.now();
    const tempId = `cmd_${startTime}`;
    setCurrentExecutionId(tempId);

    try {
      const res = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: targetCmd, executionId: tempId }),
      });

      const data = await res.json();
      const durationMs = Date.now() - startTime;

      const newLog: CommandLog = {
        id: tempId,
        command: targetCmd,
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: typeof data.exitCode === 'number' ? data.exitCode : data.success ? 0 : 1,
        durationMs,
        timestamp: startTime,
      };

      setCommandLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorLog: CommandLog = {
        id: tempId,
        command: targetCmd,
        stdout: '',
        stderr: err.message || 'Execution error',
        exitCode: 1,
        durationMs,
        timestamp: startTime,
      };
      setCommandLogs((prev) => [errorLog, ...prev]);
    } finally {
      setRunning(false);
      setCurrentExecutionId(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleCancel = async () => {
    if (!currentExecutionId) return;
    try {
      await fetch('/api/terminal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId: currentExecutionId }),
      });
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setCommandLogs([]);
    setCodeHistory([]);
    setSelectedCodeId(null);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const parts: string[] = [];
    if (codeHistory.length > 0) {
      parts.push('=== CODE FILES ===\n');
      codeHistory.forEach((c) => {
        parts.push(`// ${c.filePath}\n${c.code}\n`);
      });
    }
    if (commandLogs.length > 0) {
      parts.push('\n=== COMMAND LOGS ===\n');
      commandLogs.forEach((l) => {
        parts.push(`$ ${l.command} (exit ${l.exitCode})\n${l.stdout || ''}${l.stderr || ''}\n`);
      });
    }
    navigator.clipboard.writeText(parts.join('\n'));
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setCommand(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setCommand('');
      } else {
        setHistoryIdx(nextIdx);
        setCommand(history[nextIdx]);
      }
    }
  };

  const quickCommands = [
    { label: 'npm test', cmd: 'npm test' },
    { label: 'git status', cmd: 'git status' },
    { label: 'ls -la', cmd: 'ls -la' },
    { label: 'node -v', cmd: 'node -v' },
  ];

  const totalEntries = codeHistory.length + commandLogs.length;

  if (!isOpen) return null;

  return (
    <div
      id="codgar-integrated-terminal"
      className="h-full w-full flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden bg-[#070b16] font-mono text-xs select-none relative"
      dir="ltr"
    >
      {/* Top Ambient Glow Rim */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 pointer-events-none z-30" />

      {/* Close Button Pinned to Top-Right Corner */}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-2.5 right-3 sm:top-3 sm:right-3.5 z-40 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-sm"
          title={isFa ? 'بستن' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Clean Compact Header (Minimalist & Uncluttered) */}
      <div className="px-3.5 py-2.5 bg-[#0d1424] text-slate-300 flex items-center justify-between gap-3 border-b border-white/10 shrink-0 z-20 pr-12 sm:pr-14">
        {/* Left: Terminal Icon & Clean Title */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-sm shrink-0">
            <TerminalIcon className="w-3.5 h-3.5" />
          </div>

          <span className="font-bold text-white text-xs sm:text-sm tracking-wide font-sans truncate">
            {isFa ? 'ترمینال و تغییرات کد' : 'Terminal & Code Changes'}
          </span>
        </div>

        {/* Center: Clean Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'all' ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFa ? 'همه' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 ${
              activeTab === 'code' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>{isFa ? 'کدها' : 'Code'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('commands')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 ${
              activeTab === 'commands' ? 'bg-blue-500 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TerminalIcon className="w-3 h-3" />
            <span>{isFa ? 'دستورات' : 'Commands'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 bg-[#070b16] text-slate-200 space-y-3.5 leading-relaxed min-h-0 select-text font-mono">
        {totalEntries === 0 ? (
          /* Concise Empty State */
          <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center text-slate-400 gap-3 py-6 px-4" dir={isFa ? 'rtl' : 'ltr'}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <TerminalIcon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs sm:text-sm text-slate-200 font-sans">
                {isFa ? 'آماده اجرای دستورات و نمایش تغییرات کد' : 'Ready for Commands & Code Changes'}
              </h4>
            </div>

            {/* Quick Commands Bar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1" dir="ltr">
              {quickCommands.map((qc) => (
                <button
                  key={qc.cmd}
                  type="button"
                  onClick={() => handleExecute(qc.cmd)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/30 text-[11px] text-slate-300 hover:text-emerald-300 font-mono transition cursor-pointer active:scale-95"
                >
                  $ {qc.cmd}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 1. Code Changes Box */}
            {(activeTab === 'all' || activeTab === 'code') && activeCodeItem && (
              <div className="rounded-xl bg-[#090f1d] border border-emerald-500/30 overflow-hidden shadow-xl transition-all">
                {/* Unified Standard Code Header (Clean, compact, aligned to left) */}
                <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#0d1527] border-b border-white/10 flex items-center justify-between gap-2">
                  {/* Left: Files Dropdown Menu & Meta info */}
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Files Custom Dropdown Button (Compact & Left-aligned) */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsFilesDropdownOpen(!isFilesDropdownOpen)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-300 text-[11px] font-mono transition cursor-pointer active:scale-95 shadow-inner select-none"
                        title={isFa ? 'انتخاب فایل' : 'Select file'}
                      >
                        <FileCode2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[10.5px] text-slate-400 font-sans font-bold shrink-0">
                          {isFa ? 'فایل‌ها:' : 'Files:'}
                        </span>
                        <span className="text-emerald-200 font-bold font-mono truncate max-w-[85px] sm:max-w-[130px]">
                          {activeCodeItem.filePath || activeCodeItem.title || 'Code'}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-emerald-400/90 transition-transform duration-200 shrink-0 ${isFilesDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu Popover */}
                      {isFilesDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-52 sm:w-64 max-h-52 overflow-y-auto rounded-xl bg-[#090f1d] border border-emerald-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.85)] p-1 z-50 space-y-0.5 backdrop-blur-md">
                          <div className="px-2 py-1 text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-wider border-b border-white/5">
                            {isFa ? 'فایل‌های تولیدشده پروژه' : 'Generated Project Files'}
                          </div>
                          {codeHistory.map((item, idx) => {
                            const isSelected = item.id === activeCodeItem.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCodeId(item.id);
                                  setIsFilesDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-mono transition cursor-pointer text-left ${
                                  isSelected
                                    ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/50'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileCode2 className={`w-3 h-3 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                                  <span className="truncate">{item.filePath || item.title || `Code ${idx + 1}`}</span>
                                </div>
                                <span className={`text-[9.5px] px-1 rounded font-sans shrink-0 ${isSelected ? 'bg-emerald-950 text-emerald-300' : 'text-slate-500'}`}>
                                  {item.linesCount}L
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/40 font-mono uppercase font-bold hidden sm:inline">
                      {activeCodeItem.language}
                    </span>

                    <span className="text-[10.5px] text-slate-400 font-mono hidden md:inline">
                      {activeCodeItem.linesCount}L
                    </span>
                  </div>

                  {/* Right: Clean Standard Code Actions with generous spacing */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setWrapLines(!wrapLines)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-sans flex items-center gap-1 transition cursor-pointer border shadow-2xs ${
                        wrapLines
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/10'
                      }`}
                      title={isFa ? 'شکست خودکار خطوط' : 'Toggle Wrap'}
                    >
                      <WrapText className="w-3 h-3" />
                      <span className="hidden xs:inline">{wrapLines ? 'Wrap' : 'No Wrap'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeCodeItem.id, activeCodeItem.code)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-sans font-medium flex items-center gap-1 transition cursor-pointer border border-emerald-500/40 active:scale-95 shadow-2xs"
                      title={isFa ? 'کپی کدها' : 'Copy code'}
                    >
                      {copiedId === activeCodeItem.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === activeCodeItem.id ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی' : 'Copy')}</span>
                    </button>
                  </div>
                </div>

                {/* Code Body with Line Numbers */}
                <div className="relative bg-[#070b16] text-[11px] text-slate-200 font-mono leading-relaxed select-text flex max-h-[380px] overflow-y-auto">
                  <div className="select-none py-2.5 px-2 text-right text-slate-600 bg-black/40 border-r border-white/5 font-mono text-[11px] leading-5 shrink-0 min-w-[36px]">
                    {codeLines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  <div className="flex-1 min-w-0 py-2.5 px-3 overflow-hidden">
                    <pre
                      className={`font-mono text-[11px] leading-5 text-slate-200 ${
                        wrapLines ? 'whitespace-pre-wrap break-all sm:break-normal' : 'whitespace-pre overflow-x-auto scrollbar-thin'
                      }`}
                    >
                      {activeCodeItem.code}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Command Execution Logs */}
            {(activeTab === 'all' || activeTab === 'commands') && commandLogs.length > 0 && (
              <div className="space-y-2 pt-1">
                {commandLogs.map((log) => (
                  <div key={log.id} className="rounded-xl bg-black/50 p-2.5 border border-white/10 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-1">
                      <span className="text-cyan-400 font-semibold flex items-center gap-1.5 font-mono">
                        <span className="text-emerald-400">kian@codgar:~$</span> {log.command}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            log.exitCode === 0
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                          }`}
                        >
                          exit {log.exitCode}
                        </span>
                        <span className="text-slate-500 text-[10px] font-sans">
                          {log.durationMs}ms
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const textToCopy = `${log.command}\n${log.stdout || ''}${log.stderr || ''}`.trim();
                            navigator.clipboard.writeText(textToCopy);
                            setCopiedId(log.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="px-1.5 py-0.2 rounded bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white transition cursor-pointer text-[10px] flex items-center gap-1 font-mono border border-white/10 active:scale-95"
                          title="Copy output"
                        >
                          {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    {log.stdout && (
                      <pre className="text-slate-300 whitespace-pre-wrap break-words text-[11px] leading-relaxed">
                        {log.stdout}
                      </pre>
                    )}
                    {log.stderr && (
                      <pre className="text-rose-400 whitespace-pre-wrap break-words text-[11px] leading-relaxed">
                        {log.stderr}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <div ref={outputEndRef} />
      </div>

      {/* Terminal Command Input Bar */}
      <div className="p-2 bg-[#0d1424] border-t border-white/10 flex items-center gap-1.5 sm:gap-2 shrink-0 select-none">
        <span className="text-emerald-400 font-bold pl-1 sm:pl-2 font-mono text-xs whitespace-nowrap">
          <span className="hidden sm:inline">kian@codgar:</span>~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isFa ? 'اجرای دستور (npm test, git status)...' : 'Run command (npm test, git status)...'}
          className="flex-1 min-w-0 bg-transparent text-slate-100 placeholder:text-slate-500 outline-none text-xs font-mono select-text"
        />
        {running ? (
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold font-mono shadow-md cursor-pointer active:scale-95 transition"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleExecute()}
            disabled={!command.trim()}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold font-mono cursor-pointer shadow-md disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition"
          >
            <span>Exec</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
