/**
 * Modular timing system for the BlackBox scene.
 * All beats are defined here in seconds; helpers convert to frames.
 * Edit numbers here and every component re-times automatically.
 */

export const FPS = 30;
export const SCENE_SECONDS = 9;
export const SCENE_FRAMES = FPS * SCENE_SECONDS;

export const s = (sec: number) => Math.round(sec * FPS);

export const BEATS = {
	// Act 1 — map intro
	mapFadeIn: {start: 0, end: 1.4},
	routeDraw: {start: 0.6, end: 2.0},
	gridFadeIn: {start: 0.2, end: 1.6},

	// Act 2 — packets / panels
	factoryPanels: {start: 2.0, end: 4.0},
	emailPanels: {start: 2.4, end: 4.0},
	loadingDots: {start: 2.6, end: 4.0},

	// Act 3 — timeline + stall
	timeline: {start: 4.0, end: 6.0},
	progressStall: {start: 4.4, end: 6.0},
	questionMarks: {start: 5.0, end: 6.0},

	// Act 4 — customer silhouette
	silhouette: {start: 6.0, end: 8.0},
	monitorFlicker: {start: 6.2, end: 8.0},

	// Act 5 — closing line
	dimOut: {start: 7.8, end: 8.4},
	closingLine: {start: 8.0, end: 9.0},
} as const;

export type Beat = {start: number; end: number};

export const beatFrames = (b: Beat) => ({
	start: s(b.start),
	end: s(b.end),
});
