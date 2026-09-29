import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence} from 'remotion';
import {audioAsset} from '../assets';
import {audio, because, card, client, direct, fix, growth, idea, money, noise, result, scenes, smart, work} from './config';
import type {Line} from './config';
import {
  BecauseScene,
  CardScene,
  ClientScene,
  DirectScene,
  FixScene,
  GrowthScene,
  IdeaScene,
  MoneyScene,
  NoiseScene,
  ProfileScene,
  ResultScene,
  SmartScene,
  WorkScene,
} from './Scenes';

const timeline = [
  {name: '1. G‘oya', scene: scenes.idea, Component: IdeaScene},
  {name: '2. Savdo', scene: scenes.growth, Component: GrowthScene},
  {name: '3. Chunki', scene: scenes.because, Component: BecauseScene},
  {name: '4. Tartibsizlik', scene: scenes.noise, Component: NoiseScene},
  {name: '5. Daromad', scene: scenes.money, Component: MoneyScene},
  {name: '6. Kartochka', scene: scenes.card, Component: CardScene},
  {name: '7. Mijoz', scene: scenes.client, Component: ClientScene},
  {name: '8. Natija', scene: scenes.result, Component: ResultScene},
  {name: '9. Profil', scene: scenes.profile, Component: ProfileScene},
  {name: '10. Ish', scene: scenes.work, Component: WorkScene},
  {name: '11. Tizimli emas', scene: scenes.smart, Component: SmartScene},
  {name: '12. Direct', scene: scenes.direct, Component: DirectScene},
  {name: '13. Yakun', scene: scenes.fix, Component: FixScene},
];

const Sfx: React.FC<{file: string; at: number; name: string; volume?: number}> = ({file, at, name, volume = 1}) => {
  const src = audioAsset(file);
  if (!src) return null;
  return (
    <Sequence from={Math.max(0, at)} name={name} layout="none">
      <Audio src={src} volume={volume * audio.sfxVolume} />
    </Sequence>
  );
};

/** Sahnadagi kalit (qizil) so'zlar qachon chiqishi — ularga "pop" ovozi */
const accents = (from: number, lines: Line[]) =>
  lines.flatMap((l) => l.filter((w) => w.a).map((w) => from + w.at));

const SoundDesign: React.FC = () => {
  const pops = [
    ...accents(scenes.idea.from, idea),
    ...accents(scenes.growth.from, growth.circle),
    ...accents(scenes.because.from, [...because.first, ...because.second]),
    ...accents(scenes.money.from, [...money.top, ...money.bottom]),
    ...card.items.map((i) => scenes.card.from + i.at),
    ...accents(scenes.client.from, [client.line]),
    ...accents(scenes.result.from, result),
    ...accents(scenes.work.from, work),
    ...accents(scenes.smart.from, smart),
    ...accents(scenes.direct.from, direct),
  ];
  const impacts = [
    scenes.growth.from + growth.bottom.at,
    scenes.noise.from + noise[1][0].at,
    scenes.fix.from + fix.line[0].at,
  ];
  return (
    <>
      {timeline.slice(1).map(({name, scene}) => (
        <Sfx key={name} file={audio.whoosh} at={scene.from - 3} volume={0.45} name={`whoosh → ${name}`} />
      ))}
      {pops.map((f, i) => (
        <Sfx key={`pop-${i}`} file={audio.pop} at={f} volume={0.35} name="pop" />
      ))}
      {impacts.map((f, i) => (
        <Sfx key={`impact-${i}`} file={audio.impact} at={f} volume={0.6} name="impact" />
      ))}
    </>
  );
};

export const Kinetik: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    {timeline.map(({name, scene, Component}) => (
      <Sequence key={name} from={scene.from} durationInFrames={scene.duration} name={name}>
        <Component />
      </Sequence>
    ))}
    <SoundDesign />
  </AbsoluteFill>
);
