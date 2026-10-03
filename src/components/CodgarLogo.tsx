export function CodgarLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      id="codgar-brand-logo"
      className="relative flex items-center justify-center rounded-2xl liquid-btn select-none overflow-hidden prismatic-edge"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(13, 17, 28, 0.85) 100%)',
        boxShadow: '0 0 25px rgba(0, 229, 255, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Specular Holographic Sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-white/40 pointer-events-none" />

      {/* Mr. Robot / Cyber Geometric Monogram */}
      <svg
        viewBox="0 0 28 28"
        fill="none"
        stroke="currentColor"
        className="relative z-10 drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]"
        style={{ width: size * 0.65, height: size * 0.65 }}
      >
        {/* Outer Cyber Hexagon with fsociety precision */}
        <polygon
          points="14,2 24,7.8 24,19.2 14,25 4,19.2 4,7.8"
          stroke="url(#prismaticGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Stylized Cybernetic Core */}
        <path
          d="M17 10C15.5 8.8 13.5 8.5 11.8 9.2C9.5 10.2 8.5 12.8 9.5 15.2C10.5 17.5 13.2 18.5 15.5 17.5C16.8 17 17.8 16 18.2 14.8"
          stroke="#00ff88"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Central Root Phosphor Spark */}
        <circle cx="14" cy="13.5" r="1.8" fill="#00e5ff" className="animate-pulse" />

        <defs>
          <linearGradient id="prismaticGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#00e5ff" />
            <stop offset="0.7" stopColor="#ff1744" />
            <stop offset="1" stopColor="#00ff88" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
