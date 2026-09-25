import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {OrangeBackground} from './components/OrangeBackground';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {Problem} from './scenes/Problem';
import {Projects} from './scenes/Projects';
import {Turn} from './scenes/Turn';
import {SoundDesign} from './SoundDesign';
import {scenes} from './config';

export type ReelProps = {
  /** riser.mp3 uzunligi (soniya) — Root.tsx dagi calculateMetadata avtomatik aniqlaydi */
  riserSeconds: number | null;
};

export const Reel: React.FC<ReelProps> = ({riserSeconds}) => {
  return (
    <AbsoluteFill>
      <OrangeBackground />
      <Sequence from={scenes.hook.from} durationInFrames={scenes.hook.duration} name="1. Hook">
        <Hook />
      </Sequence>
      <Sequence from={scenes.problem.from} durationInFrames={scenes.problem.duration} name="2. Muammo">
        <Problem />
      </Sequence>
      <Sequence from={scenes.turn.from} durationInFrames={scenes.turn.duration} name="3. Burilish">
        <Turn />
      </Sequence>
      <Sequence from={scenes.projects.from} durationInFrames={scenes.projects.duration} name="4. Loyihalar">
        <Projects />
      </Sequence>
      <Sequence from={scenes.cta.from} durationInFrames={scenes.cta.duration} name="5. CTA">
        <Cta />
      </Sequence>
      <SoundDesign riserSeconds={riserSeconds} />
    </AbsoluteFill>
  );
};
