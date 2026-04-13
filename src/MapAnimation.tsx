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
const C_ACCENT = '#0369a1'; // arrows, markers, labels
// ─────────────────────────────────────────────────────────────

// Title bar height — map fills the rest
const TITLE_H = 56;

// ─── Projection: South Korea at exact screen centre ──────────
const _tmpProj = geoNaturalEarth1()
	.rotate([-127.7, 0])
	.scale(255)
	.translate([0, 0]);
const _kr = (_tmpProj([127.7, 35.9]) ?? [0, 0]) as [number, number];

// Map area starts below the title bar
const MAP_CY = TITLE_H + (H - TITLE_H) / 2;

const projection = geoNaturalEarth1()
	.rotate([-127.7, 0])
	.scale(255)
	.translate([W / 2 - _kr[0], MAP_CY - _kr[1]]);

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
	labelOffset: [number, number];
}[] = [
	// ── close destinations ──────────────────────────────────
	// Japan: ~10° east → slightly right of Korea on map
	{key: 'jp', label: 'Japan',      flag: '🇯🇵', coord: [138,   36  ], start:  15, dur:  42, labelOffset: [ 12, -13]},
	// Vietnam: ~20° west → just left-below Korea
	{key: 'vn', label: 'Vietnam',    flag: '🇻🇳', coord: [108,   14  ], start:  28, dur:  42, labelOffset: [ 12,  14]},
	// Thailand: ~27° west → slightly left-below Korea
	{key: 'th', label: 'Thailand',   flag: '🇹🇭', coord: [101,   15  ], start:  42, dur:  48, labelOffset: [-138, -14]},

	// ── medium destinations ──────────────────────────────────
	// India: ~50° west → moderately left
	{key: 'in', label: 'India',      flag: '🇮🇳', coord: [ 78,   22  ], start:  58, dur:  65, labelOffset: [-148, -13]},
	// Uzbekistan: ~65° west → left of centre
	{key: 'uz', label: 'Uzbekistan', flag: '🇺🇿', coord: [ 63,   41  ], start:  72, dur:  65, labelOffset: [ 12, -12]},

	// ── far destinations ─────────────────────────────────────
	// Turkey: ~93° west → far left
	{key: 'tr', label: 'Turkey',     flag: '🇹🇷', coord: [ 35,   39  ], start:  88, dur:  75, labelOffset: [-118, -12]},
	// Slovakia: ~108° west → very far left
	{key: 'sk', label: 'Slovakia',   flag: '🇸🇰', coord: [ 19.5, 48.7], start: 105, dur:  80, labelOffset: [ 12, -20]},

	// ── trans-Pacific (appear on right side of Korea-centred map) ──
	// USA: ~134° east via Pacific → far right
	{key: 'us', label: 'United States', flag: '🇺🇸', coord: [-98, 38], start: 120, dur:  95, labelOffset: [-205, -13]},
	// Mexico: ~131° east via Pacific → far right just below USA
	{key: 'mx', label: 'Mexico',     flag: '🇲🇽', coord: [-102, 24  ], start: 138, dur:  90, labelOffset: [-158,  18]},
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
	const lift = Math.min(dist * 0.28, 195);
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
	const src  = project(from);
	const dest = project(to);
	if (!src || !dest) return null;
	const [x2, y2] = dest;

	const d = arcPath(from, to);
	if (!d) return null;

	const qMatch = d.match(/Q([^,]+),([^ ]+)/);
	const cpx = qMatch ? parseFloat(qMatch[1]) : (src[0] + x2) / 2;
	const cpy = qMatch ? parseFloat(qMatch[2]) : (src[1] + y2) / 2;

	const guideOpacity = interpolate(frame, [start - 10, start + 12], [0, 0.22], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const arcProg = interpolate(frame, [start, start + dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});

	const dotProg = interpolate(frame, [start + dur, start + dur + 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});

	const labelFade = interpolate(frame, [start + dur + 8, start + dur + 24], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const afterDone = Math.max(0, frame - (start + dur));
	const ringT  = afterDone % 52;
	const ringR  = interpolate(ringT, [0, 52], [4, 20]);
	const ringOp = interpolate(ringT, [0, 30, 52], [0.45, 0, 0]);

	const arrowOpacity = interpolate(frame, [start + dur * 0.82, start + dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const pts = arrowTip(cpx, cpy, x2, y2, 8);
	const [lx, ly] = labelOffset;

	return (
		<g key={routeKey}>
			{/* Dashed guide line */}
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
				strokeWidth={1.4}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray="1"
				strokeDashoffset={1 - arcProg}
				style={{filter: `drop-shadow(0 0 3px ${C_ACCENT}55)`}}
			/>

			{/* Arrowhead */}
			<polygon points={pts} fill={C_ACCENT} opacity={arrowOpacity} />

			{/* Pulse ring */}
			{dotProg > 0 && (
				<circle
					cx={x2} cy={y2}
					r={ringR}
					fill="none"
					stroke={C_ACCENT}
					strokeWidth={0.9}
					opacity={ringOp * dotProg}
				/>
			)}

			{/* Destination dot */}
			<circle cx={x2} cy={y2} r={4 * dotProg} fill={C_ACCENT} />

			{/* Flag + country name */}
			<text
				x={x2 + lx}
				y={y2 + ly}
				fill="#0c3a60"
				fontSize={14}
				fontFamily="'Segoe UI', system-ui, Arial, sans-serif"
				fontWeight="600"
				opacity={labelFade}
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

	const srcPulse   = 7 + 3 * Math.sin((frame / 22) * Math.PI * 2);
	const globalFade = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
	const titleFade  = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: C_BG, fontFamily: "'Segoe UI', system-ui, sans-serif"}}>

			{/* ── Title bar — sits flush above the map ─────────────── */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: TITLE_H,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: C_BG,
					borderBottom: `1.5px solid ${C_ACCENT}33`,
					zIndex: 10,
					opacity: titleFade,
				}}
			>
				<span
					style={{
						color: '#0c3a60',
						fontSize: 28,
						fontWeight: 700,
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
					}}
				>
					Jeil Solutec Global Export Map
				</span>
			</div>

			{/* ── World map SVG — fills from below the title bar ───── */}
			<svg
				width={W}
				height={H - TITLE_H}
				viewBox={`0 0 ${W} ${H}`}
				style={{position: 'absolute', top: TITLE_H, left: 0}}
			>
				{/* Ocean */}
				<rect x={0} y={TITLE_H} width={W} height={H - TITLE_H} fill={C_BG} />

				{/* Land */}
				{countryPaths.map(({id, d}) => (
					<path
						key={id}
						d={d}
						fill={C_LAND}
						stroke={C_ACCENT}
						strokeWidth={0.35}
						strokeOpacity={0.28}
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
					<circle
						cx={sx} cy={sy}
						r={srcPulse}
						fill="none"
						stroke={C_ACCENT}
						strokeWidth={1.2}
						opacity={0.38}
					/>
					<circle cx={sx} cy={sy} r={5} fill={C_ACCENT} />
					<text
						x={sx + 11}
						y={sy + 5}
						fill="#0c3a60"
						fontSize={13}
						fontFamily="'Segoe UI', system-ui, sans-serif"
						fontWeight="700"
						letterSpacing="0.04em"
					>
						🇰🇷 South Korea
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
