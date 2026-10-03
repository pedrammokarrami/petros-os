import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AgentState, Message } from '../types';
import {
  Terminal,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  FileCode,
  Sparkles,
  RotateCw,
  Maximize2,
  Minimize2,
  X,
  GitBranch,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isExecuting: boolean;
  agentState: AgentState;
  activeWorker?: string | null;
  latestMessage?: Message;
  language?: string;
  onStop?: () => void;
}

const SAMPLE_CODE_FILES = [
  {
    name: 'neural_agent_core.py',
    lang: 'python',
    lines: [
      'import torch',
      'import torch.nn as nn',
      'from transformers import AutoTokenizer, AutoModelForCausalLM',
      'from agent_runtime import ASTCodeSynthesizer, VectorKnowledgeStore',
      '',
      '@dataclass',
      'class NeuralExecutionContext:',
      '    task_id: str',
      '    runtime_mode: str = "autonomous_architect"',
      '    telemetry_enabled: bool = True',
      '',
      'class CosmicCodeSynthesizer(nn.Module):',
      '    def __init__(self, vocab_dim: int = 128000, hidden_dim: int = 4096):',
      '        super().__init__()',
      '        self.embedding = nn.Embedding(vocab_dim, hidden_dim)',
      '        self.ast_transformer = nn.TransformerEncoderLayer(d_model=hidden_dim, nhead=32)',
      '        self.knowledge_base = VectorKnowledgeStore(dimension=hidden_dim)',
      '',
      '    async def synthesize_patch(self, prompt: str, target_ast: dict) -> dict:',
      '        print(f"[AI_SYNTH] Generating AST token graph for prompt: {prompt[:32]}...")',
      '        tokens = self.embedding.encode(prompt)',
      '        ast_diff = await self.ast_transformer.forward(tokens)',
      '        optimized_ast = self.knowledge_base.apply_safety_guardrails(ast_diff)',
      '        return {',
      '            "status": "compiled_successfully",',
      '            "modified_nodes": len(optimized_ast.keys()),',
      '            "execution_confidence": 0.9942,',
      '            "diff_patch": optimized_ast.to_unified_diff()',
      '        }',
    ],
  },
  {
    name: 'CosmicOrbitalRenderer.tsx',
    lang: 'typescript',
    lines: [
      'import React, { useEffect, useRef } from "react";',
      'import { Vector3, Color, Mesh, ShaderMaterial } from "three";',
      '',
      'export interface OrbitalHaloOptions {',
      '  particleCount: number;',
      '  luminescence: number;',
      '  colorA: string;',
      '  colorB: string;',
      '}',
      '',
      'export const useCosmicHaloEngine = (options: OrbitalHaloOptions) => {',
      '  const particlesRef = useRef<Float32Array | null>(null);',
      '  const phaseRef = useRef<number>(0);',
      '',
      '  useEffect(() => {',
      '    const count = options.particleCount || 450;',
      '    const positions = new Float32Array(count * 3);',
      '    for (let i = 0; i < count; i++) {',
      '      const theta = Math.random() * Math.PI * 2;',
      '      const phi = Math.acos((Math.random() * 2) - 1);',
      '      const radius = 1.8 + Math.random() * 0.9;',
      '      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);',
      '      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);',
      '      positions[i * 3 + 2] = radius * Math.cos(phi);',
      '    }',
      '    particlesRef.current = positions;',
      '  }, [options.particleCount]);',
      '',
      '  return { particles: particlesRef.current, phase: phaseRef.current };',
      '};',
    ],
  },
];

