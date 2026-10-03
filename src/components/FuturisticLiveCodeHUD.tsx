import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Terminal,
  FileCode,
  Sparkles,
  Cpu,
  Activity,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  GitBranch,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isExecuting: boolean;
  currentPrompt?: string;
  language?: string;
}

interface CodeFileState {
  path: string;
  name: string;
  lang: string;
  lines: string[];
}

const DYNAMIC_PIPELINE_FILES: CodeFileState[] = [
  {
    path: 'src/agent/neural_synthesizer.ts',
    name: 'neural_synthesizer.ts',
    lang: 'typescript',
    lines: [
      'import { GoogleGenAI } from "@google/genai";',
      'import { ASTParser, CodeDiffOptimizer } from "../compiler/ast";',
      'import { SecurityGuardrailAuditor } from "../security/guardrails";',
      '',
      'export interface ExecutionContext {',
      '  sessionId: string;',
      '  targetWorkspace: string;',
      '  telemetryLevel: "deep_neural_trace";',
      '  confidenceThreshold: 0.994;',
      '}',
      '',
      'export class AutonomousCodeAgent {',
      '  private ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });',
      '  private astOptimizer = new CodeDiffOptimizer();',
      '',
      '  async generatePatch(prompt: string, context: ExecutionContext) {',
      '    console.log(`[SYNTHESIS] Processing neural code tokens...`);',
      '    const rawResponse = await this.ai.models.generateContent({',
      '      model: "gemini-3.8-flash",',
      '      contents: prompt,',
      '    });',
      '    const sanitizedAST = SecurityGuardrailAuditor.verify(rawResponse.text);',
      '    return this.astOptimizer.compileToUnifiedDiff(sanitizedAST);',
      '  }',
      '}',
    ],
  },
  {
    path: 'server/api/code_execution_engine.py',
    name: 'code_execution_engine.py',
    lang: 'python',
    lines: [
      'import asyncio',
      'import subprocess',
      'from dataclasses import dataclass',
      'from typing import AsyncGenerator, Dict, Any',
      '',
      '@dataclass',
      'class MicroVMWorker:',
      '    container_id: str',
      '    runtime_memory_mb: int = 1024',
      '    gpu_acceleration: bool = True',
      '',
      'async def execute_sandboxed_ast(ast_payload: Dict[str, Any]) -> AsyncGenerator[str, None]:',
      '    print(f"[CONTAINER_INIT] Booting isolated runtime for AST tree: {ast_payload.get(\'id\')}")',
      '    proc = await asyncio.create_subprocess_exec(',
      '        "node", "--experimental-strip-types", "dist/server.cjs",',
      '        stdout=asyncio.subprocess.PIPE,',
      '        stderr=asyncio.subprocess.PIPE',
      '    )',
      '    while not proc.stdout.at_eof():',
      '        line = await proc.stdout.readline()',
      '        yield f"[VM_LOG]: {line.decode().strip()}"',
      '    await proc.wait()',
    ],
  },
  {
    path: 'engine/core/diff_patcher.rs',
    name: 'diff_patcher.rs',
    lang: 'rust',
    lines: [
      'use std::sync::Arc;',
      'use tokio::sync::RwLock;',
      'use tree_sitter::{Parser, Tree};',
      '',
      'pub struct AstDiffEngine {',
      '    parser: Parser,',
      '    cache: Arc<RwLock<Vec<u8>>>,',
      '}',
      '',
      'impl AstDiffEngine {',
      '    pub async fn apply_atomic_patch(&mut self, patch_blob: &[u8]) -> Result<(), Box<dyn std::error::Error>> {',
      '        let mut tree = self.parser.parse(patch_blob, None).unwrap();',
      '        println!("[RUST_CORE] Atomic syntax AST tree constructed with {} nodes", tree.root_node().child_count());',
      '        Ok(())',
      '    }',
      '}',
    ],
  },
];

