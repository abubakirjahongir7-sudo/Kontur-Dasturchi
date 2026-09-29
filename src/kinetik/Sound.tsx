import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence} from 'remotion';
import {audioAsset} from '../assets';
import {
  FPS,
  audio,
  because,
  card,
  client,
  direct,
  fix,
  growth,
  idea,
  money,
  noise,
  result,
  scenes,
  smart,
  work,
  type Line,
} from './config';

export type KinetikSoundProps = {
  /** suspense-riser va buildup uzunligi (soniya) — Root.tsx dagi calculateMetadata aniqlaydi */
  riserSeconds: number | null;
  buildupSeconds: number | null;
};

const Sfx: React.FC<{
  file: string;
  at: number;
  name: string;
  volume?: number;
  duration?: number;
  trimBefore?: number;
}> = ({file, at, name, volume = 1, duration, trimBefore}) => {
  const src = audioAsset(file);
  if (!src) return null;
  return (
    <Sequence from={Math.max(0, at)} durationInFrames={duration} name={name} layout="none">
      <Audio src={src} volume={volume * audio.sfxVolume} trimBefore={trimBefore} />
    </Sequence>
  );
};

/**
 * Ko'tariluvchi ovoz (riser/buildup) eng baland nuqtasi aynan `end` kadrga tushishi uchun:
 * fayl uzun bo'lsa boshidan qirqiladi, qisqa bo'lsa kechroq boshlanadi.
 */
const RiseTo: React.FC<{file: string; start: number; end: number; seconds: number | null; name: string; volume: number}> = ({
  file,
  start,
  end,
  seconds,
  name,
  volume,
}) => {
  const total = seconds ? Math.round(seconds * FPS) : end - start;
  const length = Math.min(total, end - start);
  return (
    <Sfx
      file={file}
      at={end - length}
      duration={length}
      trimBefore={total - length}
      volume={volume}
      name={name}
    />
  );
};

/** Sahnadagi qizil kalit so'zlar qachon chiqadi */
const accents = (from: number, lines: Line[]) => lines.flatMap((l) => l.filter((w) => w.a).map((w) => from + w.at));

export const KinetikSound: React.FC<KinetikSoundProps> = ({riserSeconds, buildupSeconds}) => {
  const s = scenes;
  const dropAt = s.noise.from + noise[1][0].at; // "tartibsizlik"
  const tadum = s.fix.from + fix.line[0].at; // "tizimni" — ikkinchi zarba ("dum") shu yerda
  const tadumStart = tadum - audio.netflixSecondHit;

  // Soft UI pop: kalit so'zlar va "sakrab" chiqadigan elementlar
  const pops = [
    ...accents(s.idea.from, idea),
    s.growth.from, // oq doira
    ...accents(s.growth.from, growth.circle),
    ...accents(s.because.from, [...because.first, ...because.second]),
    s.noise.from + 1, // masxaraboz
    ...accents(s.money.from, money.top),
    s.card.from + card.titleAt,
    s.client.from + client.logoAt,
    ...accents(s.client.from, [client.line]),
    ...accents(s.result.from, result),
    s.profile.from,
    ...accents(s.work.from, work),
    s.smart.from + 1, // 😎
    ...accents(s.smart.from, smart),
    ...accents(s.direct.from, direct),
    s.fix.from + fix.brandAt,
  ];

  // UI click: lampochka yoqilishi, knopka, ro'yxat bandlari
  const clicks = [
    s.idea.from + 8,
    s.card.from + card.enter + 6,
    ...card.items.map((i) => s.card.from + i.at),
  ];

  // Klaviatura: har 6 kadrda tugma bosilishi
  const typing = Array.from({length: 8}, (_, i) => s.work.from + 4 + i * 6);

  return (
    <>
      {/* 2. Kostyumli odam: "o‘smayapti" */}
      <Sfx file={audio.boom} at={s.growth.from + growth.bottom.at} volume={0.85} name="boom: o‘smayapti" />

      {/* 3 → 4. Suspense riser "tartibsizlik" dagi Drop ga olib boradi */}
      <RiseTo
        file={audio.riser}
        start={s.because.from}
        end={dropAt}
        seconds={riserSeconds}
        volume={0.7}
        name="suspense riser"
      />
      <Sfx file={audio.drop} at={dropAt} volume={1} name="drop: tartibsizlik" />

      {/* 5. Pul: raqamlar sanaladi, "ding" — "daromad" so'zida */}
      <Sfx
        file={audio.counter}
        at={s.money.from + money.bottom[1][0].at - audio.counterDing}
        volume={0.55}
        name="digital counter: daromad"
      />

      {/* Sahna o'tishlari: Slice Ring */}
      {[s.because, s.money, s.card, s.result, s.work].map((sc) => (
        <Sfx key={sc.from} file={audio.slice} at={sc.from - 2} volume={0.45} name="slice ring: o'tish" />
      ))}

      {/* Doira bilan ochilishlar: Shutter soft boom */}
      <Sfx file={audio.boom} at={s.client.from} volume={0.7} name="boom: pushti doira" />
      <Sfx file={audio.boom} at={s.profile.from} volume={0.5} name="boom: profil" />

      {/* 11 → 12. Buildup Netflix uslubidagi yakuniy zarbaga olib boradi */}
      <RiseTo
        file={audio.buildup}
        start={s.smart.from}
        end={tadumStart}
        seconds={buildupSeconds}
        volume={0.75}
        name="buildup"
      />
      <Sfx file={audio.netflix} at={tadumStart} volume={1} name="netflix: tizimni biz quramiz" />

      {pops.map((f, i) => (
        <Sfx key={`pop-${i}`} file={audio.pop} at={f} volume={0.5} name="soft ui pop" />
      ))}
      {clicks.map((f, i) => (
        <Sfx key={`click-${i}`} file={audio.click} at={f} volume={1} name="ui click" />
      ))}
      {typing.map((f, i) => (
        <Sfx key={`type-${i}`} file={audio.click} at={f} volume={0.4} name="ui click: klaviatura" />
      ))}
    </>
  );
};
