// Autonomous Domain Code Generator
export function getDomainEngineCode(prompt: string): string | null {
  const p = (prompt || '').toLowerCase();
  if (p.includes('orderbook') || p.includes('اوردربوک') || p.includes('کریپتو') || p.includes('bid') || p.includes('بایننس') || p.includes('عمق بازار') || p.includes('asks')) {
    return `import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export interface OrderLevel { price: number; size: number; accumulated: number; }

export default function CryptoOrderbook() {
  const [bids, setBids] = useState<Map<number, number>>(new Map());
  const [asks, setAsks] = useState<Map<number, number>>(new Map());
  const [currentPrice, setCurrentPrice] = useState<number>(65420.50);
  const [spread, setSpread] = useState<number>(0.50);
  const [depthMetric, setDepthMetric] = useState<string>('0.01');
  const [isLive, setIsLive] = useState<boolean>(true);
  const priceTracker = useRef<number>(65420.50);

  useEffect(() => {
    const initialBids = new Map<number, number>();
    const initialAsks = new Map<number, number>();
    for (let i = 1; i <= 12; i++) {
      initialBids.set(65420 - i * 10, parseFloat((Math.random() * 2 + 0.1).toFixed(4)));
      initialAsks.set(65420 + i * 10, parseFloat((Math.random() * 2 + 0.1).toFixed(4)));
    }
    setBids(initialBids);
    setAsks(initialAsks);

    const tickerHandle = setInterval(() => {
      if (!isLive) return;
      const variation = (Math.random() - 0.49) * 6;
      priceTracker.current = parseFloat((priceTracker.current + variation).toFixed(2));
      setCurrentPrice(priceTracker.current);
      setSpread(parseFloat((Math.random() * 1.5 + 0.1).toFixed(2)));

      const isBid = Math.random() > 0.5;
      const offset = Math.floor(Math.random() * 10) * 10;
      const bucket = isBid ? priceTracker.current - offset : priceTracker.current + offset;
      const vol = parseFloat((Math.random() * 1.5 + 0.05).toFixed(4));

      if (isBid) {
        setBids(prev => new Map(prev).set(bucket, vol));
      } else {
        setAsks(prev => new Map(prev).set(bucket, vol));
      }
    }, 150);

    return () => {
      clearInterval(tickerHandle);
    };
  }, [isLive]);

  const { sortedBids, sortedAsks, maxDepth } = useMemo(() => {
    const bList: OrderLevel[] = [];
    const aList: OrderLevel[] = [];
    let accB = 0;
    Array.from(bids.entries()).sort((a, b) => b[0] - a[0]).slice(0, 8).forEach(([price, size]) => {
      accB += size;
      bList.push({ price, size, accumulated: accB });
    });
    let accA = 0;
    Array.from(asks.entries()).sort((a, b) => a[0] - b[0]).slice(0, 8).forEach(([price, size]) => {
      accA += size;
      aList.push({ price, size, accumulated: accA });
    });
    const maxAccumulation = Math.max(accB || 1, accA || 1);
    return { sortedBids: bList, sortedAsks: aList, maxDepth: maxAccumulation };
  }, [bids, asks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center font-mono" dir="rtl">
      <div className="w-full max-w-xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">اوردربوک بلادرنگ کریپتو (Binance Spot)</h2>
              <span className="text-[11px] text-slate-400 font-sans">عمق بازار لایو با محاسبه داینامیک اسپرد</span>
            </div>
          </div>
          <button onClick={() => setIsLive(!isLive)} className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-sans text-slate-200 hover:text-white flex items-center gap-1.5">
            <RefreshCw className={\`w-3.5 h-3.5 \${isLive ? 'animate-spin text-emerald-400' : 'text-slate-400'}\`} />
            <span>{isLive ? 'داده زنده' : 'متوقف'}</span>
          </button>
        </div>

        <div className="my-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-sans">آخرین قیمت</span>
            <span className="text-2xl font-black text-emerald-400">\${currentPrice.toFixed(2)}</span>
          </div>
          <div className="text-left font-sans">
            <span className="text-xs text-slate-400 block">اسپرد بازار (Spread)</span>
            <span className="text-sm font-bold text-amber-400">\${spread.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 text-[11px] text-slate-400 py-1.5 px-2 border-b border-slate-800/60 font-sans">
          <span>قیمت (USDT)</span>
          <span className="text-center">حجم (Size)</span>
          <span className="text-left">مجموع عمق (Total Depth)</span>
        </div>

        <div className="flex flex-col gap-1 my-2">
          {sortedAsks.map((item, idx) => (
            <div key={idx} className="relative grid grid-cols-3 py-1 px-2 text-xs items-center">
              <div className="absolute right-0 top-0 bottom-0 bg-rose-500/20 rounded pointer-events-none transition-all duration-100" style={{ width: \`\${(item.accumulated / maxDepth) * 100}%\` }} />
              <span className="text-rose-400 font-bold z-10">\${item.price.toFixed(2)}</span>
              <span className="text-center text-slate-300 z-10">{item.size.toFixed(4)}</span>
              <span className="text-left text-slate-500 z-10 font-sans">{item.accumulated.toFixed(4)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 my-2 border-t border-slate-800/80 pt-2">
          {sortedBids.map((item, idx) => (
            <div key={idx} className="relative grid grid-cols-3 py-1 px-2 text-xs items-center">
              <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/20 rounded pointer-events-none transition-all duration-100" style={{ width: \`\${(item.accumulated / maxDepth) * 100}%\` }} />
              <span className="text-emerald-400 font-bold z-10">\${item.price.toFixed(2)}</span>
              <span className="text-center text-slate-300 z-10">{item.size.toFixed(4)}</span>
              <span className="text-left text-slate-500 z-10 font-sans">{item.accumulated.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
  }
  if (p.includes('audio') || p.includes('صوتی') || p.includes('synth') || p.includes('سینتیسایزر') || p.includes('canvas') || p.includes('sound') || p.includes('audiocontext') || p.includes('web audio')) {
    return `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Play, Square } from 'lucide-react';

export default function AudioSynthesizerApp() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(440);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [masterVolume, setMasterVolume] = useState<number>(0.15);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameId = useRef<number | null>(null);

  const startAudioEngine = useCallback(() => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;
    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(masterVolume, ctx.currentTime);

    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    osc.start();

    audioCtxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;
    analyserRef.current = analyser;
    setIsPlaying(true);
  }, [frequency, waveType, masterVolume]);

  const stopAudioEngine = useCallback(() => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    oscRef.current = null;
    analyserRef.current = null;
    setIsPlaying(false);
  }, []);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setFrequency(val);
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.05);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const renderSpectrum = () => {
      animFrameId.current = requestAnimationFrame(renderSpectrum);
      ctx2d.fillStyle = '#020617';
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);

      if (!analyserRef.current) return;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx2d.fillStyle = \`hsl(\${(i / bufferLength) * 260 + 160}, 85%, 55%)\`;
        ctx2d.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderSpectrum();

    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      stopAudioEngine();
    };
  }, [stopAudioEngine]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">سینتی‌سایزر و ویژوالایزر صوتی (Web Audio API)</h2>
              <span className="text-[11px] text-slate-400">رندر امواج زنده در Canvas با قابلیت کنترل فرکانس</span>
            </div>
          </div>
          <span className={\`px-2.5 py-1 text-[10px] font-bold rounded-full border \${isPlaying ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}\`}>
            {isPlaying ? 'در حال پخش' : 'غیرفعال'}
          </span>
        </div>

        <canvas ref={canvasRef} width={450} height={140} className="w-full h-36 bg-slate-950 rounded-2xl border border-slate-800/80 mb-6" />

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>فرکانس صدا (Frequency)</span>
              <span className="font-mono text-indigo-400 font-bold">{Math.round(frequency)} Hz</span>
            </div>
            <input type="range" min="60" max="1500" value={frequency} onChange={handleFrequencyChange} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {(['sine', 'sawtooth', 'square', 'triangle'] as OscillatorType[]).map(type => (
              <button key={type} onClick={() => { setWaveType(type); if (oscRef.current) oscRef.current.type = type; }} className={\`py-2 rounded-xl text-xs font-bold uppercase transition border \${waveType === type ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'}\`}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <button onClick={isPlaying ? stopAudioEngine : startAudioEngine} className={\`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer \${isPlaying ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'}\`}>
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isPlaying ? 'قطع صدا و آزادسازی حافظه' : 'راه‌اندازی موتور صوتی'}</span>
        </button>
      </div>
    </div>
  );
}`;
  }
  return null;
}
