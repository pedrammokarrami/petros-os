import React, { useState } from 'react';
import { Download, ExternalLink, RefreshCw, Sparkles, Check, Copy } from 'lucide-react';

export const ImageMessageRenderer: React.FC<{ text: string }> = ({ text }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const extractImageUrl = (t: string) => {
    if (!t || typeof t !== 'string') return null;
    const mdMatch = t.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (mdMatch) return mdMatch;
    const urlMatch = t.match(/(https?:\/\/[^\s]+(?:pollinations\.ai|\.(?:png|jpg|jpeg|webp|gif))[A-Za-z0-9_\-\.\/?%&=#]*)/i);
    if (urlMatch) return urlMatch;
    return null;
  };

  const imageUrl = extractImageUrl(text);
  if (!imageUrl) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  const remainingText = text.replace(imageUrl, '').replace(/!\[.*?\]\([^)]+\)/, '').trim();

  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const bUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = bUrl;
      a.download = `codgar-flux-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(bUrl);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 my-1 max-w-full">
      {remainingText && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-200">{remainingText}</p>
      )}

      <div className="rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900/90 shadow-2xl w-full max-w-lg text-white">
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {!loaded && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/95 p-4 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <div className="flex items-center gap-1.5 text-blue-400 font-mono text-xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>در حال رندر و تولید زنده تصویر با موتور FLUX...</span>
              </div>
              <span className="text-[10px] text-slate-400">تولید تصویر ۳ الی ۷ ثانیه زمان می‌برد</span>
            </div>
          )}

          {error ? (
            <div className="p-6 text-center text-xs text-rose-400 flex flex-col items-center gap-2">
              <span>⚠️ دریافت تصویر با خطا مواجه شد.</span>
              <button
                onClick={() => { setError(false); setLoaded(false); setRetryKey(k => k + 1); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>تلاش مجدد برای دریافت</span>
              </button>
            </div>
          ) : (
            <img
              key={retryKey}
              src={imageUrl}
              alt="AI Generated Artwork"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          )}
        </div>

        <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
              ✓ خروجی FLUX
            </span>
            <span className="text-slate-400 hidden sm:inline text-[10px]">16:9 • 1024×576</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="کپی آدرس تصویر"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => window.open(imageUrl, '_blank')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
            >
              <ExternalLink className="w-3 h-3" />
              <span>تمام‌صفحه</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition text-[11px] shadow-sm"
            >
              <Download className="w-3 h-3" />
              <span>دانلود عکس</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ImageMessageRenderer;
