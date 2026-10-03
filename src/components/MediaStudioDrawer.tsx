import React, { useState, useEffect } from 'react';

export interface MediaItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  time: string;
}

export const MediaStudioDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [history, setHistory] = useState<MediaItem[]>(() => {
    try {
      const s = localStorage.getItem('yodaw_media_archive');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleOpenMedia = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.url) return;
      const newItem: MediaItem = {
        id: Date.now(),
        type: detail.type || 'image',
        url: detail.url,
        prompt: detail.prompt || '3D crystal logo with light refraction',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setHistory(prev => {
        const updated = [newItem, ...prev.filter(x => x.url !== newItem.url)].slice(0, 40);
        try { localStorage.setItem('yodaw_media_archive', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setActiveItem(newItem);
      setIsOpen(true);
    };

    window.addEventListener('yodaw:open-media', handleOpenMedia);
    return () => window.removeEventListener('yodaw:open-media', handleOpenMedia);
  }, []);

  useEffect(() => {
    if (!activeItem && history.length > 0) {
      setActiveItem(history[0]);
    }
  }, [history, activeItem]);

  return (
    <>
      {/* دکمه شناور گالری در گوشه بالا سمت راست */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed top-4 right-4 z-40 px-3.5 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 backdrop-blur-xl border border-white/20 text-white text-xs shadow-xl transition-all active:scale-95 flex items-center gap-2 hover:border-cyan-400"
      >
        <span>🎨 استودیو و گالری</span>
        {history.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-cyan-400 text-black text-[10px] font-bold flex items-center justify-center">
            {history.length}
          </span>
        )}
      </button>

      {/* پنل شیشه‌ای پاپ‌آپ سمت راست */}
      {isOpen && (
        <div className="fixed top-3 right-3 bottom-3 w-[420px] max-w-[92vw] z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.7)] text-white overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <div>
                <h3 className="font-bold text-sm text-cyan-300">استودیو رسانه YODAW</h3>
                <p className="text-[11px] text-white/50">پیش‌نمایش زنده و گالری هوش مصنوعی</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {activeItem ? (
              <div className="flex flex-col gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="text-cyan-400 font-semibold">{activeItem.type === 'video' ? '🎬 ویدیو' : '🎨 تصویر Flux.1'}</span>
                  <span className="text-[10px]">{activeItem.time}</span>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/15 bg-black/60 aspect-video flex items-center justify-center">
                  {activeItem.type === 'video' ? (
                    <video src={activeItem.url} controls autoPlay loop className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <img src={activeItem.url} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  )}
                </div>

                <p className="text-xs text-white/80 line-clamp-3 bg-black/40 p-2 rounded-lg font-mono text-[11px]">
                  {activeItem.prompt}
                </p>

                <a
                  href={activeItem.url}
                  target="_blank"
                  rel="noreferrer"
                  download="yodaw_export.jpg"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>دانلود با کیفیت اصلی HD</span>
                  <span>⬇️</span>
                </a>
              </div>
            ) : (
              <div className="text-center py-8 text-white/40 text-xs">روی یکی از رسانه‌های زیر کلیک کنید.</div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90">آرشیو و گالری تولیدات</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                  {history.length} آیتم
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 max-h-[220px] overflow-y-auto">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`relative group rounded-xl overflow-hidden border aspect-video transition-all active:scale-95 ${
                      activeItem?.id === item.id ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-white/10 hover:border-cyan-400/50'
                    }`}
                  >
                    <img src={item.url} alt="Thumb" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-[9px]">
                      {item.type === 'video' ? '🎬' : '🖼️'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaStudioDrawer;
