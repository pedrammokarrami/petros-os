import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Message } from '../types';
import { CodgarLogo } from './CodgarLogo';
import {
  User,
  Terminal,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FastForward,
} from 'lucide-react';

interface Props {
  message: Message;
  onViewDiff: () => void;
  isLatest?: boolean;
  typewriterSpeed?: number; // ms per char (e.g. 10ms), 0 to disable
}

export function MessageItem({
  message,
  onViewDiff,
  isLatest = false,
  typewriterSpeed = 8,
}: Props) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(true);

  // Typewriter effect state
  const fullText = message.content || '';
  const [displayedText, setDisplayedText] = useState(
    isUser || !isLatest || typewriterSpeed <= 0 ? fullText : ''
  );
  const [isTyping, setIsTyping] = useState(
    !isUser && isLatest && typewriterSpeed > 0 && fullText.length > 0
  );

  const typingIndexRef = useRef(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // If it's a user message or typewriter is disabled or not latest message, show full text immediately
    if (isUser || !isLatest || typewriterSpeed <= 0) {
      setDisplayedText(fullText);
      setIsTyping(false);
      return;
    }

    // Reset and start typewriter animation
    typingIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);

    const step = () => {
      // Chunking: reveal 1-3 characters at a time for natural speed
      const charsPerTick = fullText.length > 400 ? 3 : fullText.length > 200 ? 2 : 1;
      typingIndexRef.current = Math.min(
        fullText.length,
        typingIndexRef.current + charsPerTick
      );

      setDisplayedText(fullText.slice(0, typingIndexRef.current));

      if (typingIndexRef.current < fullText.length) {
        timerRef.current = setTimeout(step, typewriterSpeed);
      } else {
        setIsTyping(false);
      }
    };

    timerRef.current = setTimeout(step, typewriterSpeed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fullText, isUser, isLatest, typewriterSpeed]);

  const handleSkipTyping = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayedText(fullText);
    setIsTyping(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex gap-3.5 my-3.5 ${isUser ? 'justify-end' : 'justify-start'} select-text transition-all duration-300`}
    >
      {/* Agent Avatar */}
      {!isUser && (
        <div className="shrink-0 pt-0.5">
          <CodgarLogo size={32} />
        </div>
      )}

      {/* Message Glass Body */}
      <div
        className={`max-w-[88%] rounded-3xl p-4 sm:p-5 transition-all duration-200 relative group ${
          isUser
            ? 'glass-panel text-slate-100 border border-emerald-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
            : 'glass-panel-elevated text-slate-200 border border-white/12 shadow-2xl'
        }`}
      >
        {/* Message Meta Header */}
        <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                isUser ? 'text-emerald-400' : 'text-emerald-400 mr-robot-glow'
              }`}
            >
              {isUser ? 'operator@fsociety' : 'CODGAR // ELLIOT CONFIDANT'}
            </span>
            {message.mode && (
              <span className="px-1.5 py-0.2 rounded bg-white/5 text-slate-400 uppercase text-[9px] border border-white/5 font-mono">
                {message.mode === 'chat' ? 'CHAT // CONVERSATION' : message.mode}
              </span>
            )}
            {isTyping && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                transmitting...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isTyping && (
              <button
                onClick={handleSkipTyping}
                className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 transition cursor-pointer"
                title="Skip animation and show complete message"
              >
                <FastForward className="w-3 h-3" />
                <span>Skip</span>
              </button>
            )}
            <span className="text-slate-500 text-[10px]">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Message Markdown Content with Typewriter Cursor */}
        <div className="markdown-body font-sans text-xs sm:text-sm leading-relaxed space-y-2">
          <Markdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const isInline = !match && !codeString.includes('\n');

                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-black/60 text-emerald-300 font-mono text-[11px] border border-emerald-500/20"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="my-2.5 rounded-2xl overflow-hidden border border-white/10 bg-[#04060a] shadow-lg font-mono">
                    <div className="px-3 py-1.5 bg-black/70 border-b border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-semibold">{match ? match[1] : 'source'}</span>
                      <button
                        onClick={() => handleCopy(codeString)}
                        className="flex items-center gap-1 hover:text-white transition cursor-pointer text-[10px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy code</span>
                      </button>
                    </div>
                    <pre className="p-3.5 overflow-x-auto text-[11px] leading-relaxed text-slate-200">
                      <code>{children}</code>
                    </pre>
                  </div>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-base font-bold text-white font-mono mt-3 mb-1 border-b border-white/10 pb-1">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-bold text-emerald-400 font-mono mt-2 mb-1">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-semibold text-slate-200 font-mono mt-2 mb-0.5">
                  {children}
                </h3>
              ),
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1.5 pl-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1.5 pl-1">{children}</ol>,
              li: ({ children }) => <li className="text-slate-300 text-xs sm:text-sm">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-emerald-500/50 pl-3 py-1 my-2 text-slate-400 italic bg-emerald-950/10 rounded-r">
                  {children}
                </blockquote>
              ),
              p: ({ children }) => <div className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-2 last:mb-0">{children}</div>,
            }}
          >
            {displayedText}
          </Markdown>

          {/* Blinking green terminal cursor when active typewriter */}
          {isTyping && (
            <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 translate-y-0.5 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          )}
        </div>

        {/* Terminal Execution Result Block */}
        {message.executionResult && (
          <div className="mt-3 rounded-2xl bg-black/70 border border-emerald-500/30 overflow-hidden font-mono text-xs shadow-inner">
            <div className="px-3 py-1.5 bg-slate-950/90 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-semibold">$ {message.executionResult.command}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className={message.executionResult.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  exit {message.executionResult.exitCode}
                </span>
                <span className="text-slate-500">{message.executionResult.durationMs}ms</span>
              </div>
            </div>

            <div className="p-3 max-h-56 overflow-y-auto space-y-1 bg-black/90">
              {message.executionResult.stdout && (
                <pre className="text-slate-300 text-[11px] whitespace-pre-wrap">
                  {message.executionResult.stdout}
                </pre>
              )}
              {message.executionResult.stderr && (
                <pre className="text-rose-400 text-[11px] whitespace-pre-wrap">
                  {message.executionResult.stderr}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Tool Calls Accordion */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10 font-mono text-xs">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition text-[11px] mb-2 cursor-pointer"
            >
              <span>Autonomous Tools Dispatched ({message.toolCalls.length})</span>
              {toolsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {toolsExpanded && (
              <div className="space-y-2">
                {message.toolCalls.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-2.5 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-emerald-400" />
                        {tool.name}
                      </span>
                      <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {tool.status} ({tool.durationMs || 0}ms)
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">{tool.description}</p>
                    {tool.output && (
                      <div className="mt-1 p-2 rounded-xl bg-black/70 text-slate-300 text-[10px] whitespace-pre-wrap overflow-x-auto border border-white/5">
                        {tool.output}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Copy Message Action */}
        <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-end">
          <button
            onClick={() => handleCopy(message.content)}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Payload'}</span>
          </button>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-2xl liquid-btn flex items-center justify-center text-emerald-300 border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
