import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {OrangeBackground} from './components/OrangeBackground';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {Problem} from './scenes/Problem';
import {Projects} from './scenes/Projects';
import {Services} from './scenes/Services';
import {Turn} from './scenes/Turn';
import {Workflow} from './scenes/Workflow';
import {SoundDesign} from './SoundDesign';
import {scenes} from './config';

export type ReelProps = {
  /** riser.mp3 uzunligi (soniya) — Root.tsx dagi calculateMetadata avtomatik aniqlaydi */
  riserSeconds: number | null;
};

const timeline = [
  {key: 'hook', name: '1. Hook', scene: scenes.hook, Component: Hook},
  {key: 'problem', name: '2. Muammo', scene: scenes.problem, Component: Problem},
  {key: 'turn', name: '3. Burilish', scene: scenes.turn, Component: Turn},
  {key: 'services', name: '4. Xizmatlar', scene: scenes.services, Component: Services},
  {key: 'projects', name: '5. Loyihalar', scene: scenes.projects, Component: Projects},
  {key: 'workflow', name: '6. Jarayon', scene: scenes.workflow, Component: Workflow},
  {key: 'cta', name: '7. CTA', scene: scenes.cta, Component: Cta},
];

export const Reel: React.FC<ReelProps> = ({riserSeconds}) => {
  return (
    <AbsoluteFill>
      <OrangeBackground />
      {timeline.map(({key, name, scene, Component}) => (
        <Sequence key={key} from={scene.from} durationInFrames={scene.duration} name={name}>
          <Component />
        </Sequence>
      ))}
      <SoundDesign riserSeconds={riserSeconds} />
    </AbsoluteFill>
  );
};
