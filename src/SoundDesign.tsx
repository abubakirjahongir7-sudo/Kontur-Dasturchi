import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, interpolate} from 'remotion';
import {asset} from './assets';
import {
  CTA_ARROW,
  CTA_BUTTON,
  CTA_INSTAGRAM,
  CTA_PULSES,
  CTA_TELEGRAM,
  DURATION,
  FPS,
  HOOK_WORDS,
  PROBLEM_CARDS,
  PROBLEM_SUBLINE,
  PROBLEM_TITLE,
  PROJECT_STARTS,
  PROJECT_TAGS,
  SERVICES_ITEMS,
  SERVICES_TAGLINE,
  TURN_FLASH,
  WORKFLOW_CHECKS,
  WORKFLOW_STEPS,
  audio,
  scenes,
} from './config';

/** Ovoz effekti: `at` kadrda boshlanadi. Fayl bo'lmasa — jim o'tkazib yuboriladi. */
const Sfx: React.FC<{
  file: string;
  at: number;
  name: string;
  volume?: number;
  duration?: number;
  trimBefore?: number;
}> = ({file, at, name, volume = 1, duration, trimBefore}) => {
  const src = asset(file);
  if (!src) return null;
  return (
    <Sequence from={Math.max(0, at)} durationInFrames={duration} name={name} layout="none">
      <Audio src={src} volume={volume} trimBefore={trimBefore} />
    </Sequence>
  );
};

const MAX_RISER_FRAMES = 60;

export const SoundDesign: React.FC<{riserSeconds: number | null}> = ({riserSeconds}) => {
  const music = asset(audio.music);
  const turnFlash = scenes.turn.from + TURN_FLASH;

  // Riser eng baland nuqtasi aynan oq flashga to'g'ri kelishi uchun uning oxirini flashga tekislaymiz
  const riserFrames = riserSeconds ? Math.round(riserSeconds * FPS) : null;
  const riserLength = riserFrames ? Math.min(riserFrames, MAX_RISER_FRAMES) : 45;
  const riserTrim = riserFrames ? riserFrames - riserLength : 0;

  return (
    <>
      {music ? (
        <Audio
          src={music}
          loop
          loopVolumeCurveBehavior="extend"
          trimBefore={Math.round(audio.musicStartSeconds * FPS)}
          volume={(f) =>
            interpolate(f, [0, 5, DURATION - 45, DURATION], [0, audio.musicVolume, audio.musicVolume, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      ) : null}

      {/* 1. HOOK: chaqnash + har bir so'zga impact */}
      <Sfx file={audio.whoosh} at={0} volume={0.6} name="whoosh (flash)" />
      {HOOK_WORDS.map((f, i) => (
        <Sfx key={`hook-${i}`} file={audio.impact} at={f} name={`impact: so'z ${i + 1}`} />
      ))}

      {/* 2. MUAMMO: sarlavha zarbasi + har bir kartaga whoosh */}
      <Sfx file={audio.whoosh} at={scenes.problem.from - 3} volume={0.7} name="whoosh → muammo" />
      <Sfx file={audio.impact} at={scenes.problem.from + PROBLEM_TITLE} volume={0.85} name="impact: MUAMMO BORMI" />
      {PROBLEM_CARDS.map((f, i) => (
        <Sfx key={`card-${i}`} file={audio.whoosh} at={scenes.problem.from + f - 2} name={`whoosh: karta ${i + 1}`} />
      ))}
      <Sfx file={audio.impact} at={scenes.problem.from + PROBLEM_SUBLINE} volume={0.6} name="impact: vaqt va pul" />

      {/* 3. BURILISH: riser → oq flash + impact */}
      <Sfx
        file={audio.riser}
        at={turnFlash - riserLength}
        duration={riserLength}
        trimBefore={riserTrim}
        volume={0.9}
        name="riser"
      />
      <Sfx file={audio.impact} at={turnFlash} name="impact: YECHIM BIZDA" />

      {/* 4. XIZMATLAR: whoosh, har plitkaga pop, shiorga impact */}
      <Sfx file={audio.whoosh} at={scenes.services.from - 3} volume={0.85} name="whoosh → xizmatlar" />
      {SERVICES_ITEMS.map((f, i) => (
        <Sfx key={`service-${i}`} file={audio.pop} at={scenes.services.from + f} volume={0.6} name={`pop: xizmat ${i + 1}`} />
      ))}
      <Sfx file={audio.impact} at={scenes.services.from + SERVICES_TAGLINE} volume={0.7} name="impact: g'oyadan mahsulotgacha" />

      {/* 5. LOYIHALAR: har almashinuvda whoosh, teglarga pop */}
      {PROJECT_STARTS.map((f, i) => (
        <React.Fragment key={`project-${i}`}>
          <Sfx
            file={audio.whoosh}
            at={scenes.projects.from + f - 3}
            volume={0.85}
            name={`whoosh: loyiha ${i + 1}`}
          />
          {PROJECT_TAGS.map((t, j) => (
            <Sfx
              key={`tag-${i}-${j}`}
              file={audio.pop}
              at={scenes.projects.from + f + t}
              volume={0.4}
              name={`pop: loyiha ${i + 1} teg ${j + 1}`}
            />
          ))}
        </React.Fragment>
      ))}

      {/* 6. JARAYON: har qadamga whoosh, belgilarga pop */}
      <Sfx file={audio.whoosh} at={scenes.workflow.from - 3} volume={0.85} name="whoosh → jarayon" />
      {WORKFLOW_STEPS.map((f, i) => (
        <Sfx key={`step-${i}`} file={audio.whoosh} at={scenes.workflow.from + f - 2} volume={0.6} name={`whoosh: qadam ${i + 1}`} />
      ))}
      {WORKFLOW_CHECKS.map((f, i) => (
        <Sfx key={`check-${i}`} file={audio.pop} at={scenes.workflow.from + f} volume={0.45} name={`pop: belgi ${i + 1}`} />
      ))}

      {/* 7. CTA */}
      <Sfx file={audio.whoosh} at={scenes.cta.from - 3} volume={0.8} name="whoosh → CTA" />
      <Sfx file={audio.pop} at={scenes.cta.from + CTA_BUTTON} volume={0.8} name="pop: tugma" />
      <Sfx file={audio.pop} at={scenes.cta.from + CTA_TELEGRAM} volume={0.6} name="pop: telegram" />
      <Sfx file={audio.pop} at={scenes.cta.from + CTA_INSTAGRAM} volume={0.6} name="pop: instagram" />
      <Sfx file={audio.whoosh} at={scenes.cta.from + CTA_ARROW - 2} volume={0.5} name="whoosh: strelka" />
      {CTA_PULSES.map((f, i) => (
        <Sfx key={`pulse-${i}`} file={audio.pop} at={scenes.cta.from + f} volume={0.45} name={`pop: puls ${i + 1}`} />
      ))}
    </>
  );
};
