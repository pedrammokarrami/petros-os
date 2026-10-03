// Web Speech Synthesis, Real-Time Audio Spectrum Analyzer, and Ultra-Fast Speech Recognition
// Optimized for instantaneous (zero-delay) microphone activation, multi-click reliability, and continuous accumulation

export interface VoiceState {
  isSpeaking: boolean;
  isListening: boolean;
  audioLevel: number;
  frequencyData?: Uint8Array;
  transcript?: string;
  interimTranscript?: string;
}

class VoiceAgentService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private silenceTimer: any = null;

  private async sendAudioToTranscribe() {
    if (this.audioChunks.length === 0) return;
    const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
    this.audioChunks = [];
    try {
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: blob
      });
      const data = await res.json();
      if (data.text && this.onResultCallback) {
        this.accumulatedTranscript = (this.accumulatedTranscript ? this.accumulatedTranscript + " " : "") + data.text.trim();
        this.onResultCallback(this.accumulatedTranscript, true);
        this.notify();
      }
    } catch (e) {}
  }

  private isSpeaking: boolean = false;
  private isListening: boolean = false;
  private recognition: any = null;
  private listeners: Set<(state: VoiceState) => void> = new Set();
  private audioLevel: number = 0;
  private levelInterval: any = null;
  private accumulatedTranscript: string = '';
  private currentInterim: string = '';
  private isRestarting: boolean = false;
  private activeLanguage: string = 'fa';
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((err: any) => void) | null = null;

  // Web Audio Context for real mic frequency spectrum
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private frequencyArray: Uint8Array = new Uint8Array(32);

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): any {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const instance = new SpeechRecognition();
        instance.continuous = true;
        instance.interimResults = true;
        instance.maxAlternatives = 1;
        return instance;
      } catch (e) {
        console.warn('SpeechRecognition creation warning:', e);
      }
    }
    return null;
  }

  public subscribe(fn: (state: VoiceState) => void) {
    this.listeners.add(fn);
    fn(this.getState());
    return () => {
      this.listeners.delete(fn);
    };
  }

  public getState(): VoiceState {
    return {
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      audioLevel: this.audioLevel,
      frequencyData: this.frequencyArray,
      transcript: this.accumulatedTranscript,
      interimTranscript: this.currentInterim,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  // Live Speech Playback (Text-to-Speech)
  public speak(text: string, language: string = 'fa', onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      try {
      const clean = text.replace(/```[\s\S]*?```/g, "کدها پردازش شدند.").replace(/[#*_~>`]/g, "").trim();
      const short = clean.split(/[.!?\n]/).filter(Boolean).slice(0, 3).join(". ") + ".";
      const audio = new Audio("/api/voice/tts?lang=" + encodeURIComponent(language) + "&text=" + encodeURIComponent(short));
      audio.onended = () => { this.isSpeaking = false; this.notify(); if (onEnd) onEnd(); };
      audio.onerror = () => { this.isSpeaking = false; this.notify(); if (onEnd) onEnd(); };
      this.isSpeaking = true;
      this.notify();
      audio.play().catch(() => {});
      return;
    } catch (e) {}
    window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'کدها پردازش شدند.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#*_~>]/g, '')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      const shortSpeech =
        cleanText
          .split(/[.!?\n]/)
          .filter(Boolean)
          .slice(0, 3)
          .join('. ') + '.';

      const utterance = new SpeechSynthesisUtterance(shortSpeech);
      utterance.lang = language === 'fa' ? 'fa-IR' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find((v) =>
        language === 'fa'
          ? v.lang.startsWith('fa') || v.lang.startsWith('ar')
          : v.lang.startsWith('en')
      );
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      this.isSpeaking = true;
      this.startLevelOscillation();
      this.notify();

      utterance.onend = () => {
        this.isSpeaking = false;
        this.stopLevelOscillation();
        this.notify();
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.stopLevelOscillation();
        this.notify();
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.isSpeaking = false;
      this.stopLevelOscillation();
      this.notify();
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.stopLevelOscillation();
    this.notify();
  }

  private startLevelOscillation() {
    if (this.levelInterval) clearInterval(this.levelInterval);
    this.levelInterval = setInterval(() => {
      this.audioLevel = 0.2 + Math.random() * 0.7;
      for (let i = 0; i < this.frequencyArray.length; i++) {
        this.frequencyArray[i] = Math.floor(Math.random() * 180 * this.audioLevel);
      }
      this.notify();
    }, 60);
  }

  private stopLevelOscillation() {
    if (this.levelInterval) {
      clearInterval(this.levelInterval);
      this.levelInterval = null;
    }
    this.audioLevel = 0;
    this.frequencyArray.fill(0);
    this.notify();
  }

  // Non-blocking, instant background mic stream connection
  private async startMicrophoneAnalyser() {
    try {
      if (navigator.mediaDevices && /* getUserMedia disabled */ undefined) {
        if (!this.micStream) {
          this.micStream = await /* getUserMedia disabled */ undefined({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        }

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!this.audioContext || this.audioContext.state === 'closed') {
            this.audioContext = new AudioCtx();
          }
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }

          if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.2; // Ultra-fast responsiveness
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            source.connect(this.analyser);
          }

          const bufferLength = this.analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          this.frequencyArray = new Uint8Array(bufferLength);

          const updateSpectrum = () => {
            if (!this.isListening || !this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            this.frequencyArray = new Uint8Array(dataArray);

            // Compute normalized RMS amplitude instantly
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            this.audioLevel = Math.min(1, avg / 60); // High sensitivity to voice

            this.notify();
            this.animationFrameId = requestAnimationFrame(updateSpectrum);
          };

          updateSpectrum();
          return;
        }
      }
    } catch (err) {
      console.warn('Real microphone audio analyzer fallback:', err);
    }

    // Fallback simulation
    this.startLevelOscillation();
  }

  private stopMicrophoneAnalyser() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioContext && this.audioContext.state === 'running') {
      try {
        this.audioContext.suspend();
      } catch {}
    }
    this.stopLevelOscillation();
  }

  // Set or update accumulated text (to keep previous speeches)
  public setAccumulatedTranscript(text: string) {
    this.accumulatedTranscript = text;
    this.currentInterim = '';
    this.notify();
  }

  public clearTranscript() {
    this.accumulatedTranscript = '';
    this.currentInterim = '';
    this.notify();
  }

  // Instantaneous Start Voice Recognition Listening Session
  public startListening(
    language: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: any) => void,
    initialText?: string
  ): boolean {
    this.activeLanguage = language;
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    if (initialText !== undefined && initialText !== null) {
      this.accumulatedTranscript = initialText.trim();
    }

    this.currentInterim = '';
    this.isListening = true;
    this.audioLevel = 0.2; // Immediate visual feedback so user sees it live right away
    this.notify();

    // Fire audio spectrum concurrently in background
    this.startMicrophoneAnalyser();
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        try {
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.audioChunks.push(e.data);
          };
          this.mediaRecorder.start(400);
        } catch(e) {}
      }).catch(() => {});
    }

    // Safely configure and launch speech recognition
    this.launchRecognitionInstance();

    return true;
  }

  private launchRecognitionInstance() {
    if (typeof window === 'undefined') return;

    // If an instance exists, clean it up cleanly first to avoid InvalidStateError on repeated clicks
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {
        // ignore cleanup error
      }
      this.recognition = null;
    }

    this.recognition = this.initSpeechRecognition();
    if (!this.recognition) {
      this.notify();
      return;
    }

    try {
      this.recognition.lang =
        this.activeLanguage === 'fa'
          ? 'fa-IR'
          : this.activeLanguage === 'es'
          ? 'es-ES'
          : this.activeLanguage === 'fr'
          ? 'fr-FR'
          : this.activeLanguage === 'ru'
          ? 'ru-RU'
          : this.activeLanguage === 'zh'
          ? 'zh-CN'
          : this.activeLanguage === 'hi'
          ? 'hi-IN'
          : this.activeLanguage === 'pt'
          ? 'pt-BR'
          : 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTrans = '';
        let newFinalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            if (item.isFinal) {
              newFinalTrans += (newFinalTrans ? ' ' : '') + item[0].transcript.trim();
            } else {
              interimTrans += (interimTrans ? ' ' : '') + item[0].transcript.trim();
            }
          }
        }

        if (newFinalTrans) {
          if (this.accumulatedTranscript) {
            this.accumulatedTranscript = `${this.accumulatedTranscript} ${newFinalTrans}`.trim();
          } else {
            this.accumulatedTranscript = newFinalTrans.trim();
          }
          this.currentInterim = '';
          if (this.onResultCallback) {
            this.onResultCallback(this.accumulatedTranscript, true);
          }
        } else if (interimTrans) {
          this.currentInterim = interimTrans;
          const fullInterim = this.accumulatedTranscript
            ? `${this.accumulatedTranscript} ${interimTrans}`
            : interimTrans;
          if (this.onResultCallback) {
            this.onResultCallback(fullInterim, false);
          }
        }
        this.notify();
      };

      this.recognition.onerror = (event: any) => {
        console.warn("[Voice Engine] Speech status:", event.error);
        // If network error (Google blocked), gracefully provide simulated fallback or keep listening
        if (event.error === "network") {
          console.log("[Voice Engine] Google Speech offline, maintaining live session...");
        }
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition status:', event.error);
          if (this.onErrorCallback) this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        // If the user hasn't explicitly stopped listening, immediately restart (continuous mode)
        if (this.isListening && !this.isRestarting) {
          this.isRestarting = true;
          setTimeout(() => {
            if (this.isListening) {
              try {
                this.launchRecognitionInstance();
              } catch (reErr) {
                console.warn('Voice restart note:', reErr);
              }
            }
            this.isRestarting = false;
          }, 60);
        }
      };

      this.recognition.start();
    } catch (e: any) {
      if (e?.name === 'InvalidStateError') {
        // Already started or busy: re-instantiate cleanly
        setTimeout(() => {
          if (this.isListening) {
            this.launchRecognitionInstance();
          }
        }, 80);
      } else {
        console.warn('Speech recognition start note:', e);
      }
    }
  }

  public stopListening() {
    this.isListening = false;
    this.isRestarting = false;
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch(e) {}
      this.sendAudioToTranscribe();
    }
    this.stopMicrophoneAnalyser();
    this.currentInterim = '';
    this.notify();
  }
}

export const voiceAgent = new VoiceAgentService();
