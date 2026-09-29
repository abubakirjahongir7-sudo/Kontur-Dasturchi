import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  because,
  brand,
  card,
  client,
  colors,
  direct,
  fix,
  growth,
  idea,
  money,
  noise,
  result,
  smart,
  work,
} from './config';
import {sans, script} from './fonts';
import {Keyboard, PinnedCard, ProfileCard, SuitFigure} from './Props';
import {Arc, Barcode, CircleReveal, CreamBg, DarkBg, Emoji, Grid, Shot, TopMark} from './Stage';
import {Words} from './Words';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Yozuvni ekranning berilgan balandligiga (markazi bo'yicha) joylashtiradi */
const At: React.FC<{y: number; x?: number; rotate?: number; children: React.ReactNode}> = ({
  y,
  x = 0,
  rotate = 0,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y,
      display: 'flex',
      justifyContent: 'center',
      transform: `translate(${x}px, -50%) rotate(${rotate}deg)`,
    }}
  >
    {children}
  </div>
);

// 1. Lampochka — "Sizda g‘oya ham, biznes ham bor"
export const IdeaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = interpolate(frame, [9, 16], [0, 1], clamp);
  return (
    <Shot enter={false}>
      <CreamBg />
      <Grid y={-60} size={700} />
      {/* G'oya paydo bo'lganda lampochka "yonadi" */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 18% 50%, rgba(255,210,70,${0.45 * lit}) 0%, rgba(255,210,70,0) 38%)`,
        }}
      />
      <Emoji name="bulb" size={1000} x={-360} y={40} rotate={10} wobble={1.5} />
      <Barcode style={{position: 'absolute', top: 250, right: 120}} />
      <TopMark y={1720} />
      <At y={900} x={170}>
        <Words lines={idea} size={64} maxWidth={600} align="flex-start" />
      </At>
    </Shot>
  );
};

// 2. Kostyumli odam — "Lekin savdo-chi? … o‘smayapti"
export const GrowthScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = spring({frame, fps, config: {damping: 13, stiffness: 170, mass: 0.7}});
  const body = spring({frame: frame - 2, fps, config: {damping: 20, stiffness: 120}});
  const bottom = spring({frame: frame - growth.bottom.at, fps, config: {damping: 15, stiffness: 200, mass: 0.7}});
  return (
    <Shot drift={0.07}>
      <DarkBg />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 700, opacity: body, transform: `translateY(${(1 - body) * 120}px)`}}>
          <SuitFigure width={800} />
        </div>
        {/* Bosh o'rnidagi oq doira */}
        <div
          style={{
            position: 'absolute',
            top: 290,
            width: 470,
            height: 470,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #ECECEC 70%, #DADADA)',
            boxShadow: '0 0 70px rgba(255,255,255,0.45), 0 0 160px rgba(255,255,255,0.18)',
            transform: `scale(${head})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Words lines={growth.circle} size={66} accentScale={1.55} maxWidth={400} />
        </div>
        {/* Pastdagi katta yozuv */}
        <div
          style={{
            position: 'absolute',
            top: 1400,
            fontFamily: sans,
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: '-0.06em',
            color: 'white',
            textShadow: '0 0 30px rgba(255,255,255,0.45), 0 10px 40px rgba(0,0,0,0.9)',
            opacity: Math.min(1, bottom * 1.8),
            transform: `scale(${interpolate(bottom, [0, 1], [1.5, 1])})`,
            filter: bottom < 0.97 ? `blur(${(1 - bottom) * 20}px)` : undefined,
          }}
        >
          {growth.bottom.t}
        </div>
      </AbsoluteFill>
    </Shot>
  );
};

// 3. Qora fon — "Chunki tizimsiz / yuritilgan biznes"
export const BecauseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.5, 1]);
  return (
    <Shot>
      <DarkBg glow={pulse} />
      <At y={960}>
        <Words lines={because.first} dark size={80} accentScale={1.6} hideAt={because.switchAt} />
      </At>
      <At y={960}>
        <Words lines={because.second} dark size={80} accentScale={2.2} />
      </At>
    </Shot>
  );
};

