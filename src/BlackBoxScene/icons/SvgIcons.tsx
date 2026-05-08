import React from 'react';
import {COLORS} from '../theme';

/** All scene icons live here as inline SVG so designers can edit per layer. */

export const IconMail: React.FC<{size?: number; color?: string}> = ({
	size = 16,
	color = COLORS.accent,
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect
			x="3"
			y="6"
			width="18"
			height="12"
			rx="1.5"
			stroke={color}
			strokeWidth="1.4"
		/>
		<path d="M3 7l9 7 9-7" stroke={color} strokeWidth="1.4" />
	</svg>
);

export const IconAttachment: React.FC<{size?: number; color?: string}> = ({
	size = 14,
	color = COLORS.textMuted,
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M21 11l-8.5 8.5a5 5 0 11-7-7L13.5 4.5a3.5 3.5 0 015 5L9 19a2 2 0 01-3-3l8-8"
			stroke={color}
			strokeWidth="1.4"
			strokeLinecap="round"
		/>
	</svg>
);

export const IconQuestion: React.FC<{size?: number; color?: string}> = ({
	size = 28,
	color = COLORS.warn,
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.2" opacity="0.7" />
		<path
			d="M9.2 9a2.8 2.8 0 015.6 0c0 1.6-2.2 2-2.8 3.2-.2.4-.2.8-.2 1.3"
			stroke={color}
			strokeWidth="1.4"
			strokeLinecap="round"
			fill="none"
		/>
		<circle cx="12" cy="17" r="0.9" fill={color} />
	</svg>
);

export const IconClock: React.FC<{size?: number; color?: string}> = ({
	size = 16,
	color = COLORS.textMuted,
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.4" />
		<path d="M12 7v5l3 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
	</svg>
);

export const IconImageStack: React.FC<{size?: number; color?: string}> = ({
	size = 16,
	color = COLORS.textMuted,
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect
			x="4"
			y="4"
			width="14"
			height="14"
			rx="1.5"
			stroke={color}
			strokeWidth="1.3"
		/>
		<path d="M7 14l3-3 3 3 2-2 2 2" stroke={color} strokeWidth="1.3" fill="none" />
		<circle cx="9" cy="9" r="1.2" fill={color} />
	</svg>
);
