import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

// ─── Utils ────────────────────────────────────────────────────────────────────

const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: seededRandom(i * 7.31) * 100,
  y: seededRandom(i * 13.77) * 100,
  size: seededRandom(i * 3.11) * 3 + 1,
  phase: seededRandom(i * 19.1) * 6.28,
  color: ['#00ffff', '#ff00ff', '#00ff88', '#ff8800', '#ffffffaa'][
    Math.floor(seededRandom(i * 5.3) * 5)
  ],
}));

// ─── Atoms ────────────────────────────────────────────────────────────────────

const Star: React.FC<{ x: number; y: number; size: number; color: string; phase: number }> = (
  { x, y, size, color, phase },
) => {
  const frame = useCurrentFrame();
  const opacity = (Math.sin(frame * 0.05 + phase) + 1) * 0.35 + 0.08;
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      width: size, height: size,
      borderRadius: '50%',
      backgroundColor: color,
      opacity,
      boxShadow: `0 0 ${size * 4}px ${color}`,
      transform: 'translate(-50%, -50%)',
    }} />
  );
};

const StarField: React.FC = () => (
  <>
    {STARS.map((s, i) => <Star key={i} {...s} />)}
  </>
);

const Grid: React.FC<{ alpha?: number }> = ({ alpha = 0.05 }) => (
  <div style={{
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,255,${alpha}) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,255,${alpha}) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
  }} />
);

const Ring: React.FC<{ offset?: number; color?: string; radius?: number }> = (
  { offset = 0, color = '#00ffff', radius = 200 },
) => {
  const frame = useCurrentFrame();
  const t = (frame + offset) % 90;
  const scale = interpolate(t, [0, 90], [0.5, 2.4]);
  const opacity = interpolate(t, [0, 55, 90], [0.8, 0.25, 0]);
  const d = radius * 2;
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      width: d, height: d,
      borderRadius: '50%',
      border: `1.5px solid ${color}`,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity,
      boxShadow: `0 0 18px ${color}`,
    }} />
  );
};

// Per-character spring drop-in
const Char: React.FC<{
  char: string;
  delay: number;
  color: string;
  size: number;
  weight: string | number;
}> = ({ char, delay, color, size, weight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });
  const opacity = interpolate(s, [0, 0.08, 1], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(s, [0, 1], [70, 0]);
  const scale = interpolate(s, [0, 0.4, 0.75, 1], [0.1, 1.4, 0.88, 1]);
  return (
    <span style={{
      display: 'inline-block',
      fontSize: size,
      fontWeight: weight,
      fontFamily: "'Courier New', 'SimHei', 'Microsoft YaHei', monospace",
      color,
      opacity,
      transform: `translateY(${y}px) scale(${scale})`,
      textShadow: `0 0 22px ${color}, 0 0 55px ${color}60`,
      whiteSpace: 'pre',
    }}>
      {char}
    </span>
  );
};

