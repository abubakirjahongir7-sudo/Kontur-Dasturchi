import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Logo} from '../components/Logo';
import {RevealWords} from '../components/RevealWords';
import {OUTRO_CONTACTS, OUTRO_CTA, brand} from '../config';
import {useLayout} from '../layout';
import {colors, fonts, gradient} from '../theme';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {u, vertical} = useLayout();

  const logoIn = spring({frame: frame - 26, fps, config: {damping: 16, stiffness: 120}});

  const cta = spring({
    frame: frame - OUTRO_CTA,
    fps,
    config: {damping: 9, stiffness: 200, mass: 0.7},
  });
  const pulse = frame > OUTRO_CTA + 20 ? 1 + Math.sin((frame - OUTRO_CTA) / 6) * 0.03 : 1;
  const shine = interpolate((frame - OUTRO_CTA) % 60, [0, 30], [-60, 160], {
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut,
        padding: `0 ${80 * u}px`,
        textAlign: 'center',
      }}
    >
      <RevealWords
        text={brand.outroQuestion}
        delay={4}
        stagger={4}
        align="center"
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: (vertical ? 78 : 72) * u,
          lineHeight: 1.15,
          color: colors.text,
          maxWidth: (vertical ? 920 : 1400) * u,
        }}
      />

      <div
        style={{
          marginTop: (vertical ? 110 : 60) * u,
          opacity: logoIn,
          transform: `scale(${interpolate(logoIn, [0, 1], [0.85, 1])})`,
        }}
      >
        <Logo size={(vertical ? 120 : 96) * u} />
      </div>

      <div
        style={{
          marginTop: (vertical ? 100 : 56) * u,
          transform: `scale(${cta * pulse})`,
          padding: `${30 * u}px ${70 * u}px`,
          borderRadius: 999,
          background: gradient(colors.violet, colors.cyan),
          boxShadow: `0 0 ${80 * u}px ${colors.violet}88`,
          color: 'white',
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 44 * u,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 20 * u}}>
          {brand.cta}
          <svg width={40 * u} height={40 * u} viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12h15m-6-7 7 7-7 7"
              stroke="white"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${shine}%`,
            width: '30%',
            background:
              'linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 48 * u,
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          gap: (vertical ? 18 : 48) * u,
          alignItems: 'center',
        }}
      >
        {brand.contacts.map((line, i) => {
          const p = spring({
            frame: frame - OUTRO_CONTACTS - i * 6,
            fps,
            config: {damping: 14, stiffness: 160},
          });
          return (
            <div
              key={line}
              style={{
                opacity: p,
                transform: `translateY(${(1 - p) * 30 * u}px)`,
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 40 * u,
                color: colors.text,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
