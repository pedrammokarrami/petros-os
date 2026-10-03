import React, { useState, useEffect } from 'react';

export const AudioVidoUniversalStudio: React.FC = () => {
  const [activeRealm, setActiveRealm] = useState<'aura' | 'music' | 'movie' | 'connect' | 'community'>('aura');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(82);
  const [ambientLight, setAmbientLight] = useState<number>(65);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const realms: ('aura' | 'music' | 'movie' | 'connect' | 'community')[] = ['aura', 'music', 'movie', 'connect', 'community'];
      const currentIndex = realms.indexOf(activeRealm);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveRealm(realms[(currentIndex + 1) % realms.length]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveRealm(realms[(currentIndex - 1 + realms.length) % realms.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRealm]);

  return (
    <div className={`w-full h-full bg-[#07070b] text-slate-100 flex flex-col font-sans select-none overflow-hidden ${isMobileView ? 'max-w-[390px] mx-auto border-x border-white/10 rounded-2xl my-2 shadow-2xl' : ''}`}>
      <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-xs tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">AUDIOVIDO STUDIO</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">PRO 4.2</span>
        </div>
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/10 text-[11px]">
          <button onClick={() => setActiveRealm('aura')} className={`px-2.5 py-1 rounded transition ${activeRealm === 'aura' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'}`}>🌌 Aura Nodes</button>
          <button onClick={() => setActiveRealm('music')} className={`px-2.5 py-1 rounded transition ${activeRealm === 'music' ? 'bg-amber-500 text-black font-semibold' : 'text-slate-400 hover:text-white'}`}>🎵 Music World</button>
          <button onClick={() => setActiveRealm('movie')} className={`px-2.5 py-1 rounded transition ${activeRealm === 'movie' ? 'bg-rose-500 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}>🎬 4K IMAX</button>
          <button onClick={() => setActiveRealm('connect')} className={`px-2.5 py-1 rounded transition ${activeRealm === 'connect' ? 'bg-emerald-500 text-black font-semibold' : 'text-slate-400 hover:text-white'}`}>🎛️ Aura Connect</button>
          <button onClick={() => setActiveRealm('community')} className={`px-2.5 py-1 rounded transition ${activeRealm === 'community' ? 'bg-purple-500 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}>👥 Community</button>
        </div>
        <button onClick={() => setIsMobileView(!isMobileView)} className={`text-xs px-2.5 py-1 rounded border transition ${isMobileView ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
          {isMobileView ? '📱 ۹ فریم آیفون' : '🖥️ ۱۶:۹ دسکتاپ'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        {activeRealm === 'aura' && (
          <div className="w-full max-w-3xl h-[420px] relative flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-black to-slate-950 p-6 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-80 h-80 rounded-full border border-cyan-500 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-60 h-60 rounded-full border border-dashed border-indigo-400 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute w-40 h-40 rounded-full border border-purple-500 animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="relative z-10 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <span className="text-2xl">🌌</span>
              </div>
              <h2 className="text-lg font-bold text-cyan-300">قلمرو ۱: گراف مرکزی کیهانی Aura Nodes</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">مدارهای چرخان فعال با گره‌های تعاملی. با کلیدهای D-Pad کیبورد بین قلمروها جابه‌جا شوید.</p>
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto pt-2">
                <div onClick={() => setActiveRealm('music')} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs cursor-pointer hover:scale-105 transition">🎵 Music Cabin</div>
                <div onClick={() => setActiveRealm('movie')} className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs cursor-pointer hover:scale-105 transition">🎬 4K IMAX</div>
                <div onClick={() => setActiveRealm('connect')} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs cursor-pointer hover:scale-105 transition">🎛️ Aura Bar</div>
                <div onClick={() => setActiveRealm('community')} className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs cursor-pointer hover:scale-105 transition">👥 Voice Space</div>
              </div>
            </div>
          </div>
        )}

        {activeRealm === 'music' && (
          <div className="w-full max-w-3xl h-[420px] rounded-2xl border border-amber-500/20 bg-[#120c08] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-500 font-mono">ACOUSTIC CABIN STUDIO</span>
                <h2 className="text-base font-bold text-amber-200">قلمرو ۲: استودیو آکوستیک کلبه چوبی با دیسک وینیل</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono">FLAC 96kHz / 24-bit Hi-Fi</span>
            </div>
            <div className="flex items-center justify-center space-x-8 my-auto">
              <div className={`w-40 h-40 rounded-full bg-neutral-900 border-4 border-amber-900/60 flex items-center justify-center shadow-2xl ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-[10px] font-bold text-black">VINYL</div>
              </div>
              <div className="space-y-3 max-w-xs">
                <div>
                  <div className="text-[10px] text-amber-400/80">قطعه جاری استودیو:</div>
                  <div className="text-xs font-semibold text-white">Solar Echoes (Acoustic Vinyl Master)</div>
                </div>
                <div className="flex items-center space-x-1 h-6">
                  {[40, 70, 95, 60, 85, 45, 90, 65, 30, 80].map((h, i) => (
                    <div key={i} style={{ height: isPlaying ? `${h}%` : '20%' }} className="w-1 bg-amber-500 rounded-full transition-all duration-200" />
                  ))}
                </div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition">
                  {isPlaying ? '⏸ توقف چرخش وینیل' : '▶ پخش وینیل ۹۶ کیلوهرتز'}
                </button>
              </div>
            </div>
            <div className="text-[10px] text-amber-500/60 font-mono text-center">Analog Tube Warmth • Dedicated Cabin Acoustics DSP</div>
          </div>
        )}

        {activeRealm === 'movie' && (
          <div className="w-full max-w-3xl h-[420px] rounded-2xl border border-rose-500/20 bg-slate-950 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-base font-bold text-white">قلمرو ۳: سینمای خانگی 4K IMAX با فید چت زنده مخاطبان</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">LIVE HDR 60fps</span>
            </div>
            <div className="grid grid-cols-3 gap-3 my-auto h-64">
              <div className="col-span-2 rounded-xl bg-black border border-white/10 flex items-center justify-center relative overflow-hidden">
                <span className="text-3xl text-rose-500/40">🎬 4K IMAX SCREEN</span>
                <div className="absolute bottom-2 left-3 text-[10px] text-slate-300">فیلم: Dune Part II (Aura Spatial Soundstream)</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 flex flex-col justify-between text-[11px]">
                <div className="font-semibold text-rose-400 border-b border-white/10 pb-1">💬 چت زنده سالن سینما</div>
                <div className="space-y-1.5 overflow-y-auto py-1">
                  <div className="bg-white/5 p-1 rounded"><span className="text-cyan-400 font-bold">علی:</span> تفکیک صدا بی‌نظیره!</div>
                  <div className="bg-white/5 p-1 rounded"><span className="text-amber-400 font-bold">رضا:</span> تصویر 4K شفافیت عالی داره.</div>
                  <div className="bg-white/5 p-1 rounded"><span className="text-purple-400 font-bold">Sarah:</span> Immersive spatial audio!</div>
                </div>
                <input placeholder="نظر در سالن..." className="bg-black/60 border border-white/20 rounded px-2 py-1 text-[10px] text-white outline-none" />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center font-mono">Dolby Atmos Surround • 12-Channel Spatial Soundstream</div>
          </div>
        )}

        {activeRealm === 'connect' && (
          <div className="w-full max-w-3xl h-[420px] rounded-2xl border border-emerald-500/20 bg-slate-950 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono">HARDWARE CONTROLLER</span>
                <h2 className="text-base font-bold text-white">قلمرو ۴: کنترلر سخت‌افزاری ساندبار Aura Bar و دیمر نور محیط</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">AuraBar-AirPlay-Pro</span>
            </div>
            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">ولوم مستر (Master Volume)</span>
                  <span className="text-emerald-400 font-bold font-mono">{volume}%</span>
                </div>
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">دیمر نور محیطی (Ambient Dimmer)</span>
                  <span className="text-cyan-400 font-bold font-mono">{ambientLight}%</span>
                </div>
                <input type="range" min="0" max="100" value={ambientLight} onChange={(e) => setAmbientLight(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center font-mono">Direct DSP Hardware Link • Zero Latency Audio Passthrough</div>
          </div>
        )}

        {activeRealm === 'community' && (
          <div className="w-full max-w-3xl h-[420px] rounded-2xl border border-purple-500/20 bg-slate-950 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-purple-400 font-mono">COMMUNITY SPATIAL SPACES</span>
                <h2 className="text-base font-bold text-white">قلمرو ۵: رویدادها، استریم‌های زنده و اتاق‌های صوتی فضایی</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">1,420 شنونده آنلاین</span>
            </div>
            <div className="grid grid-cols-3 gap-3 my-auto">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <span className="text-xs font-bold text-purple-300">🎙️ استودیو مسترینگ</span>
                <p className="text-[11px] text-slate-400">بررسی قطعات با های‌فای وینیل.</p>
                <button className="w-full py-1 rounded bg-purple-600 text-white font-semibold text-xs">ورود به اتاق</button>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <span className="text-xs font-bold text-cyan-300">🎧 شب سینمای IMAX</span>
                <p className="text-[11px] text-slate-400">پخش زنده و تحلیل فضایی صدا.</p>
                <button className="w-full py-1 rounded bg-cyan-600 text-black font-semibold text-xs">تنظیم یادآور</button>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold text-amber-300">🪵 آکوستیک کلبه چوبی</span>
                <p className="text-[11px] text-slate-400">موسیقی لوفای برای برنامه‌نویسان.</p>
                <button className="w-full py-1 rounded bg-amber-600 text-black font-semibold text-xs">شنیدن لایو</button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center font-mono">Interactive WebRTC Voice Grid • Spatial Audio Panning Enabled</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVidoUniversalStudio;
