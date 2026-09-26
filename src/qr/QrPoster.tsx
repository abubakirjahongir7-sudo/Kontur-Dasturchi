import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {GlassPanel, GlassText} from '../components/Glass';
import {OrangeBackground} from '../components/OrangeBackground';
import {QrSvg} from '../components/QrSvg';
import {asset} from '../assets';
import {colors, cta, qr} from '../config';
import {font} from '../theme';

export type QrPosterProps = {variant: 'post' | 'story'};

// Post (1080×1350) va story (1080×1920) uchun joylashuv
const layouts = {
  post: {labelTop: 70, titleTop: 112, titleSize: 64, card: 640, cardTop: 300, gap: 34, brandSize: 54},
  story: {labelTop: 220, titleTop: 266, titleSize: 76, card: 760, cardTop: 480, gap: 44, brandSize: 64},
};

const CameraIcon: React.FC = () => (
  <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.2-1.8h5l1.2 1.8h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
      stroke="white"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <circle cx={12} cy={12.5} r={3.3} stroke="white" strokeWidth={1.8} />
  </svg>
);

const LinkIcon: React.FC = () => (
  <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" stroke={colors.accent} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" stroke={colors.accent} strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);

/** Reklama uchun QR kod posteri — video bilan bir xil uslubda */
export const QrPoster: React.FC<QrPosterProps> = ({variant}) => {
  const l = layouts[variant];
  const avatar = asset(cta.avatar);
  const qrSize = l.card - 56;

  return (
    <AbsoluteFill>
      <OrangeBackground />

      <div
        style={{
          position: 'absolute',
          top: l.labelTop,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: font,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 12,
          color: colors.accent,
        }}
      >
        {qr.label}
      </div>

      <div style={{position: 'absolute', top: l.titleTop, left: 60, right: 60, display: 'flex', justifyContent: 'center'}}>
        <GlassText
          sheenOffset={30}
          sheenPeriod={110}
          style={{
            textAlign: 'center',
            fontFamily: font,
            fontWeight: 900,
            fontSize: l.titleSize,
            lineHeight: 1.08,
            letterSpacing: -1.5,
          }}
        >
          {qr.title}
        </GlassText>
      </div>

      <AbsoluteFill style={{alignItems: 'center'}}>
        {/* QR orqasidagi nur */}
        <div
          style={{
            position: 'absolute',
            top: l.cardTop + l.card / 2 - l.card * 0.8,
            width: l.card * 1.6,
            height: l.card * 1.6,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,220,140,0.55) 0%, rgba(245,184,46,0.15) 42%, transparent 68%)',
          }}
        />

        <div style={{position: 'absolute', top: l.cardTop, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {/* Shisha ramka ichida oq kartadagi QR */}
          <GlassPanel tint="light" radius={52} blur={24} sheenOffset={20} sheenPeriod={110} style={{padding: 22}}>
            <div
              style={{
                width: l.card - 44,
                height: l.card - 44,
                borderRadius: 36,
                background: '#FFF8EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 0 2px rgba(74,34,16,0.08)',
              }}
            >
              <QrSvg text={qr.url} size={qrSize} logoLetter={qr.logoLetter} />
            </div>
          </GlassPanel>

          <div
            style={{
              marginTop: l.gap,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontFamily: font,
              fontWeight: 700,
              fontSize: 34,
              color: colors.text,
              textShadow: '0 4px 12px rgba(74,34,16,0.4)',
            }}
          >
            <CameraIcon />
            {qr.subtitle}
          </div>

          <GlassPanel radius={999} blur={16} sheenOffset={40} style={{marginTop: l.gap * 0.7, padding: '16px 34px'}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontFamily: font,
                fontWeight: 700,
                fontSize: 28,
                color: colors.text,
              }}
            >
              <LinkIcon />
              {qr.urlLabel}
            </div>
          </GlassPanel>

          <div style={{marginTop: l.gap * 1.3, display: 'flex', alignItems: 'center', gap: 22}}>
            {avatar ? (
              <div style={{padding: 4, borderRadius: '50%', background: `linear-gradient(135deg, #FFE08A, ${colors.accent})`}}>
                <Img
                  src={avatar}
                  style={{
                    width: l.brandSize * 1.5,
                    height: l.brandSize * 1.5,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: '50% 30%',
                    border: `3px solid ${colors.card}`,
                    display: 'block',
                  }}
                />
              </div>
            ) : null}
            <div style={{display: 'flex', gap: 16, fontFamily: font, fontWeight: 900, fontSize: l.brandSize, letterSpacing: -1.5}}>
              <GlassText sheenOffset={10}>{cta.brandFirst}</GlassText>
              <GlassText variant="yellow" sheenOffset={4}>
                {cta.brandSecond}
              </GlassText>
            </div>
          </div>

          {variant === 'story' ? (
            <GlassPanel tint="yellow" radius={999} sheenOffset={30} style={{marginTop: l.gap, padding: '22px 48px'}}>
              <div style={{fontFamily: font, fontWeight: 900, fontSize: 42, color: '#2A1206'}}>{cta.tagline}</div>
            </GlassPanel>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Faqat QR kodning o'zi — chop etish uchun */
export const QrPlain: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#FFF8EE', alignItems: 'center', justifyContent: 'center'}}>
    <QrSvg text={qr.url} size={1200} logoLetter={qr.logoLetter} />
  </AbsoluteFill>
);
