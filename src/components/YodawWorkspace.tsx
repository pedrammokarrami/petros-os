
const formatChatMessageContent = (text: string) => {
  if (!text) return null;
  const match = text.match(/(https:\/\/image\.pollinations\.ai\/prompt\/[^\s\)\"\']+|https:\/\/[^\s\)\"\']+\.(?:png|jpg|jpeg|webp)[^\s\)\"\']*)/i);
  
  if (match) {
    const url = match[0];
    const cleanText = text.replace(url, "").replace(/!\[.*?\]\(.*?\)/g, "").trim();
    return (
      <div className="flex flex-col gap-2.5 w-full">
        {cleanText && <p className="whitespace-pre-wrap leading-relaxed">{cleanText}</p>}
        <div className="mt-2 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/75 relative group">
          <img 
            src={url} 
            alt="AI Output" 
            className="w-full max-h-[460px] object-cover rounded-xl transition-all duration-300 group-hover:scale-[1.01]" 
            loading="lazy" 
          />
          <div className="p-3 bg-black/85 backdrop-blur-md flex items-center justify-between text-xs text-white border-t border-white/10">
            <span className="text-cyan-400 font-medium">✨ موتور تصویرساز Flux.1 Cinema</span>
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer" 
              download="yodaw_art.jpg" 
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              دانلود با کیفیت اصلی HD ⬇️
            </a>
          </div>
        </div>
      </div>
    );
  }
  return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
};


const renderAiMediaContent = (rawText: string) => {
  if (!rawText) return null;
  const match = rawText.match(/(https:\/\/image\.pollinations\.ai\/prompt\/[^\s\)\"\']+|https:\/\/[^\s\)\"\']+\.(?:png|jpg|jpeg|webp)[^\s\)\"\']*)/i);
  
  if (match) {
    const imgUrl = match[0];
    const textOnly = rawText.replace(imgUrl, "").replace(/!\[.*?\]\(.*?\)/g, "").trim();
    return (
      <div className="flex flex-col gap-3 w-full">
        {textOnly && <div className="whitespace-pre-wrap">{textOnly}</div>}
        <div className="mt-2 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/70 relative group">
          <img 
            src={imgUrl} 
            alt="AI Generated" 
            className="w-full max-h-[500px] object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.01]" 
            loading="lazy" 
          />
          <div className="p-3 bg-black/85 backdrop-blur-md flex items-center justify-between text-xs text-white/90 border-t border-white/10">
            <span className="flex items-center gap-1.5 font-medium text-cyan-400">✨ موتور تصویرساز هوش مصنوعی Flux.1 Cinema</span>
            <a 
              href={imgUrl} 
              target="_blank" 
              rel="noreferrer" 
              download="yodaw_artwork.jpg" 
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              دانلود با کیفیت اصلی HD ⬇️
            </a>
          </div>
        </div>
      </div>
    );
  }
  return <div className="whitespace-pre-wrap">{rawText}</div>;
};


export function processUserPrompt(prompt: string): string {
  // ۱. اگر کاربر درخواست ساخت عکس داده باشد:
  if (prompt.includes("Image Generation Request") || prompt.toLowerCase().includes("image") || prompt.includes("عکس") || prompt.includes("تصویر")) {
    const cleanPrompt = prompt.replace(/\[.*?\]/g, "").replace(/Art Style:.*?\n/g, "").replace(/Aspect Ratio:.*?\n/g, "").replace(/Prompt Description:/g, "").trim() || "3D crystal logo with light refraction on deep matte backdrop";
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;
    
    return `✨ **تصویر هوش مصنوعی با موفقیت تولید شد (موتور Flux.1 Cinema):**\n\n![${cleanPrompt}](${imageUrl})\n\n🔍 **پرامپت پردازش‌شده:** ${cleanPrompt}\n🎨 **استایل:** Cinematic 16:9 | **وضعیت:** لایو و بدون هزینه (Zero-Cost)`;
  }

  // ۲. اگر درخواست کدنویسی باشد:
  if (prompt.toLowerCase().includes("code") || prompt.includes("کد") || prompt.includes("برنامه")) {
    return `🚀 **دستیار کدنویسی YODAW آماده است:**\nدرخواست شما آنالیز شد. لطفاً زبان یا فریم‌ورک مد نظرتان را مشخص کنید تا کدهای استاندارد و پروداکشن را تولید کنم.`;
  }

  // ۳. چت عمومی و دستورات شل:
  return `🤖 **پاسخ YODAW:** پیام شما دریافت شد: "${prompt}". اتصال به روتر محلی و کانکتورهای سیستمی ۱۰۰٪ برقرار است. چه کاری برایتان انجام دهم؟`;
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Camera,
  Film,
  Globe,
  Code2,
  Send,
  Mic,
  Terminal,
  MonitorPlay,
  Wand2,
  FileCode,
  Square,
  Copy,
  Check,
  Zap,
  ChevronUp,
  ChevronDown,
  X,
  Paperclip,
  Bot,
  User,
  Maximize2,
  MessageSquare,
  ArrowRight,
  Menu,
  Play,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { AgentMode, Message, GmailMessageData } from '../types';
import { Language, translations } from '../utils/translations';
import { LiveEmailViewerModal } from './LiveEmailViewerModal';

// Formats message timestamp to a Persian / English readable date & time
function formatMessageDate(timestamp?: number, isFa = true): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  if (isFa) {
    try {
      const dayMonth = new Intl.DateTimeFormat('fa-IR', {
        day: 'numeric',
        month: 'long',
      }).format(date);
      const time = new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
      return `${dayMonth} • ${time}`;
    } catch {
      return '۱ مهر • ۱۲:۳۰';
    }
  } else {
    try {
      const dayMonth = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
      }).format(date);
      const time = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
      return `${dayMonth} • ${time}`;
    } catch {
      return 'Today • 12:30 PM';
    }
  }
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
  onOpenMenuDrawer?: () => void;
  onOpenSiriVoice?: () => void;
  isRecordingVoice?: boolean;
  inputText?: string;
  onInputTextChange?: (text: string) => void;
  language?: Language;
  onTogglePreview?: () => void;
  isPreviewOpen?: boolean;
  isTranslatingHistory?: boolean;
  onOpenFullCodgar?: () => void;
  onOpenQueue?: () => void;
  onOpenEmailModal?: (email?: GmailMessageData | null) => void;
}

export type YodawServiceType = 'image' | 'video' | 'html' | 'coding';

function CodeBlockWithCopy({
  children,
  onOpenTerminal,
  onOpenPreview,
  onOpenEditor,
  isFa = true,
}: {
  children: React.ReactNode;
  onOpenTerminal?: () => void;
  onOpenPreview?: () => void;
  onOpenEditor?: () => void;
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

  if (!isLargeCode) {
    return (
      <div className="relative my-1 overflow-hidden rounded-lg bg-slate-900/95 border border-white/15 text-sky-200 font-mono text-[10.5px] p-1.5" dir="ltr">
        <pre className="overflow-x-auto whitespace-pre-wrap">{children}</pre>
      </div>
    );
  }

  return (
    <div className="my-2 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm text-slate-100" dir={isFa ? 'rtl' : 'ltr'}>
      <div className="px-2.5 py-1.5 flex items-center justify-between gap-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-200">{isFa ? 'کد پروژه' : 'Code'}</span>
          <span className="text-[9.5px] font-mono text-slate-400 bg-white/5 px-1 rounded border border-white/10">
            {lineCount} {isFa ? 'خط' : 'lines'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0" dir="ltr">
          {onOpenPreview && (
            <button
              type="button"
              onClick={onOpenPreview}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[10.5px] font-medium transition cursor-pointer active:scale-95"
            >
              <MonitorPlay className="w-3 h-3" />
              <span>{isFa ? 'پیش‌نمایش' : 'Preview'}</span>
            </button>
          )}
          {onOpenTerminal && (
            <button
              type="button"
              onClick={onOpenTerminal}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-medium transition cursor-pointer active:scale-95"
            >
              <Terminal className="w-3 h-3" />
              <span>{isFa ? 'ترمینال' : 'Terminal'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer active:scale-95"
            title={isFa ? 'کپی کد' : 'Copy'}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => setShowInline(!showInline)}
            className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
            title={showInline ? (isFa ? 'بستن' : 'Hide') : (isFa ? 'مشاهده' : 'View')}
          >
            {showInline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>
      {showInline && (
        <div className="p-3 bg-[#070b14] max-h-64 overflow-y-auto border-t border-slate-800 text-[11px] font-mono text-sky-100 select-text" dir="ltr">
          <pre className="whitespace-pre-wrap">{children}</pre>
        </div>
      )}
    </div>
  );
}

function ProductNotificationCard({
  content,
  onOpenPreview,
  onOpenCodeDrawer,
  onOpenTerminal,
  isFa = true,
}: {
  content: string;
  onOpenPreview?: () => void;
  onOpenCodeDrawer?: () => void;
  onOpenTerminal?: () => void;
  isFa?: boolean;
}) {
  const isImage =
    content.includes('سفارش تولید عکس') ||
    content.includes('Image Engine') ||
    content.includes('تصویر هنری') ||
    content.includes('خلق تصویر');
  const isWebsite =
    content.includes('<!DOCTYPE html>') ||
    content.includes('```html') ||
    content.includes('سفارش وب‌سایت') ||
    content.includes('سند یکپارچه HTML5');
  const isCode =
    !isWebsite &&
    (content.includes('```') ||
      content.includes('سفارش کدزنی') ||
      content.includes('سرویس کدزنی پیشرفته'));
  const isVideo =
    content.includes('سفارش تولید فیلم') ||
    content.includes('Video Engine') ||
    content.includes('سناریوی ویدیو');

  if (!isImage && !isWebsite && !isCode && !isVideo) return null;

  return (
    <div className="mt-2.5 space-y-2">
      {isImage && (
        <div className="rounded-xl sm:rounded-2xl p-3 bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-white border border-rose-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-rose-900 leading-none">
                </h5>
                <span className="text-[10px] text-rose-600 font-sans">
                  {isFa ? 'تصویر با رزولوشن فوق‌العاده آماده شد' : 'Ultra high-res visual render ready'}
                </span>
              </div>
            </div>
            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">
              {isFa ? 'تکمیل شد' : 'Generated'}
            </span>
          </div>

          {/* Artistic Visual Preview Frame */}
          <div className="relative w-full h-24 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-tr from-slate-900 via-rose-950 to-indigo-950 border border-rose-200/60 flex items-center justify-center text-center p-3 shadow-inner group/art">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(244,63,94,0.35),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center gap-1.5 text-white">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover/art:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-rose-300" />
              </div>
              <span className="text-xs font-bold tracking-tight text-white drop-shadow-sm">
                {isFa ? 'پیش‌نمایش تصویر هنری یودا' : 'YODAW Artistic Visual Canvas'}
              </span>
              <span className="text-[10px] text-rose-200/80 font-mono">
                {isFa ? '۴K HDR • رندر سه‌بعدی کریستالی' : '4K HDR • Crystal Refraction'}
              </span>
            </div>
          </div>
        </div>
      )}

      {isWebsite && (
        <div className="rounded-xl sm:rounded-2xl p-3 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-white border border-teal-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-teal-950 leading-none">
                  {isFa ? 'وب‌سایت تعاملی آماده اجرا (HTML5 App)' : 'Interactive Web App Ready'}
                </h5>
                <span className="text-[10px] text-teal-700 font-sans">
                  {isFa ? 'طراحی ریسپانسیو با انیمیشن‌های روان' : 'Responsive HTML5 + Tailwind UI'}
                </span>
              </div>
            </div>
            {/* Action Buttons: Preview + Terminal */}
            <div className="flex items-center gap-1.5">
              {onOpenPreview && (
                <button
                  type="button"
                  onClick={onOpenPreview}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <MonitorPlay className="w-3.5 h-3.5" />
                  <span>{isFa ? 'پیش‌نمایش' : 'Preview'}</span>
                </button>
              )}
              {onOpenTerminal && (
                <button
                  type="button"
                  onClick={onOpenTerminal}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isFa ? 'ترمینال' : 'Terminal'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isCode && (
        <div className="rounded-xl sm:rounded-2xl p-3 bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-white border border-amber-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-amber-950 leading-none">
                  {isFa ? 'ماژول نرم‌افزاری کدنویسی‌شده' : 'Engineered Code Solution'}
                </h5>
                <span className="text-[10px] text-amber-700 font-sans">
                  {isFa ? 'کدهای بهینه‌سازی شده و قابل اجرا' : 'Clean & production-ready code'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onOpenPreview && (
                <button
                  type="button"
                  onClick={onOpenPreview}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                >
                  <MonitorPlay className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isFa ? 'پیش‌نمایش' : 'Preview'}</span>
                </button>
              )}
              {onOpenTerminal && (
                <button
                  type="button"
                  onClick={onOpenTerminal}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isFa ? 'ترمینال' : 'Terminal'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isVideo && (
        <div className="rounded-xl sm:rounded-2xl p-3 bg-gradient-to-br from-purple-50/90 via-indigo-50/70 to-white border border-purple-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Film className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-purple-950 leading-none">
                  {isFa ? 'استودیو ویدیو و موشن یودا' : 'YODAW Video Storyboard'}
                </h5>
                <span className="text-[10px] text-purple-700 font-sans">
                  {isFa ? 'سناریو و زمان‌بندی رندر ویدیویی تکمیل شد' : 'Shot list & camera motion synthesized'}
                </span>
              </div>
            </div>
            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
              {isFa ? 'آماده رندر' : 'Storyboard Ready'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function YodawWorkspace({
  messages,
  onSendMessage,
  isExecuting,
  onStopExecution,
  wasStopped,
  onContinueExecution,
  isOnline = true,
  taskIntent,
  onOpenCodeDrawer,
  onOpenTerminal,
  onOpenSettings,
  onOpenMenuDrawer,
  onOpenSiriVoice,
  isRecordingVoice = false,
  inputText = '',
  onInputTextChange,
  language = 'fa',
  onTogglePreview,
  isPreviewOpen,
  isTranslatingHistory,
  onOpenFullCodgar,
  onOpenQueue,
  onOpenEmailModal,
}: Props) {
  const isFa = language === 'fa';
  const t = translations[language] || translations.en;

  // Selected & Expanded Service state (opens on click)
  const [expandedService, setExpandedService] = useState<YodawServiceType | null>(null); // null);
  const [selectedService, setSelectedService] = useState<YodawServiceType | null>(null);
  const [servicePrompt, setServicePrompt] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Agent Chat Input & Attachment State
  const [localText, setLocalText] = useState<string>(inputText || '');
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize prompt textarea dynamically based on content
  const isMultiline = false; // Persistent single unified composer
  const isRTLText = isFa || /[\u0600-\u06FF]/.test(localText);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);

  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 3) {
      setHasScrollableContent(true);
      setScrollProgress(Math.min(1, Math.max(0, el.scrollTop / maxScroll)));
    } else {
      setHasScrollableContent(false);
      setScrollProgress(0);
    }
  };

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    if (!localText.includes('\n') && localText.length <= 55) {
      el.style.height = 'auto';
      setHasScrollableContent(false);
      return;
    }
    el.style.height = 'auto';
    const scHeight = el.scrollHeight;
    el.style.height = `${Math.min(Math.max(scHeight, 36), 140)}px`;
    const maxScroll = el.scrollHeight - el.clientHeight;
    setHasScrollableContent(maxScroll > 3);
  };

  // Keep in sync with parent inputText if controlled
  useEffect(() => {
    if (inputText !== undefined) {
      setLocalText(inputText);
    }
  }, [inputText]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [localText]);

  const handleInputChange = (val: string) => {
    setLocalText(val);
    onInputTextChange?.(val);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files).map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Check if user has started conversation (at least one user message or executing)
  const hasUserSentCommand = messages.some((m) => m.role === 'user');
  const [forceViewMode, setForceViewMode] = useState<'landing' | 'chat' | null>(null);
  const [areCompactBubblesOpen, setAreCompactBubblesOpen] = useState(!hasUserSentCommand);

  // Email Viewer Modal state
  const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false);
  const [selectedEmailForModal, setSelectedEmailForModal] = useState<GmailMessageData | null>(null);

  // Monitor message count to automatically collapse the 4 bubbles when the first command is sent,
  // and reopen them when starting a new fresh chat session
  const prevUserMsgCount = useRef(messages.filter((m) => m.role === 'user').length);
  useEffect(() => {
    const currentUserMsgCount = messages.filter((m) => m.role === 'user').length;
    if (prevUserMsgCount.current === 0 && currentUserMsgCount > 0) {
      // First user command has arrived: fold the 4 service bubbles into the bottom circular button
      setAreCompactBubblesOpen(false);
      setExpandedService(null);
    } else if (currentUserMsgCount === 0 && prevUserMsgCount.current > 0) {
      // Chat reset (New Chat): re-expand the 4 service bubbles on the first page
      setAreCompactBubblesOpen(true);
      setForceViewMode(null);
      setExpandedService(null);
    }
    prevUserMsgCount.current = currentUserMsgCount;
  }, [messages]);

  // Effective chat mode: active once user sends a command or when executing, unless manually toggled
  const isChatActive = forceViewMode !== null ? forceViewMode === 'chat' : (hasUserSentCommand || isExecuting);

  // Auto-scroll to bottom of chat & manual scroll detection
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (isChatActive) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isExecuting, isChatActive, areCompactBubblesOpen, expandedService]);

  const handleSendPrompt = (overrideText?: string) => {
    const textToSend = (overrideText !== undefined ? overrideText : localText).trim();
    if (!textToSend && attachedFiles.length === 0) return;
    if (isExecuting) return;

    setForceViewMode('chat');
    setAreCompactBubblesOpen(false);

    let payload = textToSend;
    if (attachedFiles.length > 0) {
      const fileList = attachedFiles.map((f) => `📎 ${f.name} (${f.size})`).join(', ');
      payload = payload
        ? `${payload}\n\n[${isFa ? 'فایل‌های پیوست' : 'Attached files'}: ${fileList}]`
        : `[${isFa ? 'فایل‌های پیوست' : 'Attached files'}: ${fileList}]`;
    }

    if (expandedService) {
      handleLaunchService(payload);
    } else {
      onSendMessage(payload);
    }

    setLocalText('');
    onInputTextChange?.('');
    setAttachedFiles([]);
  };

  // Sub-options for each service
  const [imageStyle, setImageStyle] = useState<'cinematic' | 'photorealistic' | '3d-render' | 'anime'>('cinematic');
  const [imageRatio, setImageRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  
  const [videoDuration, setVideoDuration] = useState<'5s' | '10s'>('5s');
  const [videoMotion, setVideoMotion] = useState<'drone' | 'orbital' | 'neon'>('drone');

  const [htmlTemplate, setHtmlTemplate] = useState<'landing' | 'portfolio' | 'dashboard'>('landing');
  const [codingStack, setCodingStack] = useState<'react' | 'typescript' | 'fullstack'>('react');

  // Service Definitions: 4 Standalone 3D Pastel Liquid Glass Soap Bubbles (No outer white container)
  const services = [
    {
      id: 'image' as YodawServiceType,
      simpleTitle: isFa ? 'ایمیج' : 'Image',
      title: isFa ? 'تولید عکس و تصویر' : 'Image Generation',
      desc: isFa
        ? 'خلق تصاویر هنری، رندرهای سه‌بعدی و فوتورئال با وضوح فوق‌العاده'
        : 'Photorealistic & artistic high-res image synthesis',
      // صورتی و رز پاستلی سه‌بعدی درخشان
      bubbleIdleBg: 'bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-300',
      bubbleShadow: 'shadow-[0_26px_56px_-8px_rgba(244,63,94,0.52),0_12px_24px_-4px_rgba(225,29,72,0.32),0_4px_12px_rgba(15,23,42,0.12)]',
      hoverShadow: 'hover:shadow-[0_34px_68px_-6px_rgba(244,63,94,0.65),0_16px_32px_-4px_rgba(225,29,72,0.4)]',
      activeGradient: 'from-rose-600 via-pink-500 to-rose-400',
      activeGlow: 'shadow-[0_0_42px_rgba(244,63,94,0.7),0_24px_50px_rgba(225,29,72,0.48)]',
      activeBorder: 'border-rose-200/60',
      innerOrbGradient: 'from-rose-500 via-pink-400 to-rose-200',
      innerOrbBorder: 'border-rose-200/90',
      innerOrbShadow: 'shadow-[0_8px_18px_rgba(244,63,94,0.4),inset_0_2px_4px_#fff]',
      idleRing: 'hover:border-pink-400/50 hover:shadow-[0_8px_22px_rgba(251,113,133,0.3)]',
      ringColor: 'ring-rose-300',
      titleColor: 'text-rose-600 dark:text-rose-400',
      badgeColor: 'bg-rose-500',
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="8.5" cy="8.5" r="1.8" fill="currentColor" />
          <path d="m21 15-5-5-11 11" />
        </svg>
      ),
      quickPlaceholder: isFa
        ? 'توصیف عکسی که مایلید خلق شود را بنویسید (مثلاً: لوگوی سه‌بعدی کریستالی با نور نئون)...'
        : 'Describe the image to generate (e.g. 3D crystal logo with neon refraction)...',
      suggestions: isFa
        ? [
            'لوگوی کریستالی سه‌بعدی با انکسار نور روی پس‌زمینه تیره',
            'پرتره سینمایی با نورپردازی استودیویی طلایی و عمق میدان بالا',
            'نمای هوایی از شهر آینده با معماری شیشه‌ای و خودروهای پرنده',
          ]
        : [
            '3D crystal logo with light refraction on deep matte backdrop',
            'Cinematic portrait with golden studio lighting & shallow depth',
            'Futuristic glass megacity skyline with ambient volumetric mist',
          ],
    },
    {
      id: 'video' as YodawServiceType,
      simpleTitle: isFa ? 'ویدیو' : 'Video',
      title: isFa ? 'تولید فیلم و موشن' : 'Video Generation',
      enTitle: 'Video AI',
      desc: isFa
        ? 'تولید ویدیوهای سینمایی چندثانیه‌ای، جلوه‌های ویژه و موشن‌های داینامیک'
        : 'Dynamic AI cinema shots and animated motion clips',
      // بنفش و اسطوخودوسی پاستلی سه‌بعدی
      bubbleIdleBg: 'bg-gradient-to-tr from-violet-500 via-purple-400 to-indigo-300',
      bubbleShadow: 'shadow-[0_26px_56px_-8px_rgba(168,85,247,0.52),0_12px_24px_-4px_rgba(147,51,234,0.32),0_4px_12px_rgba(15,23,42,0.12)]',
      hoverShadow: 'hover:shadow-[0_34px_68px_-6px_rgba(168,85,247,0.65),0_16px_32px_-4px_rgba(147,51,234,0.4)]',
      activeGradient: 'from-violet-600 via-purple-500 to-indigo-400',
      activeGlow: 'shadow-[0_0_42px_rgba(168,85,247,0.7),0_24px_50px_rgba(147,51,234,0.48)]',
      activeBorder: 'border-purple-200/60',
      innerOrbGradient: 'from-purple-500 via-violet-400 to-indigo-200',
      innerOrbBorder: 'border-purple-200/90',
      innerOrbShadow: 'shadow-[0_8px_18px_rgba(168,85,247,0.4),inset_0_2px_4px_#fff]',
      idleRing: 'hover:border-purple-400/50 hover:shadow-[0_8px_22px_rgba(192,132,252,0.3)]',
      ringColor: 'ring-purple-300',
      titleColor: 'text-purple-600 dark:text-purple-400',
      badgeColor: 'bg-violet-600',
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="4.5" width="13" height="15" rx="3.5" />
          <polygon points="15.5 10 21.5 6.5 21.5 17.5 15.5 14" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
          <circle cx="9" cy="12" r="2.5" strokeWidth="2" />
        </svg>
      ),
      quickPlaceholder: isFa
        ? 'سناریوی ویدیوی مورد نظرتان را شرح دهید (مثلاً: پرواز دوربین پهپاد بر فراز ساحل مدرن)...'
        : 'Describe the video scene you want to produce (e.g. camera flying through neon city)...',
      suggestions: isFa
        ? [
            'حرکت نرم دوربین پهپاد بر فراز ساحل صخره‌ای هنگام غروب آفتاب',
            'موشن گرافیک انفجار ذرات درخشان نئونی در یک محیط گرادیان',
            'تیزر سریع و هیجان‌انگیز معرفی یک محصول های‌تک لوکس',
          ]
        : [
            'Smooth cinematic drone shot over rocky ocean cliffs at golden hour',
            'Motion graphic glowing particle burst in dark glass environment',
            'Dynamic teaser reveal for an ultra-luxury tech concept product',
          ],
    },
    {
      id: 'html' as YodawServiceType,
      simpleTitle: isFa ? 'وب‌سایت' : 'Website',
      title: isFa ? 'تولید وب‌سایت اچ‌تی‌ام‌ال' : 'HTML Website Generator',
      enTitle: 'HTML5 Web',
      desc: isFa
        ? 'طراحی و ساخت آنی وب‌سایت‌های کامل ریسپانسیو با پیش‌نمایش زنده'
        : 'Instant responsive HTML5/Tailwind website creation with live sandbox',
      // سبز نعنایی و زمردی پاستلی سه‌بعدی
      bubbleIdleBg: 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300',
      bubbleShadow: 'shadow-[0_26px_56px_-8px_rgba(20,184,166,0.52),0_12px_24px_-4px_rgba(13,148,136,0.32),0_4px_12px_rgba(15,23,42,0.12)]',
      hoverShadow: 'hover:shadow-[0_34px_68px_-6px_rgba(20,184,166,0.65),0_16px_32px_-4px_rgba(13,148,136,0.4)]',
      activeGradient: 'from-emerald-600 via-teal-500 to-cyan-400',
      activeGlow: 'shadow-[0_0_42px_rgba(20,184,166,0.7),0_24px_50px_rgba(13,148,136,0.48)]',
      activeBorder: 'border-teal-200/60',
      innerOrbGradient: 'from-emerald-500 via-teal-400 to-teal-200',
      innerOrbBorder: 'border-teal-200/90',
      innerOrbShadow: 'shadow-[0_8px_18px_rgba(20,184,166,0.38),inset_0_2px_4px_#fff]',
      idleRing: 'hover:border-teal-400/50 hover:shadow-[0_8px_22px_rgba(45,212,191,0.3)]',
      ringColor: 'ring-teal-300',
      titleColor: 'text-teal-600 dark:text-teal-400',
      badgeColor: 'bg-teal-600',
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 2.5a14.5 14.5 0 0 0 0 19M12 2.5a14.5 14.5 0 0 1 0 19" />
          <path d="M2.5 12h19" strokeOpacity="0.4" />
        </svg>
      ),
      quickPlaceholder: isFa
        ? 'چه سایتی بسازیم؟ (مثلاً: یک وب‌سایت هتل لوکس ۵ ستاره با افکت‌های گلس)...'
        : 'What website should we build? (e.g. luxury personal portfolio with glassmorphism)...',
      suggestions: isFa
        ? [
            'صفحه فرود یک هتل لوکس ۵ ستاره با انیمیشن‌های شیشه‌ای و رزرو آنلاین',
            'پورتفولیو شخصی مینیمال برای طراح محصول با تم دارک و کارت‌های شیشه‌ای',
            'داشبورد تحلیلی فروش با نمودارهای تعاملی و کارت‌های آماری مدرن',
          ]
        : [
            'Luxury 5-star boutique hotel landing page with booking drawer & glass cards',
            'Minimalist product designer portfolio with clean typography & interactions',
            'SaaS analytics dashboard with KPI cards and interactive charts',
          ],
    },
    {
      id: 'coding' as YodawServiceType,
      simpleTitle: isFa ? 'کدینگ' : 'Coding',
      title: isFa ? 'سرویس کدزنی و توسعه' : 'Coding Service',
      enTitle: 'Coding Engine',
      desc: isFa
        ? 'برنامه‌نویسی پیشرفته، ساخت نرم‌افزار کامل و دیباگ هوشمند'
        : 'Autonomous full-stack coding, bug fixing & live execution',
      // زرد کهربایی و طلایی پاستلی سه‌بعدی
      bubbleIdleBg: 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300',
      bubbleShadow: 'shadow-[0_26px_56px_-8px_rgba(245,158,11,0.52),0_12px_24px_-4px_rgba(217,119,6,0.32),0_4px_12px_rgba(15,23,42,0.12)]',
      hoverShadow: 'hover:shadow-[0_34px_68px_-6px_rgba(245,158,11,0.65),0_16px_32px_-4px_rgba(217,119,6,0.4)]',
      activeGradient: 'from-amber-600 via-amber-500 to-yellow-400',
      activeGlow: 'shadow-[0_0_42px_rgba(245,158,11,0.7),0_24px_50px_rgba(217,119,6,0.48)]',
      activeBorder: 'border-amber-200/60',
      innerOrbGradient: 'from-amber-500 via-amber-400 to-yellow-100',
      innerOrbBorder: 'border-amber-200/90',
      innerOrbShadow: 'shadow-[0_8px_18px_rgba(245,158,11,0.45),inset_0_2px_4px_#fff]',
      idleRing: 'hover:border-amber-400/50 hover:shadow-[0_8px_22px_rgba(251,191,36,0.3)]',
      ringColor: 'ring-amber-300',
      titleColor: 'text-amber-600 dark:text-amber-400',
      badgeColor: 'bg-amber-600',
      icon: (
        <svg className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7.5 md:h-7.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
      quickPlaceholder: isFa
        ? 'دستور کدنویسی یا رفع باگ خود را بنویسید (مثلاً: ساخت ویجت نمودار آمار در ری‌اکت)...'
        : 'Enter coding instructions or bug to fix (e.g. build a financial chart component in React)...',
      suggestions: isFa
        ? [
            'ساخت یک ویجت نمودار سهام تعاملی با ری‌اکت و انیمیشن‌های روان',
            'طراحی فرم ورود شیشه‌ای لوکس با اعتبارسنجی زنده ایمیل و رمزعبور',
            'پیاده‌سازی یک تایمر معکوس پیشرفته با کنترل‌های صوتی و ریست',
          ]
        : [
            'Build an interactive financial chart widget with React and smooth tooltips',
            'Design a luxury glass login modal with real-time field validation',
            'Create an autonomous countdown timer with audio feedback & pause/resume',
          ],
    },
  ];

  const currentServiceObj = services.find((s) => s.id === (expandedService || selectedService)) || services[2];

  // Dispatch custom service prompt directly into YODAW AI engine
  const handleLaunchService = (overridePrompt?: string) => {
    const rawText = overridePrompt || servicePrompt.trim() || inputText.trim();
    if (!rawText) return;

    const currentSvc = expandedService || selectedService;
    let fullPrompt = rawText;
    if (currentSvc === 'image' || selectedService === 'image') {
      fullPrompt = isFa
        ? `[Image Generation Request]\nاستایل هنری: ${(typeof imageStyle !== "undefined" && imageStyle ? imageStyle : "Cinematic")}\nنسبت تصویر: ${(typeof imageRatio !== "undefined" && imageRatio ? imageRatio : "16:9")}\nشرح درخواست: ${rawText}`
        : `[Image Generation Request]\nArt Style: ${(typeof imageStyle !== "undefined" && imageStyle ? imageStyle : "Cinematic")}\nAspect Ratio: ${(typeof imageRatio !== "undefined" && imageRatio ? imageRatio : "16:9")}\nPrompt Description: ${rawText}`;
    } else if (currentSvc === 'video') {
      fullPrompt = isFa
        ? `[استودیو یودا - سفارش تولید فیلم و انیمیشن / YODAW Video Engine]\nمدت زمان: ${videoDuration}\nحرکت دوربین / موشن: ${videoMotion}\nسناریوی ویدیو: ${rawText}`
        : `[YODAW Studio - Video & Motion Request]\nDuration: ${videoDuration}\nCamera Motion: ${videoMotion}\nVideo Scenario: ${rawText}`;
    } else if (currentSvc === 'html') {
      fullPrompt = isFa
        ? `لطفاً برای این سفارش، یک وب‌سایت اچ‌تی‌ام‌ال کامل، زیبا، مدرن و با کلاس جهانی در یک سند یکپارچه HTML5 همراه با Tailwind CSS و انیمیشن‌های روان بساز تا بلافاصله در پیش‌نمایش سندباکس اجرا شود:\nدسته‌بندی: ${htmlTemplate}\nتوضیحات: ${rawText}`
        : `Please build a complete, world-class, responsive HTML5 website with Tailwind CSS and smooth animations in a standalone document that executes immediately in the live preview sandbox:\nCategory: ${htmlTemplate}\nRequirements: ${rawText}`;
    } else if (currentSvc === 'coding') {
      fullPrompt = isFa
        ? `به عنوان سرویس کدزنی پیشرفته یودا (استک: ${codingStack})، لطفاً این ماژول نرم‌افزاری را به طور کامل همراه با کدهای اجرایی بدون نقص پیاده‌سازی کن:\n${rawText}`
        : `As YODAW Pro Coding Engine (Stack: ${codingStack}), please implement this complete software module with pristine executable code:\n${rawText}`;
    }

    onSendMessage(fullPrompt, {
      mode: currentSvc === 'html' || currentSvc === 'coding' ? 'agent' : 'chat',
      approvedCoding: currentSvc === 'html' || currentSvc === 'coding',
    });

    setServicePrompt('');
    setExpandedService(null);
    if (onInputTextChange) onInputTextChange('');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Ultra-Smooth, gentle micro-floating bubble animations (calm, organic, natural floating)
  // Ultra-Smooth, organic floating bubble animations with lively horizontal drift & breathing scale
  const bubbleFloatingVariants = [
    // 0: Image (Top-Start / Row 1)
    {
      animate: {
        y: [0, -7, 4, -6, 2, 0],
        x: [0, 6, -5, 5, -3, 0],
        scale: [1, 1.045, 0.965, 1.035, 0.98, 1],
      },
      duration: 10.5,
    },
    // 1: Video (Top-End / Row 1)
    {
      animate: {
        y: [0, 6, -5, 7, -3, 0],
        x: [0, -6, 5, -5, 4, 0],
        scale: [1, 0.965, 1.045, 0.98, 1.035, 1],
      },
      duration: 11.2,
    },
    // 2: Website (Bottom-Start / Row 2)
    {
      animate: {
        y: [0, -6, 5, -5, 3, 0],
        x: [0, -5, 6, -4, 5, 0],
        scale: [1, 1.04, 0.97, 1.035, 0.985, 1],
      },
      duration: 10.8,
    },
    // 3: Coding (Bottom-End / Row 2)
    {
      animate: {
        y: [0, 7, -4, 6, -3, 0],
        x: [0, 5, -6, 4, -5, 0],
        scale: [1, 0.975, 1.04, 0.97, 1.03, 1],
      },
      duration: 11.8,
    },
  ];

  // Reusable Expandable Service Details Console (Rendered under large bubbles on Landing, or directly above the 4 compact bubbles during Chat)
  const renderServiceConsole = () => {
    if (!expandedService) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0, y: 8 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: 8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto my-1.5 shrink-0 overflow-hidden z-20 px-2 sm:px-0"
      >
        <div className="rounded-2xl sm:rounded-3xl bg-white/95 border border-sky-200/90 p-3 sm:p-4 shadow-[0_10px_35px_rgba(37,99,235,0.08)] backdrop-blur-2xl">
          {/* Header of Active Service */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-sky-100 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${currentServiceObj.activeGradient} text-white flex items-center justify-center shadow-xs`}>
                {currentServiceObj.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-none flex items-center gap-1.5">
                  <span>{currentServiceObj.title}</span>
                  <span className="text-[10px] text-blue-600 font-mono">({currentServiceObj.enTitle})</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans mt-0.5">
                  {currentServiceObj.desc}
                </p>
              </div>
            </div>

            {/* Quick Context Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentServiceObj.id === 'image' && (
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[10px] font-sans">
                  {(['cinematic', 'photorealistic', '3d-render', 'anime'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setImageStyle(style)}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                        (typeof imageStyle !== "undefined" && imageStyle ? imageStyle : "Cinematic") === style
                          ? 'bg-rose-500 text-white font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {style === 'cinematic' ? (isFa ? 'سینمایی' : 'Cinema') :
                       style === 'photorealistic' ? (isFa ? 'واقع‌گرا' : 'Photo') :
                       style === '3d-render' ? (isFa ? 'سه‌بعدی' : '3D') :
                       (isFa ? 'انیمه' : 'Anime')}
                    </button>
                  ))}
                </div>
              )}

              {currentServiceObj.id === 'video' && (
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[10px] font-sans">
                  {(['5s', '10s'] as const).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setVideoDuration(dur)}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                        videoDuration === dur
                          ? 'bg-violet-500 text-white font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {dur === '5s' ? (isFa ? '۵ ثانیه' : '5s') : (isFa ? '۱۰ ثانیه' : '10s')}
                    </button>
                  ))}
                </div>
              )}

              {currentServiceObj.id === 'html' && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[10px] font-sans">
                    {(['landing', 'portfolio', 'dashboard'] as const).map((tmpl) => (
                      <button
                        key={tmpl}
                        type="button"
                        onClick={() => setHtmlTemplate(tmpl)}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                          htmlTemplate === tmpl
                            ? 'bg-sky-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tmpl === 'landing' ? (isFa ? 'لندینگ‌پیج' : 'Landing') :
                         tmpl === 'portfolio' ? (isFa ? 'پورتفولیو' : 'Portfolio') :
                         (isFa ? 'داشبورد' : 'Dashboard')}
                      </button>
                    ))}
                  </div>

                  {onTogglePreview && (
                    <button
                      type="button"
                      onClick={onTogglePreview}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/90 text-[10.5px] font-semibold flex items-center gap-1 transition cursor-pointer active:scale-95"
                      title={isFa ? 'باز کردن سندباکس پیش‌نمایش زنده' : 'Open live preview sandbox'}
                    >
                      <MonitorPlay className="w-3.5 h-3.5 text-sky-600" />
                      <span>{isFa ? 'پیش‌نمایش زنده' : 'Live Preview'}</span>
                    </button>
                  )}
                </div>
              )}

              {currentServiceObj.id === 'coding' && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[10px] font-sans">
                    {(['react', 'typescript', 'fullstack'] as const).map((stk) => (
                      <button
                        key={stk}
                        type="button"
                        onClick={() => setCodingStack(stk)}
                        className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                          codingStack === stk
                            ? 'bg-amber-500 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {stk === 'react' ? 'React + TS' :
                         stk === 'typescript' ? 'TypeScript' :
                         (isFa ? 'فول‌استک' : 'Fullstack')}
                      </button>
                    ))}
                  </div>

                  {onOpenFullCodgar && (
                    <button
                      type="button"
                      onClick={onOpenFullCodgar}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                      title={isFa ? 'ورود به محیط کامل کدزنی کُدگر' : 'Open Full CODGAR Workspace'}
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-950" />
                      <span>{isFa ? 'محیط کامل کُدگر' : 'CODGAR'}</span>
                    </button>
                  )}

                  {onOpenTerminal && (
                    <button
                      type="button"
                      onClick={onOpenTerminal}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[10.5px] font-semibold flex items-center gap-1 transition cursor-pointer active:scale-95"
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isFa ? 'ترمینال' : 'Terminal'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Close / Collapse Button */}
              <button
                type="button"
                onClick={() => setExpandedService(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title={isFa ? 'بستن تنظیمات' : 'Close options'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Prompt Suggestions Bar */}
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[9.5px] text-slate-400 shrink-0 font-sans font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{isFa ? 'پیشنهاد:' : 'Quick:'}</span>
            </span>
            {currentServiceObj.suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setServicePrompt(sug);
                }}
                className="text-[10px] sm:text-[10.5px] px-2.5 py-1 rounded-full bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-blue-700 border border-slate-200/80 hover:border-sky-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Quick Service Input Console */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex-1 min-w-0 bg-slate-50/90 focus-within:bg-white rounded-xl sm:rounded-2xl border border-sky-200/70 focus-within:border-sky-400 p-1.5 sm:p-2 transition-all shadow-inner">
              <input onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); handleSendPrompt(); }
                    }} 
                type="text"
                value={servicePrompt}
                onChange={(e) => setServicePrompt(e.target.value)}
                
                placeholder={currentServiceObj.quickPlaceholder}
                className="w-full bg-transparent outline-none text-xs sm:text-sm font-sans font-medium text-slate-800 placeholder:text-slate-400 placeholder:text-[11.5px] sm:placeholder:text-xs"
                dir={isFa ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Launch / Send Button */}
            <button
              type="button"
              onClick={() => handleLaunchService()}
              disabled={!servicePrompt.trim() && !inputText.trim()}
              className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 transition cursor-pointer active:scale-95 shrink-0"
            >
              <span>{isFa ? 'اجرا در یودا' : 'Launch in YODAW'}</span>
              <Send className={`w-3.5 h-3.5 ${isFa ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="flex-1 min-h-0 w-full h-full flex flex-col justify-between p-1 sm:p-2.5 relative select-none overflow-hidden"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Scrollable Middle View Container: Holds 4 Large Landing Bubbles OR Chat Messages */}
      <div ref={mainScrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full relative">
        {/* 1. Ultra Clean & Compact Intro Card from Yoda (Matches normal chat card style) */}
        {!isChatActive && (
          <motion.div
            key="yoda-intro-card"
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="w-full max-w-md sm:max-w-lg mx-auto mt-6 sm:mt-10 md:mt-14 mb-3 px-3 sm:px-4 shrink-0"
          >
            {hasUserSentCommand && (
              <div className="flex justify-center mb-2.5">
                <button
                  type="button"
                  onClick={() => setForceViewMode('chat')}
                  className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isFa ? 'بازگشت به گفتگوی چت یودا' : 'Back to YODAW Chat'}</span>
                </button>
              </div>
            )}

            <div
              className="bg-gradient-to-br from-white/92 via-sky-50/78 to-blue-50/65 backdrop-blur-3xl border border-white/90 text-slate-800 p-3.5 sm:p-4 rounded-[22px] sm:rounded-[26px] shadow-[0_10px_35px_rgba(37,99,235,0.07),0_2px_8px_rgba(15,23,42,0.03),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(37,99,235,0.04)] transition relative group w-full text-start"
              dir={isFa ? 'rtl' : 'ltr'}
            >
              {/* Top Specular Liquid Glass Highlight Refraction */}
              <div className="absolute top-0 inset-x-8 sm:inset-x-14 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none rounded-full" />

              {/* Top Identity Header Row with 3D Bot Avatar & Yoda Title + v4.0 (Clean, No Clutter, No Online status) */}
              <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-sky-100/70 relative z-10">
                {/* Signature Deep Blue 3D Round Bot Icon with 3 Micro Dots */}
                <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex flex-col items-center justify-center text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] shrink-0 select-none pt-0.5 border border-white/90">
                  <Bot className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                  {/* 3 Signature Micro Fluid Dots: Pale Sky Blue, Pure White, Tangible Pink */}
                  <div className="flex items-center gap-0.5 pb-0.5 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#38bdf8] shadow-[0_0_2px_#38bdf8]" />
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_2px_#ffffff]" />
                    <span className="w-1 h-1 rounded-full bg-[#f472b6] shadow-[0_0_2px_#f472b6]" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 font-mono">
                    v4.0
                  </span>
                </div>
              </div>

              {/* Concise 1-2 lines Greetings Speech */}
              <div className="relative z-10 text-[13px] sm:text-[13.5px] leading-[1.75] text-slate-700 font-sans">
                {isFa ? (
                  <p>
                    سلام! من <strong className="text-blue-700 font-bold">یودا</strong> هستم. چطور می‌توانم در ساخت عکس، ویدیو، وب‌سایت یا کدنویسی کمکتان کنم؟
                  </p>
                ) : (
                  <p>
                    Hi! I am <strong className="text-blue-700 font-bold">YODAW</strong>. How can I help you today with images, videos, websites, or coding?
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Full Interactive Chat Screen (عین صفحه چت کدگر، با پاسخ‌های هوشمند یودا و نوتیفیکیشن محصولات) */}
        {isChatActive && (
          <motion.div
            key="chat-messages-container"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-3xl mx-auto px-1 sm:px-2.5 py-1 sm:py-2 space-y-2 sm:space-y-3"
          >
            {messages
              .filter((m) => m.id !== 'msg-welcome-yodaw')
              .map((m, idx, arr) => {
              const isUser = m.role === 'user';
              const textContent = m.content || m.text || '';
              const isYodaWelcome = false;

              return (
                <div
                  key={m.id}
                  className="flex flex-col items-start w-full animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  {isUser ? (
                    /* User Message: Sleek 3D Glass Bubble with dynamic width matching text length, seamless avatar flow, and no horizontal divider lines */
                    <div
                      className="bg-gradient-to-br from-blue-600/95 via-sky-600/92 to-indigo-700/95 text-white px-3.5 pt-3.5 pb-2.5 sm:px-4.5 sm:pt-4 sm:pb-3 rounded-[20px] sm:rounded-[24px] shadow-[0_8px_26px_rgba(37,99,235,0.22),0_2px_8px_rgba(15,23,42,0.06),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_6px_rgba(0,0,0,0.18)] border border-sky-300/40 backdrop-blur-2xl w-fit min-w-[120px] max-w-[96%] sm:max-w-[88%] transition relative group text-start"
                      dir={isFa ? 'rtl' : 'ltr'}
                    >
                      {/* Top Specular Liquid Glass Highlight Refraction */}
                      <div className="absolute top-0 inset-x-6 sm:inset-x-10 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none rounded-full" />

                      {/* User message row: Avatar + Text in natural harmony */}
                      <div className="flex items-start gap-2.5 relative z-10 pt-1">
                        {/* Round Pure White 3D Avatar with Blue User Icon */}
                        <div
                          className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.18)] shrink-0 select-none border border-white/95 mt-0.5"
                          title={isFa ? 'کیان' : 'Kian'}
                        >
                          <User className="w-3.5 h-3.5 text-blue-600 drop-shadow-xs stroke-[2.4]" />
                        </div>

                        {/* User Message Text Body */}
                        <div className="flex-1 min-w-0">
                          <p className="leading-[1.7] whitespace-pre-wrap select-text font-sans font-medium text-white text-[13px] sm:text-[13.5px] text-start">
                            {textContent}
                          </p>

                          {/* Subtle Date & Copy Action without divider lines */}
                          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-sky-100/70 select-none">
                            <span className="font-sans font-normal">{formatMessageDate(m.timestamp, isFa)}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(m.id, textContent)}
                              className="p-1 rounded-md text-sky-100/80 hover:text-white hover:bg-white/20 transition cursor-pointer flex items-center gap-1 active:scale-95"
                              title={isFa ? 'کپی متن پیام' : 'Copy message text'}
                            >
                              {copiedId === m.id ? (
                                <Check className="w-2.5 h-2.5 text-emerald-300" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Bot Message: Full-width luxurious 3D liquid glass card with clean header and bottom date/copy */
                    <div
                      className="bg-gradient-to-br from-white/92 via-sky-50/78 to-blue-50/65 backdrop-blur-3xl border border-white/90 text-slate-800 p-3.5 sm:p-4.5 rounded-[22px] sm:rounded-[26px] shadow-[0_10px_35px_rgba(37,99,235,0.07),0_2px_8px_rgba(15,23,42,0.03),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(37,99,235,0.04)] max-w-[98%] sm:max-w-[94%] transition relative group w-full"
                      dir={isFa ? 'rtl' : 'ltr'}
                    >
                      {/* Top Specular Liquid Glass Highlight Refraction */}
                      <div className="absolute top-0 inset-x-8 sm:inset-x-14 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none rounded-full" />

                      {/* Top Identity Header Row with 3D Bot Avatar & Title only (Clean, No Clutter) */}
                      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-sky-100/70 relative z-10">
                        {/* Signature Deep Blue 3D Round Bot Icon with 3 Micro Dots */}
                        <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex flex-col items-center justify-center text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] shrink-0 select-none pt-0.5 border border-white/90">
                          <Bot className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                          {/* 3 Signature Micro Fluid Dots: Pale Sky Blue, Pure White, Tangible Pink */}
                          <div className="flex items-center gap-0.5 pb-0.5 mt-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#38bdf8] shadow-[0_0_2px_#38bdf8]" title="Sky Blue" />
                            <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_2px_#ffffff]" title="White" />
                            <span className="w-1 h-1 rounded-full bg-[#f472b6] shadow-[0_0_2px_#f472b6]" title="Pink" />
                          </div>
                        </div>
                      </div>

                      {/* Full-Width Message Content Area */}
                      <div className="w-full min-w-0 relative z-10">
                        {/* Markdown Body Content with rich typography (Black code box omitted!) */}
                        {(() => {
                          const cleanTextContent = textContent.replace(/```[\s\S]*?```/g, '').trim();
                          if (!cleanTextContent) return null;
                          return (
                            <div className="text-[13px] sm:text-[14px] leading-[1.75] text-slate-800 select-text font-sans w-full text-right text-start mb-2">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <div className="mb-2.5 last:mb-0 text-slate-800 font-normal leading-[1.75] text-right text-start">
                                      {children}
                                    </div>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-bold text-slate-900">
                                      {children}
                                    </strong>
                                  ),
                                  h1: ({ children }) => (
                                    <h1 className="text-sm sm:text-base font-black text-slate-900 mt-3 mb-1.5 text-right text-start">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-[13.5px] sm:text-[15px] font-bold text-slate-900 mt-2.5 mb-1 text-right text-start">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-xs sm:text-[14px] font-bold text-slate-800 mt-2 mb-0.5 text-right text-start">
                                      {children}
                                    </h3>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc ps-5 space-y-1 my-2 text-slate-800 text-right text-start">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal ps-5 space-y-1 my-2 text-slate-800 text-right text-start">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="leading-[1.7] font-normal text-right text-start">{children}</li>
                                  ),
                                  pre: () => null,
                                  code({ className, children, ...props }: any) {
                                    if (!className && typeof children === 'string' && !children.includes('\n')) {
                                      return (
                                        <code className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-800 font-mono text-[11.5px] border border-sky-200/60 font-semibold mx-0.5">
                                          {children}
                                        </code>
                                      );
                                    }
                                    return null;
                                  },
                                }}
                              >
                                {cleanTextContent}
                              </ReactMarkdown>
                            </div>
                          );
                        })()}

                        {/* Interactive Gmail / Email Reader Card */}
                        {(m.emailData || (!isYodaWelcome && /صندوق ورودی جیمیل|Gmail MCP|آخرین ایمیل|Latest Email Received/i.test(textContent))) && (
                          <div className="mt-2.5 p-3 sm:p-4 rounded-2xl bg-gradient-to-tr from-sky-50/95 via-white/90 to-blue-50/90 border border-sky-200/90 shadow-sm text-slate-800" dir={isFa ? 'rtl' : 'ltr'}>
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-sky-100 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                                  <Mail className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-slate-900 leading-none">
                                    {isFa ? 'صندوق ورودی جیمیل (Gmail MCP)' : 'Gmail Inbox (MCP)'}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {m.emailData?.to || 'arminsh00@gmail.com'}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                {isFa ? 'نامه جدید' : 'New Email'}
                              </span>
                            </div>

                            {m.emailData && (
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                                  <span className="text-slate-500 font-normal">{isFa ? 'از:' : 'From:'}</span>
                                  <span>{m.emailData.fromName}</span>
                                  <span className="text-[10.5px] text-slate-400 font-mono">&lt;{m.emailData.from}&gt;</span>
                                </div>
                                <div className="font-bold text-xs sm:text-[13px] text-blue-900 pt-0.5">
                                  {m.emailData.subject}
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pt-1 bg-white/70 p-2 rounded-xl border border-sky-100/80">
                                  {m.emailData.snippet}
                                </p>
                              </div>
                            )}

                            <div className="mt-3 pt-2.5 border-t border-sky-100 flex items-center justify-between gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEmailForModal(m.emailData || null);
                                  setIsEmailViewerOpen(true);
                                  onOpenEmailModal?.(m.emailData || null);
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{isFa ? 'باز کردن و مشاهده کامل ایمیل' : 'Open & View Email'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => window.open('https://mail.google.com/', '_blank')}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{isFa ? 'مشاهده در Gmail' : 'Open in Gmail'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Product / Artifact Notification Card (نوتیفیکیشن و پیش‌نمایش محصول تولیدی) */}
                        {!isYodaWelcome && (
                          <ProductNotificationCard
                            content={textContent}
                            onOpenPreview={onTogglePreview}
                            onOpenCodeDrawer={onOpenCodeDrawer}
                            onOpenTerminal={onOpenTerminal}
                            isFa={isFa}
                          />
                        )}

                        {/* Bottom Footer Meta: Clean Date and Copy Action at the End of Yoda's Response */}
                        <div className="mt-2.5 pt-2 border-t border-sky-100/80 flex items-center justify-between text-[11px] text-slate-400 select-none relative z-10">
                          <span className="font-sans font-normal text-slate-500">{formatMessageDate(m.timestamp, isFa)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(m.id, textContent)}
                            className="px-2 py-0.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-sky-50 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium active:scale-95 border border-sky-100/60 shadow-2xs"
                            title={isFa ? 'کپی متن پاسخ' : 'Copy response'}
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600 font-semibold">{isFa ? 'کپی شد' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isFa ? 'کپی' : 'Copy'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Continue Task Button under the stopped response */}
                        {wasStopped && !isExecuting && onContinueExecution && idx === arr.length - 1 && (
                          <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between flex-wrap gap-2 relative z-10" dir={isFa ? 'rtl' : 'ltr'}>
                            <button
                              type="button"
                              onClick={onContinueExecution}
                              className="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs sm:text-[13px] shadow-[0_4px_16px_rgba(37,99,235,0.4),0_1.5px_0px_#1d4ed8,inset_0_1.5px_2px_rgba(255,255,255,0.7)] border border-sky-300/80 transition-all duration-200 cursor-pointer active:scale-95 active:translate-y-0.5 hover:shadow-[0_6px_22px_rgba(37,99,235,0.55)] select-none overflow-hidden"
                            >
                              <div className="absolute top-0 inset-x-2 h-[42%] rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none z-10" />
                              <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner relative z-20 group-hover:scale-110 transition-transform">
                                <Play className="w-2.5 h-2.5 fill-current ml-0.5 text-white" />
                              </div>
                              <span className="font-sans relative z-20 tracking-wide font-bold">
                                {isFa ? 'کانتینیو تسک' : 'Continue Task'}
                              </span>
                            </button>
                            <span className="text-[11px] text-rose-500/80 font-sans font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              {isFa ? 'دستور متوقف شد' : 'Task stopped'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Fallback Continue Task if stopped after user message */}
            {wasStopped && !isExecuting && onContinueExecution && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="flex items-center justify-start w-full my-2.5 animate-in fade-in" dir={isFa ? 'rtl' : 'ltr'}>
                <button
                  type="button"
                  onClick={onContinueExecution}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs sm:text-[13px] shadow-[0_4px_16px_rgba(37,99,235,0.4),0_1.5px_0px_#1d4ed8,inset_0_1.5px_2px_rgba(255,255,255,0.7)] border border-sky-300/80 transition-all duration-200 cursor-pointer active:scale-95 active:translate-y-0.5 hover:shadow-[0_6px_22px_rgba(37,99,235,0.55)] select-none overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-2 h-[42%] rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none z-10" />
                  <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner relative z-20 group-hover:scale-110 transition-transform">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5 text-white" />
                  </div>
                  <span className="font-sans relative z-20 tracking-wide font-bold">
                    {isFa ? 'کانتینیو تسک' : 'Continue Task'}
                  </span>
                </button>
              </div>
            )}

            {/* If Executing: Thinking / Generating Indicator with Delicate Pale Blue, White (bordered), Pink dots */}
            {isExecuting && (
              <div className="flex flex-col items-start w-full animate-in fade-in duration-200">
                <div
                  className="bg-gradient-to-br from-white/90 via-sky-50/80 to-blue-50/65 backdrop-blur-3xl border border-white/95 text-slate-800 rounded-2xl p-3 sm:p-4 shadow-[0_10px_32px_rgba(37,99,235,0.08),inset_0_2px_4px_rgba(255,255,255,0.95)] max-w-[94%] relative"
                  dir={isFa ? 'rtl' : 'ltr'}
                >
                  {/* Top Specular Glare */}
                  <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full" />

                  <div className="flex items-center gap-2.5 mb-2 relative z-10">
                    <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex flex-col items-center justify-center text-white shadow-2xs pt-0.5 border border-white/80">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                      <div className="flex items-center gap-0.5 pb-0.5 mt-0.5">
                        <span className="w-0.5 h-0.5 rounded-full bg-[#38bdf8]" />
                        <span className="w-0.5 h-0.5 rounded-full bg-white" />
                        <span className="w-0.5 h-0.5 rounded-full bg-[#f472b6]" />
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-blue-900">
                      {isFa ? 'یودا در حال تفکر و پردازش درخواست شماست...' : 'YODAW is processing your request...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-1 relative z-10">
                    {/* The 3 Signature Palette Micro Fluid Dots: Tightly clustered matching the main logo */}
                    <div className="flex items-center gap-1 shrink-0" dir="ltr">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8] animate-bounce" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-sky-300/80 shadow-[0_0_6px_rgba(255,255,255,1),0_1px_3px_rgba(15,23,42,0.15)] animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] shadow-[0_0_6px_#f472b6] animate-bounce [animation-delay:0.3s]" />
                    </div>
                    <span className="text-[11.5px] text-slate-500 font-sans">
                      {isFa ? 'تولید خروجی هوشمند اختصاصی' : 'Generating output...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-3" />
          </motion.div>
        )}
      </div>

      {/* 3. Luxury Floating Bottom Dock: Pinned firmly at bottom on ALL views (Service Console + Compact Bubbles + AI Prompt Bar + 4-Dot Button) */}
      <div className="w-full shrink-0 z-30 flex flex-col items-center justify-end relative pointer-events-auto mt-auto pt-1.5 pb-2.5 sm:pb-3.5 md:pb-4 bg-gradient-to-t from-sky-50/95 via-sky-50/60 to-transparent">
        {/* Scroll-to-Bottom Floating Button (Centered above dock when scrolled up) */}
        <AnimatePresence>
          {showScrollBottom && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.88 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
            >
              <button
                type="button"
                onClick={scrollToBottom}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white text-[11px] sm:text-xs font-bold shadow-[0_8px_24px_rgba(37,99,235,0.42),0_2px_8px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_28px_rgba(37,99,235,0.58)] active:scale-95 transition-all cursor-pointer border border-white/95 backdrop-blur-md group select-none"
                title={isFa ? 'انتقال سریع به انتهای پیام‌ها و کادر تایپ' : 'Scroll to bottom'}
              >
                <span>{isFa ? 'انتقال به انتهای پیام‌ها' : 'Scroll to bottom'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white animate-bounce group-hover:translate-y-0.5 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Subtle Atmospheric Glass Ambient Gradient Transition behind dock */}
        <div className="absolute -top-6 inset-x-0 h-6 bg-gradient-to-t from-sky-100/50 via-sky-50/20 to-transparent pointer-events-none -z-10" />

        {/* Expandable Service Console (Available in all views when opened) */}
        <AnimatePresence>
          {false && expandedService && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-2xl px-2 sm:px-4 mb-1.5"
            >
              {renderServiceConsole()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Compact 4-Bubbles Row (Pinned firmly above prompt bar when 4-dot button is toggled on any view) */}
        <AnimatePresence>
          {areCompactBubblesOpen && (
            <motion.div
              key="bottom-compact-bubbles"
              layout
              initial={{ opacity: 0, y: 16, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.88, transition: { duration: 0.2, ease: 'easeInOut' } }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto pt-1 pb-1 shrink-0 px-2 flex items-center justify-center gap-4 sm:gap-6 md:gap-8 z-20 mb-2 sm:mb-2.5"
            >
              {services.map((svc) => {
                const isSelected = (expandedService || selectedService) === svc.id;

                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(svc.id);
                      if (expandedService === svc.id) {
                        setExpandedService(null);
                      } else {
                        setExpandedService(svc.id);
                      }
                    }}
                    className={`relative w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full aspect-square p-1 transition-all duration-300 cursor-pointer active:scale-95 hover:scale-108 flex flex-col items-center justify-center gap-0.5 text-center group select-none overflow-hidden backdrop-blur-md ${
                      isSelected
                        ? `bg-gradient-to-tr ${svc.activeGradient} ${svc.activeGlow}`
                        : `${svc.bubbleIdleBg} ${svc.bubbleShadow}`
                    }`}
                    title={svc.title}
                  >
                    {/* 1. Primary Optical Soap Bubble Top Specular Reflection */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.4)_16%,rgba(255,255,255,0.06)_38%,transparent_68%)] pointer-events-none" />

                    {/* 2. Subsurface Optical Glass Internal Refraction */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_72%_82%,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.12)_22%,transparent_52%)] pointer-events-none" />

                    {/* 3. Volumetric 3D Spherical Soap Film Depth */}
                    <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_2px_5px_rgba(255,255,255,0.7),inset_0_-5px_10px_rgba(0,0,0,0.15),inset_0_0_6px_rgba(255,255,255,0.18)]" />

                    {/* Icon */}
                    <div className="scale-75 sm:scale-85 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] shrink-0 z-10">
                      {svc.icon}
                    </div>

                    {/* Minimalist Pure White Title with Balanced Font Size */}
                    <span
                      className="relative z-10 text-[8.5px] sm:text-[9.5px] md:text-[10px] font-black uppercase tracking-tight leading-none select-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] mt-0.5"
                      style={{
                        fontFamily: isFa
                          ? "'Vazirmatn', system-ui, -apple-system, sans-serif"
                          : "'Outfit', 'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {svc.simpleTitle}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Prompt Bar + Studio Menu (Left) + 4-Dot Playful Cluster (Right) */}
        <div
          className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto pt-1 pb-4 sm:pb-6 md:pb-7 shrink-0 px-2 sm:px-4 md:px-6 z-20 flex items-end justify-between gap-2.5 sm:gap-3.5 transition-all duration-300 mb-1"
          dir="ltr"
        >
          {/* 1. Far-Left: Studio Menu 3-Line Button (Pristine 3D Optical Glass Tactile finish) */}
          <button
            type="button"
            onClick={onOpenMenuDrawer}
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full aspect-square p-1 bg-gradient-to-b from-white/98 via-sky-50/92 to-blue-50/85 backdrop-blur-3xl border border-white/95 shadow-[0_10px_28px_rgba(37,99,235,0.18),0_2px_8px_rgba(15,23,42,0.06),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(37,99,235,0.06)] hover:shadow-[0_14px_34px_rgba(37,99,235,0.28),inset_0_2px_5px_#fff] active:scale-95 transition-all duration-300 cursor-pointer shrink-0 flex items-center justify-center overflow-hidden group select-none"
            title={isFa ? 'استودیو منو' : 'Studio Menu'}
          >
            {/* Top Specular Optical Glare */}
            <div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full z-20" />
            {/* Subsurface Internal Gloss */}
            <div className="absolute -top-2 inset-x-1/4 h-4 bg-white/60 blur-2xs pointer-events-none rounded-full z-10" />

            {/* Hamburger 3-Line Clean Icon with Blue Gradient Hover */}
            <div className="flex flex-col items-center justify-center gap-1 relative z-20">
              <span className="w-4 sm:w-4.5 h-[2px] rounded-full bg-slate-700 group-hover:bg-blue-600 transition-all duration-200 group-hover:w-5" />
              <span className="w-3.5 sm:w-4 h-[2px] rounded-full bg-slate-700 group-hover:bg-sky-500 transition-all duration-200 group-hover:w-3.5" />
              <span className="w-4 sm:w-4.5 h-[2px] rounded-full bg-slate-700 group-hover:bg-blue-600 transition-all duration-200 group-hover:w-5" />
            </div>
          </button>

          {/* 2. Center: Harmonious Prompt Input Container (Matches exact side-button height in single line, expands elegantly in multiline) */}
          <div className="flex-1 min-w-0">
          {/* Hidden File Input for Attachments */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Attached Files Preview Chips */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="flex items-center gap-1.5 flex-wrap mb-1.5 px-1.5"
                dir={isFa ? 'rtl' : 'ltr'}
              >
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-sky-200/90 shadow-2xs text-[10.5px] font-sans text-slate-700 backdrop-blur-md"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">{file.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">({file.size})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachedFile(file.id)}
                      className="p-0.5 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title={isFa ? 'حذف پیوست' : 'Remove attachment'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agent Composer Container */}
          {true ? (
            /* Single-Line Pill Mode: Compact, perfectly centered, matching exact side-button height */
            <div
              className="relative flex items-center rounded-full h-10 sm:h-11 px-2 sm:px-2.5 gap-1.5 bg-gradient-to-b from-white/96 via-white/88 to-sky-50/80 backdrop-blur-3xl border border-white/95 shadow-[0_10px_28px_rgba(37,99,235,0.11),0_2px_8px_rgba(15,23,42,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(37,99,235,0.06)] focus-within:border-sky-300 focus-within:shadow-[0_14px_36px_rgba(37,99,235,0.18),inset_0_2px_5px_rgba(255,255,255,1)] transition-all overflow-hidden"
              dir="ltr"
            >
              {/* Top Optical Specular Glare Highlight */}
              <div className="absolute top-0 inset-x-6 sm:inset-x-10 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full z-20" />
              {/* Subsurface Internal Gloss Bloom */}
              <div className="absolute -top-4 inset-x-1/4 h-6 bg-white/50 blur-xs pointer-events-none rounded-full z-10" />

              {/* File Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-slate-500 hover:text-blue-600 hover:bg-white/80 transition-all cursor-pointer active:scale-95 shrink-0 relative z-20 flex items-center justify-center"
                title={isFa ? 'الصاق فایل یا عکس' : 'Attach file or image'}
              >
                <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="sr-only">{isFa ? 'الصاق فایل' : 'Attach file'}</span>
              </button>

              {/* Single-line Textarea */}
              <div className="flex-1 min-w-0 relative z-20 py-0 flex items-center">
              {selectedService && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(null);
                  }}
                  title={selectedService}
                  className="relative group flex items-center justify-center w-7 h-7 mr-2 rounded-full cursor-pointer shrink-0 transition-transform duration-200 active:scale-90"
                  style={{
                    boxShadow: selectedService === 'image' ? '0 3px 10px rgba(244,63,94,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)' :
                               selectedService === 'video' ? '0 3px 10px rgba(139,92,246,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)' :
                               (selectedService === 'website' || selectedService === 'html') ? '0 3px 10px rgba(20,184,166,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)' :
                               '0 3px 10px rgba(245,158,11,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)'
                  }}
                >
                  {/* پس‌زمینه گرادیان غنی مایع */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: selectedService === 'image' ? 'radial-gradient(circle at 35% 25%, #ff85ad 0%, #f43f5e 55%, #9f1239 100%)' :
                                  selectedService === 'video' ? 'radial-gradient(circle at 35% 25%, #c4b5fd 0%, #8b5cf6 55%, #5b21b6 100%)' :
                                  (selectedService === 'website' || selectedService === 'html') ? 'radial-gradient(circle at 35% 25%, #5eead4 0%, #14b8a6 55%, #115e59 100%)' :
                                  'radial-gradient(circle at 35% 25%, #fde68a 0%, #f59e0b 55%, #92400e 100%)'
                    }}
                  />
                  {/* بازتاب نور شیشه‌ای سه‌بعدی روی حباب (3D Glass Highlight) */}
                  <div className="absolute top-[2px] left-[4px] w-[9px] h-[5px] rounded-full bg-white/70 blur-[0.4px] rotate-[-25deg] pointer-events-none" />

                  {/* آیکون مینیمال دقیق منطبق با مود */}
                  <div className="relative z-10 text-white flex items-center justify-center pointer-events-none">
                    {selectedService === 'image' && (
                      <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                    {selectedService === 'video' && (
                      <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    )}
                    {(selectedService === 'website' || selectedService === 'html') && (
                      <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                    )}
                    {selectedService === 'coding' && (
                      <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"/>
                        <polyline points="8 6 2 12 8 18"/>
                      </svg>
                    )}
                  </div>
                </div>
              )}
                <textarea onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); handleSendPrompt(); }
                    }} 
                  ref={textareaRef}
                  rows={1}
                  value={localText}
                  onChange={(e) => {
                    handleInputChange(e.target.value);
                    adjustTextareaHeight();
                  }}
                  
                  dir={isRTLText ? 'rtl' : 'ltr'}
                  placeholder={isFa ? '\u200Fنوشتن پیام...\u200F' : 'Type your message...\u200E'}
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-[13px] font-sans font-medium text-slate-800 placeholder:text-slate-400 placeholder:text-[11.5px] sm:placeholder:text-[12.5px] px-1 resize-none overflow-hidden py-0 leading-tight block scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={{
                    direction: isRTLText ? 'rtl' : 'ltr',
                    textAlign: isRTLText ? 'right' : 'left',
                  }}
                />
              </div>

              {/* Action Buttons: Voice + Execution / Send */}
              <div className="flex items-center gap-1 shrink-0 relative z-20">
                {onOpenSiriVoice && (
                  <button
                    type="button"
                    onClick={onOpenSiriVoice}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                      isRecordingVoice
                        ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/30'
                        : 'text-slate-500 hover:text-blue-600 hover:bg-white/80'
                    }`}
                    title={isFa ? 'دستور صوتی' : 'Voice command'}
                  >
                    <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}

                {isExecuting && onStopExecution ? (
                  <button
                    type="button"
                    onClick={onStopExecution}
                    className="h-7.5 sm:h-8.5 w-7.5 sm:w-8.5 rounded-full bg-gradient-to-b from-[#fb7185] via-[#f43f5e] to-[#e11d48] hover:from-[#f43f5e] hover:to-[#be123c] text-white border border-rose-300/80 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 active:translate-y-0.5 shadow-[0_4px_14px_rgba(244,63,94,0.45),0_1.5px_0px_#be123c,inset_0_1.5px_2px_rgba(255,255,255,0.75),inset_0_-2px_4px_rgba(190,18,60,0.3)] hover:shadow-[0_6px_18px_rgba(244,63,94,0.55),0_2px_0px_#be123c,inset_0_2px_2px_rgba(255,255,255,0.85)] shrink-0 relative overflow-hidden group select-none"
                    title={isFa ? 'توقف فرآیند' : 'Stop'}
                  >
                    {/* Top 3D Specular Liquid Glass Highlight */}
                    <div className="absolute top-0 inset-x-1 h-[42%] rounded-full bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none z-10" />
                    {/* Bottom Internal Light Refraction */}
                    <div className="absolute bottom-0 inset-x-1.5 h-[1px] bg-white/40 pointer-events-none z-10" />
                    <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] relative z-20 group-hover:scale-95 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendPrompt()}
                    disabled={!localText.trim() && attachedFiles.length === 0}
                    className={`h-7.5 sm:h-8.5 w-7.5 sm:w-8.5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 relative overflow-hidden ${
                      localText.trim() || attachedFiles.length > 0
                        ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.45),0_1.5px_0px_#1d4ed8,inset_0_1px_1px_rgba(255,255,255,0.7)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.55),0_2px_0px_#1d4ed8,inset_0_1px_1px_rgba(255,255,255,0.8)] active:translate-y-0.5 active:shadow-[0_1px_4px_rgba(37,99,235,0.4)] cursor-pointer'
                        : 'bg-gradient-to-b from-sky-50 to-sky-100/90 text-sky-400 border border-sky-200/60 shadow-[0_2px_6px_rgba(37,99,235,0.06),inset_0_1px_0px_#fff] cursor-not-allowed'
                    }`}
                    title={isFa ? 'ارسال پیام به یودا' : 'Send message to YODAW'}
                  >
                    <div className="absolute top-0 inset-x-1 h-[40%] rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4] relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Multiline Composer: Luxury unified card where text spans full width to the right border, with scroll indicator on left above attach button */
            <div
              className="relative flex flex-col rounded-[22px] sm:rounded-[26px] p-2.5 sm:p-3 bg-gradient-to-b from-white/96 via-white/88 to-sky-50/80 backdrop-blur-3xl border border-white/95 shadow-[0_12px_36px_rgba(37,99,235,0.14),0_3px_12px_rgba(15,23,42,0.06),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-3px_6px_rgba(37,99,235,0.06)] focus-within:border-sky-300 focus-within:shadow-[0_16px_44px_rgba(37,99,235,0.2),inset_0_2px_5px_rgba(255,255,255,1)] transition-all overflow-hidden"
              dir="ltr"
            >
              {/* Top Optical Specular Glare Highlight */}
              <div className="absolute top-0 inset-x-8 sm:inset-x-14 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full z-20" />

              {/* 1. Main Text Writing Row: Left Scroll Track + Full-Width Textarea to Right Border */}
              <div className="w-full flex items-stretch gap-1.5 relative z-20 min-h-[46px]">
                {/* Left Scroll Indicator: Positioned on the left, directly above the paperclip button */}
                <div
                  className={`w-1.5 self-stretch my-0.5 rounded-full bg-slate-200/70 overflow-hidden relative shrink-0 transition-opacity duration-200 ${
                    hasScrollableContent ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{ minHeight: '34px' }}
                  title={isFa ? 'نشانگر اسکرول متن' : 'Scroll indicator'}
                >
                  <div
                    className="w-full rounded-full bg-gradient-to-b from-blue-500 to-sky-400 shadow-xs absolute left-0 transition-all duration-75"
                    style={{
                      height: '35%',
                      top: `${scrollProgress * 65}%`,
                    }}
                  />
                </div>

                {/* Multiline Textarea: Stretches all the way to the right border */}
                <div className="flex-1 min-w-0 py-0 flex items-start">
                  {selectedService && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(null);
                      }}
                      title={selectedService}
                      className="relative group flex items-center justify-center w-7 h-7 mr-2 rounded-full cursor-pointer shrink-0 transition-transform duration-200 active:scale-90 mt-0.5"
                      style={{
                        boxShadow: selectedService === 'image' ? '0 3px 10px rgba(244,63,94,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)' :
                                   selectedService === 'video' ? '0 3px 10px rgba(139,92,246,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)' :
                                   (selectedService === 'website' || selectedService === 'html') ? '0 3px 10px rgba(20,184,166,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)' :
                                   '0 3px 10px rgba(245,158,11,0.45), inset 0 -2px 4px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.7)'
                      }}
                    >
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: selectedService === 'image' ? 'radial-gradient(circle at 35% 25%, #ff85ad 0%, #f43f5e 55%, #9f1239 100%)' :
                                      selectedService === 'video' ? 'radial-gradient(circle at 35% 25%, #c4b5fd 0%, #8b5cf6 55%, #5b21b6 100%)' :
                                      (selectedService === 'website' || selectedService === 'html') ? 'radial-gradient(circle at 35% 25%, #5eead4 0%, #14b8a6 55%, #115e59 100%)' :
                                      'radial-gradient(circle at 35% 25%, #fde68a 0%, #f59e0b 55%, #92400e 100%)'
                        }}
                      />
                      <div className="absolute top-[2px] left-[4px] w-[9px] h-[5px] rounded-full bg-white/70 blur-[0.4px] rotate-[-25deg] pointer-events-none" />
                      <div className="relative z-10 text-white flex items-center justify-center pointer-events-none">
                        {(selectedService === 'website' || selectedService === 'html') && (
                          <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                          </svg>
                        )}
                        {selectedService === 'image' && (
                          <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        )}
                        {selectedService === 'video' && (
                          <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        )}
                        {selectedService === 'coding' && (
                          <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendPrompt();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendPrompt();
                      }
                    }}
                    value={localText}
                    onChange={(e) => {
                      handleInputChange(e.target.value);
                      adjustTextareaHeight();
                    }}
                    onScroll={handleTextareaScroll}
                    
                    dir={isRTLText ? 'rtl' : 'ltr'}
                    placeholder={isFa ? '\u200Fنوشتن پیام...\u200F' : 'Type your message...\u200E'}
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-[13.5px] font-sans font-medium text-slate-800 placeholder:text-slate-400 placeholder:text-[11.5px] sm:placeholder:text-[12.5px] px-1 resize-none overflow-y-auto max-h-[140px] leading-[1.65] py-0.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden block"
                    style={{
                      direction: isRTLText ? 'rtl' : 'ltr',
                      textAlign: isRTLText ? 'right' : 'left',
                    }}
                  />
                </div>
              </div>

              {/* 2. Bottom Action Bar: Paperclip under scroll indicator on left, Mic & Send on right */}
              <div className="w-full flex items-center justify-between pt-1.5 border-t border-sky-100/60 mt-1.5 z-20">
                {/* Bottom-Left: File Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-slate-500 hover:text-blue-600 hover:bg-white/80 transition-all cursor-pointer active:scale-95 shrink-0 flex items-center justify-center"
                  title={isFa ? 'الصاق فایل یا عکس' : 'Attach file or image'}
                >
                  <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="sr-only">{isFa ? 'الصاق فایل' : 'Attach file'}</span>
                </button>

                {/* Bottom-Right: Voice + Send Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenSiriVoice && (
                    <button
                      type="button"
                      onClick={onOpenSiriVoice}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                        isRecordingVoice
                          ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/30'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-white/80'
                      }`}
                      title={isFa ? 'دستور صوتی' : 'Voice command'}
                    >
                      <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}

                  {isExecuting && onStopExecution ? (
                    <button
                      type="button"
                      onClick={onStopExecution}
                      className="h-7.5 sm:h-8.5 w-7.5 sm:w-8.5 rounded-full bg-gradient-to-b from-[#fb7185] via-[#f43f5e] to-[#e11d48] hover:from-[#f43f5e] hover:to-[#be123c] text-white border border-rose-300/80 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 active:translate-y-0.5 shadow-[0_4px_14px_rgba(244,63,94,0.45),0_1.5px_0px_#be123c,inset_0_1.5px_2px_rgba(255,255,255,0.75),inset_0_-2px_4px_rgba(190,18,60,0.3)] hover:shadow-[0_6px_18px_rgba(244,63,94,0.55),0_2px_0px_#be123c,inset_0_2px_2px_rgba(255,255,255,0.85)] shrink-0 relative overflow-hidden group select-none"
                      title={isFa ? 'توقف فرآیند' : 'Stop'}
                    >
                      {/* Top 3D Specular Liquid Glass Highlight */}
                      <div className="absolute top-0 inset-x-1 h-[42%] rounded-full bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none z-10" />
                      {/* Bottom Internal Light Refraction */}
                      <div className="absolute bottom-0 inset-x-1.5 h-[1px] bg-white/40 pointer-events-none z-10" />
                      <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] relative z-20 group-hover:scale-95 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendPrompt()}
                      disabled={!localText.trim() && attachedFiles.length === 0}
                      className={`h-7.5 sm:h-8.5 w-7.5 sm:w-8.5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 relative overflow-hidden ${
                        localText.trim() || attachedFiles.length > 0
                          ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.45),0_1.5px_0px_#1d4ed8,inset_0_1px_1px_rgba(255,255,255,0.7)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.55),0_2px_0px_#1d4ed8,inset_0_1px_1px_rgba(255,255,255,0.8)] active:translate-y-0.5 active:shadow-[0_1px_4px_rgba(37,99,235,0.4)] cursor-pointer'
                          : 'bg-gradient-to-b from-sky-50 to-sky-100/90 text-sky-400 border border-sky-200/60 shadow-[0_2px_6px_rgba(37,99,235,0.06),inset_0_1px_0px_#fff] cursor-not-allowed'
                      }`}
                      title={isFa ? 'ارسال پیام به یودا' : 'Send message to YODAW'}
                    >
                      <div className="absolute top-0 inset-x-1 h-[40%] rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4] relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>

        {/* 3. Far-Right: Playful 4-Dot 3D Glass Cluster Button (Open AI Services) */}
        <button
          type="button"
          onClick={() => {
            const nextState = !areCompactBubblesOpen;
            setAreCompactBubblesOpen(nextState);
            if (!nextState) {
              setExpandedService(null);
            }
          }}
          className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full aspect-square p-1 bg-gradient-to-b from-white/96 via-sky-50/90 to-blue-50/80 backdrop-blur-3xl border border-white/95 shadow-[0_10px_28px_rgba(37,99,235,0.18),0_2px_8px_rgba(15,23,42,0.06),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(37,99,235,0.06)] hover:shadow-[0_14px_34px_rgba(37,99,235,0.28),inset_0_2px_5px_#fff] active:scale-95 transition-all duration-300 cursor-pointer shrink-0 flex items-center justify-center overflow-hidden group select-none ${
            areCompactBubblesOpen ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-sky-100/50 scale-105 shadow-[0_0_24px_rgba(56,189,248,0.5)]' : ''
          }`}
          title={
            areCompactBubblesOpen
              ? (isFa ? 'بستن سرویس‌ها' : 'Close services')
              : (isFa ? 'سرویس‌های هوشمند یودا (عکس، ویدیو، وب، کد)' : 'Open AI services (Image, Video, Web, Code)')
          }
        >
          {/* Top Specular Optical Glare */}
          <div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full z-20" />
          {/* Subsurface Internal Gloss */}
          <div className="absolute -top-2 inset-x-1/4 h-4 bg-white/60 blur-2xs pointer-events-none rounded-full z-10" />

          {/* 4 Playful Orbiting Micro-Spheres: Yellow (Image), Green (HTML), Purple (Video), Pink (Coding) */}
          <div className="relative w-6 h-6 flex items-center justify-center animate-playful-orbit group-hover:animate-playful-orbit-fast">
            {/* Dot 1: Yellow / Amber (Top) */}
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 shadow-[0_0_7px_#f59e0b,0_1px_2px_rgba(0,0,0,0.2)] border border-white/80 animate-playful-dot-1" />
            {/* Dot 2: Green / Emerald (Right) */}
            <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-200 shadow-[0_0_7px_#10b981,0_1px_2px_rgba(0,0,0,0.2)] border border-white/80 animate-playful-dot-2" />
            {/* Dot 3: Purple / Violet (Bottom) */}
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-tr from-purple-500 via-violet-400 to-indigo-200 shadow-[0_0_7px_#a855f7,0_1px_2px_rgba(0,0,0,0.2)] border border-white/80 animate-playful-dot-3" />
            {/* Dot 4: Pink / Rose (Left) */}
            <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-200 shadow-[0_0_7px_#f43f5e,0_1px_2px_rgba(0,0,0,0.2)] border border-white/80 animate-playful-dot-4" />
          </div>
        </button>
      </div>
      </div>

      {/* Live Email Viewer & Inbox Modal (Gmail MCP) */}
      <LiveEmailViewerModal
        isOpen={isEmailViewerOpen}
        onClose={() => setIsEmailViewerOpen(false)}
        language={language}
        initialEmail={selectedEmailForModal}
        onSendReplyPrompt={(replyPrompt) => {
          handleSendPrompt(replyPrompt);
        }}
      />
    </div>
  );
}
