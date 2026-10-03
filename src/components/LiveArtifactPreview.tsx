import React, { useState } from 'react';

export const LiveArtifactPreview = ({ code, onClose }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const [viewMode, setViewMode] = useState('desktop');

  if (isOpen === false) return null;

  let raw = (code || '').trim();
  raw = raw.replace(/\\n/g, '\n').replace(/\\t/g, '  ');

  if (raw.includes('```')) {
    const parts = raw.split('```');
    if (parts.length >= 2) {
      let extracted = parts[1];
      if (extracted.startsWith('html') || extracted.startsWith('tsx') || extracted.startsWith('jsx')) {
        extracted = extracted.replace(/^(html|tsx|jsx)\n?/, '');
      }
      raw = extracted.trim();
    }
  }

  const isHtml = raw.includes('<!DOCTYPE') || raw.includes('<html');
  const finalHtml = (raw.length > 30 && isHtml)
    ? raw
    : `<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'><script src='https://cdn.tailwindcss.com'></script></head><body class='bg-[#090a0f] text-slate-100 min-h-screen flex items-center justify-center p-6 antialiased selection:bg-cyan-500 selection:text-black'><div class='max-w-2xl text-center space-y-4'><div class='w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl mx-auto'>🚀</div><h2 class='text-xl font-bold text-white'>Yadow Real AI Preview</h2><p class='text-xs text-slate-400'>در انتظار تولید کد توسط هوش مصنوعی واقعی...</p><div class='text-left bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-xs text-slate-300 max-h-60 overflow-auto whitespace-pre-wrap'>${raw || 'No code generated yet'}</div></div></body></html>`;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4'>
      <div className='w-full max-w-6xl h-[88vh] flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0e1017] shadow-2xl'>
        <div className='h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <button onClick={() => { setIsOpen(false); onClose?.(); }} className='w-3.5 h-3.5 rounded-full bg-red-500 text-[9px] text-black font-bold flex items-center justify-center cursor-pointer'>✕</button>
            <span className='text-xs font-mono text-cyan-400 ml-2'>⚡ Yadow Real AI Live Preview</span>
          </div>
          <div className='flex items-center space-x-2'>
            <button onClick={() => setViewMode('desktop')} className={`px-3 py-1 text-xs rounded-md cursor-pointer ${viewMode === 'desktop' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}>🖥️ Desktop</button>
            <button onClick={() => setViewMode('mobile')} className={`px-3 py-1 text-xs rounded-md cursor-pointer ${viewMode === 'mobile' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}>📱 Mobile</button>
          </div>
        </div>
        <div className='flex-1 bg-[#050608] flex items-center justify-center p-2 overflow-hidden'>
          <div className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-white/10 ${viewMode === 'mobile' ? 'w-[375px]' : 'w-full'}`}>
            <iframe title='Preview' srcDoc={finalHtml} className='w-full h-full border-0 bg-black' sandbox='allow-scripts allow-modals allow-forms allow-same-origin' />
          </div>
        </div>
      </div>
    </div>
  );
};
export default LiveArtifactPreview;
