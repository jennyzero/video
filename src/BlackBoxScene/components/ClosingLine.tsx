import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {COLORS, FONT_STACK} from '../theme';
import {BEATS, beatFrames} from '../timing';

const TEXT = 'Mold trials shouldn’t be a black box.';

export const ClosingLine: React.FC = () => {
	const frame = useCurrentFrame();
	const dim = beatFrames(BEATS.dimOut);
	const beat = beatFrames(BEATS.closingLine);

	const dimOp = interpolate(frame, [dim.start, dim.end], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.4, 0, 0.2, 1),
	});

	const lineIn = interpolate(frame, [beat.start, beat.start + 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 0.61, 0.36, 1),
	});

	const underlineProg = interpolate(
		frame,
		[beat.start + 14, beat.end - 2],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.4, 0, 0.2, 1),
		}
	);

	const yShift = interpolate(lineIn, [0, 1], [10, 0]);

	return (
		<>
			{/* Dim plate */}
			<AbsoluteFill
				style={{
					background: '#000',
					opacity: dimOp * 0.72,
					pointerEvents: 'none',
				}}
			/>

			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: FONT_STACK,
					pointerEvents: 'none',
				}}
			>
				<div
					style={{
						opacity: lineIn,
						transform: `translateY(${yShift}px)`,
						textAlign: 'center',
					}}
				>
					<div
						style={{
							color: COLORS.textMuted,
							fontSize: 13,
							letterSpacing: '0.5em',
							marginBottom: 28,
						}}
					>
						MOLDFLOW · GLOBAL TRIAL VISIBILITY
					</div>
					<div
						style={{
							color: COLORS.textPrimary,
							fontSize: 56,
							fontWeight: 300,
							letterSpacing: '0.01em',
							lineHeight: 1.2,
						}}
					>
						{TEXT}
					</div>
					<div
						style={{
							marginTop: 22,
							height: 1,
							width: 420,
							marginInline: 'auto',
							background: 'rgba(255,255,255,0.12)',
							position: 'relative',
						}}
					>
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								height: '100%',
								width: `${underlineProg * 100}%`,
								background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.cyan})`,
								boxShadow: `0 0 10px ${COLORS.cyan}88`,
							}}
						/>
					</div>
				</div>
			</AbsoluteFill>
		</>
	);
};
