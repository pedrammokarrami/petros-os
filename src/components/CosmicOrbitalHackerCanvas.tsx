import React, { useEffect, useRef, useState } from 'react';
import { AgentState } from '../types';

interface Props {
  agentState?: AgentState;
  isExecuting?: boolean;
  className?: string;
  width?: number;
  height?: number;
  interactive?: boolean;
  onInteract?: () => void;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  colorType: 'white' | 'red' | 'silver' | 'amber';
  orbitAngle: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  orbitSpeed: number;
  tiltAngle: number;
  verticalWaveOffset: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface FilamentRibbon {
  points: { x: number; y: number; z: number }[];
  angle: number;
  speed: number;
  radiusX: number;
  radiusY: number;
  tilt: number;
  yCenter: number;
  color: string;
  glowColor: string;
  width: number;
  streakCount: number;
}

export function CosmicOrbitalHackerCanvas({
  agentState = 'idle',
  isExecuting = false,
  className = '',
  width = 720,
  height = 680,
  interactive = true,
  onInteract,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Generate 350+ fine orbital micro-particles for hyper-dense stardust halos
    const particleCount = 380;
    const particles: Particle3D[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isRed = Math.random() < 0.22;
      const isSilver = Math.random() < 0.45;
      const layer = Math.random(); // 0 (close around chest) to 1 (outer wide halos)

      const orbitRadiusX = 90 + layer * 220 + (Math.random() - 0.5) * 40;
      const orbitRadiusY = 32 + layer * 70 + (Math.random() - 0.5) * 20;
      const tiltAngle = (18 + Math.random() * 16) * (Math.PI / 180) * (Math.random() > 0.5 ? 1 : -0.8);

      particles.push({
        x: 0,
        y: 0,
        z: 0,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        radius: isRed ? 0.6 + Math.random() * 1.4 : 0.4 + Math.random() * 1.2,
        baseAlpha: 0.25 + Math.random() * 0.75,
        alpha: 0.5,
        colorType: isRed ? 'red' : isSilver ? 'silver' : 'white',
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadiusX,
        orbitRadiusY,
        orbitSpeed: (0.006 + (1 - layer) * 0.012 + Math.random() * 0.004) * (Math.random() > 0.15 ? 1 : -0.7),
        tiltAngle,
        verticalWaveOffset: (Math.random() - 0.5) * 110,
        twinkleSpeed: 1.5 + Math.random() * 3.5,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Dynamic swirling filament ribbons (glowing light streams weaving horizontally)
    const ribbons: FilamentRibbon[] = [
      {
        points: [],
        angle: 0,
        speed: 0.014,
        radiusX: 210,
        radiusY: 55,
        tilt: -0.26,
        yCenter: 75,
        color: 'rgba(255, 255, 255, 0.85)',
        glowColor: 'rgba(255, 255, 255, 0.25)',
        width: 1.8,
        streakCount: 32,
      },
      {
        points: [],
        angle: Math.PI * 0.5,
        speed: 0.018,
        radiusX: 250,
        radiusY: 65,
        tilt: -0.22,
        yCenter: 90,
        color: 'rgba(239, 68, 68, 0.9)',
        glowColor: 'rgba(244, 63, 94, 0.35)',
        width: 1.5,
        streakCount: 28,
      },
      {
        points: [],
        angle: Math.PI * 1.2,
        speed: 0.011,
        radiusX: 180,
        radiusY: 45,
        tilt: -0.3,
        yCenter: 40,
        color: 'rgba(255, 255, 255, 0.95)',
        glowColor: 'rgba(226, 232, 240, 0.3)',
        width: 2.2,
        streakCount: 36,
      },
      {
        points: [],
        angle: Math.PI * 1.7,
        speed: 0.022,
        radiusX: 280,
        radiusY: 75,
        tilt: -0.18,
        yCenter: 120,
        color: 'rgba(248, 113, 113, 0.85)',
        glowColor: 'rgba(220, 38, 38, 0.25)',
        width: 1.6,
        streakCount: 26,
      },
      {
        points: [],
        angle: Math.PI * 0.8,
        speed: 0.015,
        radiusX: 150,
        radiusY: 38,
        tilt: -0.24,
        yCenter: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        glowColor: 'rgba(255, 255, 255, 0.4)',
        width: 1.4,
        streakCount: 24,
      },
    ];

    // Sweater micro-glitter points (realistic cosmic speckled texture)
    const sweaterPoints: { x: number; y: number; alpha: number; size: number }[] = [];
    for (let i = 0; i < 260; i++) {
      // Points distributed across shoulders and chest area
      const sx = (Math.random() - 0.5) * 260;
      const sy = 40 + Math.random() * 160;
      sweaterPoints.push({
        x: sx,
        y: sy,
        alpha: 0.15 + Math.random() * 0.7,
        size: 0.4 + Math.random() * 1.1,
      });
    }

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 10;

      ctx.clearRect(0, 0, w, h);

      const isThinking = isExecuting || agentState === 'planning' || agentState === 'searching';
      const speedMultiplier = isThinking ? 1.6 : 1.0;

      // Realistic human micro-breathing physics & gentle mouse responsiveness
      const breathY = Math.sin(time * 1.6) * 3.0;
      const breathScale = 1 + Math.sin(time * 1.6) * 0.005;
      const headTilt = (mousePos.active ? (mousePos.x / w - 0.5) * 4 : Math.sin(time * 0.8) * 1.5);
      const headPitch = (mousePos.active ? (mousePos.y / h - 0.5) * 3 : Math.cos(time * 1.2) * 1.2);

      // =========================================================================
      // 1. COSMIC BACKGROUND: Deep Starry Abyss & Subtle Nebular Dark Dust
      // =========================================================================
      const bgGrad = ctx.createRadialGradient(cx, cy - 20, 20, cx, cy, Math.max(w, h) * 0.6);
      bgGrad.addColorStop(0, '#0c0f18');
      bgGrad.addColorStop(0.4, '#06080e');
      bgGrad.addColorStop(0.85, '#020306');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric red nebula glow rising from bottom console
      const redGlow = ctx.createRadialGradient(cx, cy + 130, 10, cx, cy + 120, 240);
      redGlow.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
      redGlow.addColorStop(0.4, 'rgba(185, 28, 28, 0.12)');
      redGlow.addColorStop(0.8, 'rgba(15, 23, 42, 0.0)');
      ctx.fillStyle = redGlow;
      ctx.fillRect(0, 0, w, h);

      // =========================================================================
      // 2. 3D PARTICLE CALCULATIONS & DEPTH SORTING
      // =========================================================================
      particles.forEach((p) => {
        p.orbitAngle += p.orbitSpeed * speedMultiplier;
        const cosA = Math.cos(p.orbitAngle);
        const sinA = Math.sin(p.orbitAngle);

        // Base elliptical orbit coordinates
        const rawX = cosA * p.orbitRadiusX;
        const rawZ = sinA * p.orbitRadiusX; // Z depth (- front, + back)
        const rawY = sinA * p.orbitRadiusY + p.verticalWaveOffset + Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 6;

        // Apply tilt rotation around X-axis
        const cosT = Math.cos(p.tiltAngle);
        const sinT = Math.sin(p.tiltAngle);

        p.x = rawX;
        p.y = rawY * cosT - rawZ * sinT;
        p.z = rawY * sinT + rawZ * cosT;

        // Dynamic twinkling alpha
        const twinkle = (Math.sin(time * p.twinkleSpeed + p.twinklePhase) + 1) * 0.5;
        p.alpha = p.baseAlpha * (0.5 + twinkle * 0.5);
      });

      // Split particles into Back (Z < 0) and Front (Z >= 0)
      const backParticles = particles.filter((p) => p.z < 0);
      const frontParticles = particles.filter((p) => p.z >= 0);

      // =========================================================================
      // 3. DRAW BACK-LAYER PARTICLES & FILAMENT STREAKS (Behind Character)
      // =========================================================================
      drawParticleLayer(ctx, backParticles, cx, cy, 0.85);
      drawRibbonLayer(ctx, ribbons, time * speedMultiplier, cx, cy, true);

      // =========================================================================
      // 4. DRAW CENTRAL CHARACTER (Realistic Silhouette with Red Reflected Glasses)
      // =========================================================================
      ctx.save();
      ctx.translate(cx + headTilt * 0.8, cy + breathY + headPitch * 0.5);
      ctx.scale(breathScale, breathScale);

      // --- A. Shoulders & Draped Dark Silhouette with Cosmic Stardust ---
      const shoulderGrad = ctx.createLinearGradient(0, 40, 0, 240);
      shoulderGrad.addColorStop(0, '#111624');
      shoulderGrad.addColorStop(0.5, '#090c15');
      shoulderGrad.addColorStop(1, '#030408');
      ctx.fillStyle = shoulderGrad;

      ctx.beginPath();
      ctx.moveTo(-180, 260);
      ctx.quadraticCurveTo(-140, 110, -60, 65);
      ctx.quadraticCurveTo(0, 55, 60, 65);
      ctx.quadraticCurveTo(140, 110, 180, 260);
      ctx.closePath();
      ctx.fill();

      // Delicate Silver Rim Light along Shoulder Tops
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-160, 230);
      ctx.quadraticCurveTo(-135, 115, -60, 65);
      ctx.quadraticCurveTo(0, 56, 60, 65);
      ctx.quadraticCurveTo(135, 115, 160, 230);
      ctx.stroke();

      // Draw Cosmic Glitter Points on Sweater / Clothing (Matching Reference Image)
      ctx.save();
      ctx.fillStyle = '#ffffff';
      sweaterPoints.forEach((sp) => {
        const dFromCenter = Math.hypot(sp.x, sp.y - 120);
        if (dFromCenter < 140) {
          ctx.globalAlpha = sp.alpha * (0.7 + Math.sin(time * 2 + sp.x) * 0.3);
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // --- B. Glowing Red Console Light Bar (Bottom Center Chest Area) ---
      ctx.save();
      const consoleY = 135;
      const barGrad = ctx.createLinearGradient(-75, 0, 75, 0);
      barGrad.addColorStop(0, 'rgba(239, 68, 68, 0.0)');
      barGrad.addColorStop(0.2, 'rgba(248, 113, 113, 0.7)');
      barGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      barGrad.addColorStop(0.8, 'rgba(248, 113, 113, 0.7)');
      barGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

      // Diffuse Bloom behind the bar
      const consoleBloom = ctx.createRadialGradient(0, consoleY, 4, 0, consoleY, 65);
      consoleBloom.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      consoleBloom.addColorStop(0.4, 'rgba(220, 38, 38, 0.3)');
      consoleBloom.addColorStop(1, 'rgba(220, 38, 38, 0.0)');
      ctx.fillStyle = consoleBloom;
      ctx.fillRect(-100, consoleY - 30, 200, 60);

      // Core Neon Red Bar
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      safeRoundRect(ctx, -65, consoleY - 3, 130, 6, 3);
      ctx.fill();
      ctx.restore();

      // --- C. Collar & Neck (In Chiaroscuro Shadow with Upward Red Ambient Bounce) ---
      const neckGrad = ctx.createLinearGradient(0, 15, 0, 70);
      neckGrad.addColorStop(0, '#1c151c');
      neckGrad.addColorStop(0.6, '#130d14');
      neckGrad.addColorStop(1, '#0a060a');
      ctx.fillStyle = neckGrad;

      ctx.beginPath();
      ctx.moveTo(-28, 25);
      ctx.lineTo(-24, 65);
      ctx.quadraticCurveTo(0, 72, 24, 65);
      ctx.lineTo(28, 25);
      ctx.closePath();
      ctx.fill();

      // Upward Red Ambient Light on Neck & Collar
      const neckRedBounce = ctx.createLinearGradient(0, 70, 0, 25);
      neckRedBounce.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
      neckRedBounce.addColorStop(0.7, 'rgba(185, 28, 28, 0.2)');
      neckRedBounce.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neckRedBounce;
      ctx.fill();

      // Collar V-Shape Outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // --- D. Realistic Human Face (Looking Downward in Serious Focus) ---
      const faceGrad = ctx.createLinearGradient(0, -60, 0, 35);
      faceGrad.addColorStop(0, '#38323a'); // Dark atmospheric top of forehead
      faceGrad.addColorStop(0.5, '#292026'); // Mid-face shadow
      faceGrad.addColorStop(0.85, '#1e1418'); // Under jaw
      faceGrad.addColorStop(1, '#140c10');
      ctx.fillStyle = faceGrad;

      ctx.beginPath();
      ctx.moveTo(-42, -20);
      ctx.bezierCurveTo(-46, -60, -25, -75, 0, -78);
      ctx.bezierCurveTo(25, -75, 46, -60, 42, -20);
      ctx.bezierCurveTo(38, 12, 22, 34, 0, 38); // Refined chin pointing down
      ctx.bezierCurveTo(-22, 34, -38, 12, -42, -20);
      ctx.closePath();
      ctx.fill();

      // Dramatic Upward Red Face Glow (Reflecting from chest console)
      const faceRedGlow = ctx.createRadialGradient(0, 36, 4, 0, 0, 48);
      faceRedGlow.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
      faceRedGlow.addColorStop(0.35, 'rgba(220, 38, 38, 0.55)');
      faceRedGlow.addColorStop(0.7, 'rgba(185, 28, 28, 0.18)');
      faceRedGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = faceRedGlow;
      ctx.fill();

      // Chin & Lower Jaw Highlight
      ctx.strokeStyle = 'rgba(252, 165, 165, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-16, 28);
      ctx.quadraticCurveTo(0, 38, 16, 28);
      ctx.stroke();

      // Downward Lips (Soft, focused, illuminated with red console light)
      const lipY = 18;
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.85)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-9, lipY);
      ctx.quadraticCurveTo(0, lipY + 2, 9, lipY);
      ctx.stroke();

      // Shaded Nose Bridge & Philtrum
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 6);
      ctx.quadraticCurveTo(0, 10, -3, 11);
      ctx.stroke();

      // --- E. Wireframe Glasses with Glowing Red Reflection (Key Signature Feature) ---
      const glassesY = -12;
      const glassW = 20;
      const glassH = 13;
      const glassSpacing = 16;

      // Dark Frame Wire
      ctx.strokeStyle = '#1a1820';
      ctx.lineWidth = 1.8;
      // Bridge between lenses
      ctx.beginPath();
      ctx.moveTo(-glassSpacing + glassW / 2, glassesY);
      ctx.quadraticCurveTo(0, glassesY - 3, glassSpacing - glassW / 2, glassesY);
      ctx.stroke();

      // Left Lens Frame
      ctx.beginPath();
      safeRoundRect(ctx, -glassSpacing - glassW / 2, glassesY - glassH / 2, glassW, glassH, 4);
      ctx.stroke();

      // Right Lens Frame
      ctx.beginPath();
      safeRoundRect(ctx, glassSpacing - glassW / 2, glassesY - glassH / 2, glassW, glassH, 4);
      ctx.stroke();

      // Temple Arms (Side frames disappearing into hair)
      ctx.beginPath();
      ctx.moveTo(-glassSpacing - glassW / 2, glassesY);
      ctx.lineTo(-44, glassesY - 6);
      ctx.moveTo(glassSpacing + glassW / 2, glassesY);
      ctx.lineTo(44, glassesY - 6);
      ctx.stroke();

      // VIBRANT RED GLOWING REFLECTIONS ON LENSES (Exactly matching user image)
      ctx.save();
      // Left Lens Glow
      const leftLensGrad = ctx.createRadialGradient(
        -glassSpacing,
        glassesY + 1,
        2,
        -glassSpacing,
        glassesY,
        glassW * 0.6
      );
      leftLensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      leftLensGrad.addColorStop(0.3, 'rgba(248, 113, 113, 0.9)');
      leftLensGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.7)');
      leftLensGrad.addColorStop(1, 'rgba(153, 27, 27, 0.3)');
      ctx.fillStyle = leftLensGrad;
      ctx.beginPath();
      safeRoundRect(ctx, -glassSpacing - glassW / 2 + 1.5, glassesY - glassH / 2 + 1.5, glassW - 3, glassH - 3, 3);
      ctx.fill();

      // Right Lens Glow
      const rightLensGrad = ctx.createRadialGradient(
        glassSpacing,
        glassesY + 1,
        2,
        glassSpacing,
        glassesY,
        glassW * 0.6
      );
      rightLensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      rightLensGrad.addColorStop(0.3, 'rgba(248, 113, 113, 0.9)');
      rightLensGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.7)');
      rightLensGrad.addColorStop(1, 'rgba(153, 27, 27, 0.3)');
      ctx.fillStyle = rightLensGrad;
      ctx.beginPath();
      safeRoundRect(ctx, glassSpacing - glassW / 2 + 1.5, glassesY - glassH / 2 + 1.5, glassW - 3, glassH - 3, 3);
      ctx.fill();

      // Lens Glass Specular Glint
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-glassSpacing - glassW / 2 + 3, glassesY - glassH / 2 + 2);
      ctx.lineTo(-glassSpacing + 2, glassesY - glassH / 2 + 2);
      ctx.moveTo(glassSpacing - glassW / 2 + 3, glassesY - glassH / 2 + 2);
      ctx.lineTo(glassSpacing + 2, glassesY - glassH / 2 + 2);
      ctx.stroke();
      ctx.restore();

      // --- F. Detailed Wavy Hair with Silver Rim-Lighting (Exact Match) ---
      ctx.save();
      // Base dark volume of wavy curls
      const hairGrad = ctx.createRadialGradient(0, -70, 10, 0, -60, 65);
      hairGrad.addColorStop(0, '#2d3345');
      hairGrad.addColorStop(0.5, '#161922');
      hairGrad.addColorStop(1, '#090b10');
      ctx.fillStyle = hairGrad;

      // Organic wavy hair contours
      ctx.beginPath();
      ctx.moveTo(-45, -35);
      ctx.bezierCurveTo(-58, -50, -55, -82, -25, -96);
      ctx.bezierCurveTo(-10, -102, 10, -102, 25, -96);
      ctx.bezierCurveTo(55, -82, 58, -50, 45, -35);
      ctx.bezierCurveTo(42, -50, 28, -68, 0, -70);
      ctx.bezierCurveTo(-28, -68, -42, -50, -45, -35);
      ctx.closePath();
      ctx.fill();

      // Hanging Curls & Forehead Strands
      ctx.fillStyle = '#161922';
      // Left curl falling over forehead
      ctx.beginPath();
      ctx.moveTo(-28, -65);
      ctx.quadraticCurveTo(-22, -40, -12, -30);
      ctx.quadraticCurveTo(-18, -45, -28, -65);
      ctx.fill();
      // Center strand
      ctx.beginPath();
      ctx.moveTo(-8, -68);
      ctx.quadraticCurveTo(-4, -42, 2, -26);
      ctx.quadraticCurveTo(-1, -45, -8, -68);
      ctx.fill();

      // STRIKING SILVER RIM-LIGHTING ON WAVY HAIR (The luminous halo in the photo)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';

      // Top silver curls
      ctx.beginPath();
      ctx.moveTo(-32, -92);
      ctx.quadraticCurveTo(-15, -102, 0, -100);
      ctx.quadraticCurveTo(15, -102, 32, -92);
      ctx.stroke();

      // Left curly locks highlight
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-52, -60);
      ctx.quadraticCurveTo(-60, -75, -42, -88);
      ctx.moveTo(-46, -45);
      ctx.quadraticCurveTo(-54, -55, -42, -68);
      ctx.stroke();

