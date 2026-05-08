import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {COLORS, FONT_STACK} from '../theme';

/**
 * Operating-system style HUD chrome — corner labels, tracking ticks,
 * frame counter. Kept extremely subtle.
 */
export const UIChrome: React.FC = () => {
	const frame = useCurrentFrame();
	const op = interpolate(frame, [10, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const tc = `T+${(frame / 30).toFixed(2).padStart(5, '0')}s`;

	return (
		<AbsoluteFill
			style={{
				color: COLORS.textDim,
				fontFamily: FONT_STACK,
				fontSize: 12,
				letterSpacing: '0.22em',
				opacity: op,
				pointerEvents: 'none',
			}}
		>
			<div style={{position: 'absolute', top: 36, left: 56}}>
				MOLDFLOW · OS  /  GLOBAL TRIAL TRACE
			</div>
			<div
				style={{
					position: 'absolute',
					top: 36,
					right: 56,
					display: 'flex',
					gap: 24,
				}}
			>
				<span>SESSION 0427</span>
				<span style={{color: COLORS.accent}}>● LIVE</span>
				<span>{tc}</span>
			</div>
			<div style={{position: 'absolute', bottom: 36, left: 56}}>
				CH-01 / TRIAL-VISIBILITY
			</div>
			<div style={{position: 'absolute', bottom: 36, right: 56}}>
				FRAME {String(frame).padStart(4, '0')} / 0270
			</div>

			{/* Corner ticks */}
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 1920 1080"
				style={{position: 'absolute', inset: 0}}
			>
				{[
					[40, 80, 1, 1],
					[1880, 80, -1, 1],
					[40, 1000, 1, -1],
					[1880, 1000, -1, -1],
				].map(([x, y, dx, dy], i) => (
					<g key={i} stroke={COLORS.panelStroke} strokeWidth={1}>
						<line x1={x} y1={y} x2={x + 24 * dx} y2={y} />
						<line x1={x} y1={y} x2={x} y2={y + 18 * dy} />
					</g>
				))}
			</svg>
		</AbsoluteFill>
	);
};
