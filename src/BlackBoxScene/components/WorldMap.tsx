import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import {COLORS, FONT_STACK} from '../theme';
import {BEATS, beatFrames} from '../timing';

const W = 1920;
const H = 1080;

const projection = geoNaturalEarth1()
	.scale(330)
	.translate([W / 2, H / 2 + 40]);

const pathGen = geoPath(projection);

type Coord = [number, number];

// Korea (Gyeonggi area) → Mexico (central Mexico)
const KOREA: Coord = [127.0, 37.4];
const MEXICO: Coord = [-102.0, 23.0];

const project = (c: Coord) => projection(c) as [number, number];

const arcPath = (from: Coord, to: Coord) => {
	const [x1, y1] = project(from);
	const [x2, y2] = project(to);
	const mx = (x1 + x2) / 2;
	const my = (y1 + y2) / 2;
	const dist = Math.hypot(x2 - x1, y2 - y1);
	const lift = Math.min(dist * 0.32, 280);
	return {
		d: `M${x1},${y1} Q${mx},${my - lift} ${x2},${y2}`,
		from: [x1, y1] as [number, number],
		to: [x2, y2] as [number, number],
	};
};

export const WorldMap: React.FC = () => {
	const frame = useCurrentFrame();

	const countryPaths = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const collection = feature(
			worldData as any,
			(worldData as any).objects.countries
		) as any;
		return collection.features.map(
			(f: any, i: number) =>
				({
					id: String(f.id ?? i),
					d: pathGen(f) ?? '',
				}) as {id: string; d: string}
		);
	}, []);

	const mapBeat = beatFrames(BEATS.mapFadeIn);
	const routeBeat = beatFrames(BEATS.routeDraw);

	const mapOp = interpolate(frame, [mapBeat.start, mapBeat.end], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 0.61, 0.36, 1),
	});

	const routeProg = interpolate(
		frame,
		[routeBeat.start, routeBeat.end],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.4, 0, 0.2, 1),
		}
	);

	const route = arcPath(KOREA, MEXICO);
	const [kx, ky] = route.from;
	const [mx, my] = route.to;

	// Map fades down a bit during later acts so panels read better
	const lateDim = interpolate(frame, [60, 110], [1, 0.55], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const pulseR = 6 + 3 * Math.sin((frame / 18) * Math.PI * 2);

	return (
		<AbsoluteFill style={{opacity: mapOp * lateDim}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="3" result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* Latitude lines */}
				{[-60, -30, 0, 30, 60].map((lat) => {
					const p1 = project([-180, lat]);
					const p2 = project([180, lat]);
					return (
						<line
							key={lat}
							x1={p1[0]}
							y1={p1[1]}
							x2={p2[0]}
							y2={p2[1]}
							stroke={COLORS.grid}
							strokeWidth={0.4}
							opacity={0.6}
						/>
					);
				})}

				{/* Countries */}
				{countryPaths.map(({id, d}) => (
					<path
						key={id}
						d={d}
						fill={COLORS.land}
						stroke={COLORS.landStroke}
						strokeWidth={0.6}
					/>
				))}

				{/* Route arc */}
				<path
					d={route.d}
					fill="none"
					stroke={COLORS.cyan}
					strokeWidth={1.5}
					strokeLinecap="round"
					pathLength={1}
					strokeDasharray="1"
					strokeDashoffset={1 - routeProg}
					opacity={0.9}
					filter="url(#softGlow)"
				/>

				{/* Endpoints */}
				<g opacity={routeProg}>
					<circle
						cx={kx}
						cy={ky}
						r={pulseR}
						fill="none"
						stroke={COLORS.accent}
						strokeWidth={1}
						opacity={0.45}
					/>
					<circle cx={kx} cy={ky} r={3.5} fill={COLORS.accent} />
					<circle cx={mx} cy={my} r={3.5} fill={COLORS.cyan} />
					<circle
						cx={mx}
						cy={my}
						r={pulseR * 0.9}
						fill="none"
						stroke={COLORS.cyan}
						strokeWidth={1}
						opacity={0.45}
					/>
				</g>

				{/* Endpoint labels */}
				<g opacity={routeProg} fontFamily={FONT_STACK}>
					<text
						x={kx + 12}
						y={ky - 10}
						fill={COLORS.textMuted}
						fontSize={14}
						letterSpacing="0.18em"
					>
						KR · SEOUL
					</text>
					<text
						x={mx - 130}
						y={my + 22}
						fill={COLORS.textMuted}
						fontSize={14}
						letterSpacing="0.18em"
					>
						MX · QUERÉTARO
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
