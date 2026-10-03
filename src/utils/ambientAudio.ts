// Web Audio API Ambient Synthesizer Engine
// Inspired by Mac Quayle's iconic dark analog synthesizer score for Mr. Robot (e.g. 1.0_8-mindwipe)
// 100% offline, zero external dependencies, synthesized directly in the browser.

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Oscillators & Nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noiseNode: AudioNode | null = null;
  private arpeggioTimer: any = null;
  private volume: number = 0.25;

  private listeners: Set<(state: { isPlaying: boolean; isMuted: boolean; volume: number }) => void> = new Set();

  public subscribe(fn: (state: { isPlaying: boolean; isMuted: boolean; volume: number }) => void) {
    this.listeners.add(fn);
    fn(this.getState());
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((fn) => fn(s));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
    };
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async start() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isPlaying) return;

    const ctx = this.ctx;

    // Master Gain & Analyser
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, ctx.currentTime);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    // Resonant Lowpass Filter (The classic Mr. Robot analog synth tone)
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(140, ctx.currentTime);
    this.filter.Q.setValueAtTime(4.5, ctx.currentTime);
    this.filter.connect(this.masterGain);

    // LFO to slowly sweep the filter cutoff (creates that slow, moody, atmospheric breathing)
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow sweep
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(70, ctx.currentTime);
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    // Drone 1: Root F1 (43.65 Hz) Sawtooth softened
    this.droneOsc1 = ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(43.65, ctx.currentTime);
    const droneGain1 = ctx.createGain();
    droneGain1.gain.setValueAtTime(0.25, ctx.currentTime);
    this.droneOsc1.connect(droneGain1);
    droneGain1.connect(this.filter);
    this.droneOsc1.start();

    // Drone 2: Fifth C2 (65.41 Hz) Triangle
    this.droneOsc2 = ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(65.41, ctx.currentTime);
    // Slight detune for analog warmth
    this.droneOsc2.detune.setValueAtTime(4, ctx.currentTime);
    const droneGain2 = ctx.createGain();
    droneGain2.gain.setValueAtTime(0.3, ctx.currentTime);
    this.droneOsc2.connect(droneGain2);
    droneGain2.connect(this.filter);
    this.droneOsc2.start();

    // Sub-bass sine wave (32.7 Hz / C1)
    this.subOsc = ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(32.7, ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.35, ctx.currentTime);
    this.subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    this.subOsc.start();

    // Subtle vinyl/tape analog noise floor
    this.startNoise(ctx, this.masterGain);

    // Minor Arpeggiator (Pulsing Mac Quayle motif)
    this.startArpeggio(ctx);

    this.isPlaying = true;
    this.notify();
  }

  private startNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.008; // very subtle
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter noise to sound like tape hiss
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(destination);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  private startArpeggio(ctx: AudioContext) {
    // Mr. Robot F-minor pentatonic / dark modal frequencies: F2, Ab2, Bb2, C3, Eb3
    const notes = [87.31, 103.83, 116.54, 130.81, 155.56, 174.61, 130.81, 116.54];
    let noteIdx = 0;

    const playStep = () => {
      if (!this.isPlaying || !this.ctx || !this.filter) return;
      const now = this.ctx.currentTime;
      const freq = notes[noteIdx % notes.length];
      noteIdx++;

      // Pluck oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = Math.random() > 0.3 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, now);

      // Soft analog attack and decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      // Individual filter envelope for the pluck
      const noteFilter = this.ctx.createBiquadFilter();
      noteFilter.type = 'lowpass';
      noteFilter.frequency.setValueAtTime(350, now);
      noteFilter.frequency.exponentialRampToValueAtTime(120, now + 0.35);

      osc.connect(noteFilter);
      noteFilter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.45);
    };

    // 130 BPM eighth notes pulse (approx 230ms per step)
    this.arpeggioTimer = setInterval(playStep, 235);
  }

  public stop() {
    if (!this.isPlaying) return;
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.subOsc?.stop();
      this.lfo?.stop();
      if (this.arpeggioTimer) {
        clearInterval(this.arpeggioTimer);
        this.arpeggioTimer = null;
      }
    } catch (e) {
      console.warn('Error stopping ambient audio:', e);
    }
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime
      );
    }
    this.notify();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }
}

export const ambientAudio = new AmbientAudioEngine();