// 4. Masxaraboz — "shunchaki tartibsizlik"
export const NoiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = noise[1][0].at;
  const k = frame >= hit ? Math.max(0, 1 - (frame - hit) / 10) ** 2 * 14 : 0;
  const shake = {x: (random(`nx${frame}`) - 0.5) * 2 * k, y: (random(`ny${frame}`) - 0.5) * 2 * k};
  return (
    <Shot>
      <CreamBg />
      <Arc rotate={-6} />
      <Emoji name="clown" size={560} at={0} x={420} y={-820} rotate={-20} wobble={4} />
      <Emoji name="clown" size={620} at={3} x={-420} y={820} rotate={18} wobble={4} />
      <Grid y={60} size={560} />
      <AbsoluteFill style={{transform: `translate(${shake.x}px, ${shake.y}px)`}}>
        <Emoji name="clown" size={400} at={1} y={120} wobble={6} />
        <At y={720} rotate={-4}>
          <Words lines={noise} size={66} accentScale={1.75} />
        </At>
      </AbsoluteFill>
    </Shot>
  );
};

// 5. Pul — "Tizim esa — haqiqiy daromad"
// Pullar chemodandan yon tomonlarga uchadi (yozuvlar ustiga tushmaydi)
const BILLS = [
  {x: -370, y: -240, r: -30, d: 4},
  {x: 370, y: -200, r: 25, d: 6},
  {x: -400, y: 60, r: 15, d: 9},
  {x: 390, y: 110, r: -18, d: 11},
  {x: -300, y: 300, r: 8, d: 13},
  {x: 300, y: 330, r: 35, d: 15},
];

export const MoneyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Shot drift={0.06}>
      <DarkBg glow={0.6} />
      <AbsoluteFill style={{opacity: 0.5, filter: 'invert(1)'}}>
        <Grid size={760} opacity={0.12} />
      </AbsoluteFill>
      {BILLS.map((b, i) => {
        const p = spring({frame: frame - b.d, fps, config: {damping: 14, stiffness: 90, mass: 0.9}});
        const float = Math.sin((frame + i * 13) / 10) * 12;
        return (
          <Emoji
            key={i}
            name="dollar"
            size={190}
            at={b.d}
            x={b.x * p}
            y={b.y * p + float}
            rotate={b.r + frame * (i % 2 ? 0.4 : -0.4)}
            wobble={0}
          />
        );
      })}
      <Emoji name="briefcase" size={560} at={0} y={20} wobble={2} />
      <At y={500} rotate={-8}>
        <Words lines={money.top} dark size={70} accentScale={1.8} />
      </At>
      <At y={1470}>
        <Words lines={money.bottom} dark size={70} accentScale={2.1} />
      </At>
    </Shot>
  );
};

// 6. Qadalgan kartochka — "Tizimsiz: nazorat, mijoz, foyda yo‘q"
export const CardScene: React.FC = () => (
  <Shot drift={0.04}>
    <CreamBg />
    <Arc rotate={4} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: 'scale(1.22)'}}>
        <PinnedCard {...card} />
      </div>
    </AbsoluteFill>
  </Shot>
);

// 7. Pushti doira — "Mijoz mehnatni ko‘rmaydi"
export const ClientScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - client.logoAt, fps, config: {damping: 14, stiffness: 180, mass: 0.7}});
  const fade = interpolate(frame, [18, 40], [1, 0.35], clamp);
  return (
    <Shot enter={false}>
      <CreamBg />
      <CircleReveal duration={14} ring="#F29A9A">
        <AbsoluteFill style={{background: colors.pink, opacity: fade}} />
      </CircleReveal>
      <At y={880}>
        <div
          style={{
            fontFamily: script,
            fontSize: 250,
            lineHeight: 1.2,
            padding: '0 30px',
            background: 'linear-gradient(90deg, #7A2FB0, #C92E8A 40%, #F0643A 75%, #F9B233)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            opacity: Math.min(1, logo * 1.6),
            transform: `scale(${interpolate(logo, [0, 1], [0.4, 1])})`,
            filter: `drop-shadow(0 12px 24px rgba(160,40,100,0.25))${logo < 0.95 ? ` blur(${(1 - logo) * 14}px)` : ''}`,
          }}
        >
          {client.logo}
        </div>
      </At>
      <At y={1070}>
        <Words lines={[client.line]} size={64} accentScale={1.55} />
      </At>
    </Shot>
  );
};

