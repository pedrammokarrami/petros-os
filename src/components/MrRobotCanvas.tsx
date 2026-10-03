import { useEffect, useRef } from 'react';
import { AgentState } from '../types';
import { ambientAudio } from '../utils/ambientAudio';

interface Props {
  agentState: AgentState;
}

export function MrRobotCanvas({ agentState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / width - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / height - 0.5) * 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Telemetry memory & Unix stream packets
    const telemetryItems = [
      'PID 1337 fsociety.daemon',
      '0x7fff5fbff7c0 [EIP]',
      'CS30.DAT // ENCRYPTED',
      'nmap -sS -O 192.251.68.239',
      'STEG_PAYLOAD: 0x9AF0C4',
      'E-CORP TAPE BACKUPS OFFLINE',
      'tty1: pts/0 (uid=0 root)',
      'hydra -l admin -P rockyou.txt ssh://target',
      'shred -u -z -n 35 memory.dump',
      'RSA 4096-BIT KEY LOADED',
      'DAEMON STATUS: OPERATIONAL',
      'HELLO, FRIEND.',
    ];

    const streams = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 0.8 + 0.3,
      text: telemetryItems[Math.floor(Math.random() * telemetryItems.length)],
      opacity: Math.random() * 0.25 + 0.08,
      size: Math.floor(Math.random() * 3) + 10,
    }));

    let scanlineY = 0;
    let glitchTimer = 0;
    let isGlitching = false;

    const render = () => {
      // Smooth mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Dark cinematic room background with deep vignette
      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, width, height);

      // Radial vignette from center (Elliot's dark room monitor glow)
      const grad = ctx.createRadialGradient(
        width / 2 + mouseRef.current.x * 40,
        height / 2 + mouseRef.current.y * 40,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.85
      );
      grad.addColorStop(0, 'rgba(10, 16, 24, 0.7)');
      grad.addColorStop(0.5, 'rgba(7, 10, 15, 0.9)');
      grad.addColorStop(1, 'rgba(4, 5, 8, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subliminal fsociety iconic mask watermark in background (faint, moody)
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(0.85, 0.85);

      // Draw faint stylized fsociety mask outline
      ctx.strokeStyle = 'rgba(255, 23, 68, 0.04)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Mask cheek & chin
      ctx.moveTo(-70, -40);
      ctx.bezierCurveTo(-110, 10, -70, 90, 0, 110);
      ctx.bezierCurveTo(70, 90, 110, 10, 70, -40);
      ctx.bezierCurveTo(50, -80, -50, -80, -70, -40);
      ctx.stroke();

      // Mask smile & mustache curve
      ctx.beginPath();
      ctx.moveTo(-45, 45);
      ctx.quadraticCurveTo(0, 70, 45, 45);
      ctx.stroke();

      // Mask eyes (circular hollows)
      ctx.beginPath();
      ctx.arc(-35, -10, 14, 0, Math.PI * 2);
      ctx.arc(35, -10, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Top hat outline
      ctx.beginPath();
      ctx.moveTo(-90, -45);
      ctx.lineTo(90, -45);
      ctx.moveTo(-55, -45);
      ctx.lineTo(-50, -115);
      ctx.lineTo(50, -115);
      ctx.lineTo(55, -45);
      ctx.stroke();
      ctx.restore();

      // Floating UNIX/Hacker telemetry strings (drifting vertically)
      ctx.font = '11px "Fira Code", monospace';
      streams.forEach((s) => {
        s.y += s.speed;
        if (s.y > height + 20) {
          s.y = -20;
          s.x = Math.random() * width;
          s.text = telemetryItems[Math.floor(Math.random() * telemetryItems.length)];
        }

        const isGreen = agentState === 'running_command' || agentState === 'writing';
        const isRed = agentState === 'failed' || agentState === 'reviewing';

        ctx.fillStyle = isGreen
          ? `rgba(16, 185, 129, ${s.opacity})`
          : isRed
          ? `rgba(244, 63, 94, ${s.opacity})`
          : `rgba(148, 163, 184, ${s.opacity * 0.75})`;

        ctx.fillText(s.text, s.x + mouseRef.current.x * 15, s.y + mouseRef.current.y * 15);
      });

      // Analog Oscilloscope Waveform (real-time audio visualizer line across the lower third)
      const analyser = ambientAudio.getAnalyser();
      ctx.save();
      const waveY = height * 0.72;

      ctx.beginPath();
      ctx.strokeStyle =
        agentState === 'running_command'
          ? 'rgba(16, 185, 129, 0.45)'
          : agentState === 'failed'
          ? 'rgba(239, 68, 68, 0.45)'
          : 'rgba(52, 211, 153, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      ctx.shadowBlur = 8;

      if (analyser) {
        const timeData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeData);
        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = waveY + (v - 1.0) * 45;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
      } else {
        // Gentle analog idle sine wave
        for (let x = 0; x < width; x += 10) {
          const y = waveY + Math.sin(x * 0.01 + Date.now() * 0.002) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();

      // CRT Scanline sweep
      scanlineY += 2;
      if (scanlineY > height) scanlineY = 0;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.fillRect(0, scanlineY, width, 2);

      // Random psychological glitch flicker
      glitchTimer++;
      if (glitchTimer > 280) {
        isGlitching = Math.random() > 0.4;
        glitchTimer = 0;
      }

      if (isGlitching) {
        ctx.fillStyle = 'rgba(255, 23, 68, 0.02)';
        ctx.fillRect(0, Math.random() * height, width, Math.random() * 20);
        isGlitching = false;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [agentState]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 crt-overlay"
      style={{ opacity: 0.95 }}
    />
  );
}
