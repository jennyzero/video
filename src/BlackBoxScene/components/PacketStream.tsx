import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {COLORS} from '../theme';
import {BEATS, beatFrames} from '../timing';

/**
 * Tiny "packets" that travel between layers — communicates the
 * data-transfer aesthetic without any cyberpunk feel.
 */
export const PacketStream: React.FC = () => {
	const frame = useCurrentFrame();
	const beat = beatFrames(BEATS.loadingDots);

	const op = interpolate(frame, [beat.start, beat.start + 14, beat.end - 6, beat.end], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const lanes = [
		{y: 340, speed: 1.0, dir: 1},
		{y: 540, speed: 0.7, dir: 1},
		{y: 740, speed: 1.2, dir: -1},
	];

	return (
		<AbsoluteFill style={{opacity: op, pointerEvents: 'none'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				{lanes.map((lane, li) => {
					const dots = [];
					for (let i = 0; i < 6; i++) {
						const phase = ((frame * lane.speed + i * 60) % 360) / 360;
						const xRaw = lane.dir === 1 ? phase * 1920 : 1920 - phase * 1920;
						dots.push(
							<g key={i} opacity={1 - Math.abs(0.5 - phase) * 1.2}>
								<rect
									x={xRaw - 22}
									y={lane.y - 1}
									width={22}
									height={2}
									fill={li % 2 === 0 ? COLORS.cyan : COLORS.accent}
									opacity={0.55}
								/>
								<circle
									cx={xRaw}
									cy={lane.y}
									r={1.6}
									fill={li % 2 === 0 ? COLORS.cyan : COLORS.accent}
								/>
							</g>
						);
					}
					return <g key={lane.y}>{dots}</g>;
				})}
			</svg>
		</AbsoluteFill>
	);
};
