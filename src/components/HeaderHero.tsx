import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
interface FaceProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const StressedFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Tense squinting eyes > < */}
    <path d="M 6 7.5 L 9 9.5 L 6 11.5" />
    <path d="M 18 7.5 L 15 9.5 L 18 11.5" />
    {/* Tense zig-zag mouth */}
    <path d="M 7 16.5 Q 9.5 14 12 16.5 Q 14.5 19 17 16.5" />
  </svg>
);

const AnxiousFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Worried slanted eyebrows */}
    <path d="M 6 6.5 L 9.5 8" />
    <path d="M 18 6.5 L 14.5 8" />
    {/* Wide worried dot eyes */}
    <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" />
    {/* Nervous sweat drop */}
    <path d="M 20.5 4.5 C 20.5 4.5 19.2 5.8 19.2 6.8 C 19.2 7.5 19.7 8 20.5 8 C 21.3 8 21.8 7.5 21.8 6.8 C 21.8 5.8 20.5 4.5 20.5 4.5 Z" fill="currentColor" stroke="none" />
    {/* Nervous wobbly mouth */}
    <path d="M 8 16 Q 10 14.5 12 16 Q 14 17.5 16 16" />
  </svg>
);

const OkayFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Neutral round dot eyes */}
    <circle cx="8" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="16" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
    {/* Straight calm mouth */}
    <path d="M 8.5 15.5 H 15.5" />
  </svg>
);

const CalmFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Peaceful curved resting eyes ⌒ ⌒ */}
    <path d="M 6 8.5 Q 8 6.5 10 8.5" />
    <path d="M 14 8.5 Q 16 6.5 18 8.5" />
    {/* Gentle serene smile */}
    <path d="M 8 15 Q 12 18.5 16 15" />
  </svg>
);

const GreatFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Joyful arched eyes ⌒ ⌒ (matching reference) */}
    <path d="M 6 8.5 C 6 6, 9.5 6, 9.5 8.5" />
    <path d="M 14.5 8.5 C 14.5 6, 18 6, 18 8.5" />
    {/* Wide happy upward smile (matching reference) */}
    <path d="M 6.5 13.5 C 6.5 20.5, 17.5 20.5, 17.5 13.5" />
  </svg>
);

const MOODS = [
  { id: 'stressed', label: 'Stressed', icon: StressedFace },
  { id: 'anxious', label: 'Anxious', icon: AnxiousFace },
  { id: 'okay', label: 'Okay', icon: OkayFace },
  { id: 'calm', label: 'Calm', icon: CalmFace },
  { id: 'great', label: 'Great', icon: GreatFace },
] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const W = 1000;
const H = 350;

// Perfectly Symmetric Quadratic arc moved down: P0 -> P1 (Apex control) -> P2
const P0 = [-30, 310];
const P1 = [500, 30];
const P2 = [1030, 310];

const at = (t: number): [number, number] => {
  const u = 1 - t;
  return [
    u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0],
    u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1],
  ];
};

