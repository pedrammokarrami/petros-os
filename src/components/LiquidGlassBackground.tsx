import React, { useEffect, useRef } from 'react';

interface CloudNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  phase: number;
  phaseSpeed: number;
  colorStop0: string;
  colorStop50: string;
  colorStop100: string;
}

export function LiquidGlassBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = Math.floor(window.innerWidth / 2));
    let height = (canvas.height = Math.floor(window.innerHeight / 2));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = Math.floor(window.innerWidth / 2);
      height = canvas.height = Math.floor(window.innerHeight / 2);
    };

    window.addEventListener('resize', handleResize);

    // 7 Vibrant Cloud Nodes: Pure Brilliant White, Deep Azure, Celestial Sky Blue, and Light Tousi/Mist
    const nodes: CloudNode[] = [
      {
        x: width * 0.2,
        y: height * 0.25,
        vx: 0.45,
        vy: 0.3,
        baseRadius: Math.max(170, width * 0.36),
        radius: Math.max(170, width * 0.36),
        phase: 0,
        phaseSpeed: 0.015,
        colorStop0: 'rgba(255, 255, 255, 1)',
        colorStop50: 'rgba(224, 242, 254, 0.85)',
        colorStop100: 'rgba(186, 230, 253, 0)',
      },
      {
        x: width * 0.75,
        y: height * 0.3,
        vx: -0.4,
        vy: 0.36,
        baseRadius: Math.max(190, width * 0.4),
        radius: Math.max(190, width * 0.4),
        phase: 1.5,
        phaseSpeed: 0.018,
        colorStop0: 'rgba(56, 189, 248, 0.95)',
        colorStop50: 'rgba(14, 165, 233, 0.75)',
        colorStop100: 'rgba(2, 132, 199, 0)',
      },
      {
        x: width * 0.45,
        y: height * 0.7,
        vx: 0.38,
        vy: -0.42,
        baseRadius: Math.max(210, width * 0.44),
        radius: Math.max(210, width * 0.44),
        phase: 2.7,
        phaseSpeed: 0.012,
        colorStop0: 'rgba(255, 255, 255, 0.98)',
        colorStop50: 'rgba(240, 249, 255, 0.8)',
        colorStop100: 'rgba(191, 219, 254, 0)',
      },
      {
        x: width * 0.85,
        y: height * 0.75,
        vx: -0.35,
        vy: -0.32,
        baseRadius: Math.max(180, width * 0.38),
        radius: Math.max(180, width * 0.38),
        phase: 3.8,
        phaseSpeed: 0.02,
        colorStop0: 'rgba(37, 99, 235, 0.9)',
        colorStop50: 'rgba(59, 130, 246, 0.7)',
        colorStop100: 'rgba(29, 78, 216, 0)',
      },
      {
        x: width * 0.12,
        y: height * 0.8,
        vx: 0.38,
        vy: -0.28,
        baseRadius: Math.max(200, width * 0.42),
        radius: Math.max(200, width * 0.42),
        phase: 4.5,
        phaseSpeed: 0.014,
        colorStop0: 'rgba(255, 255, 255, 0.98)',
        colorStop50: 'rgba(224, 242, 254, 0.75)',
        colorStop100: 'rgba(147, 197, 253, 0)',
      },
      {
        // Light Tousi & Slate Cloud (طوسی و خاکستری ابری بسیار نرم و زنده)
        x: width * 0.5,
        y: height * 0.35,
        vx: -0.3,
        vy: 0.24,
        baseRadius: Math.max(170, width * 0.34),
        radius: Math.max(170, width * 0.34),
        phase: 5.2,
        phaseSpeed: 0.016,
        colorStop0: 'rgba(226, 232, 240, 0.92)',
        colorStop50: 'rgba(203, 213, 225, 0.65)',
        colorStop100: 'rgba(148, 163, 184, 0)',
      },
      {
        x: width * 0.35,
        y: height * 0.15,
        vx: 0.32,
        vy: 0.34,
        baseRadius: Math.max(160, width * 0.32),
        radius: Math.max(160, width * 0.32),
        phase: 0.8,
        phaseSpeed: 0.019,
        colorStop0: 'rgba(255, 255, 255, 1)',
        colorStop50: 'rgba(219, 234, 254, 0.8)',
        colorStop100: 'rgba(191, 219, 254, 0)',
      },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render each moving cloud node
      for (const node of nodes) {
        node.phase += node.phaseSpeed;
        node.radius = node.baseRadius + Math.sin(node.phase) * 28;

        node.x += node.vx;
        node.y += node.vy;

        // Soft elastic boundaries to keep all clouds continuously swirling in view
        const margin = node.radius * 0.2;
        if (node.x < -margin) {
          node.x = -margin;
          node.vx = Math.abs(node.vx);
        } else if (node.x > width + margin) {
          node.x = width + margin;
          node.vx = -Math.abs(node.vx);
        }

        if (node.y < -margin) {
          node.y = -margin;
          node.vy = Math.abs(node.vy);
        } else if (node.y > height + margin) {
          node.y = height + margin;
          node.vy = -Math.abs(node.vy);
        }

        // Draw radial cloud gradient
        const grad = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius
        );
        grad.addColorStop(0, node.colorStop0);
        grad.addColorStop(0.5, node.colorStop50);
        grad.addColorStop(1, node.colorStop100);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!document.hidden) {
        animId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#68a8e8]">
      {/* 1. Base Bright Azure Sky Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              #3b82f6 0%, 
              #60a5fa 22%, 
              #38bdf8 50%, 
              #93c5fd 75%, 
              #e0f2fe 100%)
          `,
        }}
      />

      {/* 2. Interactive Liquid Cloud Canvas (Real-Time 60FPS Fluid Color Blending) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          filter: 'blur(36px)',
          transform: 'scale(1.06)',
          willChange: 'transform',
        }}
      />

      {/* 3. Wispy High-Altitude Cirrus Silk Waves Overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-75 mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <linearGradient id="sky-silk-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#bae6fd" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="sky-silk-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.98" />
          </linearGradient>

          <filter id="sky-silk-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>

        {/* Soft Organic Atmospheric Waves */}
        <path
          d="M0,180 C320,80 440,320 740,190 C1040,60 1180,240 1440,150 L1440,900 L0,900 Z"
          fill="url(#sky-silk-1)"
          filter="url(#sky-silk-blur)"
        />
        <path
          d="M0,490 C260,340 480,650 820,460 C1160,270 1280,560 1440,410 L1440,900 L0,900 Z"
          fill="url(#sky-silk-2)"
          filter="url(#sky-silk-blur)"
        />
      </svg>

      {/* 4. Fine Atmospheric Sunlight Refraction Glint */}
      <div className="absolute top-[-10%] left-[25%] w-[48rem] h-[48rem] rounded-full bg-white/55 blur-[75px] mix-blend-soft-light" />
      <div className="absolute bottom-[-10%] right-[15%] w-[52rem] h-[52rem] rounded-full bg-[#bae6fd]/65 blur-[85px] mix-blend-screen" />

      {/* 5. Crystalline Micro-Particle Shimmer */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1.8px, transparent 1.8px)`,
          backgroundSize: '30px 30px',
        }}
      />
    </div>
  );
}
