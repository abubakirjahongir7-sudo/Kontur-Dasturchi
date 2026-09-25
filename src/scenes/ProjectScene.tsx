import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Chip} from '../components/Chip';
import {DeviceFrame, deviceChrome} from '../components/DeviceFrame';
import {RevealWords} from '../components/RevealWords';
import {asset} from '../assets';
import {CHIPS_START, CHIP_STAGGER, type Device, type Project} from '../config';
import {useLayout} from '../layout';
import {colors, fonts, gradient} from '../theme';
import {useImageSize} from '../useImageSize';

const pad = (n: number) => String(n).padStart(2, '0');

export const ProjectScene: React.FC<{
  project: Project;
  index: number;
  total: number;
}> = ({project, index, total}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const {u, vertical, width, height} = useLayout();
  const {accent} = project;

  // Qurilma pastdan 3D burilish bilan chiqib keladi, keyin sekin "suzadi"
  const enter = spring({
    frame: frame - 4,
    fps,
    config: {damping: 20, stiffness: 90, mass: 1},
  });
  const float = Math.sin(frame / 18) * 8 * u;
  const tilt = interpolate(enter, [0, 1], [28, vertical ? 4 : 0]);
  const turn = vertical ? 0 : interpolate(enter, [0, 1], [-18, -8]);
  const lift = (1 - enter) * 420 * u;

  const lineGrow = spring({frame: frame - 6, fps, config: {damping: 200}});

  const src = asset(project.image);
  const size = useImageSize(src);
  const device: Device =
    project.device ??
    (size && size.width / size.height < 0.7 && size.width <= 1400 ? 'phone' : 'browser');

  // Ekran o'lchami: telefon — qat'iy, brauzer — rasm nisbatiga moslashadi
  const isPhone = device === 'phone';
  const viewW = (vertical ? (isPhone ? 470 : 896) : isPhone ? 312 : 956) * u;
  const maxViewH = (vertical ? (isPhone ? 1000 : 920) : isPhone ? 664 : 548) * u;
  const viewH =
    isPhone || !size
      ? maxViewH
      : Math.min(maxViewH, Math.max(viewW * 0.42, viewW * (size.height / size.width)));
  const chrome = deviceChrome(device, u);
  const deviceSize = {w: viewW + chrome.x, h: viewH + chrome.y};

  const deviceCenter = vertical
    ? {x: width / 2, y: height * 0.585}
    : {x: isPhone ? width * 0.7 : width - 120 * u - deviceSize.w / 2, y: height / 2};

  const header = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20 * u,
          fontFamily: fonts.mono,
          fontSize: 28 * u,
          color: accent[1],
          letterSpacing: 3 * u,
        }}
      >
        <span>
          {pad(index + 1)} / {pad(total)}
        </span>
        <div
          style={{
            width: 140 * u * lineGrow,
            height: 3 * u,
            borderRadius: 99,
            background: gradient(accent[0], accent[1]),
          }}
        />
      </div>
      <RevealWords
        text={project.title}
        delay={6}
        style={{
          marginTop: 26 * u,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: (vertical ? 86 : 76) * u,
          lineHeight: 1.12,
          color: colors.text,
        }}
      />
      <RevealWords
        text={project.subtitle}
        delay={14}
        stagger={1}
        style={{
          marginTop: 22 * u,
          fontFamily: fonts.body,
          fontWeight: 500,
          fontSize: (vertical ? 38 : 34) * u,
          lineHeight: 1.35,
          color: colors.muted,
          maxWidth: (vertical ? 900 : 700) * u,
        }}
      />
    </>
  );

  const chips = (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 16 * u}}>
      {project.tags.map((tag, i) => (
        <Chip
          key={tag}
          label={tag}
          delay={CHIPS_START + i * CHIP_STAGGER}
          accent={i % 2 === 0 ? accent[0] : accent[1]}
          u={u}
        />
      ))}
    </div>
  );

  return (
    <AbsoluteFill>
      {/* Qurilma orqasidagi rangli nur */}
      <div
        style={{
          position: 'absolute',
          left: deviceCenter.x - 600 * u,
          top: deviceCenter.y - 600 * u,
          width: 1200 * u,
          height: 1200 * u,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent[0]}55 0%, ${accent[1]}22 40%, transparent 70%)`,
          opacity: enter,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: deviceCenter.x - deviceSize.w / 2,
          top: deviceCenter.y - deviceSize.h / 2,
          perspective: 2400 * u,
        }}
      >
        <div
          style={{
            transform: `translateY(${lift + float}px) rotateX(${tilt}deg) rotateY(${turn}deg)`,
            opacity: Math.min(1, enter * 2),
          }}
        >
          <DeviceFrame
            src={src}
            image={project.image}
            size={size}
            device={device}
            viewW={viewW}
            viewH={viewH}
            scrollFrames={durationInFrames - 20}
            accent={accent}
            u={u}
          />
        </div>
      </div>

      {vertical ? (
        <>
          <div style={{position: 'absolute', top: 130 * u, left: 90 * u, right: 90 * u}}>
            {header}
          </div>
          <div style={{position: 'absolute', bottom: 120 * u, left: 90 * u, right: 90 * u}}>
            {chips}
          </div>
        </>
      ) : (
        <div
          style={{
            position: 'absolute',
            left: 120 * u,
            top: 0,
            bottom: 0,
            width: 700 * u,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {header}
          <div style={{marginTop: 44 * u}}>{chips}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
