import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {COLORS, FONT_STACK} from '../theme';
import {BEATS, beatFrames} from '../timing';
import {IconMail, IconAttachment, IconClock} from '../icons/SvgIcons';

type Email = {
	id: string;
	x: number;
	y: number;
	w: number;
	delay: number;
	from: string;
	subject: string;
	preview: string;
	timestamp: string;
	status: 'queued' | 'sending' | 'delayed';
};

const EMAILS: Email[] = [
	{
		id: 'e1',
		x: 700,
		y: 220,
		w: 520,
		delay: 0.4,
		from: 'trial.partner@kr-mold-factory',
		subject: 'RE: Trial #04 — Sample photos (delayed)',
		preview: 'Apologies for the wait. Attaching photos from yesterday\'s shot…',
		timestamp: 'queued · 04:12',
		status: 'delayed',
	},
	{
		id: 'e2',
		x: 760,
		y: 470,
		w: 520,
		delay: 0.7,
		from: 'qa.lead@kr-mold-factory',
		subject: 'Tooling adjustment report — pending translation',
		preview: 'Will forward by tomorrow. Korean source attached for reference.',
		timestamp: 'sending · 18h',
		status: 'sending',
	},
	{
		id: 'e3',
		x: 660,
		y: 720,
		w: 520,
		delay: 1.0,
		from: 'logistics@kr-mold-factory',
		subject: 'Sample shipment — awaiting carrier confirmation',
		preview: 'Tracking number not yet issued. Will update once available.',
		timestamp: 'queued · pending',
		status: 'queued',
	},
];

const statusColor = (s: Email['status']) =>
	s === 'delayed' ? COLORS.warn : s === 'sending' ? COLORS.cyan : COLORS.textDim;

export const EmailPanels: React.FC = () => {
	const frame = useCurrentFrame();
	const beat = beatFrames(BEATS.emailPanels);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{EMAILS.map((e) => {
				const start = beat.start + Math.round(e.delay * 30);
				const inT = interpolate(frame, [start, start + 18], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.bezier(0.22, 0.61, 0.36, 1),
				});
				const outT = interpolate(frame, [180 - 6, 200], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const tx = interpolate(inT, [0, 1], [40, 0]);
				const op = inT * outT;
				const float = Math.sin((frame + e.y) / 26) * 3;
				return (
					<div
						key={e.id}
						style={{
							position: 'absolute',
							left: e.x,
							top: e.y,
							width: e.w,
							opacity: op,
							transform: `translate(${tx}px, ${float}px)`,
							background: COLORS.panel,
							border: `1px solid ${COLORS.panelStroke}`,
							borderRadius: 8,
							padding: '14px 18px',
							color: COLORS.textPrimary,
							fontFamily: FONT_STACK,
							boxShadow: '0 18px 44px rgba(0,0,0,0.5)',
							backdropFilter: 'blur(8px)',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								color: COLORS.textMuted,
								fontSize: 11,
								letterSpacing: '0.18em',
							}}
						>
							<IconMail size={14} />
							<span>{e.from.toUpperCase()}</span>
							<span
								style={{
									marginLeft: 'auto',
									color: statusColor(e.status),
									display: 'inline-flex',
									alignItems: 'center',
									gap: 6,
								}}
							>
								<IconClock size={12} color={statusColor(e.status)} />
								{e.timestamp.toUpperCase()}
							</span>
						</div>
						<div
							style={{
								marginTop: 8,
								fontSize: 17,
								fontWeight: 500,
								color: COLORS.textPrimary,
								letterSpacing: '0.01em',
							}}
						>
							{e.subject}
						</div>
						<div
							style={{
								marginTop: 6,
								fontSize: 13,
								color: COLORS.textMuted,
								lineHeight: 1.5,
							}}
						>
							{e.preview}
						</div>
						<div
							style={{
								marginTop: 12,
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								color: COLORS.textDim,
								fontSize: 11,
								letterSpacing: '0.12em',
							}}
						>
							<IconAttachment />
							<span>3 ATTACHMENTS · 12.4 MB</span>
							{/* mini progress */}
							<div
								style={{
									marginLeft: 'auto',
									width: 90,
									height: 2,
									background: 'rgba(255,255,255,0.06)',
								}}
							>
								<div
									style={{
										width: `${(((frame + e.y) % 90) / 90) * 100}%`,
										height: '100%',
										background: statusColor(e.status),
										opacity: 0.7,
									}}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
