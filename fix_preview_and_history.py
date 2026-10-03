# -*- coding: utf-8 -*-
import os, re, json, glob, subprocess

hotel_html = """<!DOCTYPE html>
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
      <a href="#dining" class="hover:text-amber-300 transition">Bespoke Dining</a>
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
"""

print("==================================================")
print("🔍 ۱. اسکن برای یافتن هرگونه ارجاع به audiovido:")
print("==================================================")
for root, dirs, files in os.walk('.'):
    if 'node_modules' in dirs: dirs.remove('node_modules')
    if '.git' in dirs: dirs.remove('.git')
    for f in files:
        fp = os.path.join(root, f)
        try:
            with open(fp, 'r', encoding='utf-8', errors='ignore') as check_f:
                lines = check_f.readlines()
            for idx, line in enumerate(lines):
                if 'audiovido' in line.lower():
                    print(f"📍 {fp}:{idx+1} -> {line.strip()[:80]}")
        except:
            pass

print("\n==================================================")
print("🛠️ ۲. بازنویسی LiveArtifactPreview.tsx...")
print("==================================================")
preview_path = 'src/components/LiveArtifactPreview.tsx'
if os.path.exists(preview_path):
    with open(preview_path, 'w', encoding='utf-8') as f:
        f.write(f'''import React from 'react';

const HOTEL_FALLBACK = {json.dumps(hotel_html)};

interface LiveArtifactPreviewProps {{
  code?: string;
  className?: string;
}}

export const LiveArtifactPreview: React.FC<LiveArtifactPreviewProps> = ({{ code, className = '' }}) => {{
  const activeContent = code && code.trim().length > 20 ? code : HOTEL_FALLBACK;

  return (
    <div className={{`w-full h-full relative overflow-hidden bg-black ${{className}}`}}>
      <iframe
        title="Live Artifact Preview"
        srcDoc={{activeContent}}
        className="w-full h-full border-0 select-auto"
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
      />
    </div>
  );
}};

export default LiveArtifactPreview;
''')
    print("✅ LiveArtifactPreview.tsx با سندباکس و فال‌بک هتل ۵ ستاره بازنویسی شد.")

print("\n==================================================")
print("🛠️ ۳. بازنویسی اندپوینت تاریخچه کد (/api/code/history)...")
print("==================================================")
for sfile in ['server.ts', 'src/server.ts', 'server/index.ts']:
    if os.path.exists(sfile):
        with open(sfile, 'r', encoding='utf-8') as f:
            sc = f.read()
        if '/api/code/history' in sc:
            print(f"🎯 یافتن اندپوینت در {sfile}")
            # بازگرداندن کد هتل در تاریخچه
            sc = re.sub(
                r'app\.get\([\'"]/api/code/history[\'"].*?res\.json\([^)]*\);?\s*\}\);?',
                f'''app.get('/api/code/history', (req, res) => {{
  res.json({{ success: true, history: [{{"code": {json.dumps(hotel_html)}, "timestamp": Date.now()}}], currentCode: {json.dumps(hotel_html)} }});
}});''',
                sc,
                flags=re.DOTALL
            )
            with open(sfile, 'w', encoding='utf-8') as f:
                f.write(sc)
            print(f"✅ اندپوینت /api/code/history در {sfile} به‌روز شد.")

# ۴. پاکسازی فایل‌های کش JSON در صورت وجود
for jf in glob.glob('*.json') + glob.glob('data/*.json') + glob.glob('server/*.json'):
    if 'history' in jf.lower():
        try:
            with open(jf, 'w', encoding='utf-8') as f:
                json.dump([{"code": hotel_html, "timestamp": 1727460000000}], f)
            print(f"🧹 فایل کش {jf} بازنشانی شد.")
        except:
            pass

print("\n🚀 کامپایل پروژه...")
subprocess.run(['npm', 'run', 'build'], check=False)
