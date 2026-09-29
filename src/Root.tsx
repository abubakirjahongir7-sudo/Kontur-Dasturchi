import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {Reel, type ReelProps} from './Reel';
import {Kinetik, type KinetikProps} from './kinetik/Kinetik';
import * as kinetik from './kinetik/config';
import {QrPlain, QrPoster, type QrPosterProps} from './qr/QrPoster';
import {audioAsset} from './assets';
import {DURATION, FPS, HEIGHT, WIDTH, audio} from './config';

/** Brauzerda audio fayl uzunligini o'qiydi (fayl bo'lmasa — null) */
const getAudioSeconds = (file: string) =>
  new Promise<number | null>((resolve) => {
    const src = audioAsset(file);
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
    <>
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
      <Composition
        id="Kinetik"
        component={Kinetik}
        durationInFrames={kinetik.DURATION}
        fps={kinetik.FPS}
        width={kinetik.WIDTH}
        height={kinetik.HEIGHT}
        defaultProps={{riserSeconds: null, buildupSeconds: null} satisfies KinetikProps}
        calculateMetadata={async ({props}) => ({
          props: {
            ...props,
            riserSeconds: await getAudioSeconds(kinetik.audio.riser),
            buildupSeconds: await getAudioSeconds(kinetik.audio.buildup),
          },
        })}
      />
      <Folder name="QR">
        <Still
          id="QrPost"
          component={QrPoster}
          width={1080}
          height={1350}
          defaultProps={{variant: 'post'} satisfies QrPosterProps}
        />
        <Still
          id="QrStory"
          component={QrPoster}
          width={1080}
          height={1920}
          defaultProps={{variant: 'story'} satisfies QrPosterProps}
        />
        <Still id="QrCode" component={QrPlain} width={1200} height={1200} />
      </Folder>
    </>
  );
};
