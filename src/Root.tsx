import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';
import {CoolVideo, COOL_VIDEO_FRAMES} from './CoolVideo';

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
				id="CoolVideo"
				component={CoolVideo}
				durationInFrames={COOL_VIDEO_FRAMES}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
