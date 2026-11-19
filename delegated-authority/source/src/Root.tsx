import React from 'react';
import {Composition} from 'remotion';
import {Trust, Disclosure, Issue, CatB, FullDetails, SignIn, Adult, Child, SelfGrant} from './scenes';
const list: [string, React.FC, number][] = [
  ['Trust', Trust, 400], ['Disclosure', Disclosure, 360], ['Issue', Issue, 360], ['CatB', CatB, 380],
  ['FullDetails', FullDetails, 400], ['SignIn', SignIn, 400], ['Adult', Adult, 500], ['Child', Child, 560], ['SelfGrant', SelfGrant, 660],
];
export const Root: React.FC = () => <>{list.map(([id, c, d]) =>
  <Composition key={id} id={id} component={c} durationInFrames={d} fps={30} width={1920} height={880} />)}</>;
