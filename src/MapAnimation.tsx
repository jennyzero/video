import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';

const W = 1920;
const H = 1080;

// ─── 3-colour palette (light / high-tech) ────────────────────
const C_BG     = '#eef4f9'; // ocean + background
const C_LAND   = '#cfdee9'; // land masses
const C_ACCENT = '#0369a1'; // arrows, markers, labels, borders
// ─────────────────────────────────────────────────────────────

// ─── Projection: South Korea at exact screen centre ──────────
// Step 1 – temporary proj to measure Korea's raw screen offset
const _tmpProj = geoNaturalEarth1()
	.rotate([-127.7, 0])
	.scale(265)
	.translate([0, 0]);
const _kr = (_tmpProj([127.7, 35.9]) ?? [0, 0]) as [number, number];

// Step 2 – final proj that places Korea dead-centre
const projection = geoNaturalEarth1()
	.rotate([-127.7, 0])
	.scale(265)
	.translate([W / 2 - _kr[0], H / 2 - _kr[1]]);

const pathGen = geoPath(projection);
// ─────────────────────────────────────────────────────────────

type Coord = [number, number];

const SOURCE: Coord = [127.7, 35.9]; // South Korea

const ROUTES: {
	key: string;
	label: string;
	flag: string;
	coord: Coord;
	start: number;
	dur: number;
	labelOffset: [number, number]; // [dx, dy] relative to destination dot
}[] = [
	// Japan: just ~10° east of Korea → appears slightly right of centre
	{
		key: 'jp',
		label: 'Japan',
		flag: '🇯🇵',
		coord: [138, 36],
		start: 20,
		dur: 55,
		labelOffset: [12, -13],
	},
	// India: ~50° west of Korea → appears moderately left
	{
		key: 'in',
		label: 'India',
		flag: '🇮🇳',
		coord: [78, 22],
		start: 55,
		dur: 80,
		labelOffset: [-150, -13],
	},
	// USA: ~134° east via Pacific → far right on Korea-centred map
	{
		key: 'us',
		label: 'United States',
		flag: '🇺🇸',
		coord: [-98, 38],
		start: 90,
		dur: 100,
		labelOffset: [-200, -13],
	},
	// Mexico: ~131° east via Pacific → far right, just below USA
	{
		key: 'mx',
		label: 'Mexico',
		flag: '🇲🇽',
		coord: [-102, 24],
		start: 110,
		dur: 90,
		labelOffset: [-158, 18],
	},
];

function project(coord: Coord): [number, number] | null {
	return projection(coord) as [number, number] | null;
}

function arcPath(from: Coord, to: Coord): string | null {
	const p1 = project(from);
	const p2 = project(to);
	if (!p1 || !p2) return null;
	const [x1, y1] = p1;
	const [x2, y2] = p2;
	const dist = Math.hypot(x2 - x1, y2 - y1);
	const mx = (x1 + x2) / 2;
	const my = (y1 + y2) / 2;
	const lift = Math.min(dist * 0.28, 200);
	return `M${x1},${y1} Q${mx},${my - lift} ${x2},${y2}`;
}

function arrowTip(
	cpx: number,
	cpy: number,
	x2: number,
	y2: number,
	size: number,
): string {
	const angle = Math.atan2(y2 - cpy, x2 - cpx);
	const spread = 0.42;
	return [
		`${x2},${y2}`,
		`${x2 - size * Math.cos(angle - spread)},${y2 - size * Math.sin(angle - spread)}`,
		`${x2 - size * Math.cos(angle + spread)},${y2 - size * Math.sin(angle + spread)}`,
	].join(' ');
}

const ease = Easing.bezier(0.4, 0, 0.2, 1);

