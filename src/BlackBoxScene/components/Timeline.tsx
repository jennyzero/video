import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {COLORS, FONT_STACK} from '../theme';
import {BEATS, beatFrames} from '../timing';
import {IconQuestion} from '../icons/SvgIcons';

const STOPS = [
	{label: 'DAY 01', sub: 'Trial scheduled', x: 0.18},
	{label: 'DAY 03', sub: 'Awaiting samples', x: 0.5},
	{label: 'DAY 07', sub: 'Status unknown', x: 0.82},
];

export const Timeline: React.FC = () => {
	const frame = useCurrentFrame();
	const beat = beatFrames(BEATS.timeline);
	const stallBeat = beatFrames(BEATS.progressStall);
	const qBeat = beatFrames(BEATS.questionMarks);

	const inT = interpolate(frame, [beat.start, beat.start + 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 0.61, 0.36, 1),
	});
	const outT = interpolate(frame, [beat.end - 6, beat.end + 6], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const op = inT * outT;

	// Progress bar advances quickly to ~62% then stalls (with micro-jitter)
	const prog = interpolate(
		frame,
		[stallBeat.start, stallBeat.start + 22, stallBeat.end],
		[0, 0.62, 0.64],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.4, 0, 0.2, 1),
		}
	);
	const jitter = Math.sin(frame / 3) * 0.0035 + Math.sin(frame / 7) * 0.002;
	const progress = Math.min(0.66, Math.max(0, prog + jitter));

	const W = 1100;
	const left = (1920 - W) / 2;
	const top = 470;

	return (
		<AbsoluteFill
			style={{opacity: op, pointerEvents: 'none', fontFamily: FONT_STACK}}
		>
			<div
				style={{
					position: 'absolute',
					left,
					top,
					width: W,
					transform: `translateY(${interpolate(inT, [0, 1], [12, 0])}px)`,
				}}
			>
				{/* Title row */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						color: COLORS.textMuted,
						fontSize: 12,
						letterSpacing: '0.32em',
					}}
				>
					<span>TRIAL TIMELINE · ORDER #MX-0427</span>
					<span style={{color: COLORS.warn}}>● STALLED</span>
				</div>

				{/* Track */}
				<div
					style={{
						position: 'relative',
						marginTop: 26,
						height: 4,
						background: 'rgba(255,255,255,0.06)',
						borderRadius: 2,
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							bottom: 0,
							width: `${progress * 100}%`,
							background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.cyan})`,
							borderRadius: 2,
							boxShadow: `0 0 12px ${COLORS.accent}55`,
						}}
					/>
					{/* leading edge ticker */}
					<div
						style={{
							position: 'absolute',
							left: `calc(${progress * 100}% - 1px)`,
							top: -4,
							width: 2,
							height: 12,
							background: COLORS.warn,
							opacity: 0.85,
						}}
					/>
					{/* Stops */}
					{STOPS.map((s) => (
						<div
							key={s.label}
							style={{
								position: 'absolute',
								left: `${s.x * 100}%`,
								top: -7,
								width: 14,
								height: 14,
								marginLeft: -7,
								borderRadius: '50%',
								background: COLORS.bgDeep,
								border: `1.5px solid ${
									s.x * 100 < progress * 100 ? COLORS.cyan : COLORS.textDim
								}`,
							}}
						/>
					))}
				</div>

				{/* Stop labels */}
				{STOPS.map((s, i) => {
					const stopOp = interpolate(
						frame,
						[beat.start + 6 + i * 6, beat.start + 22 + i * 6],
						[0, 1],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
					);
					const showQ = i === 2;
					return (
						<div
							key={s.label}
							style={{
								position: 'absolute',
								left: `${s.x * 100}%`,
								top: 32,
								transform: 'translateX(-50%)',
								textAlign: 'center',
								opacity: stopOp,
							}}
						>
							<div
								style={{
									color: COLORS.textPrimary,
									fontSize: 22,
									letterSpacing: '0.16em',
									fontWeight: 600,
								}}
							>
								{s.label}
							</div>
							<div
								style={{
									marginTop: 4,
									color: COLORS.textMuted,
									fontSize: 12,
									letterSpacing: '0.22em',
								}}
							>
								{s.sub.toUpperCase()}
							</div>
							{showQ && (
								<div
									style={{
										marginTop: 12,
										display: 'flex',
										justifyContent: 'center',
										gap: 8,
										opacity: interpolate(
											frame,
											[qBeat.start, qBeat.start + 14],
											[0, 1],
											{
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											}
										),
									}}
								>
									{[0, 1, 2].map((k) => {
										const pulse =
											0.5 +
											0.5 *
												Math.sin((frame + k * 14) / 18 * Math.PI);
										return (
											<span
												key={k}
												style={{opacity: 0.4 + 0.6 * pulse}}
											>
												<IconQuestion size={20} />
											</span>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
