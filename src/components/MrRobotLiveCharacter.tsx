import React, { useEffect, useState, useRef } from 'react';
import { AgentState } from '../types';
import { voiceAgent } from '../services/voiceAgent';
import { Volume2, VolumeX, Sparkles, BrainCircuit, Orbit } from 'lucide-react';
import { CosmicOrbitalHackerCanvas } from './CosmicOrbitalHackerCanvas';

interface Props {
  agentState: AgentState;
  isExecuting: boolean;
  latestAgentMessage?: string;
  language: string;
}

export function MrRobotLiveCharacter({
  agentState,
  isExecuting,
  latestAgentMessage,
  language,
}: Props) {
  const [voiceState, setVoiceState] = useState({ isSpeaking: false, isListening: false, audioLevel: 0 });
  const [voiceMuted, setVoiceMuted] = useState(false);

  // Subscribe to speech synthesis & recognition audio harmonics
  useEffect(() => {
    const unsub = voiceAgent.subscribe((st) => {
      setVoiceState(st);
    });
    return () => unsub();
  }, []);

  // When server responds with agent message, live voice talks with lip-sync
  useEffect(() => {
    if (latestAgentMessage && !voiceMuted) {
      voiceAgent.speak(latestAgentMessage, language);
    }
  }, [latestAgentMessage, language, voiceMuted]);

  const toggleMuteVoice = () => {
    if (!voiceMuted) {
      voiceAgent.stopSpeaking();
    }
    setVoiceMuted(!voiceMuted);
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative group">
        {/* Deep Cosmic Backdrop Glow */}
        <div
          className={`absolute -inset-6 rounded-full blur-3xl opacity-70 transition-all duration-700 pointer-events-none ${
            isExecuting
              ? 'bg-gradient-to-r from-red-600/40 via-amber-500/30 to-red-600/40 animate-pulse'
              : voiceState.isSpeaking
              ? 'bg-gradient-to-r from-rose-500/40 via-red-500/30 to-rose-500/40 animate-pulse'
              : 'bg-gradient-to-r from-red-950/40 via-slate-900/50 to-red-950/40'
          }`}
        />

        {/* Live Cosmic Character with 3D Swirling Halos */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-red-500/30 shadow-[0_0_80px_rgba(0,0,0,0.98)] bg-gradient-to-b from-[#0e121d] via-[#080a11] to-[#020306] backdrop-blur-2xl flex items-center justify-center">
          <CosmicOrbitalHackerCanvas
            agentState={agentState}
            isExecuting={isExecuting}
            width={340}
            height={340}
            interactive={true}
          />

          {/* Real-time State Badge */}
          <div className="absolute bottom-3 px-3 py-1 rounded-full text-[10px] font-sans tracking-wider flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all duration-300">
            {isExecuting ? (
              <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/90 border border-rose-500/50 animate-pulse px-3 py-1 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <BrainCircuit className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span className="font-semibold">{language === 'fa' ? 'در حال تفکر و پردازش هاله...' : 'THINKING // COMPUTING...'}</span>
              </div>
            ) : voiceState.isSpeaking ? (
              <div className="flex items-center gap-1.5 text-red-300 bg-red-950/90 border border-red-500/50 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span className="font-semibold">{language === 'fa' ? 'در حال پاسخ زنده...' : 'SPEAKING LIVE...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-200 bg-black/80 border border-white/15 px-3 py-1 rounded-full shadow-md">
                <Orbit className="w-3 h-3 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{language === 'fa' ? 'کیان // متصل' : 'CODGAR // SYNCHRONIZED'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Voice Mute / Unmute Toggle Button */}
        <button
          onClick={toggleMuteVoice}
          className="absolute top-2 right-2 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white border border-red-500/30 shadow-lg transition cursor-pointer z-10"
          title={voiceMuted ? 'Unmute Live Voice' : 'Mute Live Voice'}
        >
          {voiceMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
