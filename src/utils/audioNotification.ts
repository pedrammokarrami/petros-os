// Vibrant, Luxury & Crystal Clear AI Completion Chime for Codgar AI Responses
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function playSoftChimeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime + 0.01;

    // Harmonic Luxury Two-Stage Chime: Note 1 (E5: 659.25Hz), Note 2 (A5: 880Hz), Sparkle Overtones
    const chords = [
      { freq: 659.25, time: now, duration: 0.35, gain: 0.12 },
      { freq: 880.0, time: now + 0.08, duration: 0.45, gain: 0.15 },
      { freq: 1318.5, time: now + 0.14, duration: 0.55, gain: 0.08 },
    ];

    chords.forEach((note) => {
      // Main fundamental tone (smooth sine)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, note.time);

      gainNode.gain.setValueAtTime(0.0001, note.time);
      gainNode.gain.linearRampToValueAtTime(note.gain, note.time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, note.time + note.duration);

      osc.connect(gainNode);

      // Warm subtle harmonic overtone
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(note.freq * 2, note.time);

      overtoneGain.gain.setValueAtTime(0.0001, note.time);
      overtoneGain.gain.linearRampToValueAtTime(note.gain * 0.25, note.time + 0.015);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.duration * 0.7);

      overtone.connect(overtoneGain);

      gainNode.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(note.time);
      overtone.start(note.time);

      osc.stop(note.time + note.duration);
      overtone.stop(note.time + note.duration);
    });
  } catch (err) {
    console.warn('[Codgar Audio] Notification chime:', err);
  }
}
