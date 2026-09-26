import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {GlassPanel, GlassText} from '../components/Glass';
import {PHONE_H, PHONE_W, Phone} from '../components/Phone';
import {SavdoMock} from '../components/SavdoMock';
import {PROJECT_CAPTION, PROJECT_STARTS, PROJECT_TAGS, colors, projects, type Project} from '../config';
import {punch, slamScale, snappy} from '../fx';
import {font} from '../theme';

const PHONE_TOP = 385;
const PHONE_SCALE = 0.88;
const EXIT_FRAMES = 8;

const Placeholder: React.FC<{project: Project}> = ({project}) =>
  project.fallback === 'savdo' ? (
    <SavdoMock />
  ) : (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colors.orange}, ${colors.card})`,
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: font,
        fontWeight: 700,
        fontSize: 30,
      }}
    >
      public/{project.image}
    </AbsoluteFill>
  );

/** Bitta loyiha: telefon 3D burilib kiradi, sarlavha "urilib" chiqadi */
const ProjectSlide: React.FC<{project: Project; index: number}> = ({project, index}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const dir = index % 2 === 0 ? 1 : -1;

  const enter = snappy(frame, fps, 0);
  const exit = interpolate(frame, [durationInFrames - EXIT_FRAMES, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rotateY = (1 - enter) * dir * 85 - exit * dir * 85;
  const rotateZ = (1 - enter) * dir * 10;
  const x = (1 - enter) * dir * 720 - exit * dir * 720;
  const scale = interpolate(enter, [0, 1], [0.8, 1]) * (1 - exit * 0.12);
  const float = Math.sin(frame / 14) * 10;
  const sway = Math.sin(frame / 22) * 4 * enter;

  const t = punch(frame, fps, 3);
  const cap = punch(frame, fps, PROJECT_CAPTION);
  const titleOut = interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Sarlavha */}
      <div
        style={{
          position: 'absolute',
          top: 286,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'center',
          transform: `translateY(${(1 - Math.min(t, 1)) * 90 - titleOut * 70}px) scale(${slamScale(t, 1.4)})`,
          opacity: Math.min(1, t * 2) * (1 - titleOut),
        }}
      >
        <GlassText
          variant="yellow"
          sheenOffset={-14}
          style={{fontFamily: font, fontWeight: 900, fontSize: 84, lineHeight: 1.05, textAlign: 'center'}}
        >
          {project.title}
        </GlassText>
      </div>

      {/* Telefon orqasidagi nur */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 520,
          top: PHONE_TOP + PHONE_H / 2 - 520,
          width: 1040,
          height: 1040,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,140,0.55) 0%, rgba(245,184,46,0.15) 40%, transparent 68%)',
          opacity: enter * (1 - exit) * (0.8 + Math.sin(frame / 6) * 0.2),
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 540 - PHONE_W / 2,
          top: PHONE_TOP,
          perspective: 1800,
        }}
      >
        <div
          style={{
            transform: `translateX(${x}px) translateY(${float}px) rotateY(${rotateY + sway}deg) rotateZ(${rotateZ}deg) scale(${scale * PHONE_SCALE})`,
            opacity: Math.min(1, enter * 2.5) * (1 - exit),
          }}
        >
          <Phone project={project} fallback={<Placeholder project={project} />} />
        </div>
      </div>

      {/* Telefon ustiga tushadigan shisha tavsif paneli */}
      {frame >= PROJECT_CAPTION ? (
        <div
          style={{
            position: 'absolute',
            top: 1236,
            left: 70,
            right: 70,
            transform: `translateY(${(1 - Math.min(cap, 1)) * 140 - exit * 60}px) scale(${slamScale(cap, 0.7)})`,
          }}
        >
          <GlassPanel
            radius={36}
            sheenOffset={-PROJECT_CAPTION - 10}
            sheenPeriod={140}
            style={{opacity: Math.min(1, cap * 2.5) * (1 - exit), padding: '30px 36px 32px'}}
          >
            <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, lineHeight: 1.2, color: colors.text}}>
              {project.desc}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 22}}>
              {project.tags.map((tag, i) => {
                const c = punch(frame, fps, PROJECT_TAGS[i] ?? PROJECT_TAGS[PROJECT_TAGS.length - 1]);
                if (c <= 0) return null;
                return (
                  <div key={tag} style={{transform: `scale(${slamScale(c, 0.2)})`}}>
                    <GlassPanel
                      tint={i === 0 ? 'yellow' : 'light'}
                      radius={999}
                      blur={8}
                      sheenOffset={-(PROJECT_TAGS[i] ?? 0) - 4}
                      style={{opacity: Math.min(1, c * 2), padding: '12px 26px'}}
                    >
                      <div
                        style={{
                          fontFamily: font,
                          fontWeight: 800,
                          fontSize: 30,
                          color: i === 0 ? '#2A1206' : colors.text,
                        }}
                      >
                        {tag}
                      </div>
                    </GlassPanel>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Projects: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const label = snappy(frame, fps, 0);
  const current = PROJECT_STARTS.filter((s) => frame >= s).length;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 236,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 22,
          fontFamily: font,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 10,
          color: colors.text,
          opacity: label,
          transform: `translateY(${(1 - label) * -30}px)`,
        }}
      >
        <span style={{color: colors.accent}}>{projects.label}</span>
        <span style={{opacity: 0.85}}>
          {String(current).padStart(2, '0')}/{String(projects.items.length).padStart(2, '0')}
        </span>
      </div>

      {projects.items.map((project, i) => {
        const from = PROJECT_STARTS[i];
        const to = PROJECT_STARTS[i + 1] ?? durationInFrames;
        return (
          <Sequence key={project.image} from={from} durationInFrames={to - from} name={project.title}>
            <ProjectSlide project={project} index={i} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