const Arc: React.FC<{
	from: Coord;
	to: Coord;
	routeKey: string;
	label: string;
	flag: string;
	labelOffset: [number, number];
	start: number;
	dur: number;
	frame: number;
}> = ({from, to, routeKey, label, flag, labelOffset, start, dur, frame}) => {
	const src = project(from);
	const dest = project(to);
	if (!src || !dest) return null;
	const [x2, y2] = dest;

	const d = arcPath(from, to);
	if (!d) return null;

	const qMatch = d.match(/Q([^,]+),([^ ]+)/);
	const cpx = qMatch ? parseFloat(qMatch[1]) : (src[0] + x2) / 2;
	const cpy = qMatch ? parseFloat(qMatch[2]) : (src[1] + y2) / 2;

	// Faint dashed guide appears just before animation starts
	const guideOpacity = interpolate(frame, [start - 10, start + 12], [0, 0.22], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Arc draw-on progress
	const arcProg = interpolate(frame, [start, start + dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});

	// Destination marker appear
	const dotProg = interpolate(frame, [start + dur, start + dur + 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});

	// Label fade in
	const labelFade = interpolate(frame, [start + dur + 8, start + dur + 24], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Continuous pulse ring after arc completes
	const afterDone = Math.max(0, frame - (start + dur));
	const ringT = afterDone % 52;
	const ringR = interpolate(ringT, [0, 52], [4, 20]);
	const ringOp = interpolate(ringT, [0, 30, 52], [0.5, 0, 0]);

	const arrowOpacity = interpolate(frame, [start + dur * 0.82, start + dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const pts = arrowTip(cpx, cpy, x2, y2, 9);
	const [lx, ly] = labelOffset;

	return (
		<g key={routeKey}>
			{/* Dashed guide line (full path, very faint) */}
			<path
				d={d}
				fill="none"
				stroke={C_ACCENT}
				strokeWidth={0.9}
				strokeDasharray="6 5"
				opacity={guideOpacity}
			/>

			{/* Animated arc */}
			<path
				d={d}
				fill="none"
				stroke={C_ACCENT}
				strokeWidth={1.5}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray="1"
				strokeDashoffset={1 - arcProg}
				style={{filter: `drop-shadow(0 0 3px ${C_ACCENT}66)`}}
			/>

			{/* Arrowhead */}
			<polygon
				points={pts}
				fill={C_ACCENT}
				opacity={arrowOpacity}
			/>

			{/* Pulse ring */}
			{dotProg > 0 && (
				<circle
					cx={x2}
					cy={y2}
					r={ringR}
					fill="none"
					stroke={C_ACCENT}
					strokeWidth={0.9}
					opacity={ringOp * dotProg}
				/>
			)}

			{/* Destination dot */}
			<circle
				cx={x2}
				cy={y2}
				r={4 * dotProg}
				fill={C_ACCENT}
			/>

			{/* Flag + country name label */}
			<text
				x={x2 + lx}
				y={y2 + ly}
				fill="#0c3a60"
				fontSize={16}
				fontFamily="'Segoe UI', system-ui, Arial, sans-serif"
				fontWeight="600"
				opacity={labelFade}
			>
				{flag}
				{'  '}
				{label}
			</text>
		</g>
	);
};

export const MapAnimation: React.FC = () => {
	const frame = useCurrentFrame();

	const countryPaths = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const countries = feature(worldData as any, (worldData as any).objects.countries) as any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return countries.features.map((f: any, i: number) => ({
			id: String(f.id ?? i),
			d: pathGen(f) ?? '',
		}));
	}, []);

	const sp = project(SOURCE) ?? [0, 0];
	const [sx, sy] = sp;

	const srcPulse = 7 + 3 * Math.sin((frame / 22) * Math.PI * 2);
	const globalFade = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
	const titleOpacity = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill
			style={{background: C_BG, fontFamily: "'Segoe UI', system-ui, sans-serif"}}
		>
			<svg
				width={W}
				height={H}
				viewBox={`0 0 ${W} ${H}`}
				style={{position: 'absolute', inset: 0}}
			>
				{/* Ocean / background */}
				<rect width={W} height={H} fill={C_BG} />

				{/* Land masses */}
				{countryPaths.map(({id, d}) => (
					<path
						key={id}
						d={d}
						fill={C_LAND}
						stroke={C_ACCENT}
						strokeWidth={0.35}
						strokeOpacity={0.3}
					/>
				))}

				{/* Animated arcs */}
				{ROUTES.map((r) => (
					<Arc
						key={r.key}
						routeKey={r.key}
						from={SOURCE}
						to={r.coord}
						start={r.start}
						dur={r.dur}
						frame={frame}
						label={r.label}
						flag={r.flag}
						labelOffset={r.labelOffset}
					/>
				))}

				{/* Source marker — South Korea */}
				<g opacity={globalFade}>
					{/* Pulsing outer ring */}
					<circle
						cx={sx}
						cy={sy}
						r={srcPulse}
						fill="none"
						stroke={C_ACCENT}
						strokeWidth={1.2}
						opacity={0.4}
					/>
					{/* Core dot */}
					<circle
						cx={sx}
						cy={sy}
						r={5}
						fill={C_ACCENT}
					/>
					{/* "South Korea" label */}
					<text
						x={sx + 12}
						y={sy + 5}
						fill="#0c3a60"
						fontSize={14}
						fontFamily="'Segoe UI', system-ui, sans-serif"
						fontWeight="700"
						letterSpacing="0.04em"
					>
						🇰🇷 South Korea
					</text>
				</g>
			</svg>

			{/* Title bar */}
			<div
				style={{
					position: 'absolute',
					top: 38,
					width: '100%',
					textAlign: 'center',
					color: '#0c3a60',
					fontSize: 30,
					fontWeight: 600,
					opacity: titleOpacity,
					letterSpacing: '0.14em',
					textTransform: 'uppercase',
				}}
			>
				South Korea · Global Connections
			</div>

			{/* Subtle bottom rule */}
			<div
				style={{
					position: 'absolute',
					bottom: 32,
					left: '50%',
					transform: 'translateX(-50%)',
					width: 120,
					height: 1,
					background: C_ACCENT,
					opacity: titleOpacity * 0.35,
				}}
			/>
		</AbsoluteFill>
	);
};