      // Right curly locks highlight
      ctx.beginPath();
      ctx.moveTo(52, -60);
      ctx.quadraticCurveTo(60, -75, 42, -88);
      ctx.moveTo(46, -45);
      ctx.quadraticCurveTo(54, -55, 42, -68);
      ctx.stroke();

      // Loose hair strands catching bright back-light
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-56, -72);
      ctx.quadraticCurveTo(-64, -76, -58, -84);
      ctx.moveTo(-22, -98);
      ctx.quadraticCurveTo(-18, -106, -10, -102);
      ctx.moveTo(10, -102);
      ctx.quadraticCurveTo(18, -106, 22, -98);
      ctx.moveTo(56, -72);
      ctx.quadraticCurveTo(64, -76, 58, -84);
      ctx.stroke();

      ctx.restore();

      ctx.restore(); // Restore character transform

      // =========================================================================
      // 5. DRAW FRONT-LAYER PARTICLES & SWIRLING HALO FILAMENTS (In Front of Character)
      // =========================================================================
      drawRibbonLayer(ctx, ribbons, time * speedMultiplier, cx, cy, false);
      drawParticleLayer(ctx, frontParticles, cx, cy, 1.25);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [agentState, isExecuting, mousePos]);

  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}
      onMouseMove={(e) => {
        if (!interactive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        });
      }}
      onMouseLeave={() => setMousePos((prev) => ({ ...prev, active: false }))}
      onClick={onInteract}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
      />
    </div>
  );
}

