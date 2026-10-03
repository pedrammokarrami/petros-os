import React, { useState, useRef } from 'react';
import { AgentMode } from '../types';
import { Language, translations } from '../utils/translations';
import { voiceAgent } from '../services/voiceAgent';
import {
  ArrowUp,
  Square,
  Mic,
  MicOff,
  Paperclip,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Props {
  onSendMessage: (content: string, mode: AgentMode) => void;
  onStopExecution: () => void;
  isExecuting: boolean;
  activeMode: AgentMode;
  onSelectMode: (mode: AgentMode) => void;
  activeFile: string | null;
  onClearActiveFile: () => void;
  language: Language;
  onAttachContextFile?: (path: string) => void;
}

export function MinimalComposer({
  onSendMessage,
  onStopExecution,
  isExecuting,
  activeMode,
  activeFile,
  onClearActiveFile,
  language,
  onAttachContextFile,
}: Props) {
  const [input, setInput] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[language];

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
          const res = await fetch('/api/files/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filePath: `uploads/${file.name}`,
              content: content || '',
            }),
          });
          if (res.ok) {
            setAttachedFiles((prev) => [...prev, file.name]);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    const raw = input.trim();
    if (!raw || isExecuting) return;

    if (isRecordingVoice) {
      voiceAgent.stopListening();
      setIsRecordingVoice(false);
    }

    onSendMessage(raw, activeMode);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 py-3 select-none">
      <div className="relative rounded-3xl bg-[#090d16]/90 border border-white/15 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-2 sm:p-2.5 transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_35px_rgba(16,185,129,0.25)]">
        
        {/* Attached context file indicator if any */}
        {(activeFile || attachedFiles.length > 0) && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1 px-2">
            {activeFile && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{activeFile}</span>
                <button
                  onClick={onClearActiveFile}
                  className="hover:text-rose-400 cursor-pointer ml-1"
                >
                  ×
                </button>
              </div>
            )}
            {attachedFiles.map((f, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300"
              >
                <Paperclip className="w-2.5 h-2.5 text-slate-400" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar with Voice & File attachment */}
        <div className="flex items-center gap-1.5">
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
            className="p-2.5 rounded-2xl liquid-btn text-slate-400 hover:text-cyan-300 border border-white/10 transition cursor-pointer flex-shrink-0"
            title={language === 'fa' ? 'ارسال یا پیوست فایل' : 'Upload or attach file'}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Record & Mic Button */}
          <button
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-2xl transition cursor-pointer flex-shrink-0 border ${
              isRecordingVoice
                ? 'bg-rose-600/30 text-rose-400 border-rose-500/50 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : 'liquid-btn text-slate-400 hover:text-emerald-300 border-white/10'
            }`}
            title={
              isRecordingVoice
                ? language === 'fa'
                  ? 'توقف ضبط صدا'
                  : 'Stop recording'
                : language === 'fa'
                ? 'صحبت صوتی با مستر ربات'
                : 'Talk with voice'
            }
          >
            {isRecordingVoice ? (
              <MicOff className="w-4 h-4 text-rose-400 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Clean Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder={
              isRecordingVoice
                ? language === 'fa'
                  ? 'در حال گوش دادن... صحبت کنید...'
                  : 'Listening... speak clearly...'
                : language === 'fa'
                ? 'پیام، ایده یا دستورت را بنویس یا بگو...'
                : 'Message Elliot, paste code or talk...'
            }
            rows={1}
            dir="auto"
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm font-mono outline-none resize-none px-2 py-1.5 leading-relaxed max-h-32"
          />

          {/* Send / Stop execution button */}
          {isExecuting ? (
            <button
              onClick={onStopExecution}
              className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] transition cursor-pointer flex-shrink-0"
              title="Stop execution"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={`p-2.5 rounded-2xl transition cursor-pointer flex-shrink-0 ${
                input.trim()
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Voice Status Notice */}
        {voiceNotice && (
          <div className="mt-1.5 text-[10px] font-mono text-emerald-400/90 flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{voiceNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
}
