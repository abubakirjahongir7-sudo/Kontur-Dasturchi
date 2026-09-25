import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Logo} from '../components/Logo';
import {RevealWords} from '../components/RevealWords';
import {INTRO_IMPACT, INTRO_TAGLINE, brand} from '../config';
import {useLayout} from '../layout';
import {colors, fonts, gradient} from '../theme';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {u, vertical} = useLayout();

  // Zarbagacha: markazdagi chiziq cho'ziladi va yorug'lik kuchayadi
  const build = interpolate(frame, [0, INTRO_IMPACT], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });
  const lineOpacity = interpolate(frame, [INTRO_IMPACT - 2, INTRO_IMPACT + 4], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Zarba: logo kattadan joyiga "uriladi"
  const slam = spring({
    frame: frame - INTRO_IMPACT,
    fps,
    config: {damping: 14, stiffness: 220, mass: 0.7},
  });
  const logoScale = interpolate(slam, [0, 1], [2.2, 1]);
  const logoOpacity = frame < INTRO_IMPACT ? 0 : Math.min(1, slam * 3);

  const suffix = spring({
    frame: frame - INTRO_IMPACT - 6,
    fps,
    config: {damping: 16, stiffness: 160},
  });

  // Kamera silkinishi va oq chaqnash
  const since = frame - INTRO_IMPACT;
  const shakeAmp = since >= 0 ? Math.max(0, 1 - since / 12) * 18 * u : 0;
  const shakeX = Math.sin(frame * 2.7) * shakeAmp;
  const shakeY = Math.cos(frame * 3.3) * shakeAmp;
  const flash =
    since < 0 ? 0 : interpolate(since, [0, 10], [0.55, 0], {extrapolateRight: 'clamp'});

  // Chiqishda logo biroz kichrayadi
  const exit = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoSize = (vertical ? 165 : 200) * u;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.violet}${Math.round(
            build * 90,
          )
            .toString(16)
            .padStart(2, '0')}, transparent ${30 + build * 25}%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: `${build * (vertical ? 80 : 60)}%`,
          height: 4 * u,
          borderRadius: 99,
          background: gradient(colors.violet, colors.cyan),
          boxShadow: `0 0 ${40 * u}px ${colors.cyan}`,
          opacity: lineOpacity,
        }}
      />
      <div
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${logoScale * exit})`,
          opacity: logoOpacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Logo
          size={logoSize}
          suffixOffset={(1 - suffix) * 40 * u}
          suffixOpacity={suffix}
        />
        <RevealWords
          text={brand.tagline}
          delay={INTRO_TAGLINE}
          stagger={3}
          align="center"
          style={{
            marginTop: 56 * u,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: (vertical ? 42 : 40) * u,
            color: colors.muted,
            letterSpacing: 1 * u,
          }}
        />
      </div>
      <AbsoluteFill style={{backgroundColor: 'white', opacity: flash}} />
    </AbsoluteFill>
  );
};
