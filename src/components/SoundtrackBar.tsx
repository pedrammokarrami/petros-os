import { useState, useEffect, useRef } from 'react';
import { ambientAudio } from '../utils/ambientAudio';
import { Volume2, VolumeX, Play, Disc } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface Props {
  language?: Language;
}

export function SoundtrackBar({ language = 'en' }: Props) {
  const [state, setState] = useState(ambientAudio.getState());
  const [levels, setLevels] = useState<number[]>([15, 25, 40, 30, 20]);
  const animRef = useRef<number | null>(null);
  const t = translations[language] || translations.en;

  useEffect(() => {
    const unsub = ambientAudio.subscribe((newState) => {
      setState(newState);
    });
    return () => {
      unsub();
    };
  }, []);

  // Equalizer visualizer animation loop - only active when audio is playing
  useEffect(() => {
    if (!state.isPlaying || state.isMuted) {
      setLevels([12, 12, 12, 12, 12]);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      return;
    }

    let active = true;
    const updateSpectrum = () => {
      if (!active) return;
      const analyser = ambientAudio.getAnalyser();
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const sample1 = Math.max(10, Math.round((data[2] / 255) * 100));
        const sample2 = Math.max(10, Math.round((data[5] / 255) * 100));
        const sample3 = Math.max(10, Math.round((data[8] / 255) * 100));
        const sample4 = Math.max(10, Math.round((data[12] / 255) * 100));
        const sample5 = Math.max(10, Math.round((data[16] / 255) * 100));
        setLevels([sample1, sample2, sample3, sample4, sample5]);
      }
      animRef.current = requestAnimationFrame(updateSpectrum);
    };

    animRef.current = requestAnimationFrame(updateSpectrum);
    return () => {
      active = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state.isPlaying, state.isMuted]);

  return (
    <div id="codgar-soundtrack-bar" className="relative flex items-center select-none">
      <button
        type="button"
        onClick={() => ambientAudio.togglePlay()}
        className={`w-10 h-10 rounded-full ice-glass-btn flex items-center justify-center cursor-pointer group relative shadow-md transition-all duration-300 ${
          state.isPlaying && !state.isMuted ? 'border-blue-400' : ''
        }`}
        title={state.isPlaying ? t.muteAmbientMusic : t.playAmbientMusic}
      >
        {state.isPlaying && !state.isMuted ? (
          <Disc className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: '3.5s' }} />
        ) : (
          <Play className="w-4 h-4 text-slate-700 group-hover:text-blue-600 ml-0.5" />
        )}

        {/* Floating Mini Equalizer dot badge */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[1.5px] h-2 bg-white px-1 rounded-full border border-blue-200 shadow-sm">
          {levels.slice(0, 3).map((lvl, idx) => (
            <div
              key={idx}
              className={`w-[2px] rounded-full transition-all duration-75 ${
                state.isPlaying && !state.isMuted ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              style={{ height: `${Math.max(25, Math.min(100, lvl))}%` }}
            />
          ))}
        </div>
      </button>
    </div>
  );
}
