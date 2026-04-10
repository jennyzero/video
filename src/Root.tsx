import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';
import {CoolDemo} from './CoolDemo';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComposition"
				component={MyComposition}
				durationInFrames={60}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="CoolDemo"
				component={CoolDemo}
				durationInFrames={590}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
