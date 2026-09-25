import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, useCurrentFrame} from 'remotion';
import type {Device} from '../config';
import type {ImageSize} from '../useImageSize';
import {colors, fonts, gradient} from '../theme';

/** Ramkaning ekrandan tashqari qismlari (brauzer paneli, telefon bezel) */
export const deviceChrome = (device: Device, u: number) =>
  device === 'phone'
    ? {x: 2 * (14 + 2) * u, y: 2 * (14 + 2) * u}
    : {x: 2 * 2 * u, y: (58 + 2 * 2) * u};

type ScreenProps = {
  src: string | null;
  image: string;
  size: ImageSize | null;
  viewW: number;
  viewH: number;
  scrollFrames: number;
  accent: [string, string];
  u: number;
};

/**
 * Skrinshot: rasm ekrandan baland bo'lsa (full-page skrinshot) pastga skroll qilinadi,
 * aks holda sekin yaqinlashadi.
 */
const Screen: React.FC<ScreenProps> = ({
  src,
  image,
  size,
  viewW,
  viewH,
  scrollFrames,
  accent,
  u,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [14, scrollFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  if (!src) {
    return (
      <AbsoluteFill
        style={{
          background: gradient(accent[0], accent[1], 135),
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: fonts.mono,
          fontSize: 32 * u,
        }}
      >
        public/{image}
      </AbsoluteFill>
    );
  }

  const renderedH = size ? viewW * (size.height / size.width) : viewH;

  if (renderedH > viewH * 1.05) {
    const distance = Math.min(renderedH - viewH, viewH * 2.5);
    return (
      <Img
        src={src}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: viewW,
          height: renderedH,
          transform: `translateY(${-progress * distance}px)`,
        }}
      />
    );
  }

  return (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${1 + progress * 0.06})`,
      }}
    />
  );
};

type Props = ScreenProps & {device: Device};

export const DeviceFrame: React.FC<Props> = (props) => {
  const {device, viewW, viewH, accent, u} = props;
  const shadow = `0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.55), 0 0 ${140 * u}px ${accent[0]}40`;

  if (device === 'phone') {
    return (
      <div
        style={{
          padding: 14 * u,
          borderRadius: 64 * u,
          background: '#16181F',
          border: `${2 * u}px solid rgba(255,255,255,0.14)`,
          boxShadow: shadow,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: viewW,
            height: viewH,
            borderRadius: 50 * u,
            overflow: 'hidden',
            background: colors.surface,
          }}
        >
          <Screen {...props} />
          <div
            style={{
              position: 'absolute',
              top: 16 * u,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140 * u,
              height: 40 * u,
              borderRadius: 999,
              background: '#000',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 26 * u,
        overflow: 'hidden',
        background: colors.surface,
        border: `${2 * u}px solid ${colors.border}`,
        boxShadow: shadow,
      }}
    >
      <div
        style={{
          height: 58 * u,
          display: 'flex',
          alignItems: 'center',
          gap: 12 * u,
          padding: `0 ${22 * u}px`,
          background: '#171A22',
          boxSizing: 'border-box',
          borderBottom: `${1 * u}px solid ${colors.border}`,
        }}
      >
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div
            key={c}
            style={{width: 16 * u, height: 16 * u, borderRadius: 99, background: c}}
          />
        ))}
        <div
          style={{
            marginLeft: 18 * u,
            flex: 1,
            height: 30 * u,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${16 * u}px`,
            gap: 10 * u,
          }}
        >
          <div
            style={{
              width: 12 * u,
              height: 12 * u,
              borderRadius: 3 * u,
              border: `${2 * u}px solid ${accent[1]}`,
            }}
          />
          <div
            style={{
              width: '38%',
              height: 8 * u,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.18)',
            }}
          />
        </div>
      </div>
      <div style={{position: 'relative', width: viewW, height: viewH, overflow: 'hidden'}}>
        <Screen {...props} />
      </div>
    </div>
  );
};
