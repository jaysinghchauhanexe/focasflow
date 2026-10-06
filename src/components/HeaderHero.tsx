import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
interface FaceProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  isActive?: boolean;
}

const StressedFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3, isActive = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`${className} ${isActive ? 'animate-face-stressed' : 'group-hover:animate-face-stressed'}`}
  >
    {/* Tense squinting eyes > < with vibrating twitch */}
    <path d="M 6 7.5 L 9 9.5 L 6 11.5" className={isActive ? 'animate-pulse' : ''} />
    <path d="M 18 7.5 L 15 9.5 L 18 11.5" className={isActive ? 'animate-pulse' : ''} />
    {/* Tense zig-zag stress mouth */}
    <path d="M 7 16.5 Q 9.5 14 12 16.5 Q 14.5 19 17 16.5" />
  </svg>
);

const AnxiousFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3, isActive = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`${className} ${isActive ? 'animate-face-anxious' : 'group-hover:animate-face-anxious'}`}
  >
    {/* Worried slanted eyebrows */}
    <path d="M 6 6.5 L 9.5 8" />
    <path d="M 18 6.5 L 14.5 8" />
    {/* Wide worried dot eyes */}
    <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" className={isActive ? 'animate-pulse' : ''} />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" className={isActive ? 'animate-pulse' : ''} />
    {/* Animated dripping/pulsing sweat drop */}
    <g className={isActive ? 'animate-sweat-drip' : 'group-hover:animate-sweat-drip'}>
      <path d="M 20.5 4.5 C 20.5 4.5 19.2 5.8 19.2 6.8 C 19.2 7.5 19.7 8 20.5 8 C 21.3 8 21.8 7.5 21.8 6.8 C 21.8 5.8 20.5 4.5 20.5 4.5 Z" fill="currentColor" stroke="none" />
    </g>
    {/* Nervous wobbly mouth */}
    <path d="M 8 16 Q 10 14.5 12 16 Q 14 17.5 16 16" />
  </svg>
);

const OkayFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3, isActive = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`${className}`}
  >
    {/* Neutral round dot eyes with periodic soft blink */}
    <g className={isActive ? 'animate-face-okay' : 'group-hover:animate-face-okay'}>
      <circle cx="8" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
    </g>
    {/* Straight calm mouth */}
    <path d="M 8.5 15.5 H 15.5" />
  </svg>
);

const CalmFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3, isActive = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`${className} ${isActive ? 'animate-face-calm' : 'group-hover:animate-face-calm'}`}
  >
    {/* Peaceful curved resting eyes ⌒ ⌒ */}
    <path d="M 6 8.5 Q 8 6.5 10 8.5" />
    <path d="M 14 8.5 Q 16 6.5 18 8.5" />
    {/* Gentle serene smile */}
    <path d="M 8 15 Q 12 18.5 16 15" />
  </svg>
);

const GreatFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.3, isActive = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`${className} ${isActive ? 'animate-face-great' : 'group-hover:animate-face-great'}`}
  >
    {/* Joyful arched eyes ⌒ ⌒ */}
    <path d="M 6 8.5 C 6 6, 9.5 6, 9.5 8.5" />
    <path d="M 14.5 8.5 C 14.5 6, 18 6, 18 8.5" />
    {/* Wide happy upward smile */}
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

