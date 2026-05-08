import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * Slow Apple-style camera drift wrapper.
 * Wraps any layer and applies subtle parallax + zoom.
 *
 * `depth` 0 = static, 1 = strong parallax. Use small values per-layer.
 */
export const CameraDrift: React.FC<{
	children: React.ReactNode;
	depth?: number;
	driftX?: number;
	driftY?: number;
	zoomFrom?: number;
	zoomTo?: number;
}> = ({
	children,
	depth = 0.4,
	driftX = 40,
	driftY = 18,
	zoomFrom = 1.04,
	zoomTo = 1.0,
}) => {
	const frame = useCurrentFrame();
	// Use a sine-based subtle drift so it never feels mechanical
	const t = frame / 270; // 0 → 1 across the 9s scene
	const x = Math.sin(t * Math.PI * 0.5) * driftX * depth;
	const y = Math.cos(t * Math.PI * 0.4) * driftY * depth;
	const scale = zoomFrom + (zoomTo - zoomFrom) * t;

	return (
		<AbsoluteFill
			style={{
				transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				transformOrigin: '50% 50%',
				willChange: 'transform',
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
