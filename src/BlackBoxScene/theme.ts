/**
 * Centralized design tokens — Siemens / ABB / Apple keynote feel.
 */
export const COLORS = {
	bg: '#0B1020',
	bgDeep: '#070B18',
	grid: '#16203A',
	gridStrong: '#1F2D4D',
	land: '#0F1A33',
	landStroke: '#1B2B50',
	accent: '#3B82F6',
	cyan: '#06B6D4',
	textPrimary: '#E6EEFB',
	textMuted: '#8AA0C7',
	textDim: '#5A6E94',
	panel: 'rgba(20, 30, 56, 0.55)',
	panelStroke: 'rgba(120, 160, 220, 0.18)',
	warn: '#F59E0B',
};

export const FONT_STACK =
	"'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

export const EASE = [0.22, 0.61, 0.36, 1] as const; // cinematic
export const EASE_SOFT = [0.4, 0, 0.2, 1] as const;
