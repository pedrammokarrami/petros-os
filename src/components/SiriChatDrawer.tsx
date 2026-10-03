import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import {
  X,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  Trash2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onClear: () => void;
  onSpeakMessage: (text: string) => void;
  language?: string;
  isSpeaking?: boolean;
}

export function SiriChatDrawer({
  isOpen,
  onClose,
  messages,
  onClear,
  onSpeakMessage,
  language = 'fa',
  isSpeaking = false,
}: Props) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isFa = language === 'fa';

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xl animate-fade-in pointer-events-auto select-none">
      {/* Liquid Glass Apple Siri Container */}
      <div className="w-full max-w-2xl h-[85vh] max-h-[780px] rounded-[32px] bg-[#0c101a]/85 border border-white/15 backdrop-blur-3xl shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative">
        {/* Specular Glow Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-purple-600 p-[1.5px] shadow-[0_0_16px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#080b12] rounded-[14px] flex items-center justify-center text-cyan-300">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-sans tracking-wide">
                {isFa ? 'تاریخچه مکالمات سیری' : 'Siri Interaction History'}
              </h3>
              <p className="text-[11px] text-white/50 font-mono">
                {messages.length} {isFa ? 'پیام ثبت شده' : 'messages logged'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={onClear}
                className="p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                title={isFa ? 'پاک‌سازی تاریخچه' : 'Clear History'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div
          ref={scrollRef}
          className="flex-1 p-5 overflow-y-auto space-y-4 select-text"
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
              <Sparkles className="w-8 h-8 mb-2 text-cyan-400/50 animate-pulse" />
              <p className="text-sm font-sans">
                {isFa ? 'هیچ پیامی هنوز ثبت نشده است.' : 'No interaction messages yet.'}
              </p>
              <p className="text-xs text-white/30 mt-1">
                {isFa
                  ? 'روی دکمه مرکزی سیری کلیک کرده و صحبت کنید.'
                  : 'Tap the center Siri orb and speak.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user' || msg.sender === 'user';
              const textContent = msg.content || msg.text || '';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-cyan-600/25 border border-cyan-400/30 text-cyan-50'
                        : 'bg-white/[0.06] border border-white/10 text-white/90 shadow-md'
                    }`}
                  >
                    <div className="markdown-body">
                      <ReactMarkdown>{textContent}</ReactMarkdown>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/10 text-white/40 text-[10px]">
                      <button
                        onClick={() => handleCopy(msg.id, textContent)}
                        className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                        title={isFa ? 'کپی متن' : 'Copy Text'}
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? (isFa ? 'کپی شد' : 'Copied') : ''}</span>
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => onSpeakMessage(textContent)}
                          className="hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                          title={isFa ? 'پخش صوتی' : 'Speak Text'}
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/40">
          <span>{isFa ? 'سیری نسخه طراحی مجدد موشن' : 'Siri Reimagined Motion Edition'}</span>
          <span className="font-mono text-[11px] text-cyan-400">GEMINI AI POWERED</span>
        </div>
      </div>
    </div>
  );
}
