import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, interpolate} from 'remotion';
import {asset} from './assets';
import {
  CHIPS_START,
  CHIP_STAGGER,
  INTRO_IMPACT,
  INTRO_TAGLINE,
  OUTRO_CONTACTS,
  OUTRO_CTA,
  TOTAL_FRAMES,
  audio,
  projects,
  sceneStarts,
} from './config';

/** Ovoz effekti: berilgan kadrda boshlanadi. Fayl bo'lmasa — jim o'tkazib yuboriladi. */
const Sfx: React.FC<{
  file: string;
  at: number;
  volume?: number;
  duration?: number;
  name: string;
}> = ({file, at, volume = 1, duration, name}) => {
  const src = asset(file);
  if (!src) return null;
  return (
    <Sequence from={Math.max(0, at)} durationInFrames={duration} name={name} layout="none">
      <Audio src={src} volume={volume} />
    </Sequence>
  );
};

export const SoundDesign: React.FC = () => {
  const music = asset(audio.music);
  const outroStart = sceneStarts[sceneStarts.length - 1];

  return (
    <>
      {music ? (
        <Audio
          src={music}
          loop
          loopVolumeCurveBehavior="extend"
          volume={(f) =>
            interpolate(f, [0, 12, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 0.5, 0.5, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      ) : null}

      {/* Intro: riser zarbagacha ko'tariladi, keyin impact */}
      <Sfx file={audio.riser} at={0} duration={INTRO_IMPACT} volume={0.8} name="riser" />
      <Sfx file={audio.impact} at={INTRO_IMPACT} volume={1} name="impact (logo)" />
      <Sfx file={audio.pop} at={INTRO_TAGLINE} volume={0.5} name="pop (shior)" />

      {/* Har bir sahna almashinuvida whoosh */}
      {sceneStarts.slice(1).map((start, i) => (
        <Sfx
          key={`whoosh-${i}`}
          file={audio.whoosh}
          at={start - 4}
          volume={0.7}
          name={`whoosh ${i + 1}`}
        />
      ))}

      {/* Loyiha sahnalarida teglar chiqqanda pop */}
      {projects.map((project, p) =>
        project.tags.map((_, t) => (
          <Sfx
            key={`pop-${p}-${t}`}
            file={audio.pop}
            at={sceneStarts[p + 1] + CHIPS_START + t * CHIP_STAGGER}
            volume={0.45}
            name={`pop ${p + 1}.${t + 1}`}
          />
        )),
      )}

      {/* Outro: tugma chiqqanda impact, kontaktlarda pop */}
      <Sfx file={audio.impact} at={outroStart + OUTRO_CTA} volume={0.9} name="impact (CTA)" />
      <Sfx file={audio.pop} at={outroStart + OUTRO_CONTACTS} volume={0.45} name="pop (kontakt)" />
    </>
  );
};
