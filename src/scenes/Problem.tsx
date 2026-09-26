import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {GlassPanel, GlassText} from '../components/Glass';
import {PROBLEM_CARDS, PROBLEM_SUBLINE, PROBLEM_TITLE, colors, problem} from '../config';
import {punch, shake, slamScale, snappy} from '../fx';
import {font} from '../theme';

const GLITCH_FRAMES = 14;
const CARD_W = 900;
const CARD_H = 160;

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

  const card = (content: React.ReactNode, settled = false) => (
    <GlassPanel style={{position: 'absolute', inset: 0}} sheenOffset={-start - 16 - index * 4}>
      {settled ? (
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: colors.danger}} />
      ) : null}
      {content}
    </GlassPanel>
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
        card(<CardBody text={text} />, true)
      )}
    </div>
  );
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const t = punch(frame, fps, PROBLEM_TITLE);
  const titleScale = slamScale(t, 2.6);

  const sub = punch(frame, fps, PROBLEM_SUBLINE);
  const s1 = shake(frame, [PROBLEM_TITLE, PROBLEM_SUBLINE], 30, 12);
  const s2 = shake(frame, PROBLEM_CARDS, 14, 8);

  // Oxirida (riser paytida) sahna kattalashib, kuchli silkinadi
  const build = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], {
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
          top: 290,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${titleScale})`,
          opacity: Math.min(1, t * 2),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: font,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 1.0,
            letterSpacing: -4,
          }}
        >
          <GlassText sheenOffset={-PROBLEM_TITLE - 12}>{word1}</GlassText>
          <div style={{display: 'flex', alignItems: 'baseline'}}>
            <GlassText sheenOffset={-PROBLEM_TITLE - 16}>{rest.join(' ')}</GlassText>
            {hasQuestion ? (
              <GlassText
                variant="yellow"
                glow={0.6}
                style={{
                  display: 'inline-block',
                  transform: `rotate(${wobble}deg) scale(${qScale})`,
                  transformOrigin: '50% 85%',
                  marginLeft: 8,
                }}
              >
                ?
              </GlassText>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 770,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 36,
        }}
      >
        {problem.cards.map((text, i) => (
          <GlitchCard key={text} text={text} start={PROBLEM_CARDS[i]} index={i} />
        ))}
      </div>

      {frame >= PROBLEM_SUBLINE ? (
        <div style={{position: 'absolute', top: 1380, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${slamScale(sub, 0.4)})`}}>
            <GlassPanel
              tint="yellow"
              radius={999}
              sheenOffset={-PROBLEM_SUBLINE - 8}
              style={{opacity: Math.min(1, sub * 2), padding: '26px 52px'}}
            >
              <div style={{fontFamily: font, fontWeight: 800, fontSize: 46, color: '#2A1206'}}>{problem.subline}</div>
            </GlassPanel>
          </div>
        </div>
      ) : null}

      <AbsoluteFill style={{backgroundColor: colors.dark, opacity: build * 0.55}} />
    </AbsoluteFill>
  );
};
