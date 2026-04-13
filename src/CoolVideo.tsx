import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';

const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// ─── Color palette ───────────────────────────────────────────────────────────
const BG_DARK = '#0d0d1a';
const GOLD = '#f0c040';
const CYAN = '#40e0d0';
const WHITE = '#ffffff';
const MUTED = '#888899';
const AXIS_COLOR = '#2a2a3a';

// ─── Scene 1: Animated Bar Chart ─────────────────────────────────────────────
const data = [
	{label: 'Jan', value: 42},
	{label: 'Mar', value: 68},
	{label: 'May', value: 55},
	{label: 'Jul', value: 91},
	{label: 'Sep', value: 76},
	{label: 'Nov', value: 100},
];

export const BarChartScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, height, width} = useVideoConfig();

	const titleProgress = interpolate(frame, [0, fps * 0.6], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	const chartHeight = height - 260;

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(135deg, ${BG_DARK} 0%, #1a1a2e 100%)`,
				fontFamily,
				padding: 60,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Title */}
			<div
				style={{
					opacity: titleProgress,
					transform: `translateY(${interpolate(titleProgress, [0, 1], [-20, 0])}px)`,
					marginBottom: 40,
				}}
			>
				<div style={{color: GOLD, fontSize: 18, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8}}>
					Monthly Performance
				</div>
				<div style={{color: WHITE, fontSize: 52, fontWeight: 800, lineHeight: 1}}>
					Growth Metrics
				</div>
			</div>

			{/* Chart */}
			<div style={{display: 'flex', flex: 1, alignItems: 'flex-end', gap: 0}}>
				{data.map((item, i) => {
					const barProgress = spring({
						frame: frame - i * 8 - fps * 0.4,
						fps,
						config: {damping: 16, stiffness: 70},
					});

					const barHeight = (item.value / 100) * chartHeight * barProgress;
					const valueOpacity = interpolate(barProgress, [0.8, 1], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});

					const isLast = i === data.length - 1;

					return (
						<div
							key={item.label}
							style={{
								flex: 1,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'flex-end',
								gap: 12,
								paddingBottom: 40,
							}}
						>
							{/* Value label */}
							<div
								style={{
									color: isLast ? GOLD : CYAN,
									fontSize: 20,
									fontWeight: 700,
									opacity: valueOpacity,
								}}
							>
								{item.value}%
							</div>

							{/* Bar */}
							<div
								style={{
									width: '70%',
									height: barHeight,
									background: isLast
										? `linear-gradient(180deg, ${GOLD} 0%, #c09020 100%)`
										: `linear-gradient(180deg, ${CYAN} 0%, #20a0a0 100%)`,
									borderRadius: '6px 6px 0 0',
									boxShadow: isLast
										? `0 0 20px ${GOLD}66`
										: `0 0 16px ${CYAN}44`,
								}}
							/>

							{/* X label */}
							<div style={{color: MUTED, fontSize: 18}}>{item.label}</div>
						</div>
					);
				})}
			</div>

			{/* X-axis line */}
			<div
				style={{
					position: 'absolute',
					bottom: 100,
					left: 60,
					right: 60,
					height: 2,
					background: AXIS_COLOR,
				}}
			/>

			{/* Decorative glow orb */}
			<div
				style={{
					position: 'absolute',
					top: -100,
					right: -100,
					width: 400,
					height: 400,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${CYAN}18 0%, transparent 70%)`,
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};

// ─── Scene 2: Typewriter ──────────────────────────────────────────────────────
const LINES = [
	'Build videos',
	'with React.',
	'This is Remotion.',
];

export const TypewriterScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const CHAR_FRAMES = 3;

	const allChars = LINES.join('\n');
	const totalChars = allChars.length;
	const typedCount = Math.min(totalChars, Math.floor(frame / CHAR_FRAMES));

	// Rebuild by lines
	let charsLeft = typedCount;
	const displayLines: string[] = [];
	for (const line of LINES) {
		if (charsLeft <= 0) {
			displayLines.push('');
		} else if (charsLeft >= line.length) {
			displayLines.push(line);
			charsLeft -= line.length;
		} else {
			displayLines.push(line.slice(0, charsLeft));
			charsLeft = 0;
		}
	}

	const cursorOpacity = interpolate(
		frame % 22,
		[0, 11, 22],
		[1, 0, 1],
		{extrapolateRight: 'clamp'},
	);

	const bgProgress = interpolate(frame, [0, fps], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.4, 0, 0.2, 1),
	});

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(225deg, #0d0d1a 0%, #1a0d2e 100%)`,
				fontFamily,
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			{/* Background grid lines */}
			{[...Array(8)].map((_, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: `${(i + 1) * 12.5}%`,
						height: 1,
						background: `${WHITE}08`,
					}}
				/>
			))}

			{/* Glow blob */}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: 'translate(-50%, -50%)',
					width: 600,
					height: 400,
					borderRadius: '50%',
					background: `radial-gradient(ellipse, ${GOLD}12 0%, transparent 70%)`,
					opacity: bgProgress,
				}}
			/>

			{/* Text block */}
			<div style={{position: 'relative', zIndex: 1}}>
				{displayLines.map((line, i) => {
					const isLastActive = i === displayLines.findIndex((l, j) => j >= i && (j === displayLines.length - 1 || displayLines[j + 1] === ''));
					const isFinalLine = i === LINES.length - 1;
					return (
						<div
							key={i}
							style={{
								fontSize: isFinalLine ? 80 : 72,
								fontWeight: 800,
								lineHeight: 1.2,
								color: isFinalLine ? GOLD : WHITE,
								textShadow: isFinalLine ? `0 0 40px ${GOLD}88` : 'none',
								minHeight: '1.2em',
							}}
						>
							{line}
							{isLastActive && charsLeft === 0 && (
								<span style={{opacity: cursorOpacity, color: CYAN}}>|</span>
							)}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// ─── Scene 3: Word Highlight Finale ──────────────────────────────────────────
const HighlightWord: React.FC<{
	word: string;
	color: string;
	delay: number;
}> = ({word, color, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const progress = spring({
		fps,
		frame,
		config: {damping: 200},
		delay,
		durationInFrames: 20,
	});

	return (
		<span style={{position: 'relative', display: 'inline-block'}}>
			<span
				style={{
					position: 'absolute',
					left: -6,
					right: -6,
					top: '50%',
					height: '1.1em',
					transform: `translateY(-50%) scaleX(${Math.min(1, progress)})`,
					transformOrigin: 'left center',
					background: `linear-gradient(90deg, ${color}cc, ${color}88)`,
					borderRadius: '6px',
					zIndex: 0,
				}}
			/>
			<span style={{position: 'relative', zIndex: 1}}>{word}</span>
		</span>
	);
};

export const HighlightScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	const subtitleProgress = interpolate(frame, [fps * 0.6, fps * 1.1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(160deg, #0d1a0d 0%, #0d0d1a 100%)`,
				fontFamily,
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				gap: 32,
			}}
		>
			{/* Decorative circles */}
			<div
				style={{
					position: 'absolute',
					left: -120,
					bottom: -120,
					width: 500,
					height: 500,
					borderRadius: '50%',
					border: `1px solid ${GOLD}22`,
					opacity: fadeIn,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					right: -60,
					top: -60,
					width: 300,
					height: 300,
					borderRadius: '50%',
					border: `1px solid ${CYAN}22`,
					opacity: fadeIn,
				}}
			/>

			<div
				style={{
					opacity: fadeIn,
					fontSize: 72,
					fontWeight: 800,
					color: WHITE,
					textAlign: 'center',
					lineHeight: 1.3,
				}}
			>
				<span>From </span>
				<HighlightWord word="idea" color={CYAN} delay={fps * 0.8} />
				<span> to </span>
				<HighlightWord word="motion" color={GOLD} delay={fps * 1.2} />
				<span>.</span>
			</div>

			<div
				style={{
					opacity: subtitleProgress,
					transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
					fontSize: 28,
					color: MUTED,
					letterSpacing: 6,
					textTransform: 'uppercase',
					fontWeight: 500,
				}}
			>
				Powered by Remotion
			</div>
		</AbsoluteFill>
	);
};

// ─── Main composed export ─────────────────────────────────────────────────────
const SCENE1_FRAMES = 120;
const SCENE2_FRAMES = 150;
const SCENE3_FRAMES = 120;
const TRANSITION_FRAMES = 20;

export const CoolVideo: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={SCENE1_FRAMES}>
				<BarChartScene />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={slide({direction: 'from-right'})}
				timing={springTiming({config: {damping: 200}, durationInFrames: TRANSITION_FRAMES})}
			/>
			<TransitionSeries.Sequence durationInFrames={SCENE2_FRAMES}>
				<TypewriterScene />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={fade()}
				timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
			/>
			<TransitionSeries.Sequence durationInFrames={SCENE3_FRAMES}>
				<HighlightScene />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const COOL_VIDEO_FRAMES =
	SCENE1_FRAMES + SCENE2_FRAMES + SCENE3_FRAMES - TRANSITION_FRAMES * 2;
