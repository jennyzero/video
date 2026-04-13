import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';

// ── Canvas size ───────────────────────────────────────────────────────────────
const W = 1920;
const H = 1080;

// ── Color palette ─────────────────────────────────────────────────────────────
const DAY_COLORS: Record<number, string> = {
	1: '#FF6B35',
	2: '#4ECDC4',
	3: '#A78BFA',
};

// ── Itinerary definition ──────────────────────────────────────────────────────
// 📝 Customize: replace spot names, days, and coordinates [longitude, latitude]
interface Spot {
	name: string;
	day: number;
	coord: [number, number];
}

const SPOTS: Spot[] = [
	{name: '故宫', day: 1, coord: [116.397, 39.916]},
	{name: '长城', day: 1, coord: [116.57, 40.432]},
	{name: '西湖', day: 2, coord: [120.155, 30.274]},
	{name: '乌镇', day: 2, coord: [120.496, 30.748]},
	{name: '外滩', day: 3, coord: [121.49, 31.234]},
];

const TITLE = '✈ 华东旅行路线';

// ── Timing (frames at 30 fps) ─────────────────────────────────────────────────
const FPS = 30;
const INTRO_F = 40; // map + title fade-in
const STAY_F = 50; // frames parked at each spot
const TRAVEL_F = 90; // frames flying between spots

// Arrive frame for each spot
const ARRIVE: number[] = SPOTS.map((_, i) =>
	i === 0 ? INTRO_F : INTRO_F + i * (STAY_F + TRAVEL_F)
);
export const TRAVEL_DURATION_FRAMES =
	ARRIVE[SPOTS.length - 1] + STAY_F + FPS * 2; // ~600 frames = 20 s

// ── Map projection ────────────────────────────────────────────────────────────
const projection = geoMercator()
	.center([118, 35])
	.scale(2200)
	.translate([W / 2, H / 2]);

const pathGen = geoPath(projection);

function project(coord: [number, number]): [number, number] {
	return projection(coord) as [number, number];
}

// ── Bezier helpers ────────────────────────────────────────────────────────────
function controlPoint(
	from: [number, number],
	to: [number, number]
): [number, number] {
	const mx = (from[0] + to[0]) / 2;
	const my = (from[1] + to[1]) / 2;
	const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
	const lift = Math.min(dist * 0.35, 140);
	return [mx, my - lift];
}

function quadBezier(
	p0: [number, number],
	p1: [number, number],
	p2: [number, number],
	t: number
): [number, number] {
	const t1 = 1 - t;
	return [
		t1 * t1 * p0[0] + 2 * t1 * t * p1[0] + t * t * p2[0],
		t1 * t1 * p0[1] + 2 * t1 * t * p1[1] + t * t * p2[1],
	];
}

// Tangent direction angle (degrees) for airplane rotation
function bezierAngle(
	p0: [number, number],
	p1: [number, number],
	p2: [number, number],
	t: number
): number {
	const dt = 0.01;
	const tClamped = Math.min(t, 1 - dt);
	const pos = quadBezier(p0, p1, p2, tClamped);
	const pos2 = quadBezier(p0, p1, p2, tClamped + dt);
	const dx = pos2[0] - pos[0];
	const dy = pos2[1] - pos[1];
	// Airplane SVG points up (270° from +x axis). Add 90 to convert atan2 result.
	return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
}

// ── Airplane SVG ──────────────────────────────────────────────────────────────
const AirplaneSvg: React.FC<{x: number; y: number; angleDeg: number}> = ({
	x,
	y,
	angleDeg,
}) => (
	<g transform={`translate(${x},${y}) rotate(${angleDeg})`}>
		{/* Body */}
		<ellipse rx={6} ry={22} fill="white" opacity={0.95} />
		{/* Wings */}
		<polygon points="0,-6 22,10 0,4 -22,10" fill="white" opacity={0.95} />
		{/* Tail */}
		<polygon points="0,14 10,24 0,20 -10,24" fill="white" opacity={0.9} />
		{/* Center accent */}
		<ellipse rx={3} ry={10} fill="#FF6B35" opacity={0.85} />
		{/* Glow */}
		<ellipse
			rx={14}
			ry={30}
			fill="none"
			stroke="rgba(255,255,255,0.25)"
			strokeWidth={6}
		/>
	</g>
);

// ── Location pin ──────────────────────────────────────────────────────────────
const Pin: React.FC<{
	x: number;
	y: number;
	name: string;
	color: string;
	opacity: number;
	scale: number;
}> = ({x, y, name, color, opacity, scale}) => {
	const charW = 20;
	const bubbleW = name.length * charW + 24;
	const bubbleH = 36;
	return (
		<g opacity={opacity} transform={`translate(${x},${y}) scale(${scale})`}>
			{/* Pulsing halo */}
			<circle r={20} fill={color} opacity={0.15} />
			{/* Dot */}
			<circle
				r={10}
				fill={color}
				stroke="white"
				strokeWidth={3}
				style={{filter: `drop-shadow(0 2px 8px ${color}88)`}}
			/>
			<circle r={4} fill="white" />
			{/* Name bubble */}
			<g transform="translate(16,-20)">
				<rect
					width={bubbleW}
					height={bubbleH}
					rx={10}
					fill="white"
					opacity={0.96}
					style={{filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.18))'}}
				/>
				<text
					x={12}
					y={24}
					fill="#1A202C"
					fontSize={20}
					fontWeight="700"
					fontFamily="'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif"
				>
					{name}
				</text>
				{/* Color accent bar */}
				<rect width={4} height={bubbleH} rx={2} fill={color} />
			</g>
		</g>
	);
};

