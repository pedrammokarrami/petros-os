import React, { useEffect, useRef } from 'react';
import { AgentState } from '../types';

interface Props {
  agentState: AgentState;
  isExecuting?: boolean;
  sceneMode?: 'cosmic_orbital' | 'developer_room';
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
      // Fallback below
    }
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

export function DeveloperRoomCanvas({
  agentState,
  isExecuting = false,
  sceneMode = 'cosmic_orbital',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Micro orbital particles for Cosmic Scene
    const orbitalParticles = Array.from({ length: 280 }, (_, i) => {
      const isRed = Math.random() < 0.25;
      const isSilver = Math.random() < 0.45;
      const layer = Math.random();
      return {
        angle: Math.random() * Math.PI * 2,
        radiusX: 120 + layer * 280 + (Math.random() - 0.5) * 40,
        radiusY: 40 + layer * 90 + (Math.random() - 0.5) * 20,
        tilt: -0.24 + (Math.random() - 0.5) * 0.1,
        speed: (0.007 + (1 - layer) * 0.014) * (Math.random() > 0.15 ? 1 : -0.8),
        yOffset: (Math.random() - 0.5) * 140,
        radius: isRed ? 0.6 + Math.random() * 1.5 : 0.4 + Math.random() * 1.2,
        baseAlpha: 0.2 + Math.random() * 0.7,
        isRed,
        isSilver,
        twinkle: 1.5 + Math.random() * 3,
      };
    });

    // Cosmic Sweater Glitter points
    const sweaterPoints = Array.from({ length: 220 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: 40 + Math.random() * 180,
      alpha: 0.15 + Math.random() * 0.7,
      size: 0.4 + Math.random() * 1.2,
    }));

    // City lights for Dev Room
    const cityLights = Array.from({ length: 45 }, () => ({
      x: 0.05 + Math.random() * 0.35,
      y: 0.15 + Math.random() * 0.55,
      radius: 1.5 + Math.random() * 3.5,
      alpha: 0.2 + Math.random() * 0.6,
      color: Math.random() > 0.4 ? 'rgba(251, 191, 36, ' : 'rgba(249, 115, 22, ',
      twinkleSpeed: 0.5 + Math.random() * 1.5,
    }));

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      try {
        time += 0.03;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (sceneMode === 'cosmic_orbital') {
          // =========================================================================
          // SCENE MODE: COSMIC ORBITAL HACKER (Matching User's Reference Image)
          // =========================================================================
          const cx = w * 0.5;
          const cy = h * 0.46;
          const speedMultiplier = isExecuting || agentState === 'planning' ? 1.5 : 1.0;
          const breathY = Math.sin(time * 1.6) * 3.5;

          // 1. Cosmic Void Background
          const bgGrad = ctx.createRadialGradient(cx, cy - 40, 20, cx, cy, Math.max(w, h) * 0.7);
          bgGrad.addColorStop(0, '#0c0e18');
          bgGrad.addColorStop(0.4, '#070911');
          bgGrad.addColorStop(0.85, '#030408');
          bgGrad.addColorStop(1, '#000000');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          // Atmospheric Red Nebula Ambient Glow
          const redNebula = ctx.createRadialGradient(cx, cy + 140, 10, cx, cy + 120, 320);
          redNebula.addColorStop(0, 'rgba(239, 68, 68, 0.32)');
          redNebula.addColorStop(0.35, 'rgba(185, 28, 28, 0.14)');
          redNebula.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = redNebula;
          ctx.fillRect(0, 0, w, h);

          // 2. Back Layer 3D Particles
          orbitalParticles.forEach((p) => {
            p.angle += p.speed * speedMultiplier;
            const cosA = Math.cos(p.angle);
            const sinA = Math.sin(p.angle);
            const rawX = cosA * p.radiusX;
            const rawZ = sinA * p.radiusX;
            const rawY = sinA * p.radiusY + p.yOffset;

            const cosT = Math.cos(p.tilt);
            const sinT = Math.sin(p.tilt);
            const px = cx + rawX;
            const py = cy + (rawY * cosT - rawZ * sinT);
            const z = rawY * sinT + rawZ * cosT;

            if (z < 0) {
              const alpha = p.baseAlpha * (0.5 + Math.sin(time * p.twinkle) * 0.5);
              ctx.save();
              ctx.globalAlpha = Math.max(0.05, Math.min(1.0, alpha * 0.6));
              ctx.fillStyle = p.isRed ? '#f87171' : p.isSilver ? '#e2e8f0' : '#ffffff';
              ctx.shadowColor = p.isRed ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.7)';
              ctx.shadowBlur = 4;
              ctx.beginPath();
              ctx.arc(px, py, p.radius * 0.8, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });

          // 3. Central Character Silhouette with Glowing Red Lenses
          ctx.save();
          ctx.translate(cx, cy + breathY);

          // Shoulders
          const shGrad = ctx.createLinearGradient(0, 40, 0, 260);
          shGrad.addColorStop(0, '#101422');
          shGrad.addColorStop(0.5, '#080a12');
          shGrad.addColorStop(1, '#020306');
          ctx.fillStyle = shGrad;
          ctx.beginPath();
          ctx.moveTo(-220, 300);
          ctx.quadraticCurveTo(-160, 110, -70, 65);
          ctx.quadraticCurveTo(0, 55, 70, 65);
          ctx.quadraticCurveTo(160, 110, 220, 300);
          ctx.closePath();
          ctx.fill();

          // Shoulder Rim Light
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Sweater Glitter
          ctx.fillStyle = '#ffffff';
          sweaterPoints.forEach((sp) => {
            if (Math.hypot(sp.x, sp.y - 120) < 170) {
              ctx.globalAlpha = sp.alpha * (0.6 + Math.sin(time * 2 + sp.x) * 0.4);
              ctx.beginPath();
              ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          ctx.globalAlpha = 1.0;

          // Glowing Red Console Light Bar
          const barY = 140;
          const consoleBloom = ctx.createRadialGradient(0, barY, 4, 0, barY, 80);
          consoleBloom.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          consoleBloom.addColorStop(0.4, 'rgba(220, 38, 38, 0.35)');
          consoleBloom.addColorStop(1, 'rgba(220, 38, 38, 0.0)');
          ctx.fillStyle = consoleBloom;
          ctx.fillRect(-120, barY - 40, 240, 80);

          const barGrad = ctx.createLinearGradient(-80, 0, 80, 0);
          barGrad.addColorStop(0, 'rgba(239, 68, 68, 0.0)');
          barGrad.addColorStop(0.2, 'rgba(248, 113, 113, 0.8)');
          barGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
          barGrad.addColorStop(0.8, 'rgba(248, 113, 113, 0.8)');
          barGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          ctx.fillStyle = barGrad;
          ctx.beginPath();
          safeRoundRect(ctx, -75, barY - 3, 150, 6, 3);
          ctx.fill();

          // Face (Looking Down)
          const faceGrad = ctx.createLinearGradient(0, -60, 0, 35);
          faceGrad.addColorStop(0, '#352f36');
          faceGrad.addColorStop(0.6, '#231a20');
          faceGrad.addColorStop(1, '#11090d');
          ctx.fillStyle = faceGrad;
          ctx.beginPath();
          ctx.moveTo(-44, -20);
          ctx.bezierCurveTo(-48, -60, -26, -76, 0, -78);
          ctx.bezierCurveTo(26, -76, 48, -60, 44, -20);
          ctx.bezierCurveTo(40, 12, 24, 34, 0, 38);
          ctx.bezierCurveTo(-24, 34, -40, 12, -44, -20);
          ctx.closePath();
          ctx.fill();

          // Upward Red Face Glow
          const faceRedGlow = ctx.createRadialGradient(0, 36, 4, 0, 0, 52);
          faceRedGlow.addColorStop(0, 'rgba(239, 68, 68, 0.88)');
          faceRedGlow.addColorStop(0.4, 'rgba(220, 38, 38, 0.45)');
          faceRedGlow.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = faceRedGlow;
          ctx.fill();

          // Glasses with Glowing Red Reflections
          const gy = -12;
          const gw = 22;
          const gh = 14;
          const gs = 17;

          // Wireframe
          ctx.strokeStyle = '#18161e';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-gs + gw / 2, gy);
          ctx.quadraticCurveTo(0, gy - 3, gs - gw / 2, gy);
          ctx.stroke();

          // Glowing Lenses
          const lensGlowL = ctx.createRadialGradient(-gs, gy + 1, 2, -gs, gy, gw * 0.6);
          lensGlowL.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          lensGlowL.addColorStop(0.3, 'rgba(248, 113, 113, 0.9)');
          lensGlowL.addColorStop(0.7, 'rgba(220, 38, 38, 0.7)');
          lensGlowL.addColorStop(1, 'rgba(153, 27, 27, 0.3)');
          ctx.fillStyle = lensGlowL;
          ctx.beginPath();
          safeRoundRect(ctx, -gs - gw / 2, gy - gh / 2, gw, gh, 4);
          ctx.fill();
          ctx.stroke();

          const lensGlowR = ctx.createRadialGradient(gs, gy + 1, 2, gs, gy, gw * 0.6);
          lensGlowR.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          lensGlowR.addColorStop(0.3, 'rgba(248, 113, 113, 0.9)');
          lensGlowR.addColorStop(0.7, 'rgba(220, 38, 38, 0.7)');
          lensGlowR.addColorStop(1, 'rgba(153, 27, 27, 0.3)');
          ctx.fillStyle = lensGlowR;
          ctx.beginPath();
          safeRoundRect(ctx, gs - gw / 2, gy - gh / 2, gw, gh, 4);
          ctx.fill();
          ctx.stroke();

          // Wavy Hair Volume & Silver Rim Lighting
          const hairGrad = ctx.createRadialGradient(0, -70, 10, 0, -60, 70);
          hairGrad.addColorStop(0, '#2b3040');
          hairGrad.addColorStop(0.5, '#141720');
          hairGrad.addColorStop(1, '#080a0e');
          ctx.fillStyle = hairGrad;
          ctx.beginPath();
          ctx.moveTo(-46, -35);
          ctx.bezierCurveTo(-60, -50, -56, -84, -26, -98);
          ctx.bezierCurveTo(-10, -104, 10, -104, 26, -98);
          ctx.bezierCurveTo(56, -84, 60, -50, 46, -35);
          ctx.bezierCurveTo(42, -50, 28, -70, 0, -72);
          ctx.bezierCurveTo(-28, -70, -42, -50, -46, -35);
          ctx.closePath();
          ctx.fill();

          // Striking Silver Rim Light Highlights
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 2.0;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-34, -94);
          ctx.quadraticCurveTo(0, -104, 34, -94);
          ctx.stroke();

          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-54, -62);
          ctx.quadraticCurveTo(-62, -78, -44, -90);
          ctx.moveTo(54, -62);
          ctx.quadraticCurveTo(62, -78, 44, -90);
          ctx.stroke();

          ctx.restore();

          // 4. Front Layer 3D Particles & Orbiting Halo Streaks
          orbitalParticles.forEach((p) => {
            const cosA = Math.cos(p.angle);
            const sinA = Math.sin(p.angle);
            const rawX = cosA * p.radiusX;
            const rawZ = sinA * p.radiusX;
            const rawY = sinA * p.radiusY + p.yOffset;

            const cosT = Math.cos(p.tilt);
            const sinT = Math.sin(p.tilt);
            const px = cx + rawX;
            const py = cy + (rawY * cosT - rawZ * sinT);
            const z = rawY * sinT + rawZ * cosT;

            if (z >= 0) {
              const alpha = p.baseAlpha * (0.6 + Math.sin(time * p.twinkle) * 0.4);
              ctx.save();
              ctx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
              ctx.fillStyle = p.isRed ? '#f87171' : p.isSilver ? '#e2e8f0' : '#ffffff';
              ctx.shadowColor = p.isRed ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.85)';
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(px, py, p.radius * 1.15, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        } else {
          // =========================================================================
          // SCENE MODE: COZY EVENING DEVELOPER ROOM
          // =========================================================================
          // Wall Background
          const wallGrad = ctx.createLinearGradient(0, 0, w, h);
          wallGrad.addColorStop(0, '#151216');
          wallGrad.addColorStop(0.5, '#1e181d');
          wallGrad.addColorStop(1, '#0e0b10');
          ctx.fillStyle = wallGrad;
          ctx.fillRect(0, 0, w, h);

          // Window Frame
          const winW = w * 0.42;
          const winGrad = ctx.createLinearGradient(0, 0, winW, h);
          winGrad.addColorStop(0, '#1a1827');
          winGrad.addColorStop(0.6, '#311d25');
          winGrad.addColorStop(1, '#45221b');
          ctx.fillStyle = winGrad;
          ctx.fillRect(0, 0, winW, h);

          // City silhouette
          ctx.fillStyle = '#0f0c14';
          ctx.fillRect(0, h * 0.65, winW, h * 0.35);

          // City lights bokeh
          cityLights.forEach((light) => {
            const lx = light.x * winW;
            const ly = light.y * h;
            const twinkle = Math.sin(time * light.twinkleSpeed) * 0.3 + 0.7;
            ctx.fillStyle = `${light.color}${light.alpha * twinkle})`;
            ctx.beginPath();
            ctx.arc(lx, ly, light.radius, 0, Math.PI * 2);
            ctx.fill();
          });

          // Desk
          const deskTopY = h * 0.68;
          ctx.fillStyle = '#261b18';
          ctx.fillRect(w * 0.25, deskTopY, w * 0.6, h * 0.32);
        }
      } catch (err) {
        console.warn('DeveloperRoomCanvas recovered:', err);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [agentState, isExecuting, sceneMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
    />
  );
}