export function FuturisticLiveCodeHUD({
  isOpen,
  onClose,
  isExecuting,
  currentPrompt,
  language = 'fa',
}: Props) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [visibleLineCount, setVisibleLineCount] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(74);
  const [ramUsage, setRamUsage] = useState(1.42);
  const codeContainerRef = useRef<HTMLDivElement | null>(null);

  const activeFile = DYNAMIC_PIPELINE_FILES[activeFileIndex];

  // Dynamic code streaming animation
  useEffect(() => {
    if (!isOpen) return;

    let lineInterval: any = null;
    if (isExecuting) {
      setVisibleLineCount(1);
      lineInterval = setInterval(() => {
        setVisibleLineCount((prev) => {
          if (prev >= activeFile.lines.length) {
            return prev;
          }
          return prev + 1;
        });
      }, 110);
    } else {
      setVisibleLineCount(activeFile.lines.length);
    }

    return () => {
      if (lineInterval) clearInterval(lineInterval);
    };
  }, [isOpen, isExecuting, activeFileIndex, activeFile.lines.length]);

  // Telemetry fluctuation simulation
  useEffect(() => {
    if (!isExecuting) return;
    const telemetryInterval = setInterval(() => {
      setCpuUsage(Math.floor(68 + Math.random() * 28));
      setRamUsage(+(1.35 + Math.random() * 0.4).toFixed(2));
    }, 600);
    return () => clearInterval(telemetryInterval);
  }, [isExecuting]);

  // Auto-scroll code
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [visibleLineCount]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.lines.slice(0, visibleLineCount).join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Click-outside backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/15 backdrop-blur-[2px] cursor-pointer"
        aria-hidden="true"
      />

      <motion.aside
        aria-label="Futuristic Live Code Execution HUD Sidebar"
        initial={{
          opacity: 0,
          x: 160,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        exit={{
          opacity: 0,
          x: 160,
        }}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 30,
        }}
        className={`fixed top-0 right-0 bottom-0 z-50 p-2 sm:p-4 flex flex-col transition-all duration-300 ${
          isFullscreen
            ? 'inset-2 sm:inset-6 w-auto'
            : 'w-full sm:w-[500px] md:w-[560px] lg:w-[620px] xl:w-[680px]'
        }`}
      >
        <div className="w-full h-full rounded-[28px] ice-glass-window border border-white/95 shadow-[-20px_0_50px_rgba(15,23,42,0.14),0_20px_50px_rgba(0,0,0,0.15)] p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative select-none text-slate-800 bg-white/90 backdrop-blur-2xl">
          {/* 1. Header with active files and telemetry */}
          <div className="relative z-10 pb-3 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <Terminal className="w-4 h-4 animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 truncate tracking-wide">
                    {language === 'fa' ? 'پیش‌نمایش زنده کد' : 'CODGAR CODE PREVIEW'}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                      isExecuting
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isExecuting ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                      }`}
                    />
                    {isExecuting
                      ? (language === 'fa' ? 'در حال بیلد...' : 'SYNTHESIZING...')
                      : (language === 'fa' ? 'بیلد موفق' : 'READY')}
                  </span>
                </div>

                {/* Dynamic Path Breadcrumb */}
                <p className="text-[10px] font-mono text-slate-500 truncate flex items-center gap-1 mt-0.5" dir="ltr">
                  <GitBranch className="w-3 h-3 text-blue-500" />
                  <span>main:</span>
                  <span className="text-blue-700 font-bold">{activeFile.path}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Fullscreen, Copy, Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-sm border border-white"
                title={language === 'fa' ? 'کپی کد' : 'Copy code'}
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="p-1.5 rounded-full ice-glass-btn text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-sm border border-white"
                title={isFullscreen ? (language === 'fa' ? 'کوچک‌نمایی' : 'Restore') : (language === 'fa' ? 'بزرگ‌نمایی' : 'Maximize')}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer shadow-sm border border-slate-200"
                title={language === 'fa' ? 'بستن پیش‌نمایش' : 'Close HUD'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        {/* 2. File Path Tab Switcher */}
        <div className="relative z-10 flex items-center gap-1.5 my-1.5 overflow-x-auto pb-0.5 no-scrollbar shrink-0" dir="ltr">
          {DYNAMIC_PIPELINE_FILES.map((f, idx) => (
            <button
              key={f.path}
              onClick={() => {
                setActiveFileIndex(idx);
                setVisibleLineCount(f.lines.length);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-mono transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeFileIndex === idx
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white/70 text-slate-600 hover:bg-white border border-white'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* 3. Real-Time Streaming Code Terminal Body */}
        <div
          ref={codeContainerRef}
          className="relative z-10 flex-1 overflow-y-auto rounded-2xl bg-slate-950 p-3 font-mono text-[11px] sm:text-xs leading-relaxed text-slate-200 select-text my-1 shadow-inner border border-slate-800"
          dir="ltr"
        >
          {activeFile.lines.slice(0, visibleLineCount).map((line, lIdx) => (
            <div key={lIdx} className="flex items-start gap-2.5 hover:bg-slate-900/60 px-1 py-0.5 rounded transition">
              <span className="text-slate-600 select-none w-5 text-right shrink-0 text-[10px] font-mono">
                {lIdx + 1}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-all">
                {line.startsWith('import') || line.startsWith('from') || line.startsWith('export') ? (
                  <span className="text-pink-400">{line}</span>
                ) : line.startsWith('class') || line.startsWith('async def') || line.startsWith('pub struct') ? (
                  <span className="text-amber-300 font-semibold">{line}</span>
                ) : line.includes('console.log') || line.includes('print(') ? (
                  <span className="text-emerald-300">{line}</span>
                ) : (
                  <span className="text-cyan-100">{line}</span>
                )}
              </span>
            </div>
          ))}

          {isExecuting && (
            <div className="flex items-center gap-2.5 px-1 py-0.5">
              <span className="text-slate-600 select-none w-5 text-right shrink-0 text-[10px]">
                {visibleLineCount + 1}
              </span>
              <span className="inline-block w-2.5 h-3.5 bg-blue-400 animate-ping" />
            </div>
          )}
        </div>

        {/* 4. Bottom Futuristic Status & Quantum Metrics */}
        <div className="relative z-10 pt-1.5 border-t border-white/60 flex items-center justify-between text-[10px] font-mono text-slate-600 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>CPU: {cpuUsage}%</span>
            </span>
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>RAM: {ramUsage} GB</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-blue-700 font-bold">
            <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>AST Optimizer: Active</span>
          </div>
        </div>
      </div>
    </motion.aside>
    </>
  );
}
