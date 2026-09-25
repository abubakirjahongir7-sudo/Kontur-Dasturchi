import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Background} from './components/Background';
import {Intro} from './scenes/Intro';
import {Outro} from './scenes/Outro';
import {ProjectScene} from './scenes/ProjectScene';
import {SoundDesign} from './SoundDesign';
import {TRANSITION_FRAMES, projects, sceneDurations} from './config';

const directions = ['from-right', 'from-bottom', 'from-left', 'from-bottom'] as const;

// Birinchi (intro -> loyiha) va oxirgi (loyiha -> outro) o'tishlar — wipe,
// qolganlari — turli tomondan slide
const renderTransition = (i: number) =>
  i === 0 || i === projects.length ? (
    <TransitionSeries.Transition
      presentation={wipe({direction: 'from-bottom-left'})}
      timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
    />
  ) : (
    <TransitionSeries.Transition
      presentation={slide({direction: directions[i % directions.length]})}
      timing={springTiming({durationInFrames: TRANSITION_FRAMES, config: {damping: 200}})}
    />
  );

export const Promo: React.FC = () => {
  const scenes: React.ReactNode[] = [
    <Intro key="intro" />,
    ...projects.map((project, i) => (
      <ProjectScene key={project.image} project={project} index={i} total={projects.length} />
    )),
    <Outro key="outro" />,
  ];

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        {scenes.map((scene, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={sceneDurations[i]}>
              {scene}
            </TransitionSeries.Sequence>
            {i < scenes.length - 1 ? renderTransition(i) : null}
          </React.Fragment>
        ))}
      </TransitionSeries>
      <SoundDesign />
    </AbsoluteFill>
  );
};
