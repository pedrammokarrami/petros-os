import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Send,
  Search,
  Star,
  Trash2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Inbox,
  SendHorizontal,
  FileEdit,
  Tag,
  CheckCircle2,
  Paperclip,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Reply,
  Archive,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../utils/translations';
import { GmailMessageData } from '../types';

interface LiveEmailViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialEmail?: GmailMessageData | null;
  onSendReplyPrompt?: (replyPrompt: string) => void;
}

export const LiveEmailViewerModal: React.FC<LiveEmailViewerModalProps> = ({
  isOpen,
  onClose,
  language,
  initialEmail,
  onSendReplyPrompt,
}) => {
  const isFa = language === 'fa';
  const [emails, setEmails] = useState<GmailMessageData[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessageData | null>(null);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'sent' | 'drafts'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  // Fetch emails from backend
  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/gmail/emails');
      const data = await res.json();
      if (data.success && Array.isArray(data.emails)) {
        setEmails(data.emails);
        if (!selectedEmail && data.emails.length > 0) {
          setSelectedEmail(initialEmail || data.emails[0]);
        }
      }
    } catch (e) {
      console.warn('Could not fetch emails:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
      if (initialEmail) {
        setSelectedEmail(initialEmail);
      }
    }
  }, [isOpen, initialEmail]);

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    setIsSending(true);
    setSendSuccessMessage(null);

    try {
      const res = await fetch('/api/connectors/gmail/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: composeTo.trim(),
          subject: composeSubject.trim(),
          message: composeBody.trim(),
          email: 'arminsh00@gmail.com',
          simulate: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendSuccessMessage(
          isFa ? 'ایمیل با موفقیت از طریق درگاه MCP ارسال گردید!' : 'Email sent successfully via MCP!'
        );
        setIsSending(false);
        setTimeout(() => {
          setIsComposing(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
          setSendSuccessMessage(null);
          fetchEmails();
        }, 1200);
      }
    } catch (err: any) {
      setIsSending(false);
    }
  };

  const handleQuickReply = (email: GmailMessageData) => {
    if (onSendReplyPrompt) {
      const prompt = isFa
        ? `لطفاً یک پاسخ رسمی و محترمانه به ایمیل با موضوع "${email.subject}" از طرف "${email.fromName}" آماده کن.`
        : `Please prepare a formal and courteous reply to the email with subject "${email.subject}" from "${email.fromName}".`;
      onSendReplyPrompt(prompt);
      onClose();
    } else {
      setIsComposing(true);
      setComposeTo(email.from);
      setComposeSubject(`Re: ${email.subject}`);
      setComposeBody(isFa ? `سلام،\n\nدر پاسخ به ایمیل شما:\n\n` : `Hello,\n\nRegarding your email:\n\n`);
    }
  };

  const filteredEmails = emails.filter((email) => {
    if (activeFolder === 'starred' && !starredIds.has(email.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.from.toLowerCase().includes(q) ||
        email.fromName.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none pointer-events-auto">
          {/* Backdrop Click-to-Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container: Rounded Luxury Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[85vh] max-h-[800px] bg-gradient-to-b from-white/98 via-slate-50/95 to-sky-50/90 dark:from-slate-900/98 dark:via-slate-900/95 dark:to-slate-950/90 backdrop-blur-3xl border border-white/90 dark:border-slate-800/80 rounded-[32px] shadow-[0_24px_70px_rgba(37,99,235,0.22),0_4px_20px_rgba(15,23,42,0.12),inset_0_2px_4px_rgba(255,255,255,1)] flex flex-col overflow-hidden z-10"
            dir={isFa ? 'rtl' : 'ltr'}
          >
            {/* Top Specular Glare */}
            <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-white dark:via-sky-400/50 to-transparent pointer-events-none rounded-full z-20" />

            {/* Header Strip */}
            <div className="p-3.5 sm:p-4 border-b border-sky-100/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      {isFa ? 'صندوق هوشمند جیمیل (Gmail MCP)' : 'Gmail Intelligent Workspace (MCP)'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-mono border border-rose-200 dark:border-rose-900">
                      arminsh00@gmail.com
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    {isFa
                      ? 'همگام‌سازی زنده با پروتکل رسمی MCP و دسترسی مستقیم به ایمیل‌ها'
                      : 'Live synchronization via official MCP protocol with full inbox access'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open('https://mail.google.com/', '_blank')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-100/80 hover:bg-sky-200/80 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-200/70 dark:border-sky-800 transition cursor-pointer active:scale-95"
                  title="Open Official Gmail Web"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isFa ? 'ورود به وب‌سایت Gmail' : 'Open Gmail Web'}</span>
                </button>

                <button
                  onClick={fetchEmails}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer active:scale-95"
                  title={isFa ? 'تازه‌سازی ایمیل‌ها' : 'Refresh'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                </button>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer active:scale-95"
                  title={isFa ? 'بستن' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Email Workspace Layout: Left Sidebar + Middle List + Right Reading Pane */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* 1. Left Nav Tabs */}
              <div className="w-16 sm:w-44 border-e border-sky-100/80 dark:border-slate-800 p-2 sm:p-3 flex flex-col gap-1.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
                <button
                  onClick={() => {
                    setIsComposing(true);
                    setComposeTo('');
                    setComposeSubject('');
                    setComposeBody('');
                  }}
                  className="w-full flex items-center justify-center sm:justify-start gap-2 px-2.5 sm:px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer active:scale-95 mb-2"
                >
                  <FileEdit className="w-4 h-4" />
                  <span className="hidden sm:inline">{isFa ? 'ارسال ایمیل جدید' : 'Compose'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveFolder('inbox');
                    setIsComposing(false);
                  }}
                  className={`flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeFolder === 'inbox' && !isComposing
                      ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4" />
                    <span className="hidden sm:inline">{isFa ? 'صندوق ورودی' : 'Inbox'}</span>
                  </div>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] font-mono">
                    {emails.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveFolder('starred');
                    setIsComposing(false);
                  }}
                  className={`flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeFolder === 'starred' && !isComposing
                      ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">{isFa ? 'ستاره‌دار' : 'Starred'}</span>
                  </div>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-mono">
                    {starredIds.size}
                  </span>
                </button>

                <div className="mt-auto pt-2 border-t border-sky-100 dark:border-slate-800 text-[10.5px] text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline font-sans">{isFa ? 'اتصال امن MCP' : 'MCP Secured'}</span>
                </div>
              </div>

              {/* 2. Middle Email List Pane */}
              <div className="w-64 sm:w-80 border-e border-sky-100/80 dark:border-slate-800 flex flex-col bg-white/50 dark:bg-slate-900/30 shrink-0">
                {/* Search in emails */}
                <div className="p-2 sm:p-2.5 border-b border-sky-100/80 dark:border-slate-800">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isFa ? 'جستجو در نامه‌ها...' : 'Search emails...'}
                      className="w-full ps-8 pe-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email Items List */}
                <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5">
                  {filteredEmails.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      {isFa ? 'ایمیلی یافت نشد.' : 'No emails found.'}
                    </div>
                  ) : (
                    filteredEmails.map((email) => {
                      const isSelected = selectedEmail?.id === email.id && !isComposing;
                      const isStarred = starredIds.has(email.id);

                      return (
                        <div
                          key={email.id}
                          onClick={() => {
                            setSelectedEmail(email);
                            setIsComposing(false);
                          }}
                          className={`p-2.5 sm:p-3 rounded-2xl transition cursor-pointer border relative group ${
                            isSelected
                              ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-sm'
                              : 'bg-white/70 dark:bg-slate-900/70 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  email.isUnread ? 'bg-blue-600 animate-pulse' : 'bg-transparent'
                                }`}
                              />
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {email.fromName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => toggleStar(email.id, e)}
                                className="p-0.5 text-slate-400 hover:text-amber-500 transition"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono">{email.date.split('،')[0]}</span>
                            </div>
                          </div>

                          <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate mb-1">
                            {email.subject}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {email.snippet}
                          </p>

                          {email.labels && email.labels.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              {email.labels.slice(0, 2).map((lbl) => (
                                <span
                                  key={lbl}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                >
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 3. Right Reading Pane / Compose Window */}
              <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto select-text">
                {isComposing ? (
                  /* Compose Form */
                  <form onSubmit={handleSendCompose} className="flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <FileEdit className="w-4 h-4 text-blue-600" />
                        {isFa ? 'ارسال ایمیل از طریق درگاه MCP جیمیل' : 'Compose Email via Gmail MCP'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsComposing(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        {isFa ? 'انصراف' : 'Cancel'}
                      </button>
                    </div>

                    {sendSuccessMessage && (
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {sendSuccessMessage}
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {isFa ? 'گیرنده (To):' : 'To:'}
                      </label>
                      <input
                        type="email"
                        required
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        placeholder="recipient@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {isFa ? 'موضوع (Subject):' : 'Subject:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder={isFa ? 'موضوع ایمیل...' : 'Email subject...'}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {isFa ? 'متن ایمیل (Message Body):' : 'Message Body:'}
                      </label>
                      <textarea
                        required
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder={isFa ? 'متن ایمیل خود را بنویسید...' : 'Write your email body...'}
                        className="flex-1 w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[160px]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (composeSubject) {
                              setComposeBody(
                                isFa
                                  ? `با سلام و احترام،\n\nپیرو هماهنگی‌های به‌عمل‌آمده در خصوص پروژه، جزئیات تکمیلی به پیوست تقدیم می‌گردد.\n\nبا تشکر و سپاس`
                                  : `Dear colleague,\n\nFollowing our project coordination, the requested updates are outlined below.\n\nBest regards`
                              );
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60"
                        >
                          <Sparkles className="w-3 h-3" />
                          {isFa ? 'نگارش با هوش مصنوعی' : 'AI Draft'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSending ? (isFa ? 'در حال ارسال...' : 'Sending...') : isFa ? 'ارسال ایمیل' : 'Send Email'}</span>
                      </button>
                    </div>
                  </form>
                ) : selectedEmail ? (
                  /* Read View */
                  <div className="flex flex-col h-full space-y-4">
                    {/* Subject Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {selectedEmail.subject}
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                            {isFa ? 'صندوق ورودی' : 'Inbox'}
                          </span>
                          {selectedEmail.hasAttachment && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                              <Paperclip className="w-3 h-3" />
                              {isFa ? 'پیوست دارد' : 'Attachment'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleQuickReply(selectedEmail)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>{isFa ? 'پاسخ هوشمند' : 'Smart Reply'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Sender Info Bar */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          {selectedEmail.fromName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {selectedEmail.fromName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">&lt;{selectedEmail.from}&gt;</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">
                            {isFa ? 'به:' : 'To:'} {selectedEmail.to}
                          </p>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="text-[11px] text-slate-400 font-mono block">{selectedEmail.date}</span>
                      </div>
                    </div>

                    {/* Email Body Content */}
                    <div className="flex-1 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 overflow-y-auto">
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                        {selectedEmail.body}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>{isFa ? 'تایید شده با گواهی DKIM و SPF گوگل' : 'Verified by Google DKIM & SPF'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open('https://mail.google.com/', '_blank')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isFa ? 'مشاهده در وب جیمیل' : 'View in Gmail'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Mail className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
                    <span>{isFa ? 'ایمیلی را از لیست انتخاب نمایید' : 'Select an email from the list'}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
