import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Zap, 
  CloudRain, 
  SunMedium, 
  Leaf, 
  Sparkles 
} from 'lucide-react';

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const W = 1000;
const H = 350;

// Quadratic arc: P0 -> P1 (control) -> P2
const P0 = [-20, 305];
const P1 = [500, 85];
const P2 = [1020, 305];

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

const MOODS = [
  { id: 'stressed', label: 'Stressed', icon: Zap },
  { id: 'anxious', label: 'Anxious', icon: CloudRain },
  { id: 'okay', label: 'Okay', icon: SunMedium },
  { id: 'calm', label: 'Calm', icon: Leaf },
  { id: 'great', label: 'Great', icon: Sparkles },
] as const;

export const HeaderHero: React.FC = () => {
  const { settings, selectedDate, currentMood, setMood } = useAppStore();

  const d = selectedDate ? new Date(selectedDate) : new Date();
  const hour = d.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const name = settings.userName || "Jay";
  const quote = "A focused day brings a calm & peaceful mind.";
  const today = (d.getDay() + 6) % 7; // Mon = 0
  const day = d.getDate();
  const monthYear = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const points = useMemo(
    () =>
      DAYS.map((label, i) => {
        const t = 0.095 + i * (0.81 / 6);
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
          tickA: [x + nx * flip * 3, y + ny * flip * 3],
          tickB: [x + nx * flip * 16, y + ny * flip * 16],
          lx: x + nx * flip * 36,
          ly: y + ny * flip * 36,
          angle: (Math.atan2(ty, tx) * 180) / Math.PI,
        };
      }),
    []
  );

  const knob = points[today] || points[3];
  const arc = `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
  const fadeStart = Math.max(0, (knob.x - 130) / W);
  const fadeEnd = Math.min(1, (knob.x + 10) / W);

  return (
    <div className="relative w-full h-[350px] rounded-[28px] overflow-hidden select-none shadow-soft flex flex-col justify-between border border-[rgba(36,88,76,0.08)] group">
      {/* Serene Watercolor Mountain Background Image */}
      <img
        src="/calm_landscape.jpg"
        alt="Serene landscape"
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
      />

      {/* Atmospheric Soft Light & Mist Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e211d]/90 via-[#0e211d]/35 to-[#0e211d]/15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e211d]/40 via-transparent to-[#0e211d]/25 pointer-events-none" />

      {/* Dynamic SVG Vector Arc Layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="calm-arc-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset={fadeStart} stopColor="#FFFFFF" />
            <stop offset={fadeEnd} stopColor="#78C2AD" />
            <stop offset="1" stopColor="#5EAB96" />
          </linearGradient>
        </defs>

        {/* Refined Smooth Arc Stroke */}
        <path d={arc} fill="none" stroke="url(#calm-arc-grad)" strokeWidth="5.5" strokeLinecap="round" />

        {/* Ticks + Refined Serif Weekday Labels */}
        {points.map((p, i) => (
          <g key={p.label} className="pointer-events-auto cursor-pointer">
            <line
              x1={p.tickA[0]}
              y1={p.tickA[1]}
              x2={p.tickB[0]}
              y2={p.tickB[1]}
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity={i === today ? 1 : 0.6}
            />
            <text
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${p.angle} ${p.lx} ${p.ly})`}
              fill="#FFFFFF"
              opacity={i === today ? 1 : 0.75}
              style={{ font: "500 18px 'Lora', Georgia, serif" }}
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Refined Active Day Knob */}
        <circle cx={knob.x} cy={knob.y} r="14" fill="#FFFFFF" />
        <circle cx={knob.x} cy={knob.y} r="24" fill="#FFFFFF" opacity=".25" />
      </svg>

      {/* Top Header: Greeting on Left & Clean Date on Right (No Box) */}
      <div className="relative z-10 p-6 sm:p-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pr-2">
          <h2
            className="m-0 text-white tracking-tight leading-tight text-[26px] sm:text-[30px] md:text-[34px] font-medium"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {greeting}, {name}
          </h2>

          <p className="m-0 mt-2 text-[13.5px] sm:text-[14.5px] text-white/85 font-light font-sans max-w-md">
            “{quote}”
          </p>
        </div>

        {/* Clean Date Display without box */}
        <div className="text-right flex-shrink-0">
          <div
            className="text-white leading-none text-[42px] sm:text-[50px] md:text-[58px]"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {day}
            <sup className="text-[17px] sm:text-[19px] md:text-[22px] align-top relative -top-[4px] ml-[2px] font-light">
              {ordinal(day)}
            </sup>
          </div>
          <p className="mt-1.5 mb-0 text-[13px] sm:text-[14px] text-white/85 font-light font-sans tracking-wide whitespace-nowrap">
            {monthYear.replace(" ", ", ")}
          </p>
        </div>
      </div>

      {/* Bottom Row: Center-aligned Feelings Pill Bar with clean vector icons */}
      <div className="relative z-10 p-6 pb-6 flex items-center justify-center w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0c1e1a]/70 p-1.5 rounded-full shadow-lg border border-white/10">
          <span className="text-[12px] font-medium text-white/75 pl-3 pr-1.5 hidden sm:inline-block">
            Feeling:
          </span>
          {MOODS.map((m) => {
            const Icon = m.icon;
            const isSelected = currentMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMood(m.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-white text-[#122824] font-semibold shadow-xs scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/15'
                }`}
                title={m.label}
              >
                <Icon 
                  size={15} 
                  className={isSelected ? 'text-primary' : 'text-white/80'} 
                  strokeWidth={isSelected ? 2.3 : 2}
                />
                <span className="text-[12px]">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
