import React from 'react';

interface YodawBrandMarkProps {
  className?: string;
  showPersianBadge?: boolean;
  isFa?: boolean;
}

/**
 * YodawBrandMark - Signature Luxury Tech Wordmark
 * Preserves the progressive blue gradient spectrum (Midnight Navy -> Royal Cobalt -> Ocean Azure -> Vivid Cerulean -> Radiant Sky)
 * Uses high-end typography with distinctive elongated 'Y' descender, perfectly scaled to match the app layout.
 */
export const YodawBrandMark: React.FC<YodawBrandMarkProps> = ({
  className = '',
  showPersianBadge = false,
  isFa = false,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none group cursor-pointer ${className}`}
      style={{ lineHeight: 1 }}
    >
      {/* World-Class Minimalist Wordmark with Progressive Blue Fade & Soft Rounded Vertically-Aligned Typography */}
      <div className="inline-flex items-center">
        <span
          className="yodaw-worldclass-logo text-[21px] sm:text-[23.5px] md:text-[25.5px] font-black tracking-[0.01em] uppercase transition-all duration-300 flex items-center leading-none scale-y-[1.04]"
          style={{
            fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: 850,
          }}
        >
          {/* Individual letters with progressive blue spectrum */}
          <span className="yodaw-glyph yodaw-g-y">Y</span>
          <span className="yodaw-glyph yodaw-g-o">O</span>
          <span className="yodaw-glyph yodaw-g-d">D</span>
          <span className="yodaw-glyph yodaw-g-a">A</span>
          <span className="yodaw-glyph yodaw-g-w">W</span>
        </span>
      </div>
    </div>
  );
};

