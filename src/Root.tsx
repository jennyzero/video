import React from 'react';
import {Composition} from 'remotion';
import {MapAnimation} from './MapAnimation';
import {TravelRouteAnimation, TRAVEL_DURATION_FRAMES} from './TravelRouteAnimation';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MapAnimation"
				component={MapAnimation}
				durationInFrames={200}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="TravelRouteAnimation"
				component={TravelRouteAnimation}
				durationInFrames={TRAVEL_DURATION_FRAMES}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
