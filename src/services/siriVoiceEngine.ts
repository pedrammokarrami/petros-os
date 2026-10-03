// Real-time Voice & Audio Analyzer Engine for Siri Reimagined Experience

export interface SiriSpeechRecognitionCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (err: string) => void;
  onStateChange: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  onAudioLevel: (level: number) => void;
}

export class SiriVoiceEngine {
  private static instance: SiriVoiceEngine | null = null;
  private recognition: any = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneStream: MediaStream | null = null;
  private animFrame: number = 0;
  private isListening: boolean = false;
  private synthesisVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    this.initSpeechSynthesis();
  }

  public static getInstance(): SiriVoiceEngine {
    if (!SiriVoiceEngine.instance) {
      SiriVoiceEngine.instance = new SiriVoiceEngine();
    }
    return SiriVoiceEngine.instance;
  }

  private initSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural English or Persian/Multilingual voice
        this.synthesisVoice =
          voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0] ||
          null;
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  public async startListening(
    callbacks: SiriSpeechRecognitionCallbacks,
    lang: string = 'fa-IR'
  ): Promise<boolean> {
    try {
      // 1. Microphone Web Audio API Analyser for 60fps waveform sync
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      try {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const source = this.audioCtx.createMediaStreamSource(this.microphoneStream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const trackAudio = () => {
          if (!this.isListening || !this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1, avg / 85); // 0 to 1

          callbacks.onAudioLevel(normalized);
          this.animFrame = requestAnimationFrame(trackAudio);
        };

        this.animFrame = requestAnimationFrame(trackAudio);
      } catch (e) {
        console.warn('Microphone stream analyzer not accessible, using synthetic pulses:', e);
      }

      // 2. Speech Recognition (Web Speech API)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        callbacks.onError('Web Speech API is not supported in this browser.');
        return false;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = lang === 'fa' ? 'fa-IR' : 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStateChange('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          callbacks.onTranscript(text, !!finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          callbacks.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or stopped
          }
        }
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start voice recognition:', err);
      callbacks.onError(err.message || 'Microphone error');
      return false;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }
  }

  public speak(
    text: string,
    lang: string = 'fa',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = text.replace(/[#*`_~]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'fa' ? 'fa-IR' : 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    if (this.synthesisVoice) {
      utterance.voice = this.synthesisVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