// Helper: Renders 3D particle dust with color gradients & glowing cores
function drawParticleLayer(
  ctx: CanvasRenderingContext2D,
  particles: Particle3D[],
  cx: number,
  cy: number,
  scale: number
) {
  particles.forEach((p) => {
    const px = cx + p.x;
    const py = cy + p.y;
    const r = Math.max(0.4, p.radius * scale);

    ctx.save();
    ctx.globalAlpha = Math.min(1.0, Math.max(0.05, p.alpha));

    if (p.colorType === 'red') {
      ctx.fillStyle = '#f87171';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
      ctx.shadowBlur = 6 * scale;
    } else if (p.colorType === 'silver') {
      ctx.fillStyle = '#e2e8f0';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 4 * scale;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 5 * scale;
    }

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// Helper: Renders graceful continuous orbital ribbon streaks around the body
function drawRibbonLayer(
  ctx: CanvasRenderingContext2D,
  ribbons: FilamentRibbon[],
  time: number,
  cx: number,
  cy: number,
  isBack: boolean
) {
  ribbons.forEach((ribbon, idx) => {
    ctx.save();
    const currentAngle = ribbon.angle + time * ribbon.speed;
    const count = ribbon.streakCount;

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * Math.PI * 2;
      const angle = currentAngle + offset;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // 3D coordinates
      const rawX = cosA * ribbon.radiusX;
      const rawZ = sinA * ribbon.radiusX;
      const rawY = sinA * ribbon.radiusY + ribbon.yCenter + Math.sin(time * 2 + idx + i * 0.4) * 4;

      const cosT = Math.cos(ribbon.tilt);
      const sinT = Math.sin(ribbon.tilt);

      const x = rawX;
      const y = rawY * cosT - rawZ * sinT;
      const z = rawY * sinT + rawZ * cosT;

      // Filter front vs back
      if (isBack && z >= 0) continue;
      if (!isBack && z < 0) continue;

      // Streak length segment
      const trailAngle = angle - 0.08;
      const tRawX = Math.cos(trailAngle) * ribbon.radiusX;
      const tRawZ = Math.sin(trailAngle) * ribbon.radiusX;
      const tRawY = Math.sin(trailAngle) * ribbon.radiusY + ribbon.yCenter;
      const tx = tRawX;
      const ty = tRawY * cosT - tRawZ * sinT;

      const alpha = (0.2 + 0.8 * Math.sin((i / count) * Math.PI)) * (isBack ? 0.45 : 0.85);

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = ribbon.color;
      ctx.lineWidth = ribbon.width * (isBack ? 0.8 : 1.2);
      ctx.shadowColor = ribbon.glowColor;
      ctx.shadowBlur = 8;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(cx + tx, cy + ty);
      ctx.lineTo(cx + x, cy + y);
      ctx.stroke();
    }

    ctx.restore();
  });
}

function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | number[]
) {
  const r = Array.isArray(radii) ? radii[0] || 0 : radii;
  const radius = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  if (typeof (ctx as any).roundRect === 'function') {
    try {
      (ctx as any).roundRect(x, y, w, h, radii);
      return;
    } catch {
      // Fallback
    }
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}
