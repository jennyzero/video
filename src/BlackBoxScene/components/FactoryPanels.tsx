import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {COLORS, FONT_STACK} from '../theme';
import {BEATS, beatFrames} from '../timing';
import {IconImageStack} from '../icons/SvgIcons';

/**
 * Floating, blurry "factory photo" placeholder panels.
 * The image area is intentionally a blurred SVG composition (no raster)
 * so the look stays editable. Drop in real <image> tags later if needed.
 */

type Panel = {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	delay: number; // seconds offset within the act
	label: string;
	tone: 'a' | 'b' | 'c';
};

const PANELS: Panel[] = [
	{id: 'p1', x: 220, y: 230, w: 360, h: 230, delay: 0.0, label: 'TRIAL FLOOR · 04', tone: 'a'},
	{id: 'p2', x: 1340, y: 280, w: 360, h: 230, delay: 0.25, label: 'TOOL MOUNT · A2', tone: 'b'},
	{id: 'p3', x: 1480, y: 640, w: 300, h: 200, delay: 0.55, label: 'EJECTOR ARRAY', tone: 'c'},
];

const blurredArt = (tone: Panel['tone'], w: number, h: number) => {
	const g1 = tone === 'a' ? '#1B2C55' : tone === 'b' ? '#1A2A4E' : '#152244';
	const g2 = tone === 'a' ? '#0A1230' : tone === 'b' ? '#0C1638' : '#0A1130';
	return (
		<svg
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			style={{display: 'block'}}
		>
			<defs>
				<filter id={`blur-${tone}`} x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="14" />
				</filter>
				<linearGradient id={`grad-${tone}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={g1} />
					<stop offset="100%" stopColor={g2} />
				</linearGradient>
			</defs>
			<rect width={w} height={h} fill={`url(#grad-${tone})`} />
			<g filter={`url(#blur-${tone})`} opacity="0.85">
				<circle cx={w * 0.3} cy={h * 0.55} r={70} fill="#2B4A8A" />
				<rect
					x={w * 0.5}
					y={h * 0.2}
					width={w * 0.35}
					height={h * 0.55}
					fill="#1F3974"
				/>
				<circle cx={w * 0.78} cy={h * 0.78} r={50} fill="#0F1E44" />
				<rect x={0} y={h * 0.72} width={w} height={4} fill="#06B6D4" opacity="0.5" />
			</g>
		</svg>
	);
};

export const FactoryPanels: React.FC = () => {
	const frame = useCurrentFrame();
	const beat = beatFrames(BEATS.factoryPanels);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{PANELS.map((p) => {
				const start = beat.start + Math.round(p.delay * 30);
				const inT = interpolate(frame, [start, start + 22], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.bezier(0.22, 0.61, 0.36, 1),
				});
				const outT = interpolate(frame, [180 - 6, 200], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const op = inT * outT;
				// subtle floating
				const float = Math.sin((frame + p.x) / 22) * 4;
				const tx = interpolate(inT, [0, 1], [-18, 0]);
				return (
					<div
						key={p.id}
						style={{
							position: 'absolute',
							left: p.x,
							top: p.y,
							width: p.w,
							height: p.h,
							opacity: op,
							transform: `translate(${tx}px, ${float}px)`,
							borderRadius: 8,
							overflow: 'hidden',
							background: COLORS.panel,
							border: `1px solid ${COLORS.panelStroke}`,
							boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
							backdropFilter: 'blur(8px)',
							fontFamily: FONT_STACK,
						}}
					>
						{/* photo placeholder */}
						<div
							style={{
								width: '100%',
								height: p.h - 44,
								filter: 'blur(6px) saturate(0.85)',
								opacity: 0.85,
							}}
						>
							{blurredArt(p.tone, p.w, p.h - 44)}
						</div>
						{/* footer label */}
						<div
							style={{
								position: 'absolute',
								left: 12,
								right: 12,
								bottom: 10,
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								color: COLORS.textMuted,
								fontSize: 11,
								letterSpacing: '0.22em',
							}}
						>
							<IconImageStack />
							<span>{p.label}</span>
							<span style={{marginLeft: 'auto', color: COLORS.textDim}}>
								JPG · 2.4MB
							</span>
						</div>
						{/* scan border */}
						<div
							style={{
								position: 'absolute',
								inset: 0,
								borderRadius: 8,
								boxShadow: `inset 0 0 0 1px ${COLORS.panelStroke}`,
								pointerEvents: 'none',
							}}
						/>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