// ── Route arc component ───────────────────────────────────────────────────────
const RouteArc: React.FC<{
	from: [number, number];
	to: [number, number];
	color: string;
	progress: number; // 0-1
}> = ({from, to, color, progress}) => {
	const cp = controlPoint(from, to);
	const d = `M${from[0]},${from[1]} Q${cp[0]},${cp[1]} ${to[0]},${to[1]}`;
	return (
		<g>
			{/* Ghost line */}
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth={2}
				strokeDasharray="6 5"
				opacity={0.2}
			/>
			{/* Animated draw */}
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth={3.5}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - progress}
				style={{filter: `drop-shadow(0 0 5px ${color}99)`}}
			/>
		</g>
	);
};

// ── Day badge row ─────────────────────────────────────────────────────────────
const DayBadges: React.FC<{currentDay: number}> = ({currentDay}) => {
	const days = Array.from(new Set(SPOTS.map((s) => s.day))).sort();
	return (
		<div
			style={{
				display: 'flex',
				gap: 14,
				marginBottom: 14,
			}}
		>
			{days.map((day) => {
				const active = day === currentDay;
				const color = DAY_COLORS[day] ?? '#888';
				return (
					<div
						key={day}
						style={{
							background: active ? color : 'rgba(255,255,255,0.35)',
							color: active ? 'white' : 'rgba(0,0,0,0.4)',
							borderRadius: 24,
							padding: '8px 28px',
							fontSize: 24,
							fontWeight: 800,
							letterSpacing: '0.04em',
							boxShadow: active ? `0 4px 16px ${color}55` : 'none',
							border: `2px solid ${active ? color : 'rgba(255,255,255,0.5)'}`,
							transition: 'all 0.2s',
							fontFamily:
								"'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif",
						}}
					>
						Day {day}
					</div>
				);
			})}
		</div>
	);
};

