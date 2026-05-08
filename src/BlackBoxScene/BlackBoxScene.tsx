import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Background} from './components/Background';
import {WorldMap} from './components/WorldMap';
import {FactoryPanels} from './components/FactoryPanels';
import {EmailPanels} from './components/EmailPanels';
import {PacketStream} from './components/PacketStream';
import {Timeline} from './components/Timeline';
import {CustomerScene} from './components/CustomerScene';
import {ClosingLine} from './components/ClosingLine';
import {UIChrome} from './components/UIChrome';
import {CameraDrift} from './components/CameraDrift';
import {SCENE_FRAMES} from './timing';

/**
 * BlackBoxScene
 * Premium industrial-tech motion graphics scene.
 * 9s @ 30fps · 1920×1080. Every layer remains fully editable.
 */
export const BlackBoxScene: React.FC = () => {
	const frame = useCurrentFrame();

	// Final fade-to-black hold for the closing line
	const sceneVignette = interpolate(
		frame,
		[SCENE_FRAMES - 12, SCENE_FRAMES],
		[1, 0.92],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return (
		<AbsoluteFill style={{background: '#0B1020', filter: `brightness(${sceneVignette})`}}>
			{/* Static base */}
			<Background />

			{/* Parallax layers — each gets its own depth */}
			<CameraDrift depth={0.25} driftX={50} driftY={20} zoomFrom={1.05} zoomTo={1.0}>
				<WorldMap />
			</CameraDrift>

			<CameraDrift depth={0.55} driftX={30} driftY={14} zoomFrom={1.02} zoomTo={1.0}>
				<PacketStream />
			</CameraDrift>

			<CameraDrift depth={0.7} driftX={26} driftY={12} zoomFrom={1.03} zoomTo={1.0}>
				<FactoryPanels />
			</CameraDrift>

			<CameraDrift depth={0.85} driftX={20} driftY={10} zoomFrom={1.02} zoomTo={1.0}>
				<EmailPanels />
			</CameraDrift>

			<CameraDrift depth={0.5} driftX={14} driftY={6}>
				<Timeline />
			</CameraDrift>

			<CameraDrift depth={0.35} driftX={18} driftY={8}>
				<CustomerScene />
			</CameraDrift>

			{/* Top-most non-parallaxed UI */}
			<UIChrome />

			{/* Closing dim + line */}
			<ClosingLine />
		</AbsoluteFill>
	);
};
