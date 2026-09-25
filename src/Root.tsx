import React from 'react';
import {Composition} from 'remotion';
import {Reel, type ReelProps} from './Reel';
import {asset} from './assets';
import {DURATION, FPS, HEIGHT, WIDTH, audio} from './config';

/** Brauzerda audio fayl uzunligini o'qiydi (fayl bo'lmasa — null) */
const getAudioSeconds = (file: string) =>
  new Promise<number | null>((resolve) => {
    const src = asset(file);
    if (!src) return resolve(null);
    const el = document.createElement('audio');
    const done = (v: number | null) => resolve(v !== null && Number.isFinite(v) ? v : null);
    el.preload = 'metadata';
    el.onloadedmetadata = () => done(el.duration);
    el.onerror = () => done(null);
    setTimeout(() => done(null), 8000);
    el.src = src;
  });

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{riserSeconds: null} satisfies ReelProps}
      calculateMetadata={async ({props}) => ({
        props: {...props, riserSeconds: await getAudioSeconds(audio.riser)},
      })}
    />
  );
};
