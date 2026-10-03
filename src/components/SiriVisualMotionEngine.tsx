import React, { useEffect, useRef, useState } from 'react';

export type VisualMode = 'ribbons' | 'orb' | 'particles' | 'waveform' | 'eclipse';
export type ColorTheme = 'classic' | 'neon' | 'solar' | 'aurora' | 'deepspace';
export type SiriAgentState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Props {
  visualMode?: VisualMode;
  colorTheme?: ColorTheme;
  agentState?: SiriAgentState;
  audioLevel?: number; // 0 to 1
  sensitivity?: number;
  interactive?: boolean;
  onOrbClick?: () => void;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  hue: number;
  layer: number;
  angle: number;
  orbitRadius: number;
  speed: number;
}

export function SiriVisualMotionEngine({
  visualMode = 'ribbons',
  colorTheme = 'classic',
  agentState = 'idle',
  audioLevel = 0,
  sensitivity = 1.0,
  interactive = true,
  onOrbClick,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    active: false,
    targetX: 0,
    targetY: 0,
  });

  const animFrameId = useRef<number>(0);
  const smoothedAudioRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const isMobileRef = useRef<boolean>(false);

  // Color Theme Gradients
  const getPalette = (theme: ColorTheme) => {
    switch (theme) {
      case 'neon':
        return {
          primary: '#ff007f',     // Neon Hot Pink
          secondary: '#00f0ff',   // Electric Cyan
          tertiary: '#9d00ff',    // Neon Purple
          quaternary: '#00ff88',  // Acid Green
          accent: '#ffffff',
          ambient: 'rgba(255, 0, 127, 0.15)',
        };
      case 'solar':
        return {
          primary: '#ff9500',     // Solar Gold
          secondary: '#ff2d55',   // Crimson Flare
          tertiary: '#ffd60a',    // Pure Amber
          quaternary: '#ff3b30',  // Radiant Red
          accent: '#ffffff',
          ambient: 'rgba(255, 149, 0, 0.18)',
        };
      case 'aurora':
        return {
          primary: '#30d158',     // Emerald Aurora
          secondary: '#00f0ff',   // Cyan Ice
          tertiary: '#5856d6',    // Indigo Glow
          quaternary: '#64d2ff',  // Light Blue
          accent: '#ffffff',
          ambient: 'rgba(48, 209, 88, 0.15)',
        };
      case 'deepspace':
        return {
          primary: '#0a84ff',     // Deep Cobalt
          secondary: '#bf5af2',   // Electric Violet
          tertiary: '#5e5ce6',    // Deep Indigo
          quaternary: '#00ffff',  // Cyan Starlight
          accent: '#ffffff',
          ambient: 'rgba(10, 132, 255, 0.15)',
        };
      case 'classic':
      default:
        return {
          primary: '#00f0ff',     // Siri Cyan
          secondary: '#ff2d75',   // Siri Magenta Pink
          tertiary: '#8a2be2',    // Siri Royal Violet
          quaternary: '#ff9f0a',  // Siri Warm Amber Highlight
          accent: '#ffffff',      // Pure White Core
          ambient: 'rgba(0, 240, 255, 0.18)',
        };
    }
  };

  // Initialize Canvas & Particle Physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    isMobileRef.current = window.innerWidth < 768;

    const particleCount = isMobileRef.current ? 90 : 180;
    const initialParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbitRadius = 40 + Math.random() * 220;
      initialParticles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 0.8 + Math.random() * 2.2,
        baseRadius: 0.8 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.8,
        hue: Math.random() * 360,
        layer: Math.floor(Math.random() * 4),
        angle,
        orbitRadius,
        speed: 0.005 + Math.random() * 0.015,
      });
    }
    particlesRef.current = initialParticles;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      isMobileRef.current = rect.width < 768;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', resize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Main Render Loop: 60fps / 120fps Silky Fluid Dynamics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth Audio Reactivity with decay
      const targetAudio = Math.max(0, Math.min(1, audioLevel * sensitivity));
      const lerpSpeed = agentState === 'listening' || agentState === 'speaking' ? 0.22 : 0.12;
      smoothedAudioRef.current += (targetAudio - smoothedAudioRef.current) * lerpSpeed;
      const currentAudio = smoothedAudioRef.current;

      // State Dynamics Modulation
      let speedMult = 1.0;
      let amplitudeMult = 1.0;
      let complexity = 1.0;

      if (agentState === 'listening') {
        speedMult = 1.6 + currentAudio * 2.2;
        amplitudeMult = 1.4 + currentAudio * 3.5;
        complexity = 1.5;
      } else if (agentState === 'thinking') {
        speedMult = 2.4;
        amplitudeMult = 0.9;
        complexity = 2.0;
      } else if (agentState === 'speaking') {
        speedMult = 1.8 + currentAudio * 2.0;
        amplitudeMult = 1.8 + currentAudio * 3.0;
        complexity = 1.6;
      } else {
        // Idle breathing
        speedMult = 0.85;
        amplitudeMult = 0.75 + Math.sin(time * 0.0018) * 0.15;
        complexity = 1.0;
      }

      phaseRef.current += dt * speedMult * 1.8;
      const phase = phaseRef.current;

      // Mouse Smooth Tracking
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const mouseDistX = mouseRef.current.active ? (mouseRef.current.x - centerX) * 0.15 : 0;
      const mouseDistY = mouseRef.current.active ? (mouseRef.current.y - centerY) * 0.15 : 0;

      const palette = getPalette(colorTheme);

      // Clear Frame with ultra-deep transparent fade for liquid motion trail
      ctx.clearRect(0, 0, width, height);

      // Ambient Background Radial Bloom
      const baseRadius = Math.min(width, height) * (isMobileRef.current ? 0.38 : 0.28);
      const orbRadius = baseRadius * amplitudeMult;

      const ambientGrad = ctx.createRadialGradient(
        centerX + mouseDistX * 0.3,
        centerY + mouseDistY * 0.3,
        10,
        centerX + mouseDistX * 0.3,
        centerY + mouseDistY * 0.3,
        orbRadius * 2.4
      );
      ambientGrad.addColorStop(0, palette.ambient);
      ambientGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.08)');
      ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // Switch Visual Render Mode
      ctx.save();
      ctx.globalCompositeOperation = 'screen'; // Additive glowing blend

      if (visualMode === 'ribbons') {
        renderChromaticRibbons(ctx, centerX, centerY, orbRadius, phase, currentAudio, palette, mouseDistX, mouseDistY, complexity);
      } else if (visualMode === 'orb') {
        renderSiriOrb3D(ctx, centerX, centerY, orbRadius, phase, currentAudio, palette, mouseDistX, mouseDistY);
      } else if (visualMode === 'particles') {
        renderParticleNebula(ctx, centerX, centerY, orbRadius, phase, currentAudio, palette, mouseDistX, mouseDistY);
      } else if (visualMode === 'waveform') {
        renderHarmonicSoundwave(ctx, centerX, centerY, width, height, phase, currentAudio, palette);
      } else if (visualMode === 'eclipse') {
        renderLiquidEclipse(ctx, centerX, centerY, orbRadius, phase, currentAudio, palette, mouseDistX, mouseDistY);
      }

      // Render Floating Particle Filaments around the core
      renderParticles(ctx, centerX, centerY, orbRadius, phase, currentAudio, palette, mouseDistX, mouseDistY);

      ctx.restore();

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId.current);
    };
  }, [visualMode, colorTheme, agentState, sensitivity]);

  // ==========================================
  // MODE 1: THE ICONIC CHROMATIC RIBBONS (DRIBBLE 3975272 EXACT MOTION)
  // ==========================================
  const renderChromaticRibbons = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    phase: number,
    audio: number,
    palette: ReturnType<typeof getPalette>,
    mx: number,
    my: number,
    complexity: number
  ) => {
    const ribbonCount = isMobileRef.current ? 7 : 11;
    const pointsPerRibbon = isMobileRef.current ? 70 : 120;
    const ribbonWidth = radius * 1.8;

    const layers = [
      { color: palette.primary, alpha: 0.85, freq: 1.2, speed: 1.0, phaseOffset: 0, amp: 1.0 },
      { color: palette.secondary, alpha: 0.85, freq: 1.8, speed: -0.9, phaseOffset: Math.PI * 0.4, amp: 1.1 },
      { color: palette.tertiary, alpha: 0.8, freq: 2.3, speed: 1.3, phaseOffset: Math.PI * 0.8, amp: 0.9 },
      { color: palette.quaternary, alpha: 0.75, freq: 1.5, speed: -1.2, phaseOffset: Math.PI * 1.2, amp: 0.8 },
      { color: palette.accent, alpha: 0.95, freq: 2.8, speed: 1.6, phaseOffset: Math.PI * 1.6, amp: 0.6 },
    ];

    for (let r = 0; r < ribbonCount; r++) {
      const layer = layers[r % layers.length];
      const rRatio = (r / ribbonCount) - 0.5;
      const angleOffset = rRatio * 0.5;

      ctx.beginPath();
      let first = true;

      for (let i = 0; i <= pointsPerRibbon; i++) {
        const u = (i / pointsPerRibbon) * 2 - 1; // -1 to 1
        const envelope = Math.pow(Math.cos(u * Math.PI * 0.5), 1.6); // smooth taper at edges

        // 3D Harmonic Wave Equation (Perlin-like smooth multi-octave)
        const wave1 = Math.sin(u * 3.5 * layer.freq + phase * layer.speed + layer.phaseOffset);
        const wave2 = Math.sin(u * 6.2 * layer.freq - phase * 0.8 + r);
        const wave3 = Math.cos(u * 10.0 + phase * 1.4);

        const totalHarmonic = (wave1 * 0.6 + wave2 * 0.3 + wave3 * 0.1) * envelope;
        const dynamicAmp = (radius * 0.55 * layer.amp * (1 + audio * 1.8)) * complexity;

        const x = cx + mx * 0.5 + u * ribbonWidth * 0.5 + Math.sin(phase * 0.5 + r) * 12;
        const y = cy + my * 0.5 + rRatio * radius * 0.3 + totalHarmonic * dynamicAmp;

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Gradient Stroke for Liquid Transparency
      const grad = ctx.createLinearGradient(cx - ribbonWidth * 0.5, cy, cx + ribbonWidth * 0.5, cy);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.2, layer.color);
      grad.addColorStop(0.5, palette.accent);
      grad.addColorStop(0.8, layer.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = (isMobileRef.current ? 2.5 : 3.8) + audio * 4.0;
      ctx.shadowColor = layer.color;
      ctx.shadowBlur = (isMobileRef.current ? 12 : 24) + audio * 18;
      ctx.stroke();
    }

    // Central Radiant Chromatic Core
    const coreGlow = ctx.createRadialGradient(cx + mx * 0.6, cy + my * 0.6, 2, cx + mx * 0.6, cy + my * 0.6, radius * 0.45);
    coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    coreGlow.addColorStop(0.3, palette.primary);
    coreGlow.addColorStop(0.7, palette.secondary);
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx + mx * 0.6, cy + my * 0.6, radius * 0.45 * (1 + audio * 0.4), 0, Math.PI * 2);
    ctx.fill();
  };

  // ==========================================
  // MODE 2: 3D VOLUMETRIC SIRI ORB
  // ==========================================
  const renderSiriOrb3D = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    phase: number,
    audio: number,
    palette: ReturnType<typeof getPalette>,
    mx: number,
    my: number
  ) => {
    const ox = cx + mx * 0.7;
    const oy = cy + my * 0.7;
    const currentRadius = radius * (1 + audio * 0.25);

    // Multi-pass glowing volumetric orb
    const ringCount = 18;
    for (let i = 0; i < ringCount; i++) {
      const t = i / ringCount;
      const ringAngle = phase * (1.2 + t * 0.8) + (i * Math.PI) / 4;
      const rx = currentRadius * (0.4 + t * 0.6);
      const ry = currentRadius * (0.2 + t * 0.7);

      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(ringAngle * 0.2);

      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, ringAngle, 0, Math.PI * 2);

      const color = i % 2 === 0 ? palette.primary : palette.secondary;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 + audio * 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18 + audio * 12;
      ctx.stroke();

      ctx.restore();
    }

    // Core glass lens
    const lensGrad = ctx.createRadialGradient(ox - currentRadius * 0.2, oy - currentRadius * 0.2, 5, ox, oy, currentRadius * 0.9);
    lensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    lensGrad.addColorStop(0.4, palette.primary);
    lensGrad.addColorStop(0.8, palette.tertiary);
    lensGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, currentRadius * 0.85, 0, Math.PI * 2);
    ctx.fill();
  };

  // ==========================================
  // MODE 3: FLUID PARTICLE NEBULA
  // ==========================================
  const renderParticleNebula = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    phase: number,
    audio: number,
    palette: ReturnType<typeof getPalette>,
    mx: number,
    my: number
  ) => {
    const streamCount = 5;
    for (let s = 0; s < streamCount; s++) {
      const angle = (s / streamCount) * Math.PI * 2 + phase * 0.6;
      const color = s % 2 === 0 ? palette.primary : palette.secondary;

      ctx.beginPath();
      for (let d = 0; d < 80; d++) {
        const r = (d / 80) * radius * 1.6;
        const spiralAngle = angle + (d * 0.08) + Math.sin(phase + d * 0.1) * 0.3;
        const x = cx + mx * 0.5 + Math.cos(spiralAngle) * r;
        const y = cy + my * 0.5 + Math.sin(spiralAngle) * r;

        if (d === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 3 + audio * 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.stroke();
    }
  };

  // ==========================================
  // MODE 4: HOLOGRAPHIC SOUNDWAVE SPECTRUM
  // ==========================================
  const renderHarmonicSoundwave = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    width: number,
    height: number,
    phase: number,
    audio: number,
    palette: ReturnType<typeof getPalette>
  ) => {
    const bars = isMobileRef.current ? 48 : 96;
    const barWidth = (width * 0.75) / bars;
    const startX = (width - width * 0.75) / 2;

    for (let i = 0; i < bars; i++) {
      const u = i / bars;
      const x = startX + i * barWidth;
      const envelope = Math.sin(u * Math.PI); // center weighted

      const wave = Math.sin(u * 8 + phase * 2.5) * Math.cos(u * 14 - phase * 1.8);
      const barHeight = (20 + (Math.abs(wave) * 120 + audio * 220)) * envelope;

      const grad = ctx.createLinearGradient(x, cy - barHeight / 2, x, cy + barHeight / 2);
      grad.addColorStop(0, palette.primary);
      grad.addColorStop(0.5, palette.accent);
      grad.addColorStop(1, palette.secondary);

      ctx.fillStyle = grad;
      ctx.shadowColor = palette.primary;
      ctx.shadowBlur = 10;
      ctx.fillRect(x, cy - barHeight / 2, barWidth * 0.7, barHeight);
    }
  };

  // ==========================================
  // MODE 5: LIQUID ECLIPSE CORONA
  // ==========================================
  const renderLiquidEclipse = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    phase: number,
    audio: number,
    palette: ReturnType<typeof getPalette>,
    mx: number,
    my: number
  ) => {
    const ox = cx + mx * 0.6;
    const oy = cy + my * 0.6;
    const flareCount = isMobileRef.current ? 36 : 72;

    // Solar Corona Flares
    for (let i = 0; i < flareCount; i++) {
      const angle = (i / flareCount) * Math.PI * 2 + phase * 0.4;
      const flareNoise = Math.sin(angle * 6 + phase * 2) * Math.cos(angle * 12 - phase);
      const flareLen = radius * (1.1 + Math.abs(flareNoise) * 0.6 + audio * 0.9);

      const x1 = ox + Math.cos(angle) * (radius * 0.85);
      const y1 = oy + Math.sin(angle) * (radius * 0.85);
      const x2 = ox + Math.cos(angle) * flareLen;
      const y2 = oy + Math.sin(angle) * flareLen;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      const color = i % 2 === 0 ? palette.primary : palette.secondary;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 + audio * 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.stroke();
    }

    // Obsidian Core Silhouette
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#05070c';
    ctx.beginPath();
    ctx.arc(ox, oy, radius * 0.82, 0, Math.PI * 2);
    ctx.fill();

    // Inner rim light
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 3;
    ctx.shadowColor = palette.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();
  };

  // ==========================================
  // FLOATING PARTICLE FILAMENTS ENGINE
  // ==========================================
  const renderParticles = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    phase: number,
    audio: number,
    palette: ReturnType<typeof getPalette>,
    mx: number,
    my: number
  ) => {
    const particles = particlesRef.current;
    const ox = cx + mx * 0.5;
    const oy = cy + my * 0.5;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.angle += p.speed * (1 + audio * 2.5);

      // Orbital swirling with subtle turbulence
      const currentOrbit = p.orbitRadius * (1 + audio * 0.6) + Math.sin(phase + i) * 8;
      const targetX = ox + Math.cos(p.angle) * currentOrbit;
      const targetY = oy + Math.sin(p.angle * 1.2) * (currentOrbit * 0.7);

      p.x += (targetX - p.x) * 0.08;
      p.y += (targetY - p.y) * 0.08;

      const dynamicRadius = (p.baseRadius + audio * 2.5) * (p.layer === 0 ? 1.4 : 0.8);
      const color = p.layer === 0 ? palette.primary : p.layer === 1 ? palette.secondary : p.layer === 2 ? palette.tertiary : palette.accent;

      ctx.beginPath();
      ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 + audio * 10;
      ctx.fill();
    }
  };

  // Interactive Mouse / Touch Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.targetX = e.clientX - rect.left;
    mouseRef.current.targetY = e.clientY - rect.top;
    mouseRef.current.active = true;
  };

  const handlePointerLeave = () => {
    mouseRef.current.active = false;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.targetX = rect.width / 2;
      mouseRef.current.targetY = rect.height / 2;
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onOrbClick}
      className={`relative w-full h-full select-none cursor-pointer overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
