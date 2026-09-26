import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {GlassPanel, GlassText} from '../components/Glass';
import {WORKFLOW_CHECKS, WORKFLOW_STEPS, WORKFLOW_TITLE, colors, workflow} from '../config';
import {punch, shake, slamScale, snappy} from '../fx';
import {font} from '../theme';

const ROW_TOP = 480;
const ROW_H = 200;
const ROW_GAP = 44;
const LEFT = 90;
const CIRCLE = 110;

const Step: React.FC<{index: number; fade: number}> = ({index, fade}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = WORKFLOW_STEPS[index];
  if (frame < start) return null;
  const step = workflow.steps[index];

  const p = punch(frame, fps, start);
  const check = punch(frame, fps, WORKFLOW_CHECKS[index]);
  const active = frame >= start && (WORKFLOW_STEPS[index + 1] === undefined || frame < WORKFLOW_STEPS[index + 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: ROW_TOP + index * (ROW_H + ROW_GAP),
        left: LEFT - 40,
        right: LEFT - 40,
        transform: `translateX(${(1 - Math.min(p, 1)) * 700}px) rotate(${(1 - Math.min(p, 1)) * 6}deg) scale(${
          slamScale(p, 0.6) * (active ? 1.03 : 1)
        })`,
      }}
    >
      <GlassPanel
        radius={40}
        sheenOffset={-start - 8}
        sheenPeriod={150}
        style={{
          height: ROW_H,
          opacity: Math.min(1, p * 2.5) * fade,
          padding: '0 36px',
          boxSizing: 'border-box',
          boxShadow: active
            ? '0 26px 60px rgba(50,12,0,0.35), 0 0 60px rgba(245,184,46,0.55), inset 0 2px 1px rgba(255,255,255,0.55)'
            : undefined,
        }}
      >
        <div style={{height: '100%', display: 'flex', alignItems: 'center', gap: 34, width: '100%'}}>
          <GlassPanel
            tint="yellow"
            radius={999}
            blur={8}
            sheenOffset={-start - 2}
            style={{width: CIRCLE, height: CIRCLE, flexShrink: 0}}
          >
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: font,
                fontWeight: 900,
                fontSize: 46,
                color: '#2A1206',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
          </GlassPanel>
          <div style={{flex: 1, fontFamily: font, color: colors.text}}>
            <div style={{fontSize: 50, fontWeight: 900, letterSpacing: -1}}>{step.title}</div>
            <div style={{fontSize: 32, fontWeight: 600, opacity: 0.88, marginTop: 6}}>{step.desc}</div>
          </div>
          {check > 0 ? (
            <div
              style={{
                width: 74,
                height: 74,
                flexShrink: 0,
                borderRadius: 999,
                background: colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${slamScale(check, 0)}) rotate(${(1 - Math.min(check, 1)) * -90}deg)`,
                boxShadow: '0 0 30px rgba(245,184,46,0.8)',
              }}
            >
              <svg width={42} height={42} viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5 10 17.5 19 7" stroke="#2A1206" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : null}
        </div>
      </GlassPanel>
    </div>
  );
};

export const Workflow: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const label = snappy(frame, fps, 0);
  const t = punch(frame, fps, WORKFLOW_TITLE);
  const s = shake(frame, [WORKFLOW_TITLE, ...WORKFLOW_STEPS], 14, 8);

  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Raqamlarni bog'lovchi chiziq qadamlar chiqqan sari pastga cho'ziladi
  const lineX = LEFT - 40 + 2 + 36 + CIRCLE / 2;
  const firstY = ROW_TOP + ROW_H / 2;
  const lastY = ROW_TOP + (workflow.steps.length - 1) * (ROW_H + ROW_GAP) + ROW_H / 2;
  const reached = interpolate(
    frame,
    WORKFLOW_STEPS.map((f) => f + 4),
    WORKFLOW_STEPS.map((_, i) => i / (WORKFLOW_STEPS.length - 1)),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{transform: `translate(${s.x}px, ${s.y - exit * 120}px) scale(${1 + exit * 0.08})`}}>
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
        {workflow.label}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 290,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${slamScale(t, 1.8)})`,
          opacity: Math.min(1, t * 2) * (1 - exit),
        }}
      >
        <GlassText
          sheenOffset={-WORKFLOW_TITLE - 14}
          style={{fontFamily: font, fontWeight: 900, fontSize: 92, letterSpacing: -2, textAlign: 'center'}}
        >
          {workflow.title}
        </GlassText>
      </div>

      <div
        style={{
          position: 'absolute',
          left: lineX - 4,
          top: firstY,
          width: 8,
          height: (lastY - firstY) * reached,
          borderRadius: 8,
          background: `linear-gradient(180deg, ${colors.accent}, #FFE7A8)`,
          boxShadow: '0 0 24px rgba(245,184,46,0.8)',
          opacity: frame >= WORKFLOW_STEPS[0] ? 1 - exit : 0,
        }}
      />

      {workflow.steps.map((step, i) => (
        <Step key={step.title} index={i} fade={1 - exit} />
      ))}
    </AbsoluteFill>
  );
};
