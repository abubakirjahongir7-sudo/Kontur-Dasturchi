import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../components/Card';
import {Flash} from '../components/Flash';
import {asset} from '../assets';
import {
  CTA_ARROW,
  CTA_AVATAR,
  CTA_BRAND,
  CTA_BUTTON,
  CTA_INSTAGRAM,
  CTA_PULSES,
  CTA_TAGLINE,
  CTA_TELEGRAM,
  colors,
  cta,
} from '../config';
import {punch, snappy} from '../fx';
import {font} from '../theme';

const IG_GRADIENT = 'linear-gradient(45deg, #F58529, #DD2A7B 45%, #8134AF 75%, #515BD4)';

/** Pastdan "sakrab" chiqish */
const usePop = (delay: number, distance = 60) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = punch(frame, fps, delay);
  return {
    transform: `translateY(${(1 - p) * distance}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
    opacity: Math.min(1, p * 2.5),
  };
};

const TelegramIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={24} fill="#2AABEE" />
    <path
      d="M11 23.5 34.5 14c1.1-.4 2 .3 1.7 1.9l-4 18.8c-.3 1.3-1.1 1.6-2.2 1l-6-4.4-2.9 2.8c-.3.3-.6.6-1.2.6l.4-6.1 11.1-10c.5-.4-.1-.7-.7-.3L16.9 27l-5.9-1.8c-1.3-.4-1.3-1.3.3-1.7Z"
      fill="white"
    />
  </svg>
);

const PlaneIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 3 10 14" stroke="white" strokeWidth={2.2} strokeLinecap="round" />
    <path d="M21 3 14.5 21l-4.5-7-7-4.5L21 3Z" stroke="white" strokeWidth={2.2} strokeLinejoin="round" />
  </svg>
);

const InstagramGlyph: React.FC<{size: number}> = ({size}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: IG_GRADIENT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 24 24" fill="none">
      <rect x={3} y={3} width={18} height={18} rx={5} stroke="white" strokeWidth={2.2} />
      <circle cx={12} cy={12} r={4.2} stroke="white" strokeWidth={2.2} />
      <circle cx={17.3} cy={6.7} r={1.3} fill="white" />
    </svg>
  </div>
);

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const avatarSrc = asset(cta.avatar);

  const zoom = interpolate(snappy(frame, fps, 0), [0, 1], [1.12, 1]);

  const avatar = usePop(CTA_AVATAR, 120);
  const brand = usePop(CTA_BRAND);
  const tagline = usePop(CTA_TAGLINE);
  const button = usePop(CTA_BUTTON, 80);
  const telegram = usePop(CTA_TELEGRAM);
  const instagram = usePop(CTA_INSTAGRAM, 80);

  // Tugma pulsi: har bir CTA_PULSES kadrida kattalashib qaytadi + halqa tarqaladi
  const lastPulse = [...CTA_PULSES].reverse().find((p) => frame >= p);
  const since = lastPulse === undefined ? 99 : frame - lastPulse;
  const bump = since < 10 ? Math.sin((since / 10) * Math.PI) * 0.09 : 0;
  const breathe = frame > CTA_BUTTON + 20 ? Math.sin(frame / 7) * 0.015 : 0;
  const ring = Math.min(1, since / 20);

  // Strelka: chizilib chiqadi, keyin sakrab turadi
  const draw = interpolate(frame, [CTA_ARROW, CTA_ARROW + 12], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bounce = frame > CTA_ARROW + 12 ? Math.abs(Math.sin((frame - CTA_ARROW) / 5)) * -22 : 0;
  const hint = usePop(CTA_ARROW, 40);
  const dmGlow = frame > CTA_ARROW ? 0.5 + Math.sin(frame / 4) * 0.5 : 0;

  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: font,
          color: colors.text,
        }}
      >
        {/* Rasm */}
        <div
          style={{
            marginTop: 235,
            width: 206,
            height: 264,
            borderRadius: 40,
            overflow: 'hidden',
            border: `5px solid ${colors.card}`,
            boxShadow: `0 0 0 3px ${colors.accent}, 0 20px 60px rgba(60,16,0,0.55), 0 0 80px rgba(245,184,46,0.5)`,
            background: colors.card,
            ...avatar,
            transform: `${avatar.transform} rotate(${(1 - avatar.opacity) * -10}deg)`,
          }}
        >
          {avatarSrc ? (
            <Img src={avatarSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : null}
        </div>

        {/* Kontur Dasturchi */}
        <div
          style={{
            marginTop: 36,
            fontSize: 86,
            fontWeight: 900,
            letterSpacing: -2,
            textShadow: '0 8px 0 rgba(74,34,16,0.55)',
            ...brand,
          }}
        >
          {cta.brandFirst} <span style={{color: colors.accent}}>{cta.brandSecond}</span>
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 52,
            fontWeight: 800,
            textShadow: '0 6px 0 rgba(74,34,16,0.45)',
            ...tagline,
          }}
        >
          {cta.tagline}
        </div>

        {/* Sariq tugma */}
        <div style={{position: 'relative', marginTop: 44, ...button}}>
          {lastPulse !== undefined && ring < 1 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 70,
                border: `${6 * (1 - ring)}px solid ${colors.accent}`,
                transform: `scale(${1 + ring * 0.25}, ${1 + ring * 0.7})`,
                opacity: 1 - ring,
              }}
            />
          ) : null}
          <div
            style={{
              width: 880,
              height: 140,
              borderRadius: 70,
              background: colors.accent,
              color: '#2A1206',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 46,
              fontWeight: 900,
              boxShadow: `0 14px 0 #B8820F, 0 0 ${60 + bump * 400}px rgba(245,184,46,0.8)`,
              transform: `scale(${1 + bump + breathe})`,
            }}
          >
            {cta.button}
          </div>
        </div>

        {/* Telegram */}
        <Card
          style={{
            marginTop: 52,
            width: 880,
            height: 116,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            fontSize: 40,
            fontWeight: 800,
            ...telegram,
          }}
        >
          <TelegramIcon size={56} />
          {cta.telegram}
        </Card>

        {/* Instagram Direct */}
        <Card
          style={{
            marginTop: 30,
            width: 880,
            padding: '28px 34px',
            boxSizing: 'border-box',
            ...instagram,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{padding: 5, borderRadius: '50%', background: IG_GRADIENT}}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `4px solid ${colors.card}`,
                  background: colors.card,
                }}
              >
                {avatarSrc ? (
                  <Img
                    src={avatarSrc}
                    style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}}
                  />
                ) : null}
              </div>
            </div>
            <div style={{flex: 1}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 38, fontWeight: 800}}>
                {cta.instagram}
                <InstagramGlyph size={40} />
              </div>
              <div style={{fontSize: 24, fontWeight: 600, opacity: 0.75, marginTop: 6}}>{cta.instagramBio}</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 24,
              height: 84,
              borderRadius: 22,
              background: IG_GRADIENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              fontSize: 36,
              fontWeight: 800,
              boxShadow: `0 0 ${20 + dmGlow * 50}px rgba(214,41,118,${0.3 + dmGlow * 0.5})`,
              transform: `scale(${1 + dmGlow * 0.03})`,
            }}
          >
            <PlaneIcon size={40} />
            {cta.directButton}
          </div>
        </Card>

        {/* Strelka va "Direct'ga yozing!" */}
        <div
          style={{
            marginTop: 10,
            width: 880,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            ...hint,
          }}
        >
          <svg
            width={130}
            height={120}
            viewBox="0 0 130 120"
            fill="none"
            style={{transform: `translateY(${bounce}px)`, overflow: 'visible'}}
          >
            <path
              d="M112 104 C 60 104, 30 80, 34 16"
              stroke={colors.accent}
              strokeWidth={10}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={draw}
              style={{filter: 'drop-shadow(0 4px 0 rgba(74,34,16,0.6))'}}
            />
            <path
              d="M12 38 L34 12 L56 38"
              stroke={colors.accent}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={draw < 0.2 ? 1 : 0}
              style={{filter: 'drop-shadow(0 4px 0 rgba(74,34,16,0.6))'}}
            />
          </svg>
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: colors.accent,
              textShadow: '0 6px 0 rgba(74,34,16,0.6), 0 0 30px rgba(255,214,120,0.6)',
              transform: `translateY(${bounce * 0.3}px)`,
            }}
          >
            {cta.directHint}
          </div>
        </div>
      </div>

      <Flash at={0} duration={8} strength={0.7} />
    </AbsoluteFill>
  );
};
