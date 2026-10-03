import React, { useEffect, useRef } from 'react';
import { AgentState } from '../types';

interface Props {
  agentState: AgentState;
  isExecuting?: boolean;
}

export function HolographicPolyhedron({ agentState, isExecuting = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = 0.2;
    let angleY = 0;
    let angleZ = 0;
    let time = 0;

    // Golden ratio for icosahedron vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    // Normalize vertices
    const radius = 95;
    const vertices = baseVertices.map(v => {
      const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      return [(v[0] / len) * radius, (v[1] / len) * radius, (v[2] / len) * radius];
    });

    // Dual inner star vertices
    const innerRadius = 45;
    const innerVertices = baseVertices.map(v => {
      const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      return [(v[0] / len) * innerRadius, (v[1] / len) * innerRadius, (v[2] / len) * innerRadius];
    });

    // Edges of icosahedron
    const edges: [number, number][] = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [1, 9], [1, 8], [1, 7],
      [2, 11], [2, 10], [2, 6], [2, 4], [2, 3],
      [3, 4], [3, 9], [3, 8], [3, 6],
      [4, 5], [4, 9], [4, 11],
      [5, 9], [5, 11],
      [6, 7], [6, 8], [6, 10],
      [7, 8], [7, 10],
      [8, 9],
      [10, 11]
    ];

    // Floating code lines inside
    const codeLines = [
      'def execute_code():',
      '  print("Hello, World!")',
      '  result = 42',
      '  return result',
      'import numpy as np',
      'neural_weights = [0.89, 0.42]',
      'matrix.eval()',
      '0xFA78B // OK'
    ];

    // Particles
    const particles = Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160,
      z: (Math.random() - 0.5) * 160,
      speed: 0.5 + Math.random() * 0.8,
      size: 1 + Math.random() * 2
    }));

    const render = () => {
      time += 0.02;
      const speed = isExecuting || agentState !== 'idle' ? 0.024 : 0.009;
      angleY += speed;
      angleX += speed * 0.4;
      angleZ = Math.sin(time * 0.5) * 0.15;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const pulse = 1 + Math.sin(time * 2) * (isExecuting ? 0.08 : 0.03);

      // Rotation matrix helper
      const project = (x: number, y: number, z: number, scale = 1) => {
        // Rotate Y
        let x1 = x * Math.cos(angleY) + z * Math.sin(angleY);
        let z1 = -x * Math.sin(angleY) + z * Math.cos(angleY);

        // Rotate X
        let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

        // Rotate Z
        let x3 = x1 * Math.cos(angleZ) - y2 * Math.sin(angleZ);
        let y3 = x1 * Math.sin(angleZ) + y2 * Math.cos(angleZ);

        const fov = 350;
        const pScale = (fov / (fov + z2)) * scale * pulse;
        return {
          px: cx + x3 * pScale,
          py: cy + y3 * pScale,
          pz: z2,
          pScale
        };
      };

      // Draw volumetric holographic glow backing
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
      grad.addColorStop(0.5, 'rgba(14, 116, 144, 0.12)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fill();

      // Draw floating code text inside
      ctx.save();
      ctx.font = '9px "Fira Code", monospace';
      codeLines.forEach((text, i) => {
        const offsetZ = Math.sin(time + i) * 30;
        const offsetY = (i - codeLines.length / 2) * 14;
        const pt = project(0, offsetY, offsetZ, 0.85);
        const alpha = Math.max(0.15, Math.min(0.85, (pt.pz + 100) / 200));
        ctx.fillStyle = `rgba(165, 243, 252, ${alpha * 0.75})`;
        ctx.fillText(text, pt.px - 60, pt.py);
      });
      ctx.restore();

      // Project vertices
      const projected = vertices.map(v => project(v[0], v[1], v[2]));
      const projectedInner = innerVertices.map(v => project(v[0], v[1], v[2]));

      // Draw inner core polyhedron
      ctx.save();
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
      ctx.lineWidth = 1;
      edges.slice(0, 15).forEach(([i, j]) => {
        const p1 = projectedInner[i];
        const p2 = projectedInner[j];
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      });
      ctx.restore();

      // Draw outer edges with cyan/teal neon glow
      ctx.save();
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgZ = (p1.pz + p2.pz) / 2;
        const depthAlpha = Math.max(0.2, (avgZ + 120) / 240);

        ctx.strokeStyle = `rgba(34, 211, 238, ${depthAlpha * 0.85})`;
        ctx.lineWidth = avgZ > 0 ? 1.8 : 1.1;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = avgZ > 0 ? 8 : 2;

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      });
      ctx.restore();

      // Draw vertices nodes
      projected.forEach(p => {
        const nodeAlpha = Math.max(0.3, (p.pz + 120) / 240);
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.pz > 0 ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Floating data particles
      particles.forEach(pt => {
        pt.x += Math.sin(time + pt.speed) * 0.4;
        pt.y += Math.cos(time + pt.speed) * 0.4;
        const p = project(pt.x, pt.y, pt.z);
        ctx.fillStyle = 'rgba(103, 232, 249, 0.6)';
        ctx.beginPath();
        ctx.arc(p.px, p.py, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [agentState, isExecuting]);

  return (
    <div className="relative pointer-events-none select-none flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]"
      />
    </div>
  );
}