// 8. "U faqat natijani ko‘radi"
export const ResultScene: React.FC = () => (
  <Shot>
    <CreamBg />
    <At y={960}>
      <Words lines={result} size={70} accentScale={2.2} />
    </At>
  </Shot>
);

// 9. Instagram profil kartochkasi
export const ProfileScene: React.FC = () => (
  <Shot drift={0.06}>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 48%, #2A2A2E 0%, #0A0A0B 45%, #000 80%)'}} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <ProfileCard />
    </AbsoluteFill>
  </Shot>
);

// 10. Klaviatura — "Siz tinmay ishlayapsiz"
export const WorkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kb = spring({frame, fps, config: {damping: 18, stiffness: 110, mass: 0.9}});
  return (
    <Shot>
      <CreamBg />
      <TopMark />
      <At y={560}>
        <Words lines={work} size={70} accentScale={1.95} />
      </At>
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 1010,
          transform: `translate(${(1 - kb) * 500}px, ${(1 - kb) * 500}px) perspective(1600px) rotateX(30deg) rotateZ(-24deg)`,
          transformOrigin: '0% 0%',
        }}
      >
        <Keyboard typing />
      </div>
    </Shot>
  );
};

// 11. 😎 — "Lekin tizimli emas"
export const SmartScene: React.FC = () => (
  <Shot>
    <CreamBg />
    <Arc rotate={-4} />
    <Emoji name="cool" size={560} at={0} x={440} y={-780} rotate={-16} wobble={3} style={{opacity: 0.9}} />
    <Emoji name="cool" size={560} at={2} x={-460} y={800} rotate={14} wobble={3} style={{opacity: 0.9}} />
    <Emoji name="cool" size={400} at={1} y={140} wobble={5} />
    <At y={700}>
      <Words lines={smart} size={70} accentScale={1.8} />
    </At>
  </Shot>
);

// 12. Qora doira — "Hoziroq Direct’ga yozing"
export const DirectScene: React.FC = () => (
  <Shot enter={false}>
    <CreamBg />
    <CircleReveal duration={12}>
      <DarkBg glow={0.8} />
    </CircleReveal>
    <At y={960}>
      <Words lines={direct} dark size={64} accentScale={1.7} />
    </At>
  </Shot>
);

// 13. "tizimni biz quramiz" + brend
export const FixScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const b = spring({frame: frame - fix.brandAt, fps, config: {damping: 16, stiffness: 160}});
  const end = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
  return (
    <Shot exit={false} drift={0.04}>
      <AbsoluteFill style={{opacity: end}}>
        <DarkBg glow={0.8} />
        <At y={900}>
          <Words lines={[fix.line]} dark size={66} accentScale={1.8} />
        </At>
        <At y={1110}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              fontFamily: sans,
              opacity: b,
              transform: `translateY(${(1 - b) * 40}px)`,
              filter: b < 0.97 ? `blur(${(1 - b) * 10}px)` : undefined,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <span
                style={{width: 16, height: 16, borderRadius: 8, background: colors.red, boxShadow: `0 0 18px ${colors.redGlow}`}}
              />
              <span style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.3em', color: 'white'}}>
                {brand.name.toUpperCase()}
              </span>
            </div>
            <span style={{fontSize: 34, fontWeight: 500, color: 'rgba(255,255,255,0.6)'}}>@{brand.handle}</span>
          </div>
        </At>
      </AbsoluteFill>
    </Shot>
  );
};