export function LiveCodeExecutionVisualizer({
  isExecuting,
  agentState,
  activeWorker,
  language = 'fa',
  onStop,
}: Props) {
  const isFa = language === 'fa';
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [tokenRate, setTokenRate] = useState(136);
  const [memoryMb, setMemoryMb] = useState(3420);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const currentFile = SAMPLE_CODE_FILES[activeFileIndex];

  // Elapsed Timer & Metric Fluctuations (Smooth non-blocking updates)
  useEffect(() => {
    if (!isExecuting) {
      setElapsedMs(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedMs((prev) => prev + 150);
      setTokenRate(124 + Math.floor(Math.random() * 32));
      setMemoryMb(3400 + Math.floor(Math.random() * 80));
    }, 150);

    return () => clearInterval(interval);
  }, [isExecuting]);

  // Ultra-smooth line streaming (High performance, NO browser freezing)
  useEffect(() => {
    if (!isExecuting) {
      setLineCount(currentFile.lines.length);
      return;
    }

    setLineCount(1);
    const totalLines = currentFile.lines.length;

    const interval = setInterval(() => {
      setLineCount((prev) => {
        if (prev >= totalLines) {
          // Switch to next file smoothly
          setActiveFileIndex((f) => (f + 1) % SAMPLE_CODE_FILES.length);
          return 1;
        }
        return prev + 1;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isExecuting, activeFileIndex]);

  // Terminal log stream (Lightweight)
  useEffect(() => {
    if (!isExecuting) return;

    const mockEvents = [
      `[KERNEL] Autonomous sandbox worker initialized (PID: 4921)...`,
      `[TOKEN_STREAM] Ingesting prompt vector representations & workspace AST...`,
      `[AST_SCANNER] Scanned 48 project source files in 16ms.`,
      `[SYNTHESIZER] Multi-step refactoring strategy formulated.`,
      `[PATCH_ENGINE] Injecting high-order AST modifications...`,
      `[LINT_RUNNER] Strict typecheck validated (0 errors, 0 warnings).`,
      `[COMPILER] Bundle synthesized into dist/server.cjs in 42ms.`,
      `[AI_TELEMETRY] Hot-reloaded container modules cleanly.`,
    ];

    let logIdx = 0;
    setLogs([`[INIT] System ready. Synthesizing live patches...`]);

    const logInterval = setInterval(() => {
      if (logIdx < mockEvents.length) {
        const timeStr = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev.slice(-14), `[${timeStr}] ${mockEvents[logIdx]}`]);
        logIdx++;
      } else {
        logIdx = 0;
      }
    }, 950);

    return () => clearInterval(logInterval);
  }, [isExecuting]);

  // Smooth scroll
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [lineCount, logs]);

  if (!isExecuting) return null;

  // Minimized Liquid Glass Floating Island
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-auto">
        <button
          onClick={() => setIsMinimized(false)}
          className="amber-glass-pill px-5 py-3 rounded-full flex items-center gap-3.5 hover:border-amber-300 transition-all shadow-[0_12px_36px_rgba(0,0,0,0.85)] cursor-pointer group"
        >
          <RotateCw className="w-4 h-4 text-amber-400 animate-spin" />
          <div className="text-right font-sans">
            <p className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
              <span>{isFa ? 'سرور در حال کدنویسی زنده' : 'Live Code Engine Active'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </p>
            <p className="text-[10px] text-amber-300/80 font-mono">
              {tokenRate} tok/s • {(elapsedMs / 1000).toFixed(1)}s
            </p>
          </div>
          <Maximize2 className="w-4 h-4 text-amber-200/80 group-hover:text-white transition" />
        </button>
      </div>
    );
  }

  const visibleLines = currentFile.lines.slice(0, lineCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in select-none pointer-events-auto">
      {/* Liquid Glass Main Modal Container - Exactly matching the first screen's Warm Amber Liquid Glass Aesthetic */}
      <div className="w-full max-w-5xl h-[85vh] max-h-[800px] amber-glass-card rounded-[28px] sm:rounded-[36px] flex flex-col overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)] border border-amber-400/40 relative">
        {/* Subtle Liquid Top Specular Glare */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200/60 to-transparent pointer-events-none" />

        {/* 1. Header Navigation Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-amber-500/20 bg-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <div className="w-full h-full bg-[#1b110a] rounded-[14px] flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm sm:text-base font-bold text-amber-100 font-sans tracking-wide">
                  {isFa ? 'محیط اجرای زنده و سنتز کدها' : 'AI Live Code Synthesis Engine'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono text-amber-300 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>{isFa ? 'زنده' : 'LIVE'}</span>
                </span>
              </div>
              <p className="text-xs text-amber-300/75 font-mono flex items-center gap-2 mt-0.5">
                <span>{activeWorker || 'Kian Autonomous Agent'}</span>
                <span>•</span>
                <span className="text-emerald-400">STATE: {agentState.toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Telemetry Chips & Header Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-amber-200">
              <div className="px-3 py-1.5 rounded-xl amber-glass-pill flex items-center gap-1.5 border border-amber-400/30">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>{tokenRate} tok/s</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl amber-glass-pill flex items-center gap-1.5 border border-amber-400/30">
                <Activity className="w-3.5 h-3.5 text-amber-300" />
                <span>RAM {memoryMb}MB</span>
              </div>
            </div>

            {/* Minimize / Close Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-200 hover:text-white border border-amber-400/20 transition cursor-pointer"
                title={isFa ? 'کوچک‌نمایی به گوشه تصویر' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              {onStop && (
                <button
                  onClick={onStop}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600/90 to-rose-700/90 hover:from-red-500 hover:to-rose-600 text-white font-sans text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isFa ? 'توقف' : 'Stop'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Main Body Grid: Left/Center Code Area & Right Terminal */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-4 sm:p-5 overflow-hidden">
          {/* Left Column (8 cols): Liquid Code Editor */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl amber-glass-beveled overflow-hidden border border-amber-400/25">
            {/* File Tabs */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/40 border-b border-amber-500/20">
              <div className="flex items-center gap-2 overflow-x-auto">
                {SAMPLE_CODE_FILES.map((file, idx) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 transition cursor-pointer ${
                      activeFileIndex === idx
                        ? 'bg-amber-500/20 border border-amber-400/50 text-amber-100 shadow-md'
                        : 'text-amber-300/60 hover:text-amber-200 hover:bg-white/5'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>{file.name}</span>
                    {activeFileIndex === idx && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300/60">
                <span className="px-2 py-0.5 rounded-lg bg-black/30 border border-amber-400/20">UTF-8</span>
              </div>
            </div>

            {/* Code Body */}
            <div
              ref={codeContainerRef}
              className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed bg-black/25"
              dir="ltr"
            >
              {visibleLines.map((line, idx) => {
                const isDiffAdd = line.includes('synthesize_patch') || line.includes('optimized_ast') || line.includes('positions');
                const isDiffDel = line.includes('class CosmicCodeSynthesizer');
                const isLast = idx === visibleLines.length - 1;

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 py-0.5 px-2 rounded-lg transition-colors ${
                      isDiffAdd
                        ? 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-400'
                        : isDiffDel
                        ? 'bg-rose-950/40 text-rose-200 border-l-2 border-rose-400'
                        : 'hover:bg-amber-400/5'
                    } ${isLast ? 'bg-amber-500/15 border-l-2 border-amber-400' : ''}`}
                  >
                    <span className="w-8 text-right text-amber-300/40 select-none text-xs">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {renderSyntaxColoredLine(line)}
                      {isLast && (
                        <span className="inline-block w-2 h-4 bg-amber-400 ml-1 animate-pulse align-middle" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Editor Status Bottom */}
            <div className="px-4 py-2 bg-black/40 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono text-amber-300/70">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AST Graph Validated</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                <span>branch: autonomous-patch</span>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Real-Time Terminal & Pipeline Progress */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl amber-glass-beveled overflow-hidden border border-amber-400/25">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/40 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-100">
                  {isFa ? 'خروجی زنده شل سرور' : 'Runtime Shell Output'}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>

            {/* Terminal Stream */}
            <div
              ref={logContainerRef}
              className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] sm:text-xs space-y-2 text-amber-100/90 bg-black/25"
              dir="ltr"
            >
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="leading-relaxed border-l border-amber-500/40 pl-2.5 py-0.5 hover:bg-white/5 transition rounded-r"
                >
                  {log.includes('[KERNEL]') || log.includes('[LINT_') ? (
                    <span className="text-cyan-300">{log}</span>
                  ) : log.includes('[PATCH_') || log.includes('[COMPILER]') ? (
                    <span className="text-emerald-300 font-semibold">{log}</span>
                  ) : (
                    <span className="text-amber-200/90">{log}</span>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 text-amber-400 pt-1 text-xs">
                <span className="animate-spin">⠋</span>
                <span>Streaming tokens to runtime container...</span>
              </div>
            </div>

            {/* Active Pipeline Progress */}
            <div className="p-3.5 bg-black/40 border-t border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-sans text-amber-200">
                <span>{isFa ? 'مرحله فعال:' : 'Active Phase:'}</span>
                <span className="font-mono text-amber-300 font-bold">{agentState.toUpperCase()}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-900/80 overflow-hidden border border-amber-400/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(96, Math.max(15, Math.floor((elapsedMs / 10000) * 100)))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Footer Info Bar */}
        <div className="px-6 py-3 bg-black/40 border-t border-amber-500/20 flex items-center justify-between text-xs font-sans text-amber-300/80">
          <p className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isFa
                ? 'کدها به صورت گرافیکی و همگام با سرور در حال تایپ و کامپایل بلادرنگ هستند.'
                : 'Code patches are being generated, syntax-checked, and compiled in real time.'}
            </span>
          </p>
          <p className="font-mono text-[11px] text-amber-300">
            STATUS: 200 OK • VITE HMR STREAM
          </p>
        </div>
      </div>
    </div>
  );
}

// Syntax highlighting colors matching the Liquid Glass & Warm Amber Palette
function renderSyntaxColoredLine(line: string) {
  if (line.startsWith('#') || line.startsWith('//')) {
    return <span className="text-stone-500 italic">{line}</span>;
  }
  if (line.includes('import ') || line.includes('from ') || line.includes('class ') || line.includes('def ') || line.includes('export ')) {
    return <span className="text-amber-400 font-bold">{line}</span>;
  }
  if (line.includes('return ') || line.includes('await ') || line.includes('async ')) {
    return <span className="text-pink-400 font-semibold">{line}</span>;
  }
  if (line.includes('print(') || line.includes('console.log(') || line.includes('useEffect')) {
    return <span className="text-cyan-300">{line}</span>;
  }
  if (line.includes('="') || line.includes("='") || line.includes('": "')) {
    return <span className="text-yellow-200">{line}</span>;
  }
  return <span className="text-stone-200">{line}</span>;
}
