import React from 'react';
import {Composition} from 'remotion';
import {Promo} from './Promo';
import {FPS, TOTAL_FRAMES} from './config';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Instagram Reels / TikTok / Telegram uchun — 9:16 */}
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* YouTube / sayt uchun — 16:9 */}
      <Composition
        id="PromoWide"
        component={Promo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