const AnimText: React.FC<{
  text: string;
  delay?: number;
  color?: string;
  size?: number;
  weight?: string | number;
}> = ({ text, delay = 0, color = '#00ffff', size = 80, weight = 900 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
    {text.split('').map((ch, i) => (
      <Char key={i} char={ch} delay={delay + i * 4} color={color} size={size} weight={weight} />
    ))}
  </div>
);

// Animated stat counter
const Counter: React.FC<{
  to: number;
  suffix?: string;
  label: string;
  color: string;
  delay?: number;
}> = ({ to, suffix = '', label, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 65, mass: 1 } });
  const val = Math.round(interpolate(s, [0, 1], [0, to]));
  const op = interpolate(Math.min(1, s * 8), [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const sc = interpolate(s, [0, 0.3, 0.65, 1], [0, 1.45, 0.85, 1]);
  return (
    <div style={{ textAlign: 'center', opacity: op, transform: `scale(${sc})` }}>
      <div style={{
        fontSize: 98,
        fontWeight: 900,
        fontFamily: 'monospace',
        color,
        textShadow: `0 0 28px ${color}, 0 0 75px ${color}50`,
        lineHeight: 1,
      }}>
        {val}{suffix}
      </div>
      <div style={{
        fontSize: 16,
        color: '#ffffff55',
        fontFamily: 'monospace',
        letterSpacing: '0.3em',
        marginTop: 14,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );
};

// Animated progress bar
const Bar: React.FC<{
  label: string;
  pct: number;
  color: string;
  delay?: number;
}> = ({ label, pct, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } });
  const w = interpolate(s, [0, 1], [0, pct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = interpolate(Math.min(1, s * 8), [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{ width: 520, opacity: op }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 9, fontFamily: 'monospace', fontSize: 16,
        color: '#ffffff77', letterSpacing: '0.1em',
      }}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{Math.round(w)}%</span>
      </div>
      <div style={{ height: 10, backgroundColor: '#ffffff0c', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${w}%`,
          background: `linear-gradient(90deg, ${color}60, ${color})`,
          borderRadius: 5,
          boxShadow: `0 0 12px ${color}, 0 0 26px ${color}50`,
        }} />
      </div>
    </div>
  );
};

// Feature card with slide-in animation
const Card: React.FC<{
  icon: string;
  title: string;
  desc: string;
  color: string;
  delay?: number;
}> = ({ icon, title, desc, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 100, mass: 0.8 } });
  const op = interpolate(s, [0, 0.1, 1], [0, 1, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const x = interpolate(s, [0, 1], [-55, 0]);
  return (
    <div style={{
      opacity: op,
      transform: `translateX(${x}px)`,
      padding: '26px 30px',
      border: `1px solid ${color}35`,
      borderRadius: 14,
      background: `linear-gradient(135deg, ${color}0b, transparent)`,
      boxShadow: `0 0 30px ${color}10, inset 0 0 20px ${color}06`,
      width: 390,
    }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontSize: 19,
        fontWeight: 700,
        color,
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        marginBottom: 10,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: '#ffffff55', fontFamily: 'monospace', lineHeight: 1.75 }}>
        {desc}
      </div>
    </div>
  );
};

// Floating hex outline
const Hex: React.FC<{ cx: number; cy: number; r: number; color: string; rotOff: number }> = (
  { cx, cy, r, color, rotOff },
) => {
  const frame = useCurrentFrame();
  const rot = ((frame * 0.4 + rotOff) % 360);
  const floatY = Math.sin((frame + rotOff) * 0.04) * 18;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * (Math.PI / 180);
    return `${r * Math.cos(a)},${r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg style={{
      position: 'absolute',
      left: `${cx}%`, top: `${cy}%`,
      transform: `translate(-50%, -50%) translateY(${floatY}px) rotate(${rot}deg)`,
      overflow: 'visible',
    }} width={r * 2} height={r * 2}>
      <polygon
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity={0.35}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  );
};

// ─── Scenes ───────────────────────────────────────────────────────────────────

const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 35], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at 50% 45%, #080825 0%, #000008 100%)',
      opacity,
    }}>
      <StarField />
      <Grid alpha={0.04} />
      {/* Concentric pulsing rings */}
      <Ring offset={0}  color="#00ffff" radius={280} />
      <Ring offset={30} color="#ff00ff" radius={280} />
      <Ring offset={60} color="#00ffff" radius={280} />

      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 14,
      }}>
        <AnimText text="◈  REMOTION  DEMO  ◈" delay={5}  color="#ff00ff70" size={22}  weight={700} />
        <div style={{ margin: '16px 0 10px' }}>
          <AnimText text="炮哥出品" delay={20} color="#00ffff" size={162} weight={900} />
        </div>
        <AnimText text="MUST BE A MASTERPIECE" delay={52} color="#ff8800" size={38} weight={700} />
        <div style={{ marginTop: 32 }}>
          <AnimText text="FROM  CODE  TO  CINEMA" delay={92} color="#00ff8868" size={20} weight={400} />
        </div>
      </AbsoluteFill>

      {/* HUD corners */}
      <div style={{ position: 'absolute', top: 32, left: 40, fontFamily: 'monospace', fontSize: 13, color: '#00ffff30', letterSpacing: '0.1em' }}>
        REMOTION v4.0.447
      </div>
      <div style={{ position: 'absolute', top: 32, right: 40, fontFamily: 'monospace', fontSize: 13, color: '#00ffff30' }}>
        FR:{String(frame).padStart(4, '0')}
      </div>
      <div style={{ position: 'absolute', bottom: 32, left: 40, fontFamily: 'monospace', fontSize: 13, color: '#ff00ff30' }}>
        [DEMO MODE ACTIVE]
      </div>
      <div style={{ position: 'absolute', bottom: 32, right: 40, fontFamily: 'monospace', fontSize: 13, color: '#ff00ff30' }}>
        30 FPS · 1920×1080
      </div>
    </AbsoluteFill>
  );
};

