import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {COLORS} from '../theme';
import {BEATS, beatFrames} from '../timing';

const W = 1920;
const H = 1080;

/**
 * Dark navy background + thin technical grid + soft radial vignette.
 * Renders as SVG so every line stays editable / vector.
 */
export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	const {start, end} = beatFrames(BEATS.gridFadeIn);
	const gridOp = interpolate(frame, [start, end], [0, 0.55], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 0.61, 0.36, 1),
	});

	const cellMajor = 160;
	const cellMinor = 40;

	const minorLines = [];
	for (let x = 0; x <= W; x += cellMinor) {
		minorLines.push(
			<line
				key={`mx${x}`}
				x1={x}
				y1={0}
				x2={x}
				y2={H}
				stroke={COLORS.grid}
				strokeWidth={0.5}
			/>
		);
	}
	for (let y = 0; y <= H; y += cellMinor) {
		minorLines.push(
			<line
				key={`my${y}`}
				x1={0}
				y1={y}
				x2={W}
				y2={y}
				stroke={COLORS.grid}
				strokeWidth={0.5}
			/>
		);
	}

	const majorLines = [];
	for (let x = 0; x <= W; x += cellMajor) {
		majorLines.push(
			<line
				key={`Mx${x}`}
				x1={x}
				y1={0}
				x2={x}
				y2={H}
				stroke={COLORS.gridStrong}
				strokeWidth={0.8}
			/>
		);
	}
	for (let y = 0; y <= H; y += cellMajor) {
		majorLines.push(
			<line
				key={`My${y}`}
				x1={0}
				y1={y}
				x2={W}
				y2={y}
				stroke={COLORS.gridStrong}
				strokeWidth={0.8}
			/>
		);
	}

	return (
		<AbsoluteFill style={{background: COLORS.bg}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<radialGradient id="bgVignette" cx="50%" cy="50%" r="65%">
						<stop offset="0%" stopColor="#101A36" stopOpacity={1} />
						<stop offset="100%" stopColor={COLORS.bgDeep} stopOpacity={1} />
					</radialGradient>
					<linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#000" stopOpacity={0.55} />
						<stop offset="40%" stopColor="#000" stopOpacity={0} />
						<stop offset="60%" stopColor="#000" stopOpacity={0} />
						<stop offset="100%" stopColor="#000" stopOpacity={0.6} />
					</linearGradient>
				</defs>
				<rect width={W} height={H} fill="url(#bgVignette)" />
				<g opacity={gridOp}>{minorLines}</g>
				<g opacity={Math.min(1, gridOp + 0.1)}>{majorLines}</g>
				<rect width={W} height={H} fill="url(#topFade)" />
			</svg>
		</AbsoluteFill>
	);
};
