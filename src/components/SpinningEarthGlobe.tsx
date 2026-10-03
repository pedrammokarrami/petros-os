import React, { useEffect, useRef } from 'react';

interface Props {
  onClick?: () => void;
  title?: string;
  size?: number;
}

export function SpinningEarthGlobe({ onClick, title = 'تغییر زبان و اتصال جهانی', size = 44 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    // Pre-generate continent points on sphere (lat, lon) for realistic Earth continents
    const continentPoints: Array<{ lat: number; lon: number; r: number }> = [
      // North America
      { lat: 45, lon: -100, r: 16 },
      { lat: 55, lon: -115, r: 14 },
      { lat: 35, lon: -90, r: 12 },
      { lat: 25, lon: -100, r: 8 },
      { lat: 60, lon: -40, r: 10 }, // Greenland
      // South America
      { lat: -10, lon: -55, r: 15 },
      { lat: -25, lon: -60, r: 14 },
      { lat: -45, lon: -70, r: 8 },
      // Europe
      { lat: 50, lon: 15, r: 12 },
      { lat: 60, lon: 20, r: 10 },
      { lat: 40, lon: 0, r: 8 },
      // Africa
      { lat: 25, lon: 20, r: 16 },
      { lat: 10, lon: 25, r: 18 },
      { lat: -10, lon: 25, r: 16 },
      { lat: -30, lon: 25, r: 12 },
      // Asia
      { lat: 50, lon: 90, r: 24 },
      { lat: 35, lon: 105, r: 22 },
      { lat: 20, lon: 80, r: 14 },
      { lat: 60, lon: 130, r: 18 },
      { lat: 35, lon: 135, r: 10 }, // Japan
      { lat: 30, lon: 55, r: 12 }, // Middle East / Iran
      // Australia
      { lat: -25, lon: 135, r: 14 },
      // Antarctica
      { lat: -80, lon: 0, r: 26 },
      { lat: -82, lon: 180, r: 26 },
    ];

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(20, size);
    const height = Math.max(20, size);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const radius = Math.max(5, size * 0.44);
    const cx = size / 2;
    const cy = size / 2;

    const render = () => {
      try {
        rotation += 0.02;
        ctx.clearRect(0, 0, size, size);

        // 1. Atmosphere Halo Glow behind globe
        const rInner = Math.max(1, radius * 0.8);
        const rOuter = Math.max(rInner + 1, radius * 1.15);
        const halo = ctx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter);
        halo.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        halo.addColorStop(0.7, 'rgba(14, 165, 233, 0.2)');
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
        ctx.fill();

        // 2. Base Ocean Sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        // Ocean lighting (sunlight from top-left)
        const oceanGrad = ctx.createRadialGradient(
          cx - radius * 0.35,
          cy - radius * 0.35,
          Math.max(0.1, radius * 0.1),
          cx,
          cy,
          Math.max(1, radius)
        );
        oceanGrad.addColorStop(0, '#1e40af'); // bright cyan-blue highlight
        oceanGrad.addColorStop(0.5, '#0f2b6e'); // deep ocean blue
        oceanGrad.addColorStop(0.85, '#08173d');
        oceanGrad.addColorStop(1, '#020617'); // dark terminator
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, size, size);

        // 3. Latitude and Longitude Grid Lines (Rotating)
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';

        // Latitudes
        for (let lat = -60; lat <= 60; lat += 30) {
          const phi = (lat * Math.PI) / 180;
          const rLat = Math.max(0.1, radius * Math.cos(phi));
          const yLat = cy - radius * Math.sin(phi);
          const rLatY = Math.max(0.1, rLat * 0.25);
          ctx.beginPath();
          ctx.ellipse(cx, yLat, rLat, rLatY, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Longitudes (rotating) - guarantee strictly positive radius parameters
        for (let lon = 0; lon < 360; lon += 45) {
          const radLon = ((lon + (rotation * 180) / Math.PI) * Math.PI) / 180;
          const cosLon = Math.cos(radLon);
          // Only draw when front facing and with positive width
          if (cosLon > 0.05) {
            const rx = Math.max(0.2, radius * cosLon);
            const ry = Math.max(0.2, radius);
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // 4. Rotating Continents (Projected from 3D sphere)
        for (const p of continentPoints) {
          const latRad = (p.lat * Math.PI) / 180;
          const lonRad = ((p.lon + (rotation * 180) / Math.PI) * Math.PI) / 180;

          // 3D coordinates on unit sphere
          const x3d = Math.cos(latRad) * Math.sin(lonRad);
          const y3d = -Math.sin(latRad);
          const z3d = Math.cos(latRad) * Math.cos(lonRad);

          // Visible only if on front facing hemisphere (z > -0.05)
          if (z3d > -0.05) {
            const px = cx + x3d * radius;
            const py = cy + y3d * radius;
            const pr = Math.max(0.5, (p.r / 60) * radius * Math.max(0.2, z3d + 0.3));

            // Shading on land: sunlight from top-left
            const lightFactor = Math.max(0.2, x3d * -0.5 + y3d * -0.5 + z3d * 0.8);
            const landColor = lightFactor > 0.6 ? '#34d399' : '#059669'; // vivid emerald

            ctx.fillStyle = landColor;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();

            // Land glow
            ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
            ctx.beginPath();
            ctx.arc(px, py, pr * 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 5. Cloud Bands (slightly faster spin)
        const cloudRot = rotation * 1.15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        for (let i = 0; i < 4; i++) {
          const cyOff = cy + (i - 1.5) * (radius * 0.45);
          const cxOff = cx + Math.sin(cloudRot + i * 2) * (radius * 0.5);
          const cRadiusX = Math.max(0.5, radius * 0.35);
          const cRadiusY = Math.max(0.2, radius * 0.08);
          ctx.beginPath();
          ctx.ellipse(cxOff, cyOff, cRadiusX, cRadiusY, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }

        // 6. Spherical Lens Glass Shading & Terminator Shadow
        const lensGrad = ctx.createRadialGradient(
          cx - radius * 0.4,
          cy - radius * 0.4,
          Math.max(0.1, radius * 0.1),
          cx,
          cy,
          Math.max(1, radius)
        );
        lensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        lensGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
        lensGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
        lensGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
        ctx.fillStyle = lensGrad;
        ctx.fillRect(0, 0, size, size);

        ctx.restore();

        // 7. Outer 3D Sphere Rim Ring & Specular Highlight
        ctx.lineWidth = 1.5;
        const rimGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        rimGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.5)');
        rimGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
        ctx.strokeStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, radius), 0, Math.PI * 2);
        ctx.stroke();
      } catch (err) {
        console.warn('Globe render pass recovered:', err);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-11 h-11 rounded-full sphere-btn-3d flex items-center justify-center cursor-pointer group shadow-lg relative p-0 overflow-hidden"
      title={title}
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-full transition-transform duration-300 group-hover:scale-110 pointer-events-none"
      />
      {/* Outer ambient glow */}
      <span className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-sm pointer-events-none group-hover:bg-cyan-400/40 transition" />
    </button>
  );
}
