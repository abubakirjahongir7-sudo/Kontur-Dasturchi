import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../config';
import {font} from '../theme';

const bars = [0.35, 0.5, 0.42, 0.66, 0.58, 0.82, 1];
const orders = [
  {name: 'Buyurtma #1042', status: 'Yetkazildi', color: '#34D399'},
  {name: 'Buyurtma #1041', status: 'Yo‘lda', color: colors.accent},
  {name: 'Buyurtma #1040', status: 'Yangi', color: '#60A5FA'},
];

/** savdo.jpg bo'lmaganda telefon ichida ko'rsatiladigan savdo paneli (namuna) */
export const SavdoMock: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const count = interpolate(frame, [6, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #24100A, #140803)',
        padding: '96px 34px 34px',
        fontFamily: font,
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
      }}
    >
      <div style={{fontSize: 22, fontWeight: 600, opacity: 0.6, letterSpacing: 3}}>SAVDO PANELI</div>
      <div
        style={{
          background: colors.card,
          borderRadius: 28,
          padding: 28,
          border: '2px solid rgba(255, 214, 150, 0.22)',
        }}
      >
        <div style={{fontSize: 22, opacity: 0.7, fontWeight: 600}}>Bugungi buyurtmalar</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6}}>
          <div style={{fontSize: 64, fontWeight: 900}}>{Math.round(count * 128)}</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1B0A03',
              background: colors.accent,
              borderRadius: 999,
              padding: '4px 14px',
            }}
          >
            +{Math.round(count * 38)}%
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 190, marginTop: 20}}>
          {bars.map((b, i) => {
            const g = spring({frame: frame - 8 - i * 3, fps, config: {damping: 14, stiffness: 160}});
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${b * 100 * g}%`,
                  borderRadius: 10,
                  background:
                    i === bars.length - 1
                      ? `linear-gradient(180deg, ${colors.accent}, ${colors.orange})`
                      : 'rgba(245, 184, 46, 0.35)',
                }}
              />
            );
          })}
        </div>
      </div>
      {orders.map((o, i) => {
        const p = spring({frame: frame - 20 - i * 5, fps, config: {damping: 16, stiffness: 200}});
        return (
          <div
            key={o.name}
            style={{
              transform: `translateX(${(1 - p) * 120}px)`,
              opacity: p,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 22,
              padding: '22px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {o.name}
            <span style={{display: 'flex', alignItems: 'center', gap: 10, color: o.color, fontSize: 22}}>
              <span style={{width: 12, height: 12, borderRadius: 99, background: o.color}} />
              {o.status}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
