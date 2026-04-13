import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';

const W = 1920;
const H = 1080;

const projection = geoNaturalEarth1()
	.scale(260)
	.translate([W / 2, H / 2 + 50]);

const pathGen = geoPath(projection);

type Coord = [number, number];

const SOURCE: Coord = [127.0, 37.4]; // Gyeonggi-do, South Korea

const ROUTES: {
	key: string;
	label: string;
	coord: Coord;
	color: string;
	start: number;
	dur: number;
}[] = [
	{key: 'jp', label: '日本', coord: [138, 36], color: '#F87171', start: 10, dur: 22},
	{key: 'in', label: '印度', coord: [78, 22], color: '#FBBF24', start: 28, dur: 45},
	{key: 'us', label: '美国', coord: [-95, 38], color: '#60A5FA', start: 50, dur: 58},
	{key: 'mx', label: '墨西哥', coord: [-102, 23], color: '#34D399', start: 72, dur: 58},
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
	// Lift the control point above the midpoint; cap for very long routes
	const lift = Math.min(dist * 0.28, 220);
	return `M${x1},${y1} Q${mx},${my - lift} ${x2},${y2}`;
}

function arrowPoints(
	cpx: number,
	cpy: number,
	x2: number,
	y2: number,
	size: number
): string {
	// Tangent direction at t=1 of quadratic bezier is (x2-cpx, y2-cpy)
	const angle = Math.atan2(y2 - cpy, x2 - cpx);
	const spread = 0.45;
	const ax = x2 - size * Math.cos(angle - spread);
	const ay = y2 - size * Math.sin(angle - spread);
	const bx = x2 - size * Math.cos(angle + spread);
	const by = y2 - size * Math.sin(angle + spread);
	return `${x2},${y2} ${ax},${ay} ${bx},${by}`;
}

const ease = Easing.bezier(0.4, 0, 0.2, 1);

const Arc: React.FC<{
	from: Coord;
	to: Coord;
	color: string;
	start: number;
	dur: number;
	frame: number;
	label: string;
}> = ({from, to, color, start, dur, frame, label}) => {
	const dest = project(to);
	const src = project(from);
	if (!dest || !src) return null;
	const [x2, y2] = dest;

	const d = arcPath(from, to);
	if (!d) return null;

	// Parse control point from the path string for arrowhead direction
	const qMatch = d.match(/Q([\d.+-]+),([\d.+-]+)/);
	const cpx = qMatch ? parseFloat(qMatch[1]) : (src[0] + x2) / 2;
	const cpy = qMatch ? parseFloat(qMatch[2]) : (src[1] + y2) / 2;

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

	const labelFade = interpolate(frame, [start + dur + 5, start + dur + 20], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const afterDone = Math.max(0, frame - (start + dur));
	const ringT = afterDone % 50;
	const ringR = interpolate(ringT, [0, 50], [6, 22]);
	const ringOp = interpolate(ringT, [0, 30, 50], [0.7, 0, 0]);

	const arrowOpacity = interpolate(frame, [start + dur * 0.85, start + dur], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const pts = arrowPoints(cpx, cpy, x2, y2, 13);

	return (
		<g>
			{/* Arc line */}
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth={2.5}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray="1"
				strokeDashoffset={1 - arcProg}
				style={{filter: `drop-shadow(0 0 5px ${color}99)`}}
			/>

			{/* Arrowhead */}
			<polygon
				points={pts}
				fill={color}
				opacity={arrowOpacity}
				style={{filter: `drop-shadow(0 0 4px ${color})`}}
			/>

			{/* Pulse ring */}
			{dotProg > 0 && (
				<circle
					cx={x2}
					cy={y2}
					r={ringR}
					fill="none"
					stroke={color}
					strokeWidth={1.5}
					opacity={ringOp * dotProg}
				/>
			)}

			{/* Destination dot */}
			<circle
				cx={x2}
				cy={y2}
				r={5 * dotProg}
				fill={color}
				style={{filter: `drop-shadow(0 0 8px ${color})`}}
			/>

			{/* Label */}
			<text
				x={x2 + 12}
				y={y2 + 6}
				fill={color}
				fontSize={22}
				fontFamily="'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif"
				fontWeight="700"
				opacity={labelFade}
				style={{filter: `drop-shadow(0 0 6px ${color}88)`}}
			>
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
		return countries.features.map((f, i) => ({
			id: String((f as any).id ?? i),
			d: pathGen(f) ?? '',
		}));
	}, []);

	const sp = project(SOURCE) ?? [0, 0];
	const [sx, sy] = sp;

	const srcPulseR = 10 + 4 * Math.sin((frame / 25) * Math.PI * 2);
	const titleOpacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: '#03071a', fontFamily: 'sans-serif'}}>
			<svg
				width={W}
				height={H}
				viewBox={`0 0 ${W} ${H}`}
				style={{position: 'absolute', inset: 0}}
			>
				{/* Ocean */}
				<rect width={W} height={H} fill="#050d1f" />

				{/* Graticule-like faint grid lines */}
				{[-60, -30, 0, 30, 60].map((lat) => {
					const p1 = project([-180, lat]);
					const p2 = project([180, lat]);
					if (!p1 || !p2) return null;
					return (
						<line
							key={lat}
							x1={p1[0]}
							y1={p1[1]}
							x2={p2[0]}
							y2={p2[1]}
							stroke="#0d1e3d"
							strokeWidth={0.5}
						/>
					);
				})}

				{/* Countries */}
				{countryPaths.map(({id, d}) => (
					<path key={id} d={d} fill="#0d1f40" stroke="#162f5c" strokeWidth={0.7} />
				))}

				{/* Animated arcs */}
				{ROUTES.map((r) => (
					<Arc
						key={r.key}
						from={SOURCE}
						to={r.coord}
						color={r.color}
						start={r.start}
						dur={r.dur}
						frame={frame}
						label={r.label}
					/>
				))}

				{/* Source marker – Gyeonggi-do */}
				<circle
					cx={sx}
					cy={sy}
					r={srcPulseR}
					fill="none"
					stroke="#FFD700"
					strokeWidth={1.5}
					opacity={0.45}
				/>
				<circle
					cx={sx}
					cy={sy}
					r={6}
					fill="#FFD700"
					style={{filter: 'drop-shadow(0 0 10px #FFD700)'}}
				/>
				<text
					x={sx + 12}
					y={sy - 10}
					fill="#FFD700"
					fontSize={20}
					fontWeight="700"
					fontFamily="'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif"
					style={{filter: 'drop-shadow(0 0 6px #FFD70099)'}}
				>
					京畿道
				</text>
			</svg>

			{/* Title overlay */}
			<div
				style={{
					position: 'absolute',
					top: 36,
					width: '100%',
					textAlign: 'center',
					color: '#ffffff',
					fontSize: 42,
					fontWeight: 800,
					opacity: titleOpacity,
					textShadow: '0 0 24px rgba(96,165,250,0.7)',
					letterSpacing: '0.08em',
					fontFamily:
						"'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
				}}
			>
				京畿道 · 全球连接
			</div>
		</AbsoluteFill>
	);
};
