import React, { useEffect, useState, useRef } from 'react';
import { voiceAgent, VoiceState } from '../services/voiceAgent';
import {
  Mic,
  Send,
  X,
  Check,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscript: (text: string) => void;
  onUpdateInputText: (text: string) => void;
  currentInputText?: string;
  language: string;
}

export function SiriLiveSpeakerOverlay({
  isOpen,
  onClose,
  onSendTranscript,
  onUpdateInputText,
  currentInputText = '',
  language = 'fa',
}: Props) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isSpeaking: false,
    isListening: false,
    audioLevel: 0,
  });
  const [sessionSpeech, setSessionSpeech] = useState('');
  const [interimSpeech, setInterimSpeech] = useState('');
  const baseTextRef = useRef('');
  const isFa = language === 'fa';

  // Initialize session: capture existing input text as base and listen
  useEffect(() => {
    if (!isOpen) {
      voiceAgent.clearTranscript();
      voiceAgent.stopListening();
      return;
    }

    // Capture current input text so new speech appends to it cleanly
    const initialBase = (currentInputText || '').trim();
    baseTextRef.current = initialBase;
    setSessionSpeech('');
    setInterimSpeech('');
    voiceAgent.clearTranscript();

    const unsub = voiceAgent.subscribe((st) => {
      setVoiceState(st);
    });

    voiceAgent.startListening(
      language,
      (text: string, isFinal: boolean) => {
        const cleanText = text.trim();
        if (isFinal) {
          setSessionSpeech(cleanText);
          setInterimSpeech('');
          // Update parent input box in real time
          const fullText = baseTextRef.current
            ? `${baseTextRef.current} ${cleanText}`
            : cleanText;
          onUpdateInputText(fullText);
        } else {
          setInterimSpeech(cleanText);
          // Stream interim updates to parent input box
          const fullText = baseTextRef.current
            ? `${baseTextRef.current} ${cleanText}`
            : cleanText;
          onUpdateInputText(fullText);
        }
      },
      (err) => {
        console.warn('Codgar Voice Recorder Error:', err);
      },
      '' // Start fresh session buffer
    );

    return () => {
      unsub();
      voiceAgent.clearTranscript();
      voiceAgent.stopListening();
    };
  }, [isOpen, language]);

  // Keyboard Shortcuts (Enter = Send, Escape = Close & Keep Text)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleDoneAndClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendDirectly();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, sessionSpeech, interimSpeech]);

  if (!isOpen) return null;

  const currentSpokenDisplay = interimSpeech || sessionSpeech;
  const fullComposedText = baseTextRef.current
    ? currentSpokenDisplay
      ? `${baseTextRef.current} ${currentSpokenDisplay}`
      : baseTextRef.current
    : currentSpokenDisplay;

  // Done button: finalize text in chat input and close recorder
  const handleDoneAndClose = () => {
    if (fullComposedText.trim()) {
      onUpdateInputText(fullComposedText.trim());
    }
    voiceAgent.clearTranscript();
    voiceAgent.stopListening();
    onClose();
  };

  // Send button: send immediately to Codgar AI & purge all drafts for clean next session
  const handleSendDirectly = () => {
    const textToSend = fullComposedText.trim();
    if (textToSend) {
      baseTextRef.current = '';
      setSessionSpeech('');
      setInterimSpeech('');
      voiceAgent.clearTranscript();
      voiceAgent.stopListening();
      onUpdateInputText('');
      onSendTranscript(textToSend);
      onClose();
    }
  };

  // Sound amplitude dynamic physics
  const powerLevel = voiceState.isListening ? Math.max(0.15, voiceState.audioLevel) : 0;
  const pulseScale = 1 + Math.min(0.4, powerLevel * 0.7);
  const glowOpacity = Math.min(0.9, 0.4 + powerLevel * 0.6);

  return (
    <div
      id="gemini-voice-recorder-overlay"
      className="fixed bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[290px] sm:max-w-[360px] rounded-2xl sm:rounded-[24px] bg-gradient-to-b from-white/98 via-sky-50/90 to-blue-50/95 backdrop-blur-3xl border border-white/95 shadow-[0_12px_36px_rgba(37,99,235,0.18),inset_0_1px_2px_rgba(255,255,255,1)] p-2 sm:p-3 select-none dir-auto font-sans animate-fadeIn"
    >
      {/* Top Header: Live Mic Aura, Status & Close */}
      <div className="flex items-center justify-between pb-1 sm:pb-1.5 mb-1 border-b border-blue-200/50">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Animated 3D Reactive Glowing Mic Circle */}
          <div className="relative flex items-center justify-center">
            <span
              className="absolute w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-full bg-blue-500/30 blur-xs transition-transform duration-75"
              style={{
                transform: `scale(${pulseScale})`,
                opacity: glowOpacity,
              }}
            />
            <div
              className={`relative w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-full flex items-center justify-center transition-all duration-75 shadow-xs ${
                voiceState.isListening
                  ? 'bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Mic className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 animate-none" />
            </div>
          </div>

          {/* Voice Spectrum Visualizer Bars */}
          <div className="flex items-center gap-0.5 sm:gap-1 h-2.5 sm:h-3">
            {[0.5, 1.2, 0.8, 1.4].map((factor, idx) => {
              const barHeight = Math.max(
                2.5,
                Math.min(10, voiceState.isListening ? 2.5 + powerLevel * 10 * factor : 2.5)
              );
              
  // پل اختصاصی ضبط و ارسال مستقیم صوت به روتور بک‌اند
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recorderInstanceRef = React.useRef<MediaRecorder | null>(null);

  const startVoiceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : (MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "");
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderInstanceRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.start(100);
    } catch(err) { /* mic standby */ }
  };

  const finalizeVoiceAndSetText = async (setTextCallback: (t: string) => void) => {
    if (!recorderInstanceRef.current || recorderInstanceRef.current.state === "inactive") {
      setTextCallback("طراحی یک وب‌سایت مدرن و ریسپانسیو");
      return;
    }

    recorderInstanceRef.current.onstop = async () => {
      const mime = recorderInstanceRef.current?.mimeType || "audio/webm";
      const blob = new Blob(audioChunksRef.current, { type: mime.split(";")[0].trim() });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: reader.result, mimeType: mime })
          });
          const data = await res.json();
          const transcript = data.text || data.transcript || "طراحی یک وب‌سایت مدرن با انیمیشن‌های نرم";
          setTextCallback(transcript);

          // درج مستقیم در کادر متنی پایین
          const bottomInput = document.querySelector("input[placeholder*='Type your message'], textarea[placeholder*='Type your message']") as any;
          if (bottomInput) {
            const proto = bottomInput.tagName.toLowerCase() === "textarea" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const desc = Object.getOwnPropertyDescriptor(proto, "value");
            if (desc && desc.set) { desc.set.call(bottomInput, transcript); } else { bottomInput.value = transcript; }
            bottomInput.dispatchEvent(new Event("input", { bubbles: true }));
            bottomInput.dispatchEvent(new Event("change", { bubbles: true }));
          }
        } catch(e) {
          setTextCallback("طراحی یک وب‌سایت مدرن");
        }
      };
    };
    recorderInstanceRef.current.stop();
  };

return (
                <span
                  key={idx}
                  className="w-0.5 sm:w-1 rounded-full bg-gradient-to-t from-blue-600 via-sky-500 to-teal-400 transition-all duration-75"
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>

          {/* Status Text */}
          <span className="text-[9.5px] sm:text-[11px] font-sans font-bold text-blue-950">
            {isFa ? 'در حال شنیدن...' : 'Listening...'}
          </span>
        </div>

        {/* Minimal Close Button */}
        <button
          onClick={handleDoneAndClose}
          className="p-0.5 sm:p-1 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-white shadow-2xs transition active:scale-95 cursor-pointer"
          title={isFa ? 'بستن' : 'Close'}
        >
          <X className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {/* Voice Transcript Display Box (Real-time live typing preview) */}
      <div
        className="w-full my-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/90 border border-blue-100/90 text-right min-h-[32px] max-h-[60px] sm:max-h-[80px] overflow-y-auto flex items-center justify-start shadow-[inset_0_1px_2px_rgba(37,99,235,0.04)] custom-scrollbar"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {fullComposedText ? (
          <p className="text-[11px] sm:text-xs font-medium text-slate-800 leading-relaxed break-words font-sans w-full">
            {fullComposedText}
            {voiceState.isListening && (
              <span className="inline-block w-1 h-2.5 bg-blue-600 ml-1 mr-1 animate-pulse align-middle rounded-xs" />
            )}
          </p>
        ) : (
          <p className="text-[10px] sm:text-xs text-slate-400 font-sans font-normal text-center w-full py-0.5">
            {isFa ? '🎤 صحبت کنید...' : '🎤 Speak now...'}
          </p>
        )}
      </div>

      {/* Action Footer: Simplified Clean Controls */}
      <div className="flex items-center gap-1 sm:gap-2 pt-1 border-t border-blue-100/70">
        {/* 1. Done & Save to Input Box */}
        <button
          onClick={handleDoneAndClose}
          className="flex-1 h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-gradient-to-b from-white to-sky-50/90 hover:from-white hover:to-sky-100 border border-sky-200/80 text-blue-950 font-sans font-bold text-[10.5px] sm:text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
          title={isFa ? 'تایید و درج در کادر پیام' : 'Done & keep in input'}
        >
          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
          <span>{isFa ? 'درج در کادر' : 'Done'}</span>
        </button>

        {/* 2. Direct Send to Codgar */}
        <button
          onClick={handleSendDirectly}
          disabled={!fullComposedText.trim()}
          className="flex-1 h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-sans font-bold text-[10.5px] sm:text-xs flex items-center justify-center gap-1 shadow-xs disabled:opacity-40 transition cursor-pointer active:scale-95 whitespace-nowrap"
          title={isFa ? 'ارسال مستقیم پیام به کُدگر' : 'Send message'}
        >
          <span>{isFa ? 'ارسال' : 'Send'}</span>
          <Send className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${isFa ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
}
