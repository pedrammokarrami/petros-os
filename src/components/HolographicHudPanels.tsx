import React, { useState, useEffect } from 'react';
import { AgentState } from '../types';
import { Activity, Cpu, HardDrive, Terminal } from 'lucide-react';

interface Props {
  agentState: AgentState;
  isExecuting?: boolean;
}

export function HolographicHudPanels({ agentState, isExecuting }: Props) {
  const [frequencies, setFrequencies] = useState<number[]>([40, 65, 30, 85, 95, 50, 75, 45, 60, 80, 70, 90]);
  const [cpuUsage, setCpuUsage] = useState<number>(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrequencies(prev =>
        prev.map(() => Math.floor(20 + Math.random() * (isExecuting ? 75 : 45)))
      );
      setCpuUsage(Math.floor(18 + Math.random() * (isExecuting ? 40 : 15)));
    }, 450);
    return () => clearInterval(interval);
  }, [isExecuting]);

  return (
    <div className="pointer-events-none select-none flex items-end gap-2.5 sm:gap-3 text-amber-200">
      {/* 1. Left Vertical Amber HUD: Streaming code matrix */}
      <div className="w-24 sm:w-28 p-2 rounded-xl bg-amber-950/40 border border-amber-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(217,119,6,0.25)] transform -rotate-y-12 rotate-x-6 origin-bottom-left transition-all">
        <div className="flex items-center justify-between pb-1 border-b border-amber-400/30 text-[9px] font-mono text-amber-300">
          <span className="flex items-center gap-1">
            <Terminal className="w-2.5 h-2.5 text-amber-400" />
            VECT
          </span>
          <span className="animate-pulse text-amber-400">● LIVE</span>
        </div>
        <div className="mt-1 space-y-0.5 font-mono text-[8px] text-amber-200/80 leading-tight">
          <p className="truncate text-amber-300 font-semibold">$ py.exec(42)</p>
          <p className="truncate">T: 0.042ms</p>
          <p className="truncate">MEM: 64.2 MB</p>
          <p className="truncate">ACC: 99.8%</p>
          <p className="truncate text-amber-400/90">0x7FA29B // OK</p>
        </div>
      </div>

      {/* 2. Center Amber HUD: Audio / Neural Frequency Bars */}
      <div className="w-36 sm:w-44 p-2.5 rounded-xl bg-amber-950/45 border border-amber-400/40 backdrop-blur-md shadow-[0_0_25px_rgba(217,119,6,0.3)] transform rotate-x-12 origin-bottom transition-all">
        <div className="flex items-center justify-between pb-1 border-b border-amber-400/30 text-[9px] font-mono">
          <span className="text-amber-300 font-semibold flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
            SPECTRUM // CORE
          </span>
          <span className="text-amber-400/80 text-[8px]">{cpuUsage}% LOAD</span>
        </div>

        {/* Live animated frequency bars */}
        <div className="mt-2 flex items-end justify-between h-9 px-1 gap-1">
          {frequencies.map((h, i) => (
            <div key={i} className="flex-1 bg-amber-900/60 rounded-t overflow-hidden h-full flex items-end">
              <div
                className="w-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 rounded-t transition-all duration-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[8px] font-mono text-amber-300/70">
          <span>0Hz</span>
          <span className="text-amber-400 font-bold tracking-wider">AI_LATENCY: 18ms</span>
          <span>24kHz</span>
        </div>
      </div>

      {/* 3. Right "System Status" Frosted HUD Panel (As in user image) */}
      <div className="hidden md:block w-44 p-2.5 rounded-xl bg-slate-900/50 border border-slate-300/20 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.6)] transform rotate-y-6 rotate-x-8 origin-bottom-right transition-all">
        <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[9px] font-mono text-slate-200">
          <span className="font-semibold flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5 text-emerald-400" />
            System Status
          </span>
          <span className="text-[8px] text-emerald-400">ONLINE</span>
        </div>

        <div className="mt-1.5 grid grid-cols-2 gap-2 text-[8px] font-mono">
          {/* Mini Bar Chart */}
          <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
            <div className="text-slate-400 mb-1">Compute</div>
            <div className="flex items-end gap-0.5 h-6">
              {[30, 60, 45, 90, 70, 85].map((v, i) => (
                <div key={i} className="flex-1 bg-slate-700 rounded-t flex items-end h-full">
                  <div className="w-full bg-emerald-400/80 rounded-t" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Mini Donut Gauge */}
          <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 flex flex-col items-center justify-center">
            <div className="text-slate-400 mb-0.5">Efficiency</div>
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="85, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[8px] font-bold text-white">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
