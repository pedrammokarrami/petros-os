import { ImageMessageRenderer } from './ImageMessageRenderer';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentMode, Message, GmailMessageData } from '../types';
import {
  Send,
  Paperclip,
  Mic,
  Sparkles,
  Copy,
  Check,
  Bot,
  User,
  X,
  Terminal,
  Clock,
  Calendar,
  Code2,
  Cpu,
  Zap,
  MessageSquare,
  Sparkle,
  Layers,
  ArrowRight,
  MonitorPlay,
  CheckCircle2,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Square,
  Play,
  Mail,
  ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TranslationDict, Language, translations } from '../utils/translations';

function CodeBlockWithCopy({
  children,
  onOpenTerminal,
  onOpenPreview,
  isFa = true,
}: {
  children: React.ReactNode;
  onOpenTerminal?: () => void;
  onOpenPreview?: () => void;
  isFa?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showInline, setShowInline] = useState(false);

  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && node.props && node.props.children) {
      return extractText(node.props.children);
    }
    return '';
  };

  const rawCode = extractText(children).trim();
  const lineCount = rawCode ? rawCode.split('\n').length : 0;
  const isLargeCode = lineCount > 3;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rawCode) {
      navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If small inline snippet (1-3 lines)
  if (!isLargeCode) {
    return (
      <div className="relative group/code my-1 sm:my-1.5 overflow-hidden rounded-lg sm:rounded-xl bg-slate-900/90 border border-white/15 text-sky-100 font-mono text-[10.5px] sm:text-xs p-1.5 sm:p-2">
        <pre className="overflow-x-auto whitespace-pre-wrap">{children}</pre>
      </div>
    );
  }

  return (
    <div
      className="my-1.5 sm:my-2 rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800/90 shadow-sm transition-all text-slate-100"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Compact Minimal Header Strip */}
      <div className="px-2 py-1 sm:px-3 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Code2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold text-slate-200">
            {isFa ? 'کد پروژه' : 'Source Code'}
          </span>
          <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-400 bg-white/5 px-1 py-0.2 rounded border border-white/10">
            {lineCount} {isFa ? 'خط' : 'lines'}
          </span>
        </div>

        {/* Compact Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0 flex-wrap" dir="ltr">
          {onOpenPreview && (
            <button
              type="button"
              onClick={onOpenPreview}
              className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[10px] sm:text-xs font-medium transition cursor-pointer active:scale-95"
            >
              <MonitorPlay className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">{isFa ? 'پیش‌نمایش' : 'Preview'}</span>
            </button>
          )}

          {onOpenTerminal && (
            <button
              type="button"
              onClick={onOpenTerminal}
              className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-xs font-medium transition cursor-pointer active:scale-95"
            >
              <Terminal className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">{isFa ? 'ترمینال' : 'Terminal'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer active:scale-95"
            title={isFa ? 'کپی کد' : 'Copy Code'}
          >
            {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowInline(!showInline)}
            className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs transition cursor-pointer"
            title={showInline ? (isFa ? 'بستن کد' : 'Hide') : (isFa ? 'مشاهده کد' : 'View')}
          >
            {showInline ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Preview if user toggles */}
      {showInline && (
        <div className="p-3 bg-[#070b14] max-h-60 overflow-y-auto border-t border-slate-800 text-[11px] font-mono text-sky-100 select-text" dir="ltr">
          <pre className="whitespace-pre-wrap">{children}</pre>
        </div>
      )}
    </div>
  );
}

interface Props {
  messages: Message[];
  onSendMessage: (
    text: string,
    options?: { mode?: AgentMode; approvedCoding?: boolean; pendingCodingPrompt?: string } | AgentMode
  ) => void;
  isExecuting: boolean;
  onStopExecution?: () => void;
  wasStopped?: boolean;
  onContinueExecution?: () => void;
  isOnline?: boolean;
  taskIntent?: 'chat' | 'coding';
  onOpenCodeDrawer?: () => void;
  onOpenTerminal?: () => void;
  onOpenSettings?: () => void;
  onOpenSiriVoice?: () => void;
  isRecordingVoice?: boolean;
  inputText?: string;
  onInputTextChange?: (text: string) => void;
  isStreamingTyping?: boolean;
  streamingText?: string;
  t?: TranslationDict;
  language?: Language;
  onTogglePreview?: () => void;
  isPreviewOpen?: boolean;
  isTranslatingHistory?: boolean;
  onOpenEmailModal?: (email?: GmailMessageData) => void;
}

