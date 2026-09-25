import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../components/Card';
import {PROBLEM_CARDS, PROBLEM_TITLE, colors, problem} from '../config';
import {punch, shake, slamScale, snappy} from '../fx';
import {font} from '../theme';

const GLITCH_FRAMES = 14;
const CARD_W = 900;
const CARD_H = 170;

const AlertIcon: React.FC = () => (
  <div
    style={{
      width: 84,
      height: 84,
      flexShrink: 0,
      borderRadius: 24,
      background: 'rgba(255, 59, 48, 0.18)',
      border: `2px solid ${colors.danger}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg width={46} height={46} viewBox="0 0 24 24" fill="none">
      <path d="M12 3 2 21h20L12 3Z" stroke={colors.danger} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M12 10v5" stroke={colors.danger} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={12} cy={18} r={1.3} fill={colors.danger} />
    </svg>
  </div>
);

const CardBody: React.FC<{text: string; color?: string}> = ({text, color = colors.text}) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 34,
      padding: '0 44px',
      fontFamily: font,
      fontWeight: 800,
      fontSize: 62,
      color,
    }}
  >
    <AlertIcon />
    {text}
  </div>
);

/** Karta: yon tomondan uchib kiradi va qizil "glitch" bilan titraydi */
const GlitchCard: React.FC<{text: string; start: number; index: number}> = ({text, start, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start) return null;

  const p = snappy(frame, fps, start);
  const dir = index % 2 === 0 ? -1 : 1;
  const x = (1 - p) * dir * 1300;

  const g = frame - start;
  const glitching = g < GLITCH_FRAMES;
  const intensity = glitching ? 1 - g / GLITCH_FRAMES : 0;
  const rnd = (k: string) => random(`${k}-${index}-${frame}`) - 0.5;

  const jitter = glitching ? rnd('j') * 40 * intensity : 0;
  const split = glitching ? 8 + Math.abs(rnd('s')) * 22 * intensity : 0;

  const card = (content: React.ReactNode, extra?: React.CSSProperties) => (
    <Card style={{position: 'absolute', inset: 0, overflow: 'hidden', ...extra}}>{content}</Card>
  );

  return (
    <div
      style={{
        position: 'relative',
        width: CARD_W,
        height: CARD_H,
        transform: `translateX(${x + jitter}px) skewX(${glitching ? rnd('k') * 14 * intensity : 0}deg)`,
      }}
    >
      {glitching ? (
        <>
          {/* RGB bo'linish: qizil va ko'k nusxalar */}
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${-split}px)`, opacity: 0.8}}>
            <CardBody text={text} color="#FF2A2A" />
          </div>
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${split}px)`, opacity: 0.7}}>
            <CardBody text={text} color="#00E5FF" />
          </div>
          {/* Kesiklarga bo'lingan karta */}
          {[0, 1, 2, 3].map((band) => (
            <div
              key={band}
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(${band * 25}% 0 ${100 - (band + 1) * 25}% 0)`,
                transform: `translateX(${random(`b-${index}-${band}-${frame}`) > 0.45 ? rnd(`bx${band}`) * 90 * intensity : 0}px)`,
              }}
            >
              {card(<CardBody text={text} />)}
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 32,
              background: colors.danger,
              opacity: 0.45 * intensity * (random(`f-${index}-${frame}`) > 0.3 ? 1 : 0.2),
              mixBlendMode: 'screen',
            }}
          />
        </>
      ) : (
        card(<CardBody text={text} />, {
          boxShadow: `0 24px 60px rgba(60,16,0,0.45), inset 6px 0 0 ${colors.danger}`,
        })
      )}
    </div>
  );
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const t = punch(frame, fps, PROBLEM_TITLE);
  const titleScale = slamScale(t, 2.6);

  const s1 = shake(frame, [PROBLEM_TITLE], 30, 12);
  const s2 = shake(frame, PROBLEM_CARDS, 14, 8);

  // Oxirida (riser paytida) sahna kattalashib, kuchli silkinadi
  const build = interpolate(frame, [durationInFrames - 16, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bx = (random(`bx${frame}`) - 0.5) * 30 * build;
  const by = (random(`by${frame}`) - 0.5) * 30 * build;

  const [word1, ...rest] = problem.title.replace(/\?$/, '').split(' ');
  const hasQuestion = problem.title.endsWith('?');
  const wobble = Math.sin(frame / 3.2) * 14 * (1 + Math.max(0, 1 - (frame - PROBLEM_TITLE) / 20));
  const qScale = 1 + Math.sin(frame / 5) * 0.08;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${s1.x + s2.x + bx}px, ${s1.y + s2.y + by}px) rotate(${
          s1.r + s2.r
        }deg) scale(${1 + build * 0.18})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 330,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: font,
          fontWeight: 900,
          fontSize: 170,
          lineHeight: 1.0,
          letterSpacing: -4,
          color: colors.text,
          textShadow: '0 10px 0 rgba(74,34,16,0.55), 0 0 60px rgba(90,20,0,0.35)',
          transform: `scale(${titleScale})`,
          opacity: Math.min(1, t * 2),
        }}
      >
        <div>{word1}</div>
        <div style={{display: 'flex', alignItems: 'baseline'}}>
          {rest.join(' ')}
          {hasQuestion ? (
            <span
              style={{
                display: 'inline-block',
                color: colors.accent,
                transform: `rotate(${wobble}deg) scale(${qScale})`,
                transformOrigin: '50% 85%',
                marginLeft: 8,
                textShadow: '0 10px 0 rgba(74,34,16,0.55), 0 0 50px rgba(245,184,46,0.8)',
              }}
            >
              ?
            </span>
          ) : null}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 860,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 44,
        }}
      >
        {problem.cards.map((text, i) => (
          <GlitchCard key={text} text={text} start={PROBLEM_CARDS[i]} index={i} />
        ))}
      </div>

      <AbsoluteFill style={{backgroundColor: colors.dark, opacity: build * 0.55}} />
    </AbsoluteFill>
  );
};
