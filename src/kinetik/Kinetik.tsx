import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {scenes} from './config';
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
import {KinetikSound, type KinetikSoundProps} from './Sound';

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

export type KinetikProps = KinetikSoundProps;

export const Kinetik: React.FC<KinetikProps> = (props) => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    {timeline.map(({name, scene, Component}) => (
      <Sequence key={name} from={scene.from} durationInFrames={scene.duration} name={name}>
        <Component />
      </Sequence>
    ))}
    <KinetikSound {...props} />
  </AbsoluteFill>
);
