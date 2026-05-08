import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing, random} from 'remotion';
import {COLORS, FONT_STACK} from '../theme';
import {BEATS, beatFrames} from '../timing';

/**
 * Customer silhouette in front of a monitor.
 * SVG silhouette + flickering "partial info" panel screen.
 */
export const CustomerScene: React.FC = () => {
	const frame = useCurrentFrame();
	const beat = beatFrames(BEATS.silhouette);
	const flickBeat = beatFrames(BEATS.monitorFlicker);

	const inT = interpolate(frame, [beat.start, beat.start + 22], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 0.61, 0.36, 1),
	});
	const outT = interpolate(frame, [beat.end - 8, beat.end + 8], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const op = inT * outT;

	// Monitor flicker — every few frames, the screen dims briefly
	const flickerSeed = Math.floor(frame / 4);
	const flicker =
		frame >= flickBeat.start && frame <= flickBeat.end
			? random(`flick-${flickerSeed}`) > 0.86
				? 0.45
				: 1
			: 1;

	const subtleSway = Math.sin(frame / 30) * 2;

	return (
		<AbsoluteFill style={{opacity: op, pointerEvents: 'none', fontFamily: FONT_STACK}}>
			{/* Backlit floor glow */}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					bottom: 60,
					width: 900,
					height: 220,
					transform: 'translateX(-50%)',
					background:
						'radial-gradient(ellipse at center, rgba(59,130,246,0.16), rgba(59,130,246,0) 70%)',
					filter: 'blur(8px)',
				}}
			/>

			<svg
				width={1920}
				height={1080}
				viewBox="0 0 1920 1080"
				style={{position: 'absolute', inset: 0}}
			>
				<defs>
					<linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#0E1A38" />
						<stop offset="100%" stopColor="#070D1F" />
					</linearGradient>
					<linearGradient id="silhouetteGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#06101F" stopOpacity={0.95} />
						<stop offset="100%" stopColor="#020610" stopOpacity={1} />
					</linearGradient>
					<filter id="screenGlow" x="-30%" y="-30%" width="160%" height="160%">
						<feGaussianBlur stdDeviation="14" />
					</filter>
				</defs>

				{/* Monitor outer glow */}
				<rect
					x={650}
					y={300}
					width={620}
					height={360}
					rx={10}
					fill={COLORS.accent}
					opacity={0.18 * flicker}
					filter="url(#screenGlow)"
				/>

				{/* Monitor frame */}
				<rect
					x={660}
					y={310}
					width={600}
					height={340}
					rx={8}
					fill="url(#screenGrad)"
					stroke={COLORS.panelStroke}
					strokeWidth={1.5}
				/>

				{/* Monitor stand */}
				<rect x={950} y={650} width={20} height={42} fill="#0A1024" />
				<rect x={870} y={690} width={180} height={6} rx={2} fill="#0A1024" />

				{/* Screen content — partial / corrupted UI */}
				<g
					clipPath="inset(0 round 8px)"
					transform="translate(660 310)"
					opacity={flicker}
				>
					<rect width="600" height="340" fill="url(#screenGrad)" />
					{/* faint scan lines */}
					{Array.from({length: 30}).map((_, i) => (
						<rect
							key={i}
							x={0}
							y={i * 12}
							width={600}
							height={1}
							fill="#0E1A38"
							opacity={0.3}
						/>
					))}

					{/* App header */}
					<rect x={20} y={20} width={120} height={10} fill={COLORS.cyan} opacity={0.7} />
					<rect x={20} y={36} width={260} height={6} fill={COLORS.textDim} opacity={0.6} />

					{/* Status pills */}
					<g transform="translate(20 70)">
						<rect width={100} height={22} rx={3} fill={COLORS.accent} opacity={0.18} />
						<rect x={108} width={100} height={22} rx={3} fill={COLORS.warn} opacity={0.18} />
						<rect x={216} width={100} height={22} rx={3} fill="#444" opacity={0.18} />
					</g>

					{/* Skeleton "loading" rows */}
					{[120, 150, 180, 210, 240, 270].map((y, i) => {
						const widths = [320, 460, 280, 380, 240, 360];
						const dim = i % 3 === 1 ? 0.2 : 0.55;
						return (
							<rect
								key={y}
								x={20}
								y={y}
								width={widths[i]}
								height={6}
								fill={COLORS.textDim}
								opacity={dim}
							/>
						);
					})}

					{/* Missing-data block */}
					<g transform="translate(360 110)">
						<rect width={220} height={170} fill="#0A1230" stroke={COLORS.panelStroke} />
						<text
							x={110}
							y={92}
							textAnchor="middle"
							fontFamily={FONT_STACK}
							fontSize={11}
							letterSpacing="0.32em"
							fill={COLORS.textDim}
						>
							NO DATA
						</text>
						<text
							x={110}
							y={112}
							textAnchor="middle"
							fontFamily={FONT_STACK}
							fontSize={10}
							letterSpacing="0.2em"
							fill={COLORS.textDim}
							opacity={0.6}
						>
							awaiting partner upload
						</text>
					</g>

					{/* glitch line */}
					{random(`g-${Math.floor(frame / 6)}`) > 0.7 && (
						<rect
							x={0}
							y={(frame * 7) % 340}
							width={600}
							height={2}
							fill={COLORS.cyan}
							opacity={0.55}
						/>
					)}
				</g>

				{/* Customer silhouette */}
				<g
					transform={`translate(${960 + subtleSway} 720)`}
					fill="url(#silhouetteGrad)"
				>
					{/* head */}
					<ellipse cx="0" cy="0" rx="38" ry="44" />
					{/* shoulders / torso */}
					<path
						d="M -130,180 C -130,80 -75,40 0,40 C 75,40 130,80 130,180 L 130,320 L -130,320 Z"
					/>
				</g>

				{/* Rim light edge on silhouette */}
				<g
					transform={`translate(${960 + subtleSway} 720)`}
					fill="none"
					stroke={COLORS.accent}
					strokeWidth={1}
					opacity={0.35 * flicker}
				>
					<ellipse cx="0" cy="0" rx="38" ry="44" />
					<path d="M -130,180 C -130,80 -75,40 0,40 C 75,40 130,80 130,180" />
				</g>
			</svg>

			{/* Floating mini panels around the customer */}
			{[
				{x: 280, y: 360, w: 240, label: 'INBOX · 3 PENDING'},
				{x: 1430, y: 410, w: 230, label: 'TRIAL #04 · UNRESOLVED'},
				{x: 1480, y: 720, w: 220, label: 'LAST UPDATE · 38h AGO'},
				{x: 220, y: 720, w: 220, label: 'WAITING ON PARTNER'},
			].map((p, i) => {
				const start = beat.start + 8 + i * 4;
				const o = interpolate(frame, [start, start + 14], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const f = Math.sin((frame + i * 30) / 28) * 4;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: p.x,
							top: p.y + f,
							width: p.w,
							padding: '10px 14px',
							background: COLORS.panel,
							border: `1px solid ${COLORS.panelStroke}`,
							borderRadius: 6,
							color: COLORS.textMuted,
							fontSize: 11,
							letterSpacing: '0.22em',
							opacity: o * 0.9,
							backdropFilter: 'blur(6px)',
						}}
					>
						{p.label}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