// Symmetrically spaced points along the parabolic arch
const P0 = [-45, 315];
const P1 = [500, 25];
const P2 = [1045, 315];

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
  const { settings, selectedDate, currentMood, setMood, openMoodModal } = useAppStore();
  const moodTimerRef = React.useRef<any>(null);

  const handleSelectMood = (moodId: any) => {
    setMood(moodId);
    if (moodTimerRef.current) {
      clearTimeout(moodTimerRef.current);
    }
    // Check if user has enabled mood-adaptive insight pop-up notifications in preferences
    const isPopupEnabled = settings.preferences?.enableMoodInsightPopups ?? true;
    if (isPopupEnabled) {
      moodTimerRef.current = setTimeout(() => {
        openMoodModal();
      }, 2000);
    }
  };

  React.useEffect(() => {
    return () => {
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, []);

  const theme = settings.theme || 'green';
  const isDark = theme === 'dark';

  const d = selectedDate ? new Date(selectedDate) : new Date();
  const currentHour = new Date().getHours();

  const timeOfDay = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 17) return 'afternoon';
    if (currentHour >= 17 && currentHour < 21) return 'evening';
    return 'night';
  }, [currentHour]);

  const greeting = useMemo(() => {
    switch (timeOfDay) {
      case 'morning':
        return 'Good Morning';
      case 'afternoon':
        return 'Good Afternoon';
      case 'evening':
        return 'Good Evening';
      case 'night':
      default:
        return 'Good Night';
    }
  }, [timeOfDay]);

  const quote = useMemo(() => {
    if (currentMood === 'stressed') {
      return 'Breathe deeply. You do not have to carry everything all at once.';
    }
    if (currentMood === 'anxious') {
      return 'One peaceful step at a time. What single outcome matters most right now?';
    }
    if (currentMood === 'great') {
      return 'High clarity & wonderful energy. Ride this wave into your key milestones!';
    }
    if (currentMood === 'calm') {
      return 'Centered mind, steady momentum. Maintain your serene, mindful rhythm.';
    }
    switch (timeOfDay) {
      case 'morning':
        return 'A focused morning brings a calm & intentional day.';
      case 'afternoon':
        return 'Maintain steady momentum with mindful flow.';
      case 'evening':
        return 'Reflect gently on the progress made today.';
      case 'night':
      default:
        return 'Rest deeply to restore your energy for tomorrow.';
    }
  }, [timeOfDay, currentMood]);

  const name = settings.userName || "Jay";
  const today = (d.getDay() + 6) % 7; // Mon = 0
  const day = d.getDate();
  const monthYear = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'teal':
        return {
          bgImage: '/cyan-theme-bg.jpg',
          overlayGrad: 'from-white/60 via-white/30 to-white/10',
          sideGrad: 'from-white/30 via-transparent to-white/20',
        };
      case 'blue':
        return {
          bgImage: '/blue-theme-bg.png',
          overlayGrad: 'from-white/60 via-white/30 to-white/10',
          sideGrad: 'from-white/30 via-transparent to-white/20',
        };
      case 'monochrome':
        return {
          bgImage: '/monochrome-theme-bg.jpg',
          overlayGrad: 'from-white/60 via-white/30 to-white/10',
          sideGrad: 'from-white/30 via-transparent to-white/20',
        };
      case 'dark':
        return {
          bgImage: '/dark-theme-bg.jpg',
          overlayGrad: 'from-black/70 via-black/30 to-transparent',
          sideGrad: 'from-black/40 via-transparent to-black/25',
        };
      case 'green':
      default:
        return {
          bgImage: '/calm_landscape.jpg',
          overlayGrad: 'from-white/60 via-white/30 to-white/10',
          sideGrad: 'from-white/30 via-transparent to-white/20',
        };
    }
  }, [theme]);

  // Symmetrically spaced points along the parabolic arch
  const points = useMemo(
    () =>
      DAYS.map((label, i) => {
        const t = 0.075 + i * (0.85 / 6);
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
          lx: x + nx * flip * 43,
          ly: y + ny * flip * 43,
          angle: (Math.atan2(ty, tx) * 180) / Math.PI,
        };
      }),
    []
  );

  const knob = points[today] || points[3];
  const arcPath = `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
  const splitOffset = Math.max(0.05, Math.min(0.95, knob.t));

  return (
    <div className={`relative w-full h-[350px] bg-card rounded-[28px] overflow-hidden select-none flex flex-col justify-between group transition-all ${isDark ? 'border border-white/10 shadow-2xl' : 'border border-borderToken/40'
      }`}>
      {/* Dynamic Serene Theme Background Image */}
      <img
        src={themeConfig.bgImage}
        alt="Theme hero landscape"
        key={themeConfig.bgImage}
        className={`absolute inset-0 w-full h-full object-cover object-center transform scale-[1.08] transition-opacity duration-700 ease-out ${isDark ? 'opacity-95' : 'opacity-90'
          }`}
      />

      {/* Atmospheric Ambient Gradients */}
      <div className={`absolute inset-0 bg-gradient-to-t ${themeConfig.overlayGrad} pointer-events-none transition-colors duration-500`} />
      <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.sideGrad} pointer-events-none transition-colors duration-500`} />

      {/* Dynamic SVG Vector Arc Layer with Faded Edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
      >
        <defs>
          {/* Arc Gradient in Theme Dark Primary Tone or Luminous Sky Blue for Dark Theme */}
          <linearGradient id="calm-arch-glow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
            {/* Left Edge Fade */}
            <stop offset="0%" stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity="0" />
            <stop offset="4%" stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity="0.95" />
            <stop offset="8%" stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity="1" />

            {/* Deep Theme Primary Color up to active node */}
            <stop offset={`${Math.max(8, (splitOffset - 0.04) * 100)}%`} stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity="1" />

            {/* Future trail - distinctly visible */}
            <stop offset={`${Math.max(9, splitOffset * 100 + 2)}%`} stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity={isDark ? "0.68" : "0.62"} />

            {/* Right Edge Fade */}
            <stop offset="90%" stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity={isDark ? "0.68" : "0.62"} />
            <stop offset="96%" stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity={isDark ? "0.35" : "0.28"} />
            <stop offset="100%" stopColor={isDark ? "#38BDF8" : "var(--color-primary)"} stopOpacity="0" />
          </linearGradient>

          {/* Soft Drop Glow Filter for Active Node */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation={isDark ? 5 : 3} floodColor={isDark ? "#38BDF8" : "var(--color-primary)"} floodOpacity={isDark ? "0.6" : "0.35"} />
          </filter>
        </defs>

        {/* Symmetric Smooth Arc Path */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#calm-arch-glow)"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Weekday Nodes along Arc */}
        {points.map((p, i) => {
          const isSelected = i === today;
          const isPast = i < today;

          return (
            <g key={p.label} className="pointer-events-auto cursor-pointer">
              {/* Active Day: Clean Ring Node */}
              {isSelected && (
                <>
                  {/* Outer soft diffuse halo */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="32"
                    fill={isDark ? "#38BDF8" : "var(--color-primary)"}
                    opacity={isDark ? 0.35 : 0.22}
                  />
                  {/* Crisp ring node */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="19"
                    fill={isDark ? "#0E7490" : "var(--color-primary)"}
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    filter="url(#nodeGlow)"
                  />
                </>
              )}

              {/* Past Days: Solid Primary Node with white accent border */}
              {isPast && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="13.5"
                  fill={isDark ? "#38BDF8" : "var(--color-primary)"}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  opacity="1"
                />
              )}

              {/* Future Days: Distinct Node with white rim */}
              {!isSelected && !isPast && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="13"
                  fill={isDark ? "rgba(56, 189, 248, 0.45)" : "var(--color-primary)"}
                  stroke={isDark ? "rgba(255, 255, 255, 0.75)" : "#FFFFFF"}
                  strokeWidth="3"
                  opacity={isDark ? 0.92 : 0.8}
                />
              )}

              {/* Day Label in Clean Typography */}
              <text
                x={p.lx}
                y={p.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${p.angle * 0.75} ${p.lx} ${p.ly})`}
                fill={isDark ? "#FFFFFF" : "var(--color-text)"}
                opacity={isSelected ? 1 : 0.9}
                style={{
                  fontFamily: "'Gilda Display', serif",
                  fontSize: isSelected ? '24px' : '22px',
                  fontWeight: isSelected ? 600 : 400,
                  textShadow: isDark ? '0 1px 4px rgba(0,0,0,0.6)' : 'none',
                }}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Top Header: Greeting on Left & Date on Right */}
      <div className="relative z-10 p-6 sm:p-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pr-2">
          <h2 className={`m-0 tracking-tight leading-tight text-[26px] sm:text-[30px] md:text-[34px] font-medium font-serif ${isDark ? 'text-white drop-shadow-sm' : 'text-foreground'
            }`}>
            {greeting}, {name}
          </h2>

          <p className={`m-0 mt-2 text-[13.5px] sm:text-[14.5px] font-light font-sans max-w-md ${isDark ? 'text-white/80' : 'text-textSecondary'
            }`}>
            “{quote}”
          </p>
        </div>

        {/* Clean Date Display */}
        <div className="text-right flex-shrink-0">
          <div className={`leading-none text-[42px] sm:text-[50px] md:text-[58px] font-serif ${isDark ? 'text-white' : 'text-foreground'
            }`}>
            {day}
            <sup className={`text-[17px] sm:text-[19px] md:text-[22px] align-top relative -top-[4px] ml-[2px] font-light ${isDark ? 'text-white/75' : 'text-textSecondary'
              }`}>
              {ordinal(day)}
            </sup>
          </div>
          <p className={`mt-1.5 mb-0 text-[13px] sm:text-[14px] font-light font-sans tracking-wide whitespace-nowrap ${isDark ? 'text-white/80' : 'text-textSecondary'
            }`}>
            {monthYear.replace(" ", ", ")}
          </p>
        </div>
      </div>

      {/* Bottom Row: Glassmorphic Feeling Bar (Clean, Zero Layout Shift) */}
      <div className="relative z-10 p-5 pb-6 flex items-center justify-center w-full">
        <div className={`flex items-center px-3 py-1.5 rounded-full transition-colors backdrop-blur-md ${isDark
            ? 'bg-black/60 border border-white/15 shadow-xl'
            : 'bg-card/90 border border-borderToken shadow-sm'
          }`}>
          <span className={`text-[12.5px] font-medium pl-1 pr-3 hidden sm:inline-block tracking-wide select-none ${isDark ? 'text-white/70' : 'text-mutedText'
            }`}>
            Feeling:
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const isSelected = currentMood === m.id;
              const areAnimationsEnabled = settings.preferences?.enableMoodFaceAnimations ?? true;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMood(m.id)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center rounded-full transition-spring cursor-pointer group ${isSelected
                      ? isDark
                        ? 'bg-white text-black shadow-lg scale-105'
                        : 'bg-primary text-white shadow-md scale-105'
                      : isDark
                        ? 'text-white/75 hover:text-white hover:bg-white/15'
                        : 'text-textSecondary hover:text-foreground hover:bg-card-subtle'
                    }`}
                  title={m.label}
                  aria-label={m.label}
                >
                  <Icon
                    key={`${m.id}-${isSelected ? 'active' : 'idle'}`}
                    size={24}
                    isActive={areAnimationsEnabled ? isSelected : false}
                    className={
                      isSelected
                        ? isDark
                          ? 'text-black'
                          : 'text-white'
                        : isDark
                          ? 'text-white/80 group-hover:text-white'
                          : 'text-textSecondary group-hover:text-foreground'
                    }
                    strokeWidth={2.3}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
