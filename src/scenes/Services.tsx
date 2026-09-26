import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {GlassPanel, GlassText} from '../components/Glass';
import {SERVICES_ITEMS, SERVICES_TAGLINE, SERVICES_TITLE, colors, services, type ServiceIcon} from '../config';
import {punch, shake, slamScale, snappy} from '../fx';
import {font} from '../theme';

const TILE_W = 450;
const TILE_H = 340;

const Icon: React.FC<{name: ServiceIcon}> = ({name}) => {
  const common = {stroke: 'white', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={62} height={62} viewBox="0 0 24 24" fill="none">
      {name === 'web' ? (
        <>
          <rect x={2.5} y={4} width={19} height={16} rx={3} {...common} />
          <path d="M2.5 9h19" {...common} />
          <circle cx={6} cy={6.5} r={0.6} fill="white" />
          <circle cx={8.5} cy={6.5} r={0.6} fill="white" />
          <path d="M7 13.5h6M7 16.5h10" {...common} />
        </>
      ) : null}
      {name === 'bot' ? (
        <>
          <path d="M21.5 3 10.5 14" {...common} />
          <path d="M21.5 3 15 21l-4.5-7-7-4.5L21.5 3Z" {...common} />
        </>
      ) : null}
      {name === 'app' ? (
        <>
          <rect x={3} y={3} width={7.5} height={7.5} rx={2} {...common} />
          <rect x={13.5} y={3} width={7.5} height={7.5} rx={2} {...common} />
          <rect x={3} y={13.5} width={7.5} height={7.5} rx={2} {...common} />
          <rect x={13.5} y={13.5} width={7.5} height={7.5} rx={2} {...common} />
        </>
      ) : null}
      {name === 'ai' ? (
        <>
          <path d="M10 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" {...common} />
          <path d="M18.5 14.5c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" {...common} />
        </>
      ) : null}
    </svg>
  );
};

const Tile: React.FC<{index: number; start: number; fade: number}> = ({index, start, fade}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start) return null;
  const item = services.items[index];

  const p = punch(frame, fps, start);
  const dir = index % 2 === 0 ? -1 : 1;
  const float = Math.sin((frame + index * 17) / 20) * 8;

  return (
    <div
      style={{
        transform: `translateY(${(1 - Math.min(p, 1)) * 160 + float}px) rotate(${(1 - Math.min(p, 1)) * dir * 14}deg) scale(${slamScale(p, 0.3)})`,
      }}
    >
      <GlassPanel
        sheenOffset={-start - 10 - index * 6}
        sheenPeriod={140}
        style={{
          width: TILE_W,
          height: TILE_H,
          opacity: Math.min(1, p * 2.5) * fade,
          padding: '34px 36px',
          boxSizing: 'border-box',
          fontFamily: font,
          color: colors.text,
        }}
      >
        <GlassPanel
          tint="yellow"
          radius={30}
          blur={10}
          sheenOffset={-start - 4}
          style={{width: 104, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon name={item.icon} />
          </div>
        </GlassPanel>
        <div style={{marginTop: 28, fontSize: 44, fontWeight: 900, letterSpacing: -1, whiteSpace: 'nowrap'}}>{item.title}</div>
        <div style={{marginTop: 8, fontSize: 28, fontWeight: 600, opacity: 0.9}}>{item.desc}</div>
      </GlassPanel>
    </div>
  );
};

export const Services: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const label = snappy(frame, fps, 0);
  const t = punch(frame, fps, SERVICES_TITLE);
  const tag = punch(frame, fps, SERVICES_TAGLINE);
  const s = shake(frame, [SERVICES_TITLE, SERVICES_TAGLINE], 22, 10);

  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${s.x}px, ${s.y - exit * 120}px) scale(${1 + exit * 0.08})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 236,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: font,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 12,
          color: colors.accent,
          opacity: label * (1 - exit),
        }}
      >
        {services.label}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 290,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${slamScale(t, 1.8)})`,
          opacity: Math.min(1, t * 2) * (1 - exit),
        }}
      >
        <GlassText
          sheenOffset={-SERVICES_TITLE - 14}
          style={{
            textAlign: 'center',
            fontFamily: font,
            fontWeight: 900,
            fontSize: 80,
            lineHeight: 1.08,
            letterSpacing: -2,
          }}
        >
          {services.title}
        </GlassText>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 530,
          left: 0,
          right: 0,
          display: 'grid',
          gridTemplateColumns: `${TILE_W}px ${TILE_W}px`,
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {services.items.map((item, i) => (
          <div key={item.title} style={{width: TILE_W, height: TILE_H}}>
            <Tile index={i} start={SERVICES_ITEMS[i]} fade={1 - exit} />
          </div>
        ))}
      </div>

      {frame >= SERVICES_TAGLINE ? (
        <div style={{position: 'absolute', top: 1300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${slamScale(tag, 0.4)})`}}>
            <GlassPanel
              tint="yellow"
              radius={999}
              sheenOffset={-SERVICES_TAGLINE - 8}
              style={{opacity: Math.min(1, tag * 2) * (1 - exit), padding: '28px 56px'}}
            >
              <div style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: '#2A1206'}}>
                {services.tagline}
              </div>
            </GlassPanel>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