export function CodedAiChatCard({
  messages,
  onSendMessage,
  isExecuting,
  onStopExecution,
  wasStopped: propWasStopped,
  onContinueExecution,
  isOnline = true,
  taskIntent = 'chat',
  onOpenCodeDrawer,
  onOpenTerminal,
  onOpenSettings,
  onOpenSiriVoice,
  isRecordingVoice = false,
  inputText: controlledInputText,
  onInputTextChange,
  isStreamingTyping = false,
  streamingText = '',
  t: propT,
  language = 'en',
  onTogglePreview,
  isPreviewOpen = false,
  isTranslatingHistory = false,
  onOpenEmailModal,
}: Props) {
  const t = propT || translations[language] || translations.en;
  const isRTL = language === 'fa';
  const [internalInputText, setInternalInputText] = useState('');
  const inputText = controlledInputText !== undefined ? controlledInputText : internalInputText;
  const setInputText = onInputTextChange || setInternalInputText;

  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [internalWasStopped, setInternalWasStopped] = useState(false);
  const wasStopped = propWasStopped !== undefined ? propWasStopped : internalWasStopped;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const handleScroll = () => {
    if (!mainScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = mainScrollRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollBottom(isFarFromBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: mainScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Auto-resize textarea when text changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Default single-line height is 24px, auto-expands up to 160px when multi-line text is typed
      const newHeight = Math.min(Math.max(scrollHeight, 24), 160);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  // Auto-scroll to bottom on new messages or streaming typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isStreamingTyping]);

  const handleSend = () => {
    const prompt = inputText.trim();
    if (!prompt || isExecuting) return;

    setInternalWasStopped(false);
    onSendMessage(prompt);
    setInputText('');
    setAttachedFileName(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  };

  const handleStop = () => {
    if (onStopExecution) {
      onStopExecution();
    }
    setInternalWasStopped(true);
  };

  const handleContinue = () => {
    setInternalWasStopped(false);
    if (onContinueExecution) {
      onContinueExecution();
    } else {
      onSendMessage(
        language === 'fa'
          ? 'لطفاً ادامه پاسخ قبلی را بنویس و تولید پروژه را از همان‌جا ادامه بده.'
          : 'Please continue where you left off.',
        { mode: 'agent' }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      const prefix = inputText ? `${inputText} ` : '';
      setInputText(`${prefix}[File: ${file.name}]`);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      id="grok-chat-container"
      layout="position"
      initial={false}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 260,
          damping: 25,
          mass: 0.9,
        },
        duration: 0.45,
      }}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform, height',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'subpixel-antialiased',
      }}
      className="w-full max-w-full md:max-w-[98%] xl:max-w-[1380px] rounded-2xl sm:rounded-[28px] md:rounded-[32px] ice-glass-window select-none relative z-30 mx-auto border border-white/85 backdrop-blur-3xl flex flex-col justify-between transform-gpu transition-all duration-300 shadow-[0_15px_60px_rgba(37,99,235,0.14)] h-full flex-1 max-h-[920px] min-h-0 p-2 sm:p-4 md:p-6"
    >
      {/* Translation in Progress Indicator Floating Pill */}
      {isTranslatingHistory && (
        <div className="flex items-center justify-center pb-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold animate-pulse shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>
              {language === 'fa'
                ? 'در حال ترجمه تاریخچه گفتگو...'
                : language === 'es'
                ? 'Traduciendo historial de conversación...'
                : language === 'fr'
                ? 'Traduction de l\'historique...'
                : language === 'ru'
                ? 'Перевод истории сообщений...'
                : language === 'zh'
                ? '正在翻译历史对话...'
                : language === 'hi'
                ? 'बातचीत का इतिहास अनुवाद किया जा रहा है...'
                : language === 'pt'
                ? 'Traduzindo histórico da conversa...'
                : 'Translating chat history...'}
            </span>
          </div>
        </div>
      )}

      {/* 2. Scrollable 1-on-1 Chat Stream */}
      <div ref={mainScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto my-2 space-y-2.5 sm:space-y-3 pr-2 pl-1 select-text custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user' || msg.sender === 'user';
          const textContent = msg.content || msg.text || '';

          // In Persian/RTL: User message is on the RIGHT (attached to user's blue avatar), Agent message is on the LEFT
          // In English/LTR: User message is on the right, Agent is on the left
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser
                  ? isRTL
                    ? 'flex-row justify-start' // In RTL container: start is RIGHT edge, so avatar is on right, bubble is immediately next to it
                    : 'flex-row-reverse justify-start' // In LTR container: user on right
                  : isRTL
                  ? 'flex-row-reverse justify-start' // In RTL container: agent is on LEFT
                  : 'flex-row justify-start' // In LTR container: agent is on LEFT
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* User Avatar (Blue Glossy) */}
              {isUser && (
                <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-500 via-sky-400 to-blue-300 p-[1px] shadow-[0_2px_8px_rgba(59,130,246,0.18)] shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-[6px] sm:rounded-[10px] bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white border border-white/50">
                    <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-50" />
                  </div>
                </div>
              )}

              {/* Agent Avatar (Original Codgar Bot Icon with Animated Pulsing Green Online Indicator) */}
              {!isUser && (
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1px] sm:p-[1.5px] shadow-[0_2px_8px_rgba(37,99,235,0.18)]">
                    <div className="w-full h-full bg-white rounded-[6px] sm:rounded-[9px] flex items-center justify-center text-blue-600 shadow-inner">
                      <Bot className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600 drop-shadow-[0_1px_2px_rgba(37,99,235,0.25)]" />
                    </div>
                  </div>
                  {/* Glowing Pulsing Green Online Indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-1.5 w-1.5 sm:h-2.5 sm:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 bg-emerald-500 ring-1 sm:ring-1.5 ring-white shadow-xs" />
                  </span>
                </div>
              )}

              {/* Message Bubble - Luxury Liquid Glass Compact Proportions */}
              <div
                className={`relative group w-fit max-w-[90%] sm:max-w-[82%] rounded-[15px] sm:rounded-2xl p-2 sm:p-3 md:p-3.5 text-[11.5px] sm:text-[13.5px] leading-relaxed transition-all overflow-hidden ${
                  isUser
                    ? 'user-glass-bubble-3d text-white'
                    : 'ice-glass-card text-slate-800 shadow-sm border border-white/90'
                }`}
              >
                <div
                  className={`markdown-body w-full overflow-hidden font-sans select-text ${
                    isUser ? 'text-white font-medium' : 'text-slate-800'
                  }`}
                  dir="auto"
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <div
                          className="mb-1 sm:mb-1.5 last:mb-0 leading-relaxed font-sans text-[11.5px] sm:text-[13.5px] break-words overflow-wrap-anywhere dir-auto"
                          dir="auto"
                        >
                          {children}
                        </div>
                      ),
                      pre: ({ children }) => (
                        <CodeBlockWithCopy
                          onOpenTerminal={onOpenTerminal}
                          onOpenPreview={onTogglePreview}
                          isFa={isRTL}
                        >
                          {children}
                        </CodeBlockWithCopy>
                      ),
                      code: ({ inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isBlock = !inline && (match || (typeof children === 'string' && children.includes('\n')));

                        if (isBlock) {
                          return (
                            <code className="font-mono text-[10px] sm:text-xs text-sky-200 break-all block py-0.5 sm:py-1" {...props}>
                              {children}
                            </code>
                          );
                        }

                        return (
                          <code
                            className="px-1 sm:px-1.5 py-0.5 rounded bg-blue-100/95 text-blue-950 border border-blue-300/90 font-mono text-[10px] sm:text-xs dir-ltr inline-block mx-0.5 break-all font-bold shadow-2xs"
                            dir="ltr"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      ul: ({ children }) => (
                        <ul className="list-disc pr-3.5 sm:pr-4 my-1 sm:my-1.5 space-y-0.5 font-sans text-[11.5px] sm:text-[13.5px] dir-auto" dir="auto">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pr-3.5 sm:pr-4 my-1 sm:my-1.5 space-y-0.5 font-sans text-[11.5px] sm:text-[13.5px] dir-auto" dir="auto">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed dir-auto" dir="auto">
                          {children}
                        </li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="font-bold text-xs sm:text-sm my-1 sm:my-1.5 text-slate-900 border-b border-blue-200/60 pb-0.5 dir-auto" dir="auto">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-bold text-[11px] sm:text-xs my-0.5 sm:my-1 text-slate-900 dir-auto" dir="auto">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-semibold text-[10.5px] sm:text-xs my-0.5 text-slate-800 dir-auto" dir="auto">
                          {children}
                        </h3>
                      ),
                    }}
                  >
                    {textContent}
                  </ReactMarkdown>

                  {/* Interactive Gmail / Email Reader Card */}
                  {(msg.emailData || (!isUser && /صندوق ورودی جیمیل|Gmail MCP|آخرین ایمیل|Latest Email Received/i.test(textContent))) && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-tr from-sky-50/95 via-white/90 to-blue-50/90 border border-sky-200/90 shadow-2xs text-slate-800 select-none" dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-sky-100 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 leading-none">
                              {isRTL ? 'صندوق ورودی جیمیل (Gmail MCP)' : 'Gmail Inbox (MCP)'}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {msg.emailData?.to || 'arminsh00@gmail.com'}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          {isRTL ? 'نامه جدید' : 'New Email'}
                        </span>
                      </div>

                      {msg.emailData && (
                        <div className="space-y-1 text-xs select-text">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <span className="text-slate-500 font-normal">{isRTL ? 'از:' : 'From:'}</span>
                            <span>{msg.emailData.fromName}</span>
                            <span className="text-[10.5px] text-slate-400 font-mono">&lt;{msg.emailData.from}&gt;</span>
                          </div>
                          <div className="font-bold text-xs sm:text-[13px] text-blue-900 pt-0.5">
                            {msg.emailData.subject}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pt-1 bg-white/70 p-2 rounded-xl border border-sky-100/80">
                            {msg.emailData.snippet}
                          </p>
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-sky-100 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onOpenEmailModal?.(msg.emailData)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'باز کردن و مشاهده کامل ایمیل' : 'Open & View Email'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.open('https://mail.google.com/', '_blank')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{isRTL ? 'مشاهده در Gmail' : 'Open in Gmail'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Bar: Date, Timestamp with Inline Minimal Copy Icon - No Card, No Text */}
                <div
                  className={`mt-1 sm:mt-1.5 pt-0.5 sm:pt-1 flex items-center border-t ${
                    isUser ? 'border-white/20 text-blue-100' : 'border-blue-100/70 text-slate-400'
                  } text-[8px] sm:text-[9.5px] select-none`}
                >
                  <div className="flex items-center gap-1.5 font-sans font-medium">
                    <span className="tracking-tight opacity-90">
                      {(() => {
                        const date = new Date(msg.timestamp || Date.now());
                        if (isRTL) {
                          const dayMonth = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
                            day: 'numeric',
                            month: 'long',
                          }).format(date);
                          const time = new Intl.DateTimeFormat('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).format(date);
                          return `${dayMonth} ${time}`;
                        } else {
                          const day = date.getDate();
                          const month = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, {
                            month: 'long',
                          }).format(date);
                          const time = new Intl.DateTimeFormat('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).format(date);
                          return `${day} ${month} ${time}`;
                        }
                      })()}
                    </span>

                    {/* Inline Standalone Copy Icon Button - No box, no border, no text */}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, textContent)}
                      className={`p-0.5 rounded transition cursor-pointer active:scale-90 inline-flex items-center justify-center opacity-75 hover:opacity-100 ${
                        isUser
                          ? 'text-white hover:text-blue-100'
                          : 'text-slate-400 hover:text-blue-600'
                      }`}
                      title={isRTL ? 'کپی متن پاسخ' : 'Copy message'}
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 animate-in zoom-in-50" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Interactive Coding Mode & Continue Chat Options - Sleek, minimal capsule bar */}
                {!isUser && msg.id !== 'msg-welcome' && !/حیطه (انجام )?وظایف|خارج از تخصص|خارج از توان|outside (the )?scope of my duties|fuera del alcance de mis funciones|dépasse le cadre de mes fonctions|выходит за рамки моих обязанностей|超出了我的职责范围|कार्यक्षेत्र से बाहर|fora do escopo/i.test(textContent) && (() => {
                  const isCodeDelivered = Boolean(
                    msg.isCodingTask ||
                    msg.taskType === 'coding' ||
                    (textContent && (textContent.includes('```') || textContent.includes('کد پروژه') || textContent.includes('Terminal & Code Changes')))
                  );

                  return (
                    <div
                      className="mt-1.5 sm:mt-2.5 pt-1.5 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between gap-1.5 flex-wrap select-none"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        <span>
                          {language === 'fa'
                            ? (isCodeDelivered ? 'ادامه همکاری:' : 'انتخاب مسیر بعدی:')
                            : language === 'es'
                            ? 'Siguiente paso:'
                            : language === 'fr'
                            ? 'Étape suivante :'
                            : language === 'ru'
                            ? 'Следующий шаг:'
                            : language === 'zh'
                            ? '下一步：'
                            : language === 'hi'
                            ? 'अगला कदम:'
                            : language === 'pt'
                            ? 'Próximo passo:'
                            : 'Next Action:'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        {/* Option 1: Switch to Coding Mode - ONLY shown when code has NOT been delivered yet */}
                        {!isCodeDelivered && (
                          <button
                            type="button"
                            onClick={() => {
                              onSendMessage(
                                language === 'fa'
                                  ? 'تأیید است؛ لطفاً به حالت کدنویسی برو و این پروژه را بساز.'
                                  : language === 'es'
                                  ? 'Aprobado; por favor cambia al modo de programación y crea este proyecto.'
                                  : language === 'fr'
                                  ? 'Approuvé ; veuillez passer en mode programmation et créer ce projet.'
                                  : language === 'ru'
                                  ? 'Подтверждено; перейдите в режим кодирования и создайте этот проект.'
                                  : language === 'zh'
                                  ? '确认；请切换到编程模式并构建此项目。'
                                  : language === 'hi'
                                  ? 'स्वीकार है; कृपया कोडिंग मोड में जाएं और इस प्रोजेक्ट को बनाएं।'
                                  : language === 'pt'
                                  ? 'Aprovado; por favor alterne para o modo de programação e crie este projeto.'
                                  : 'Approved; please switch to coding mode and build this project.',
                                { approvedCoding: true, mode: 'agent', pendingCodingPrompt: msg.pendingCodingPrompt || textContent }
                              );
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-[10px] sm:text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer text-center"
                          >
                            <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>
                              {language === 'fa'
                                ? 'حالت کدنویسی'
                                : language === 'es'
                                ? 'Modo código'
                                : language === 'fr'
                                ? 'Mode codage'
                                : language === 'ru'
                                ? 'Режим кода'
                                : language === 'zh'
                                ? '进入编程'
                                : language === 'hi'
                                ? 'कोडिंग मोड'
                                : language === 'pt'
                                ? 'Modo código'
                                : 'Coding Mode'}
                            </span>
                          </button>
                        )}

                        {/* Option 2: Continue Conversation / Consultation - Always shown */}
                        <button
                          type="button"
                          onClick={() => {
                            onSendMessage(
                              language === 'fa'
                                ? 'فعلاً فقط در قالب گفتگوی متنی و بدون نوشتن کد، توضیحات و برنامه‌ریزی بیشتری ارائه بده.'
                                : language === 'es'
                                ? 'Por ahora, continúa en modo conversación y planifica más sin escribir código.'
                                : language === 'fr'
                                ? 'Pour l\'instant, continuez la discussion et la planification sans coder.'
                                : language === 'ru'
                                ? 'Пока продолжайте в режиме беседы и планирования без кода.'
                                : language === 'zh'
                                ? '暂时仅以文字对话形式继续，不要编写代码。'
                                : language === 'hi'
                                ? 'फिलहाल केवल बातचीत اور योजना जारी रखें।'
                                : language === 'pt'
                                ? 'Por enquanto continue apenas conversando.'
                                : 'Continue the conversation and planning without writing code.',
                              { approvedCoding: false, mode: 'chat' }
                            );
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[10px] sm:text-xs font-semibold transition active:scale-95 cursor-pointer shadow-2xs text-center"
                        >
                          <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                          <span>
                            {language === 'fa'
                              ? 'ادامه گفتگو'
                              : language === 'es'
                              ? 'Continuar conversación'
                              : language === 'fr'
                              ? 'Continuer discussion'
                              : language === 'ru'
                              ? 'Продолжить беседу'
                              : language === 'zh'
                              ? '继续对话'
                              : language === 'hi'
                              ? 'बातचीत जारी रखें'
                              : language === 'pt'
                              ? 'Continuar conversa'
                              : 'Continue Chat'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* In English LTR: User Avatar on Right */}
              {!isRTL && isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 via-sky-400 to-blue-300 p-[1px] shadow-[0_4px_12px_rgba(59,130,246,0.22)] shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white border border-white/50">
                    <User className="w-3.5 h-3.5 text-blue-50" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Streaming Typewriter Bubble */}
        {isStreamingTyping && (
          <div
            className={`flex items-start gap-2.5 ${isRTL ? 'justify-end' : 'justify-start'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {isRTL ? (
              <>
                <div className="order-2 relative shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1.5px] shadow-[0_2px_8px_rgba(37,99,235,0.2)]">
                    <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center text-blue-600 shadow-inner">
                      <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-1.5 ring-white shadow-xs" />
                  </span>
                </div>
                <div className="order-1 ice-glass-card text-slate-800 rounded-2xl p-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90 text-right">
                  <p className="whitespace-pre-line font-sans leading-relaxed">
                    {streamingText}
                    <span className="inline-block w-1.5 h-3.5 bg-blue-500 mr-1 animate-pulse align-middle" />
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1.5px] shadow-[0_2px_8px_rgba(37,99,235,0.2)]">
                    <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center text-blue-600 shadow-inner">
                      <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-1.5 ring-white shadow-xs" />
                  </span>
                </div>
                <div className="ice-glass-card text-slate-800 rounded-2xl p-3 text-xs sm:text-sm max-w-[88%] sm:max-w-[78%] shadow-sm border border-white/90">
                  <p className="whitespace-pre-line font-sans leading-relaxed">
                    {streamingText}
                    <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse align-middle" />
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Active Thinking Indicator State - Minimal Borderless & Smaller Subtle Animated Dots */}
        {isExecuting && !isStreamingTyping && (
          <div
            className={`flex items-center gap-2 ${isRTL ? 'justify-end' : 'justify-start'} py-1 animate-fadeIn`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {isRTL ? (
              <>
                {/* Codgar Avatar */}
                <div className="order-2 w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1px] shadow-[0_2px_6px_rgba(37,99,235,0.18)] shrink-0">
                  <div className="w-full h-full bg-white rounded-[7px] sm:rounded-[10px] flex items-center justify-center text-blue-600 shadow-inner">
                    <Bot className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600 animate-pulse" />
                  </div>
                </div>

                {/* Minimal Borderless Thinking Display */}
                <div className="order-1 flex items-center gap-1.5 py-1 px-1.5 select-none">
                  {/* 3 Animated Fluid Merging Circles - Smaller (w-1.5 h-1.5) without bulky card */}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-fluid-circle-1" />
                    <span className="w-1.5 h-1.5 rounded-full animate-fluid-circle-2" />
                    <span className="w-1.5 h-1.5 rounded-full animate-fluid-circle-3" />
                  </div>

                  <span className="font-medium text-slate-500 text-[11px] sm:text-xs font-sans tracking-tight">
                    {language === 'fa'
                      ? 'کُدگر در حال اندیشیدن...'
                      : language === 'es'
                      ? 'Codgar está pensando...'
                      : language === 'fr'
                      ? 'Codgar réfléchit...'
                      : language === 'ru'
                      ? 'Codgar думает...'
                      : language === 'zh'
                      ? 'Codgar 正在思考...'
                      : language === 'hi'
                      ? 'Codgar सोच रहा है...'
                      : language === 'pt'
                      ? 'Codgar está pensando...'
                      : 'Codgar is thinking...'}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Codgar Avatar */}
                <div className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-500 p-[1px] shadow-[0_2px_6px_rgba(37,99,235,0.18)] shrink-0">
                  <div className="w-full h-full bg-white rounded-[7px] sm:rounded-[10px] flex items-center justify-center text-blue-600 shadow-inner">
                    <Bot className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600 animate-pulse" />
                  </div>
                </div>

                {/* Minimal Borderless Thinking Display */}
                <div className="flex items-center gap-1.5 py-1 px-1.5 select-none" dir="ltr">
                  <span className="font-medium text-slate-500 text-[11px] sm:text-xs font-sans tracking-tight">
                    {language === 'es'
                      ? 'Codgar is thinking...'
                      : language === 'fr'
                      ? 'Codgar réfléchit...'
                      : language === 'ru'
                      ? 'Codgar думает...'
                      : language === 'zh'
                      ? 'Codgar 正在思考...'
                      : language === 'hi'
                      ? 'Codgar सोच रहा है...'
                      : language === 'pt'
                      ? 'Codgar está pensando...'
                      : 'Codgar is thinking...'}
                  </span>

                  {/* 3 Animated Fluid Merging Circles */}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-fluid-circle-1" />
                    <span className="w-1.5 h-1.5 rounded-full animate-fluid-circle-2" />
                    <span className="w-1.5 h-1.5 rounded-full animate-fluid-circle-3" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached file chip if any */}
      {attachedFileName && !isExecuting && (
        <div
          className="mb-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-700 flex items-center justify-between gap-2 max-w-[580px] sm:max-w-[680px] w-full mx-auto shrink-0"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <span className="truncate font-mono">📎 {attachedFileName}</span>
          <button
            type="button"
            onClick={() => setAttachedFileName(null)}
            className="text-blue-500 hover:text-blue-800 transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Offline Status Warning Pill */}
      {!isOnline && (
        <div className="flex items-center justify-center mb-1 shrink-0 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] sm:text-[11px] font-bold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>
              {language === 'fa'
                ? 'آفلاین (کدها ذخیره شد)'
                : 'Offline (Progress saved)'}
            </span>
          </div>
        </div>
      )}

      {/* Continue Generating Pill - shown when stopped or offline recovery */}
      {(wasStopped || !isOnline) && !isExecuting && (
        <div className="flex items-center justify-center mb-1 shrink-0 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-blue-500/25 border border-white/60 transition-all active:scale-95 cursor-pointer hover:shadow-lg"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span>
              {language === 'fa'
                ? 'کانتینیو تسک'
                : language === 'es'
                ? 'Continuar'
                : language === 'fr'
                ? 'Continuer'
                : language === 'ru'
                ? 'Продолжить'
                : language === 'zh'
                ? '继续生成'
                : language === 'hi'
                ? 'जारी रखें'
                : language === 'pt'
                ? 'Continuar'
                : 'Continue'}
            </span>
          </button>
        </div>
      )}

      {/* Scroll-to-Bottom Floating Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <div className="flex justify-center w-full mb-1">
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={scrollToBottom}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white text-[11px] sm:text-xs font-bold shadow-[0_8px_24px_rgba(37,99,235,0.38),0_2px_8px_rgba(15,23,42,0.12)] hover:shadow-[0_10px_28px_rgba(37,99,235,0.52)] active:scale-95 transition-all cursor-pointer border border-white/90 backdrop-blur-md group select-none"
              title={isRTL ? 'انتقال سریع به انتهای پیام‌ها و کادر تایپ' : 'Scroll to bottom'}
            >
              <span>{isRTL ? 'انتقال به انتهای پیام‌ها' : 'Scroll to bottom'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white animate-bounce group-hover:translate-y-0.5 transition-transform" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Modern Floating Input Bar with Apple-Grade Precision & Auto-Layout */}
      <div
        className={`w-full mx-auto bg-white/95 backdrop-blur-2xl transition-all duration-300 border border-sky-200/70 shadow-[0_4px_24px_rgba(37,99,235,0.08)] shrink-0 relative focus-within:ring-2 focus-within:ring-blue-400/40 focus-within:border-blue-300 hover:border-sky-300 mt-1 ${
          inputText.includes('\n') || inputText.length > 55
            ? 'max-w-full sm:max-w-2xl md:max-w-3xl rounded-[18px] sm:rounded-[24px] p-1.5 sm:p-2.5 flex items-end gap-1 sm:gap-2'
            : 'max-w-full sm:max-w-[580px] md:max-w-[680px] rounded-full py-0.5 px-1 sm:py-1.5 sm:px-3 flex items-center gap-0.5 sm:gap-1.5'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50/70 transition flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
          title={t.attachFile}
        >
          <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Multi-line Auto-Expanding Textarea */}
        <div className="flex-1 min-w-0 py-0.5 px-1 flex items-center">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'fa'
                ? 'پیام به کُدگر...'
                : language === 'es'
                ? 'Mensaje para Codgar...'
                : language === 'fr'
                ? 'Message à Codgar...'
                : language === 'ru'
                ? 'Сообщение для Codgar...'
                : language === 'zh'
                ? '发送消息给 Codgar...'
                : language === 'hi'
                ? 'Codgar को संदेश लिखें...'
                : language === 'pt'
                ? 'Mensagem para o Codgar...'
                : 'Message Codgar...'
            }
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`w-full bg-transparent resize-none overflow-y-auto max-h-[120px] sm:max-h-[160px] min-h-[20px] sm:min-h-[24px] h-[20px] sm:h-[24px] text-xs sm:text-sm font-sans font-medium text-slate-800 placeholder:text-slate-400 placeholder:text-[11.5px] sm:placeholder:text-[13px] placeholder:font-normal outline-none transition-all custom-scrollbar leading-5 sm:leading-6 py-0 ${
              isRTL ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'
            }`}
          />
        </div>

        {/* Action Buttons Right/Left Side */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Voice / Siri Mic Button */}
          <button
            type="button"
            onClick={onOpenSiriVoice}
            className={`transition cursor-pointer flex items-center justify-center shrink-0 active:scale-95 ${
              isRecordingVoice
                ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-rose-400 text-white shadow-[0_0_12px_rgba(251,113,133,0.6)] animate-spin-slow'
                : 'w-7 h-7 sm:w-8 sm:h-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50/70 p-0.5'
            }`}
            title={t.liveVoice}
          >
            {isRecordingVoice ? (
              <div className="w-full h-full rounded-full flex items-center justify-center bg-black/20 backdrop-blur-xs">
                <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-pulse" />
              </div>
            ) : (
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Stop Button (Soft Coral-Rose 3D Glass) */}
          {isExecuting ? (
            <button
              type="button"
              onClick={handleStop}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#fb7185] via-[#f43f5e] to-[#e11d48] hover:from-[#f43f5e] hover:to-[#be123c] text-white border border-rose-300/80 shadow-[0_3px_10px_rgba(244,63,94,0.4),0_1px_0px_#be123c,inset_0_1.5px_2px_rgba(255,255,255,0.7)] flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 animate-pulse relative overflow-hidden select-none"
              title={language === 'fa' ? 'توقف عملیات (Stop)' : 'Stop generation'}
            >
              <div className="absolute top-0 inset-x-1 h-[40%] rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none z-10" />
              <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] relative z-20" />
            </button>
          ) : null}

          {/* Send Button (Blue Gradient) */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() && !attachedFileName}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-xs shadow-blue-500/25 transition cursor-pointer shrink-0 active:scale-95"
            title={t.sendMessage}
          >
            <Send className={`w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current transform ${isRTL ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
