import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';

const W = 1920;
const H = 1080;

// Natural Earth projection centred slightly south so Africa/Europe don't clip
const projection = geoNaturalEarth1()
	.scale(255)
	.translate([W / 2, H / 2 + 40]);

const pathGen = geoPath(projection);

type Coord = [number, number];

// 3-colour palette ─────────────────────────────────────────────
const C_BG = '#07111f';   // deep navy   (ocean + background)
const C_LAND = '#0d1e38'; // dark blue   (land masses)
const C_ACCENT = '#38bdf8'; // sky cyan  (all interactive elements)
// ──────────────────────────────────────────────────────────────

const SOURCE: Coord = [127.7, 35.9]; // South Korea

const ROUTES: {
	key: string;
	label: string;
	flag: string;
	coord: Coord;
	start: number;
	dur: number;
	labelOffset: [number, number];
}[] = [
	{
		key: 'jp',
		label: 'Japan',
		flag: '🇯🇵',
		coord: [138, 36],
		start: 15,
		dur: 28,
		labelOffset: [12, -12],
	},
	{
		key: 'in',
		label: 'India',
		flag: '🇮🇳',
		coord: [78, 22],
		start: 22,
		dur: 42,
		labelOffset: [-142, -12],
	},
	{
		key: 'us',
		label: 'United States',
		flag: '🇺🇸',
		coord: [-98, 38],
		start: 30,
		dur: 58,
		labelOffset: [12, -12],
	},
	{
		key: 'mx',
		label: 'Mexico',
		flag: '🇲🇽',
		coord: [-102, 24],
		start: 38,
		dur: 52,
		labelOffset: [12, 18],
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
	const lift = Math.min(dist * 0.3, 190);
	return `M${x1},${y1} Q${mx},${my - lift} ${x2},${y2}`;
}

function arrowTip(
	cpx: number,
	cpy: number,
	x2: number,
	y2: number,
	size: number
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

	// Faint dashed guide appears just before the arc starts
	const guideOpacity = interpolate(frame, [start - 8, start + 8], [0, 0.18], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Arc draw-on progress
	const arcProg = interpolate(frame, [start, start + dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});

	// Destination dot / arrowhead appears
	const dotProg = interpolate(frame, [start + dur, start + dur + 10], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});

	// Label fades in after dot
	const labelFade = interpolate(frame, [start + dur + 6, start + dur + 20], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Continuous pulse ring after destination reached
	const afterDone = Math.max(0, frame - (start + dur));
	const ringT = afterDone % 48;
	const ringR = interpolate(ringT, [0, 48], [4, 20]);
	const ringOp = interpolate(ringT, [0, 28, 48], [0.55, 0, 0]);

	const arrowOpacity = interpolate(frame, [start + dur * 0.8, start + dur], [0, 1], {
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
				strokeWidth={0.8}
				strokeDasharray="5 5"
				opacity={guideOpacity}
			/>

			{/* Animated glowing arc */}
			<path
				d={d}
				fill="none"
				stroke={C_ACCENT}
				strokeWidth={1.4}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray="1"
				strokeDashoffset={1 - arcProg}
				style={{filter: `drop-shadow(0 0 4px ${C_ACCENT}bb)`}}
			/>

			{/* Arrowhead */}
			<polygon
				points={pts}
				fill={C_ACCENT}
				opacity={arrowOpacity}
				style={{filter: `drop-shadow(0 0 3px ${C_ACCENT})`}}
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
				style={{filter: `drop-shadow(0 0 7px ${C_ACCENT})`}}
			/>

			{/* Flag + country name */}
			<text
				x={x2 + lx}
				y={y2 + ly}
				fill="#d0ecfc"
				fontSize={17}
				fontFamily="'Segoe UI', system-ui, Arial, sans-serif"
				fontWeight="500"
				opacity={labelFade}
				style={{filter: `drop-shadow(0 0 6px ${C_ACCENT}55)`}}
			>
				{flag}{'  '}{label}
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
		<AbsoluteFill style={{background: C_BG, fontFamily: "'Segoe UI', system-ui, sans-serif"}}>
			<svg
				width={W}
				height={H}
				viewBox={`0 0 ${W} ${H}`}
				style={{position: 'absolute', inset: 0}}
			>
				{/* Ocean */}
				<rect width={W} height={H} fill={C_BG} />

				{/* Land masses — 2-colour: fill + border */}
				{countryPaths.map(({id, d}) => (
					<path
						key={id}
						d={d}
						fill={C_LAND}
						stroke="#132844"
						strokeWidth={0.45}
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

				{/* Source — South Korea */}
				<g opacity={globalFade}>
					{/* Outer pulse ring */}
					<circle
						cx={sx}
						cy={sy}
						r={srcPulse}
						fill="none"
						stroke={C_ACCENT}
						strokeWidth={1}
						opacity={0.38}
					/>
					{/* Core dot */}
					<circle
						cx={sx}
						cy={sy}
						r={5}
						fill={C_ACCENT}
						style={{filter: `drop-shadow(0 0 9px ${C_ACCENT})`}}
					/>
					{/* "South Korea" label */}
					<text
						x={sx + 11}
						y={sy + 5}
						fill={C_ACCENT}
						fontSize={15}
						fontFamily="'Segoe UI', system-ui, sans-serif"
						fontWeight="600"
						letterSpacing="0.04em"
						style={{filter: `drop-shadow(0 0 8px ${C_ACCENT}88)`}}
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
					color: '#d0ecfc',
					fontSize: 32,
					fontWeight: 600,
					opacity: titleOpacity,
					letterSpacing: '0.14em',
					textTransform: 'uppercase',
					textShadow: `0 0 22px ${C_ACCENT}77`,
				}}
			>
				South Korea · Global Connections
			</div>
		</AbsoluteFill>
	);
};