const tangent = (t: number): [number, number] => {
  const u = 1 - t;
  return [
    2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]),
    2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]),
  ];
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export const HeaderHero: React.FC = () => {
  const { settings, selectedDate, currentMood, setMood } = useAppStore();

  const theme = settings.theme || 'green';

  const d = selectedDate ? new Date(selectedDate) : new Date();
  const hour = d.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const name = settings.userName || "Jay";
  const quote = "A focused day brings a calm & peaceful mind.";
  const today = (d.getDay() + 6) % 7; // Mon = 0
  const day = d.getDate();
  const monthYear = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'teal':
        return {
          bgImage: '/cyan-theme-bg.jpg',
          overlayGrad: 'from-[#04242b]/90 via-[#04242b]/35 to-[#04242b]/15',
          sideGrad: 'from-[#04242b]/40 via-transparent to-[#04242b]/25',
        };
      case 'blue':
        return {
          bgImage: '/blue-theme-bg.png',
          overlayGrad: 'from-[#061e38]/90 via-[#061e38]/35 to-[#061e38]/15',
          sideGrad: 'from-[#061e38]/40 via-transparent to-[#061e38]/25',
        };
      case 'monochrome':
        return {
          bgImage: '/monochrome-theme-bg.jpg',
          overlayGrad: 'from-[#0f172a]/90 via-[#0f172a]/35 to-[#0f172a]/15',
          sideGrad: 'from-[#0f172a]/40 via-transparent to-[#0f172a]/25',
        };
      case 'dark':
        return {
          bgImage: '/dark-theme-bg.jpg',
          overlayGrad: 'from-[#030712]/95 via-[#030712]/55 to-[#030712]/30',
          sideGrad: 'from-[#030712]/50 via-transparent to-[#030712]/30',
        };
      case 'green':
      default:
        return {
          bgImage: '/calm_landscape.jpg',
          overlayGrad: 'from-[#0e211d]/90 via-[#0e211d]/35 to-[#0e211d]/15',
          sideGrad: 'from-[#0e211d]/40 via-transparent to-[#0e211d]/25',
        };
    }
  }, [theme]);

  // Symmetrically spaced points along the parabolic arch
  const points = useMemo(
    () =>
      DAYS.map((label, i) => {
        const t = 0.08 + i * (0.84 / 6);
        const [x, y] = at(t);
        const [tx, ty] = tangent(t);
        const len = Math.hypot(tx, ty);
        const nx = -ty / len;
        const ny = tx / len;
        const flip = ny < 0 ? -1 : 1;
        return {
          label,
          t,
          x,
          y,
          lx: x + nx * flip * 38,
          ly: y + ny * flip * 38,
          angle: (Math.atan2(ty, tx) * 180) / Math.PI,
        };
      }),
    []
  );

  const knob = points[today] || points[3];
  const arcPath = `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
  const splitOffset = Math.max(0.05, Math.min(0.95, knob.t));

  return (
    <div className="relative w-full h-[350px] rounded-[28px] overflow-hidden select-none flex flex-col justify-between group shadow-soft transition-all">
      {/* Dynamic Serene Theme Background Image */}
      <img
        src={themeConfig.bgImage}
        alt="Theme hero landscape"
        key={themeConfig.bgImage}
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-all duration-700 ease-out"
      />

      {/* Atmospheric Soft Light & Mist Gradients */}
      <div className={`absolute inset-0 bg-gradient-to-t ${themeConfig.overlayGrad} pointer-events-none transition-colors duration-500`} />
      <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.sideGrad} pointer-events-none transition-colors duration-500`} />

      {/* Dynamic SVG Vector Arc Layer with Faded Edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
      >
        <defs>
          {/* Luminous Arc Gradient with 25-30% Primary overlay on White on the right */}
          <linearGradient id="calm-arch-glow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
            {/* Left Edge Fade */}
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="5%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="9%" stopColor="#FFFFFF" stopOpacity="1" />

            {/* Crisp luminous white up to active node */}
            <stop offset={`${Math.max(9, (splitOffset - 0.06) * 100)}%`} stopColor="#FFFFFF" stopOpacity="1" />

            {/* 25-30% Theme Primary Color on top of White Background */}
            <stop offset={`${Math.max(10, splitOffset * 100 + 3)}%`} stopColor="color-mix(in srgb, var(--color-primary) 28%, #FFFFFF)" stopOpacity="0.95" />

            {/* Right Edge Fade */}
            <stop offset="88%" stopColor="color-mix(in srgb, var(--color-primary) 28%, #FFFFFF)" stopOpacity="0.95" />
            <stop offset="94%" stopColor="color-mix(in srgb, var(--color-primary) 28%, #FFFFFF)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--color-primary) 28%, #FFFFFF)" stopOpacity="0" />
          </linearGradient>

          {/* Soft Drop Glow Filter for Active Node */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Symmetric Smooth Arc Path */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#calm-arch-glow)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Weekday Nodes along Arc */}
        {points.map((p, i) => {
          const isSelected = i === today;
          const isPast = i < today;

          return (
            <g key={p.label} className="pointer-events-auto cursor-pointer">
              {/* Active Day: Clean Ring Node (Theme center + Crisp white outer ring) */}
              {isSelected && (
                <>
                  {/* Outer soft diffuse glow halo */}
                  <circle cx={p.x} cy={p.y} r="28" fill="#FFFFFF" opacity="0.18" />
                  {/* Crisp ring node */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="16"
                    fill="var(--color-primary)"
                    stroke="#FFFFFF"
                    strokeWidth="4.5"
                    filter="url(#nodeGlow)"
                  />
                </>
              )}

              {/* Past Days: Soft White Node */}
              {isPast && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill="#FFFFFF"
                  opacity="0.95"
                />
              )}

              {/* Future Days (Right of current day): 25% Primary Color over White */}
              {!isSelected && !isPast && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill="color-mix(in srgb, var(--color-primary) 25%, #FFFFFF)"
                  opacity="0.95"
                />
              )}

              {/* Day Label */}
              <text
                x={p.lx}
                y={p.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${p.angle * 0.75} ${p.lx} ${p.ly})`}
                fill="#FFFFFF"
                opacity={isSelected ? 1 : isPast ? 0.95 : 0.8}
                style={{
                  font: isSelected
                    ? "600 20px var(--font-heading, 'Gilda Display', serif)"
                    : "400 18.5px var(--font-heading, 'Gilda Display', serif)"
                }}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Top Header: Greeting on Left & Clean Date on Right */}
      <div className="relative z-10 p-6 sm:p-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="m-0 text-white tracking-tight leading-tight text-[26px] sm:text-[30px] md:text-[34px] font-medium font-serif drop-shadow-sm">
            {greeting}, {name}
          </h2>

          <p className="m-0 mt-2 text-[13.5px] sm:text-[14.5px] text-white/90 font-light font-sans max-w-md drop-shadow-xs">
            “{quote}”
          </p>
        </div>

        {/* Clean Date Display */}
        <div className="text-right flex-shrink-0">
          <div className="text-white leading-none text-[42px] sm:text-[50px] md:text-[58px] font-serif drop-shadow-sm">
            {day}
            <sup className="text-[17px] sm:text-[19px] md:text-[22px] align-top relative -top-[4px] ml-[2px] font-light">
              {ordinal(day)}
            </sup>
          </div>
          <p className="mt-1.5 mb-0 text-[13px] sm:text-[14px] text-white/90 font-light font-sans tracking-wide whitespace-nowrap drop-shadow-xs">
            {monthYear.replace(" ", ", ")}
          </p>
        </div>
      </div>

      {/* Bottom Row: Lighter Glassmorphic Feeling Bar (Pure illustration faces) */}
      <div className="relative z-10 p-5 pb-6 flex items-center justify-center w-full">
        <div className="flex items-center bg-black/20 backdrop-blur-md border border-white/15 px-2.5 sm:px-3 py-1.5 rounded-full shadow-2xl transition-all">
          <span className="text-[12.5px] font-medium text-white/65 pl-2 pr-2.5 hidden sm:inline-block tracking-wide">
            Feeling:
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {MOODS.map((m, idx) => {
              const Icon = m.icon;
              const isSelected = currentMood === m.id;
              return (
                <React.Fragment key={m.id}>
                  {idx > 0 && !isSelected && currentMood !== MOODS[idx - 1].id && (
                    <div className="w-[1px] h-5 bg-white/15 hidden sm:block mx-0.5" />
                  )}
                  <button
                    onClick={() => setMood(m.id as any)}
                    className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-all duration-200 ${isSelected
                      ? 'bg-white text-[#15463D] shadow-xl'
                      : 'text-white/80'
                      }`}
                    title={m.label}
                    aria-label={m.label}
                  >
                    <Icon
                      size={isSelected ? 28 : 26}
                      className={isSelected ? 'text-[#15463D]' : 'text-white'}
                      strokeWidth={2.3}
                    />
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
