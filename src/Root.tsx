import React from 'react';
import {Composition} from 'remotion';
import {MapAnimation} from './MapAnimation';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MapAnimation"
				component={MapAnimation}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