// ── Main composition ──────────────────────────────────────────────────────────
export const TravelRouteAnimation: React.FC = () => {
	const frame = useCurrentFrame();
	const ease = Easing.bezier(0.4, 0, 0.2, 1);

	// Pre-compute all screen coordinates
	const screenSpots = useMemo(() => SPOTS.map((s) => project(s.coord)), []);

	// Country paths
	const countryPaths = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const geo = feature(worldData as any, (worldData as any).objects.countries) as any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return geo.features.map((f: any, i: number) => ({
			id: String(f.id ?? i),
			d: pathGen(f) ?? '',
		}));
	}, []);

	// ── Route arc progress ────────────────────────────────────────────────────
	const arcProgress = SPOTS.slice(0, -1).map((_, i) => {
		const departF = ARRIVE[i] + STAY_F;
		const arriveF = ARRIVE[i + 1];
		return interpolate(frame, [departF, arriveF], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: ease,
		});
	});

	// ── Airplane position & angle ─────────────────────────────────────────────
	let planeX = screenSpots[0][0];
	let planeY = screenSpots[0][1];
	let planeAngle = 0;
	let planeVisible = frame >= INTRO_F - 10;

	for (let i = 0; i < SPOTS.length; i++) {
		const arriveF = ARRIVE[i];
		const departF = arriveF + STAY_F;

		if (frame < arriveF && i > 0) {
			// Traveling toward spot i
			const prevDepart = ARRIVE[i - 1] + STAY_F;
			const t = interpolate(frame, [prevDepart, arriveF], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: ease,
			});
			const from = screenSpots[i - 1];
			const to = screenSpots[i];
			const cp = controlPoint(from, to);
			[planeX, planeY] = quadBezier(from, cp, to, t);
			planeAngle = bezierAngle(from, cp, to, t);
			break;
		} else if (frame <= departF || i === SPOTS.length - 1) {
			// Parked at spot i
			[planeX, planeY] = screenSpots[i];
			planeAngle = 0;
			break;
		}
	}

	// ── Spot pin visibility ───────────────────────────────────────────────────
	const pinVisibility = SPOTS.map((_, i) => {
		const arriveF = ARRIVE[i];
		return {
			opacity: interpolate(frame, [arriveF, arriveF + 20], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
			scale: interpolate(frame, [arriveF, arriveF + 16], [0.4, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: Easing.out(Easing.back(1.5)),
			}),
		};
	});

	// ── Current day (for badge highlight) ────────────────────────────────────
	let currentDay = SPOTS[0].day;
	for (let i = SPOTS.length - 1; i >= 0; i--) {
		if (frame >= ARRIVE[i]) {
			currentDay = SPOTS[i].day;
			break;
		}
	}

	// ── Global fade-in ────────────────────────────────────────────────────────
	const mapOpacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateRight: 'clamp',
	});
	const titleOpacity = interpolate(frame, [10, 40], [0, 1], {
		extrapolateRight: 'clamp',
	});

	// ── Progress bar ─────────────────────────────────────────────────────────
	const progressPct = Math.min(frame / TRAVEL_DURATION_FRAMES, 1);

	// ── Spot count label ─────────────────────────────────────────────────────
	const visitedCount = SPOTS.filter((_, i) => frame >= ARRIVE[i]).length;

	return (
		<AbsoluteFill
			style={{
				background: '#D4EEFF',
				fontFamily:
					"'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif",
			}}
		>
			{/* ── Map SVG ──────────────────────────────────────────────────────── */}
			<svg
				width={W}
				height={H}
				viewBox={`0 0 ${W} ${H}`}
				style={{position: 'absolute', inset: 0, opacity: mapOpacity}}
			>
				{/* Ocean */}
				<rect width={W} height={H} fill="#B8DFF5" />

				{/* Subtle latitude grid */}
				{[20, 30, 40, 50].map((lat) => {
					const p1 = projection([80, lat]);
					const p2 = projection([160, lat]);
					if (!p1 || !p2) return null;
					return (
						<line
							key={lat}
							x1={p1[0]}
							y1={p1[1]}
							x2={p2[0]}
							y2={p2[1]}
							stroke="rgba(255,255,255,0.3)"
							strokeWidth={0.6}
							strokeDasharray="4 6"
						/>
					);
				})}

				{/* Countries */}
				{countryPaths.map(({id, d}) => (
					<path
						key={id}
						d={d}
						fill="#E8F5D0"
						stroke="#C6DFA8"
						strokeWidth={0.8}
					/>
				))}

				{/* Route arcs */}
				{SPOTS.slice(0, -1).map((spot, i) => (
					<RouteArc
						key={i}
						from={screenSpots[i]}
						to={screenSpots[i + 1]}
						color={DAY_COLORS[spot.day] ?? '#888'}
						progress={arcProgress[i]}
					/>
				))}

				{/* Location pins */}
				{SPOTS.map((spot, i) => (
					<Pin
						key={i}
						x={screenSpots[i][0]}
						y={screenSpots[i][1]}
						name={spot.name}
						color={DAY_COLORS[spot.day] ?? '#888'}
						opacity={pinVisibility[i].opacity}
						scale={pinVisibility[i].scale}
					/>
				))}

				{/* Airplane */}
				{planeVisible && (
					<AirplaneSvg x={planeX} y={planeY} angleDeg={planeAngle} />
				)}
			</svg>

			{/* ── Title ─────────────────────────────────────────────────────────── */}
			<div
				style={{
					position: 'absolute',
					top: 40,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					opacity: titleOpacity,
				}}
			>
				<div
					style={{
						background: 'rgba(255,255,255,0.88)',
						backdropFilter: 'blur(8px)',
						borderRadius: 20,
						padding: '14px 48px',
						boxShadow: '0 6px 30px rgba(0,0,0,0.12)',
						display: 'flex',
						alignItems: 'center',
						gap: 16,
					}}
				>
					<span style={{fontSize: 44, fontWeight: 900, color: '#1A202C', letterSpacing: '0.04em'}}>
						{TITLE}
					</span>
					<span
						style={{
							background: '#FF6B35',
							color: 'white',
							borderRadius: 12,
							padding: '4px 18px',
							fontSize: 22,
							fontWeight: 700,
						}}
					>
						{visitedCount}/{SPOTS.length} 景点
					</span>
				</div>
			</div>

			{/* ── Bottom HUD ────────────────────────────────────────────────────── */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					width: '100%',
					padding: '0 64px 36px',
					boxSizing: 'border-box',
					background:
						'linear-gradient(transparent, rgba(212,238,255,0.95) 40%)',
					opacity: titleOpacity,
				}}
			>
				{/* Day badges */}
				<DayBadges currentDay={currentDay} />

				{/* Progress bar */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 18,
					}}
				>
					<span
						style={{
							fontSize: 20,
							fontWeight: 700,
							color: '#4A5568',
							whiteSpace: 'nowrap',
						}}
					>
						行程进度
					</span>
					<div
						style={{
							flex: 1,
							height: 10,
							background: 'rgba(0,0,0,0.1)',
							borderRadius: 6,
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								width: `${progressPct * 100}%`,
								height: '100%',
								background:
									'linear-gradient(90deg, #FF6B35 0%, #4ECDC4 50%, #A78BFA 100%)',
								borderRadius: 6,
								boxShadow: '0 0 8px rgba(255,107,53,0.5)',
							}}
						/>
					</div>
					<span
						style={{
							fontSize: 20,
							fontWeight: 700,
							color: '#4A5568',
							whiteSpace: 'nowrap',
						}}
					>
						{Math.round(progressPct * 100)}%
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};
