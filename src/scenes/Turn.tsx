import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {Flash} from '../components/Flash';
import {GlassPanel, GlassText} from '../components/Glass';
import {TURN_FLASH, colors, turn} from '../config';
import {hitGlow, punch, shake, slamScale} from '../fx';
import {font} from '../theme';

const RAYS = 48;

export const Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const before = frame < TURN_FLASH;

  // Flashgacha: tezlik chiziqlari markazga tortiladi, silkinish kuchayadi
  const charge = interpolate(frame, [0, TURN_FLASH], [0.3, 1], {extrapolateRight: 'clamp'});
  const preShake = before ? charge * 26 : 0;
  const s = shake(frame, [TURN_FLASH], 40, 14);
  const sx = s.x + (random(`tx${frame}`) - 0.5) * preShake;
  const sy = s.y + (random(`ty${frame}`) - 0.5) * preShake;

  const p = punch(frame, fps, TURN_FLASH);
  const scale = slamScale(p, 3.2);
  const glow = hitGlow(frame, TURN_FLASH, 20);

  const exit = interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {before ? (
        <AbsoluteFill style={{background: `radial-gradient(circle, #5A2308 0%, ${colors.dark} 70%)`}}>
          <svg
            width="100%"
            height="100%"
            viewBox="-540 -960 1080 1920"
            style={{transform: `translate(${sx}px, ${sy}px) scale(1.06)`}}
          >
            {Array.from({length: RAYS}, (_, i) => {
              const a = (i / RAYS) * Math.PI * 2 + random(`ra${i}`) * 0.2;
              const travel = ((frame * (0.09 + random(`rs${i}`) * 0.05) + random(`ro${i}`)) % 1) ** 2;
              const r1 = 1300 * (1 - travel);
              const r2 = r1 + 120 + 260 * charge;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r1}
                  y1={Math.sin(a) * r1}
                  x2={Math.cos(a) * r2}
                  y2={Math.sin(a) * r2}
                  stroke={colors.accent}
                  strokeOpacity={0.35 + charge * 0.5}
                  strokeWidth={3 + charge * 5}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,214,120,${0.55 + glow * 0.4}) 0%, rgba(232,101,26,0) ${
              45 + glow * 20
            }%)`,
          }}
        />
      )}

      {!before ? (
        <AbsoluteFill
          style={{alignItems: 'center', justifyContent: 'center', transform: `translate(${sx}px, ${sy}px)`}}
        >
          <div style={{transform: `scale(${scale}) translateY(${-exit * 260}px)`}}>
            <GlassPanel
              tint="brown"
              radius={60}
              blur={26}
              sheenOffset={-TURN_FLASH - 8}
              sheenPeriod={120}
              style={{opacity: Math.min(1, p * 3) * (1 - exit)}}
            >
              <GlassText
                variant="yellow"
                glow={glow}
                sheenOffset={-TURN_FLASH - 12}
                sheenPeriod={120}
                style={{
                  padding: '50px 70px 60px',
                  textAlign: 'center',
                  fontFamily: font,
                  fontWeight: 900,
                  fontSize: 180,
                  lineHeight: 1.0,
                  letterSpacing: -4,
                }}
              >
                {turn.text.split(' ').map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </GlassText>
            </GlassPanel>
          </div>
        </AbsoluteFill>
      ) : null}

      <Flash at={TURN_FLASH} duration={12} />
    </AbsoluteFill>
  );
};