const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at 35% 60%, #1a0032 0%, #000012 100%)',
      opacity,
    }}>
      <Grid alpha={0.07} />
      <StarField />
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <AnimText text="PERFORMANCE" delay={5} color="#ff00ff" size={56} weight={900} />
        <div style={{ height: 52 }} />
        <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start' }}>
          <Counter to={60}  suffix="+"  label="FPS RENDER"      color="#00ffff" delay={22} />
          <Counter to={4}   suffix="K"  label="RESOLUTION"      color="#ff00ff" delay={42} />
          <Counter to={447}             label="CURRENT VERSION"  color="#ff8800" delay={62} />
        </div>
        <div style={{ height: 62 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Bar label="ANIMATION ENGINE"     pct={98}  color="#00ffff" delay={75} />
          <Bar label="VISUAL QUALITY"       pct={100} color="#ff00ff" delay={90} />
          <Bar label="DEVELOPER EXPERIENCE" pct={96}  color="#00ff88" delay={105} />
          <Bar label="COOLNESS FACTOR  🔥"  pct={99}  color="#ff8800" delay={120} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HEXES = [
  { cx: 9,  cy: 18, r: 80, color: '#00ffff', rotOff: 0   },
  { cx: 87, cy: 14, r: 58, color: '#ff00ff', rotOff: 45  },
  { cx: 91, cy: 82, r: 95, color: '#ff8800', rotOff: 30  },
  { cx: 6,  cy: 84, r: 68, color: '#00ff88', rotOff: 15  },
  { cx: 50, cy: 4,  r: 48, color: '#ffff00', rotOff: 60  },
  { cx: 80, cy: 50, r: 42, color: '#00ffff', rotOff: 120 },
];

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at 65% 35%, #001a32 0%, #000008 100%)',
      opacity,
    }}>
      <Grid alpha={0.05} />
      <StarField />
      {HEXES.map((h, i) => <Hex key={i} {...h} />)}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 44,
      }}>
        <AnimText text="CAPABILITIES" delay={5} color="#00ffff" size={56} weight={900} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <Card
            icon="⚡"
            title="SPRING PHYSICS"
            desc={"Natural animations powered by\nphysics-based spring simulation\nfor buttery-smooth motion"}
            color="#00ffff"
            delay={22}
          />
          <Card
            icon="🎬"
            title="FRAME PERFECT"
            desc={"Deterministic rendering delivers\nexact pixel-perfect output on\nevery single render pass"}
            color="#ff00ff"
            delay={38}
          />
          <Card
            icon="⚛️"
            title="REACT POWERED"
            desc={"Use the full React ecosystem\nand existing skills to build\nvideo compositions in TSX"}
            color="#00ff88"
            delay={54}
          />
          <Card
            icon="🎨"
            title="INFINITE CANVAS"
            desc={"CSS, SVG, Canvas, WebGL —\nany visual effect is possible\non the Remotion canvas"}
            color="#ff8800"
            delay={70}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30, 90, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const logoS = spring({ frame: frame - 5, fps, config: { damping: 10, stiffness: 80, mass: 1.5 } });
  const logoScale = interpolate(logoS, [0, 1], [0.3, 1]);
  const logoOp   = interpolate(logoS, [0, 0.1, 1], [0, 1, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at 50% 50%, #0e0025 0%, #000000 100%)',
      opacity,
    }}>
      <StarField />
      {/* 4-colour concentric ring burst */}
      <Ring offset={0}  color="#00ffff" radius={320} />
      <Ring offset={22} color="#ff00ff" radius={265} />
      <Ring offset={44} color="#ff8800" radius={210} />
      <Ring offset={66} color="#00ff88" radius={155} />
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 22,
      }}>
        <div style={{ opacity: logoOp, transform: `scale(${logoScale})` }}>
          <AnimText text="REMOTION" delay={0} color="#ffffff" size={130} weight={900} />
        </div>
        <AnimText text="THE FUTURE OF PROGRAMMATIC VIDEO" delay={25} color="#00ffff" size={26} weight={400} />
        <div style={{ marginTop: 36 }}>
          <AnimText text="炮哥 · 最酷炫 · 永远第一" delay={52} color="#ff8800" size={34} weight={700} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────

export const CoolDemo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    {/* 20-frame crossfades between every scene */}
    <Sequence from={0}   durationInFrames={175}><S1 /></Sequence>
    <Sequence from={155} durationInFrames={185}><S2 /></Sequence>
    <Sequence from={320} durationInFrames={165}><S3 /></Sequence>
    <Sequence from={460} durationInFrames={130}><S4 /></Sequence>
  </AbsoluteFill>
);
