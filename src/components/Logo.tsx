import React, {useId} from 'react';
import {brand} from '../config';
import {colors, fonts, gradient} from '../theme';

/** "KONTUR" — faqat kontur (outline), "DASTURCHI" — gradient bilan to'ldirilgan */
export const Logo: React.FC<{size: number; suffixOffset?: number; suffixOpacity?: number}> = ({
  size,
  suffixOffset = 0,
  suffixOpacity = 1,
}) => {
  const filterId = `outline-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const stroke = Math.max(2, size * 0.02);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
        fontFamily: fonts.display,
      }}
    >
      {/* text-stroke o'zgaruvchan shriftda harflar ichidagi chiziqlarni ham chizadi,
          shuning uchun kontur SVG filtr bilan olinadi: kengaytirilgan harf − asl harf */}
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter
          id={filterId}
          x="-5%"
          y="-15%"
          width="110%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology in="SourceAlpha" operator="dilate" radius={stroke} result="grown" />
          <feComposite in="grown" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood floodColor={colors.text} />
          <feComposite in2="ring" operator="in" />
        </filter>
      </svg>
      <div
        style={{
          fontSize: size,
          fontWeight: 800,
          letterSpacing: size * 0.04,
          color: 'white',
          filter: `url(#${filterId})`,
          padding: `0 ${stroke * 2}px`,
        }}
      >
        {brand.name}
      </div>
      <div
        style={{
          marginTop: size * 0.12,
          fontSize: size * 0.42,
          fontWeight: 700,
          letterSpacing: size * 0.14,
          paddingLeft: size * 0.14,
          backgroundImage: gradient(colors.violet, colors.cyan),
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          transform: `translateY(${suffixOffset}px)`,
          opacity: suffixOpacity,
        }}
      >
        {brand.suffix}
      </div>
    </div>
  );
};
