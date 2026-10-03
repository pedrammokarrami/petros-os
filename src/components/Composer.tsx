import React, { useState, useRef, useEffect } from 'react';
import { AgentMode } from '../types';
import { Language, translations } from '../utils/translations';
import { voiceAgent } from '../services/voiceAgent';
import {
  ArrowUp,
  Square,
  FileCode2,
  X,
  Bot,
  MessageSquareCode,
  ListTodo,
  FileSearch,
  Bug,
  Terminal,
  Mic,
  MicOff,
  Paperclip,
  UploadCloud,
} from 'lucide-react';

interface Props {
  onSendMessage: (text: string, mode: AgentMode) => void;
  onStopExecution: () => void;
  isExecuting: boolean;
  activeMode: AgentMode;
  onSelectMode: (mode: AgentMode) => void;
  activeFile: string | null;
  onClearActiveFile: () => void;
  language: Language;
  onAttachContextFile?: (path: string) => void;
}

export function Composer({
  onSendMessage,
  onStopExecution,
  isExecuting,
  activeMode,
  onSelectMode,
  activeFile,
  onClearActiveFile,
  language,
  onAttachContextFile,
}: Props) {
  const [input, setInput] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[language];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecordingVoice) {
      voiceAgent.stopListening();
      setIsRecordingVoice(false);
      setVoiceNotice('');
    } else {
      setIsRecordingVoice(true);
      setVoiceNotice(language === 'fa' ? 'در حال شنیدن صدای شما...' : 'Listening to your voice...');
      const started = voiceAgent.startListening(
        language,
        (transcript) => {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          setVoiceNotice(language === 'fa' ? 'خطا در دسترسی میکروفون' : 'Mic error or permission denied');
          setIsRecordingVoice(false);
          setTimeout(() => setVoiceNotice(''), 3000);
        }
      );
      if (!started) {
        setIsRecordingVoice(false);
        setVoiceNotice(language === 'fa' ? 'مرورگر از ضبط صدا پشتیبانی نمی‌کند' : 'Voice recognition not supported');
        setTimeout(() => setVoiceNotice(''), 3000);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const content = evt.target?.result as string;
        try {
          // Upload directly to workspace
          const res = await fetch('/api/files/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath: `uploads/${file.name}`,
              content: content || '',
            }),
          });
          if (res.ok) {
            setUploadedFiles((prev) => [...prev, `uploads/${file.name}`]);
            if (onAttachContextFile) {
              onAttachContextFile(`uploads/${file.name}`);
            }
          }
        } catch (err) {
          console.error('File upload error:', err);
        }
      };
      reader.readAsText(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    const raw = input.trim();
    if (!raw || isExecuting) return;

    let targetMode = activeMode;
    let textToSend = raw;

    // Smart slash command routing
    if (raw.startsWith('/terminal ')) {
      targetMode = 'terminal';
      textToSend = raw.slice(10).trim();
    } else if (raw.startsWith('$ ')) {
      targetMode = 'terminal';
      textToSend = raw.slice(2).trim();
    } else if (raw === '/test') {
      targetMode = 'terminal';
      textToSend = 'npm test';
    } else if (raw.startsWith('/plan ')) {
      targetMode = 'plan';
      textToSend = raw.slice(6).trim();
    } else if (raw.startsWith('/review')) {
      targetMode = 'review';
      textToSend = raw.slice(7).trim() || 'Please review this codebase for vulnerabilities, bugs, and performance bottlenecks.';
    } else if (raw.startsWith('/debug ')) {
      targetMode = 'debug';
      textToSend = raw.slice(7).trim();
    } else if (raw.startsWith('/chat ')) {
      targetMode = 'chat';
      textToSend = raw.slice(6).trim();
    }

    onSendMessage(textToSend, targetMode);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const modePills: { id: AgentMode; label: string; icon: any; color: string }[] = [
    { id: 'agent', label: t.modes.agent, icon: Bot, color: 'text-emerald-400' },
    { id: 'chat', label: t.modes.chat, icon: MessageSquareCode, color: 'text-emerald-300' },
    { id: 'plan', label: t.modes.plan, icon: ListTodo, color: 'text-cyan-400' },
    { id: 'review', label: t.modes.review, icon: FileSearch, color: 'text-rose-400' },
    { id: 'debug', label: t.modes.debug, icon: Bug, color: 'text-amber-400' },
    { id: 'terminal', label: t.modes.terminal, icon: Terminal, color: 'text-emerald-400' },
  ];

  const getPlaceholder = () => {
    switch (activeMode) {
      case 'chat':
        return t.placeholderChat;
      case 'terminal':
        return t.placeholderTerminal;
      case 'plan':
        return t.placeholderPlan;
      case 'review':
        return t.placeholderReview;
      case 'debug':
        return t.placeholderDebug;
      case 'agent':
      default:
        return t.placeholderAgent;
    }
  };

  return (
    <div
      id="codgar-composer-container"
      className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1 z-20 select-none"
    >
      <div className="glass-panel-elevated rounded-3xl p-3.5 transition-all duration-300 border border-white/15 prismatic-edge shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        {/* Active Context File Attachment Pill */}
        {activeFile && (
          <div className="mb-2.5 flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono w-fit">
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-sm">{t.contextAttached}: {activeFile}</span>
            <button
              onClick={onClearActiveFile}
              className="p-0.5 hover:bg-emerald-900 rounded text-emerald-400 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Text Input Area & Action Icons */}
        <div className="relative flex items-center gap-2">
          {/* File Upload Hidden Input & Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-2xl liquid-btn text-slate-400 hover:text-cyan-300 border border-white/10 transition cursor-pointer flex-shrink-0"
            title={language === 'fa' ? 'پیوست یا آپلود فایل به پروژه' : 'Upload or attach files to workspace'}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Record Button */}
          <button
            onClick={handleVoiceToggle}
            className={`p-2 rounded-2xl transition cursor-pointer flex-shrink-0 border ${
              isRecordingVoice
                ? 'bg-rose-600/30 text-rose-400 border-rose-500/50 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'liquid-btn text-slate-400 hover:text-emerald-300 border-white/10'
            }`}
            title={
              isRecordingVoice
                ? language === 'fa'
                  ? 'توقف ضبط صدا'
                  : 'Stop voice recording'
                : language === 'fa'
                ? 'صحبت صوتی و ضبط ویس'
                : 'Record live voice message'
            }
          >
            {isRecordingVoice ? (
              <MicOff className="w-4 h-4 text-rose-400 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder={
              isRecordingVoice
                ? language === 'fa'
                  ? 'در حال گوش دادن... صحبت کنید'
                  : 'Listening to your microphone...'
                : getPlaceholder()
            }
            rows={1}
            dir="auto"
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm font-mono outline-none resize-none px-2 py-1.5 leading-relaxed max-h-48"
          />
        </div>

        {voiceNotice && (
          <div className="mt-1.5 text-[11px] font-mono text-emerald-400/90 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{voiceNotice}</span>
          </div>
        )}

        {/* Footer Controls: Subtle Mode Pills & Apple-styled Exec Button */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          {/* Refined Liquid Glass Mode Pills with breathing room */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[70vw] sm:max-w-none scrollbar-none">
            {modePills.map((p) => {
              const Icon = p.icon;
              const isActive = activeMode === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectMode(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'liquid-pill-active font-semibold shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : p.color}`} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action / Stop Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500">
              Ctrl+Enter
            </span>

            {isExecuting ? (
              <button
                onClick={onStopExecution}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold font-mono shadow-[0_0_15px_rgba(255,23,68,0.5)] transition cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>{t.abort}</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-semibold font-mono transition-all duration-200 shadow-lg cursor-pointer ${
                  input.trim()
                    ? 'liquid-btn text-white border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
                style={
                  input.trim()
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.25) 100%)',
                      }
                    : {}
                }
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>{activeMode === 'chat' ? t.send : t.execute}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
