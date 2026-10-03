import React, { useEffect, useState, useRef } from 'react';
import { AgentState } from '../types';
import { voiceAgent } from '../services/voiceAgent';
import { Volume2, VolumeX, Sparkles, Terminal, Code2, BrainCircuit } from 'lucide-react';

interface Props {
  agentState: AgentState;
  isExecuting: boolean;
  latestAgentMessage?: string;
  language: string;
  onQuickPrompt?: (prompt: string) => void;
}

export function LiveCharacterAvatar({
  agentState,
  isExecuting,
  latestAgentMessage,
  language,
  onQuickPrompt,
}: Props) {
  const [voiceState, setVoiceState] = useState({ isSpeaking: false, isListening: false, audioLevel: 0 });
  const [voiceMuted, setVoiceMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Subscribe to voice state for mouth synchronization
  useEffect(() => {
    const unsub = voiceAgent.subscribe((st) => {
      setVoiceState(st);
    });
    return () => unsub();
  }, []);

  // When a new message comes from server, trigger realistic live speech if not muted
  useEffect(() => {
    if (latestAgentMessage && !voiceMuted) {
      voiceAgent.speak(latestAgentMessage, language);
    }
  }, [latestAgentMessage, language, voiceMuted]);

  // Canvas-based organic living avatar animation with realistic breathing, eyelid blinks, lip-sync, and cybernetic halo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let blinkProgress = 0; // 0 = open, 1 = closed
    let nextBlink = 80 + Math.random() * 120;
    let headTilt = 0;

    const render = () => {
      time += 0.035;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Status dynamics
      const isThinking = isExecuting || agentState === 'planning' || agentState === 'searching';
      const isSpeaking = voiceState.isSpeaking || agentState === 'writing' || agentState === 'reading';
      const audioAmp = voiceState.isSpeaking ? voiceState.audioLevel : isThinking ? Math.sin(time * 6) * 0.2 + 0.3 : 0;

      // Organic idle breathing motion
      const breath = Math.sin(time * 1.5) * 4;
      const lookX = Math.sin(time * 0.8) * 3;
      const lookY = Math.cos(time * 0.7) * 2;

      // Handle blinks naturally
      if (nextBlink-- <= 0) {
        blinkProgress += 0.25;
        if (blinkProgress >= 1) {
          blinkProgress = 0;
          nextBlink = 90 + Math.random() * 150;
        }
      }

      // Outer Cybernetic Ambient Aura / Audio Rings
      const ringRadius = 78 + breath;
      const auraGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, ringRadius + 28);
      
      if (isThinking) {
        // Cyan / Purple thinking pulsating energy
        auraGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
        auraGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.15)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (isSpeaking) {
        // Emerald / Teal speech resonance
        auraGrad.addColorStop(0, `rgba(16, 185, 129, ${0.3 + audioAmp * 0.4})`);
        auraGrad.addColorStop(0.7, 'rgba(5, 150, 105, 0.12)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        // Calm ambient emerald-dark
        auraGrad.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
        auraGrad.addColorStop(0.8, 'rgba(6, 78, 59, 0.05)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius + 28, 0, Math.PI * 2);
      ctx.fill();

      // Audio Frequency Particle Orbiters
      const particleCount = 16;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * (isThinking ? 1.8 : 0.6);
        const dist = ringRadius + Math.sin(time * 4 + i) * (isSpeaking ? 12 * audioAmp : 4);
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.fillStyle = isThinking ? 'rgba(34, 211, 238, 0.7)' : isSpeaking ? 'rgba(52, 211, 153, 0.8)' : 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 2.2 + (isSpeaking ? audioAmp * 2 : 0), 0, Math.PI * 2);
        ctx.fill();
      }

      // Cybernetic Head Base (Hooded Hacker / Android Silhouette with Apple-grade polish)
      ctx.save();
      ctx.translate(cx + lookX * 0.4, cy + breath * 0.6);

      // Shoulders / Dark Hoodie base
      ctx.fillStyle = '#0a1017';
      ctx.beginPath();
      ctx.ellipse(0, 84, 85, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer Hood Curve
      ctx.fillStyle = '#0f1722';
      ctx.beginPath();
      ctx.moveTo(-52, 45);
      ctx.bezierCurveTo(-65, -10, -55, -65, 0, -74);
      ctx.bezierCurveTo(55, -65, 65, -10, 52, 45);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isThinking ? 'rgba(6, 182, 212, 0.4)' : 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Face Inner shadow / Dark Tech Faceplate
      const faceGrad = ctx.createLinearGradient(0, -45, 0, 35);
      faceGrad.addColorStop(0, '#111827');
      faceGrad.addColorStop(1, '#030712');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.moveTo(-34, 30);
      ctx.bezierCurveTo(-44, -5, -38, -46, 0, -50);
      ctx.bezierCurveTo(38, -46, 44, -5, 34, 30);
      ctx.bezierCurveTo(24, 46, -24, 46, -34, 30);
      ctx.closePath();
      ctx.fill();

      // Cyber Visor / Glowing Optical Eyes
      const eyeY = -12;
      const eyeSpacing = 19;
      const eyeWidth = 14;
      const eyeHeight = Math.max(1, 7 * (1 - Math.sin(blinkProgress * Math.PI)));

      // Eye Glow
      ctx.shadowColor = isThinking ? '#06b6d4' : '#10b981';
      ctx.shadowBlur = 12 + (isSpeaking ? audioAmp * 10 : 0);

      // Left Eye
      ctx.fillStyle = isThinking ? '#22d3ee' : '#34d399';
      ctx.beginPath();
      ctx.roundRect(-eyeSpacing - eyeWidth / 2 + lookX, eyeY + lookY, eyeWidth, eyeHeight, 3);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.roundRect(eyeSpacing - eyeWidth / 2 + lookX, eyeY + lookY, eyeWidth, eyeHeight, 3);
      ctx.fill();

      // Pupil Focus lights
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-eyeSpacing + lookX * 1.2, eyeY + lookY + 0.5, 1.8, 0, Math.PI * 2);
      ctx.arc(eyeSpacing + lookX * 1.2, eyeY + lookY + 0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Living Animated Mouth (Lip-sync reacts to voice or thinking waves)
      const mouthY = 18;
      const mouthWidth = 18 + (isSpeaking ? audioAmp * 8 : 0);
      const mouthHeight = isSpeaking ? 3 + audioAmp * 12 : isThinking ? 2 + Math.sin(time * 8) * 1.5 : 2;

      ctx.strokeStyle = isThinking ? '#22d3ee' : '#10b981';
      ctx.lineWidth = 2;
      ctx.fillStyle = isSpeaking && audioAmp > 0.2 ? 'rgba(5, 150, 105, 0.4)' : '#0f172a';

      ctx.beginPath();
      if (mouthHeight > 3) {
        ctx.ellipse(0, mouthY, mouthWidth / 2, mouthHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.moveTo(-mouthWidth / 2, mouthY);
        ctx.quadraticCurveTo(0, mouthY + (isSpeaking ? audioAmp * 4 : 0), mouthWidth / 2, mouthY);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [agentState, isExecuting, voiceState]);

  const toggleMuteVoice = () => {
    if (!voiceMuted) {
      voiceAgent.stopSpeaking();
    }
    setVoiceMuted(!voiceMuted);
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 select-none">
      <div className="relative group">
        {/* Holographic Glowing Ring around the Canvas */}
        <div
          className={`absolute -inset-2 rounded-full blur-xl opacity-60 transition-all duration-700 pointer-events-none ${
            isExecuting
              ? 'bg-gradient-to-r from-cyan-500/40 via-indigo-500/40 to-cyan-500/40 animate-pulse'
              : voiceState.isSpeaking
              ? 'bg-gradient-to-r from-emerald-500/50 via-teal-500/40 to-emerald-500/50 animate-pulse'
              : 'bg-gradient-to-r from-emerald-950/40 via-emerald-800/20 to-emerald-950/40'
          }`}
        />

        {/* Live Canvas Character Avatar */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.85)] bg-gradient-to-b from-[#0d141e]/90 to-[#05080e]/95 backdrop-blur-xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="w-full h-full object-contain"
          />

          {/* Real-time State Badge floating on the avatar */}
          <div className="absolute bottom-3 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all duration-300">
            {isExecuting ? (
              <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/80 border-cyan-500/40 animate-pulse px-2 py-0.5 rounded-full">
                <BrainCircuit className="w-3 h-3 animate-spin" />
                <span>{language === 'fa' ? 'در حال تفکر و پردازش...' : 'ANALYZING & THINKING...'}</span>
              </div>
            ) : voiceState.isSpeaking ? (
              <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/80 border-emerald-500/40 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{language === 'fa' ? 'در حال پاسخ صوتی...' : 'SPEAKING LIVE...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-300 bg-black/60 border-white/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'fa' ? 'آماده شنیدن و گفتگو' : 'ONLINE // READY'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Voice Mute / Unmute Button */}
        <button
          onClick={toggleMuteVoice}
          className="absolute top-2 right-2 p-2 rounded-full liquid-btn text-slate-300 hover:text-white border border-white/10 shadow-lg transition cursor-pointer"
          title={voiceMuted ? 'Unmute Live Character Voice' : 'Mute Character Voice'}
        >
          {voiceMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
