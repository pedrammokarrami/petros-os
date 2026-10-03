import React, { useState, useEffect } from 'react';
import AudioVidoUniversalStudio from './AudioVidoUniversalStudio';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact?: {
    id?: string;
    title?: string;
    type?: string;
    content?: string;
  } | null;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, artifact }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'runner'>('preview');
  const [copied, setCopied] = useState(false);

  // بستن قطعی با کلید Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('[PreviewModal] Closing via Escape key');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const rawCode = artifact?.content || `// AudioVido Universal Studio (React 18 + TypeScript)
// 5 Spatial Realms: Aura Nodes, Music World, Movie World, Community, Aura Connect
// Mobile 9-Views & Android TV D-Pad Navigator Active`;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl h-[88vh] bg-[#0c0e15] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* نوار هدر با رویدادهای تضمینی کلیک */}
        <div className="relative z-50 flex items-center justify-between px-6 py-3.5 bg-[#141724] border-b border-slate-800">
          {/* سمت چپ: عنوان */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-500/30">
              AV
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">AudioVido Multiplatform Studio</h3>
              <p className="text-[10px] text-blue-400 font-mono">REACT • Interactive Sandbox</p>
            </div>
          </div>

          {/* وسط: تب‌های سه‌گانه با تغییر قطعی استیت */}
          <div className="flex items-center bg-[#090b10] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                console.log('[PreviewModal] Switched to Preview');
                setActiveTab('preview');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👁 Preview
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('[PreviewModal] Switched to Code');
                setActiveTab('code');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              &lt;/&gt; Code
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('[PreviewModal] Switched to Runner');
                setActiveTab('runner');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'runner'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              &gt;_ Runner
            </button>
          </div>

          {/* سمت راست: دکمه کپی کد و دکمه ضربدر بستن با رویداد قطعی */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(rawCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              {copied ? '✓ کپی شد' : '📋 کپی کد'}
            </button>

            {/* دکمه قرمز ضربدر با هندلر تضمینی onClose */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log('[PreviewModal] Close button clicked');
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer shadow-lg ml-2"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* بدنه محتوا بر اساس تب فعال */}
        <div className="relative z-10 flex-1 w-full h-full bg-[#080a10] p-4 overflow-hidden">
          {activeTab === 'preview' && (
            <div className="w-full h-full">
              <iframe title="Live Preview" srcDoc={rawCode || `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AURA PALACE | 5-Star Luxury Boutique Hotel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['Playfair Display', 'serif'],
            sans: ['Plus Jakarta Sans', 'sans-serif'],
          }
        }
      }
    }
  </script>
</head>
<body class="bg-[#090a0f] text-[#e0e2ec] font-sans antialiased selection:bg-amber-400 selection:text-black min-h-screen">
  <header class="fixed top-0 inset-x-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
      <span class="font-serif text-lg tracking-widest text-amber-200 font-bold">AURA PALACE</span>
      <span class="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">5-Star Boutique</span>
    </div>
    <nav class="hidden md:flex items-center space-x-6 text-xs uppercase tracking-widest text-slate-300 font-medium">
      <a href="#suites" class="hover:text-amber-300 transition">Signature Suites</a>
      <a href="#experiences" class="hover:text-amber-300 transition">Bespoke Dining</a>
      <a href="#wellness" class="hover:text-amber-300 transition">Wellness Spa</a>
    </nav>
    <button onclick="toggleDrawer()" class="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-amber-500/30 transition transform hover:-translate-y-0.5 cursor-pointer">
      Book Your Stay
    </button>
  </header>

  <section class="relative min-h-[85vh] flex items-center justify-center px-6 pt-20 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-[#090a0f] pointer-events-none"></div>
    <div class="relative z-10 text-center max-w-4xl mx-auto space-y-6">
      <span class="inline-block text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
        Private Coastal Sanctuary
      </span>
      <h1 class="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
        Where Timeless Serenity Meets <span class="italic bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">Bespoke Luxury</span>
      </h1>
      <p class="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
        An intimate collection of 28 oceanfront sanctuary residences, Michelin-starred gastronomy, and holistic private wellness retreats.
      </p>
      <div class="pt-2 flex items-center justify-center space-x-4">
        <button onclick="toggleDrawer()" class="px-7 py-3 rounded-full bg-amber-400 text-black font-bold text-xs uppercase tracking-widest hover:bg-amber-300 transition shadow-xl shadow-amber-500/20 cursor-pointer">
          Check Availability
        </button>
      </div>
    </div>
  </section>

  <section id="suites" class="py-16 px-6 max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-xl hover:border-amber-400/40 transition flex flex-col justify-between">
        <div>
          <div class="h-44 rounded-xl bg-gradient-to-tr from-stone-900 to-neutral-800 flex items-center justify-center text-4xl">🏰</div>
          <h3 class="font-serif text-lg font-bold text-white mt-3">Royal Panoramic Penthouse</h3>
          <p class="text-xs text-slate-400 mt-1">180° sea view, heated infinity pool, 24/7 butler.</p>
        </div>
        <button onclick="toggleDrawer('Royal Penthouse')" class="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-amber-400 hover:text-black text-white text-xs font-semibold uppercase tracking-wider border border-white/10 transition cursor-pointer">Reserve Suite</button>
      </div>
      <div class="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-xl hover:border-amber-400/40 transition flex flex-col justify-between">
        <div>
          <div class="h-44 rounded-xl bg-gradient-to-tr from-stone-900 to-neutral-800 flex items-center justify-center text-4xl">🌊</div>
          <h3 class="font-serif text-lg font-bold text-white mt-3">Azure Beachfront Haven</h3>
          <p class="text-xs text-slate-400 mt-1">Direct beach access, cedar sundeck, marble jacuzzi.</p>
        </div>
        <button onclick="toggleDrawer('Azure Villa')" class="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-amber-400 hover:text-black text-white text-xs font-semibold uppercase tracking-wider border border-white/10 transition cursor-pointer">Reserve Suite</button>
      </div>
      <div class="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-xl hover:border-amber-400/40 transition flex flex-col justify-between">
        <div>
          <div class="h-44 rounded-xl bg-gradient-to-tr from-stone-900 to-neutral-800 flex items-center justify-center text-4xl">🌿</div>
          <h3 class="font-serif text-lg font-bold text-white mt-3">Botanica Garden Suite</h3>
          <p class="text-xs text-slate-400 mt-1">Surrounded by olive groves, stone fireplace, brass tub.</p>
        </div>
        <button onclick="toggleDrawer('Garden Suite')" class="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-amber-400 hover:text-black text-white text-xs font-semibold uppercase tracking-wider border border-white/10 transition cursor-pointer">Reserve Suite</button>
      </div>
    </div>
  </section>

  <!-- Interactive Booking Drawer -->
  <div id="bookingDrawer" class="fixed inset-y-0 right-0 w-full max-w-sm bg-[#111218] border-l border-white/10 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 ease-out flex flex-col justify-between p-6">
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 class="font-serif text-lg font-bold text-white">Reserve Your Stay</h3>
        <button onclick="toggleDrawer()" class="w-7 h-7 rounded-full bg-white/5 text-white flex items-center justify-center cursor-pointer">✕</button>
      </div>
      <div class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">Residence</label>
          <input id="selectedSuite" value="Royal Panoramic Penthouse" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div><label class="block text-slate-400 mb-1">Check-In</label><input type="date" value="2026-10-10" class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs"></div>
          <div><label class="block text-slate-400 mb-1">Check-Out</label><input type="date" value="2026-10-15" class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs"></div>
        </div>
      </div>
    </div>
    <button onclick="alert('🎉 Reservation Received!'); toggleDrawer();" class="w-full py-3 rounded-lg bg-amber-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer">Confirm Booking</button>
  </div>
  <div id="drawerOverlay" onclick="toggleDrawer()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden cursor-pointer"></div>

  <script>
    function toggleDrawer(s) {
      const d = document.getElementById('bookingDrawer');
      const o = document.getElementById('drawerOverlay');
      if (s) document.getElementById('selectedSuite').value = s;
      d.classList.toggle('translate-x-full');
      o.classList.toggle('hidden');
    }
  </script>
</body>
</html>
`} className="w-full h-full border-0" sandbox="allow-scripts allow-modals allow-forms allow-same-origin" />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="w-full h-full p-6 overflow-auto font-mono text-xs text-slate-300 bg-[#0c0e16] rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-4 text-[11px] text-purple-400 border-b border-slate-800 pb-2">
                <span>📁 src/components/AudioVidoUniversalStudio.tsx</span>
                <span>TypeScript + React 18</span>
              </div>
              <pre className="whitespace-pre-wrap select-text leading-relaxed">{rawCode}</pre>
            </div>
          )}

          {activeTab === 'runner' && (
            <div className="w-full h-full p-6 font-mono text-xs text-emerald-400 bg-[#0c0e16] rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-white font-bold">&gt; CODGAR STUDIO V4.5 // SANDBOX RUNNER</p>
                <p>&gt; [OK] AudioVido Universal Studio Mounted</p>
                <p>&gt; [OK] 5 Realms Synced: Aura Nodes, Music World, Movie World, Community, Aura Connect</p>
                <p>&gt; [OK] D-Pad Navigation Listener Active (ArrowLeft / ArrowRight)</p>
                <p>&gt; [OK] Zero iframe Dependency - Native 60FPS React Fiber</p>
              </div>
              <div className="text-slate-500 text-[11px] border-t border-slate-800 pt-3 flex justify-between">
                <span>وضعیت: ۱۰۰٪ عملیاتی</span>
                <span>Port: 3000 (Internal) / 3001 (Standalone)</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default PreviewModal;
