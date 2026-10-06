import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const W = 1000;
const H = 350;

// Quadratic arc: P0 -> P1 (control) -> P2
const P0 = [-20, 305];
const P1 = [500, 75];
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

export const HeaderHero: React.FC = () => {
  const { settings, selectedDate } = useAppStore();

  const d = selectedDate ? new Date(selectedDate) : new Date();
  const hour = d.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const name = settings.userName || "Jay";
  const quote = "A focused day brings calmer mind.";
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
        const ny = tx / len; // normal pointing downwards
        const flip = ny < 0 ? -1 : 1;
        return {
          label,
          t,
          x,
          y,
          tickA: [x + nx * flip * 3, y + ny * flip * 3],
          tickB: [x + nx * flip * 17, y + ny * flip * 17],
          lx: x + nx * flip * 38,
          ly: y + ny * flip * 38,
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
    <div className="relative w-full h-[350px] rounded-[26px] overflow-hidden text-white select-none shadow-soft flex flex-col justify-between">
      {/* Mountain Background Image */}
      <img
        src="/mountainbg.png"
        alt="Mountain landscape background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Atmospheric Darkening Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#041d22]/90 via-[#041d22]/30 to-[#041d22]/10 pointer-events-none" />

      {/* Dynamic SVG Vector Arc Layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wac-arc-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
            <stop offset="0" stopColor="#fff" />
            <stop offset={fadeStart} stopColor="#fff" />
            <stop offset={fadeEnd} stopColor="#4fb3bd" />
            <stop offset="1" stopColor="#3fa0ab" />
          </linearGradient>
        </defs>

        {/* Refined Balanced Arc Stroke */}
        <path d={arc} fill="none" stroke="url(#wac-arc-grad)" strokeWidth="6" strokeLinecap="round" />

        {/* Ticks + Refined Serif Labels */}
        {points.map((p, i) => (
          <g key={p.label} className="pointer-events-auto cursor-pointer">
            {/* Tick Mark */}
            <line
              x1={p.tickA[0]}
              y1={p.tickA[1]}
              x2={p.tickB[0]}
              y2={p.tickB[1]}
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={i === today ? 1 : 0.65}
            />
            {/* Weekday Name in Refined Serif Typography */}
            <text
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${p.angle} ${p.lx} ${p.ly})`}
              fill="#fff"
              opacity={i === today ? 1 : 0.8}
              style={{ font: "400 20px 'Lora', Georgia, serif" }}
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* Refined Active Day Knob */}
        <circle cx={knob.x} cy={knob.y} r="16" fill="#fff" />
        <circle cx={knob.x} cy={knob.y} r="26" fill="#fff" opacity=".22" />
      </svg>

      {/* Top Header: Greeting on Left & Date on Right via Responsive Flexbox */}
      <div className="relative z-10 p-6 md:p-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pr-2">
          <h2
            className="m-0 text-white tracking-tight leading-tight text-[24px] sm:text-[28px] md:text-[34px] truncate sm:whitespace-normal"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {greeting} {name}
          </h2>
          <p className="m-0 mt-3 md:mt-5 text-[13px] sm:text-[14px] text-white/80 font-light font-sans truncate sm:whitespace-normal">
            “{quote}”
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div
            className="text-white leading-none text-[40px] sm:text-[50px] md:text-[60px]"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {day}
            <sup className="text-[18px] sm:text-[20px] md:text-[24px] align-top relative -top-[4px] ml-[2px] font-light">
              {ordinal(day)}
            </sup>
          </div>
          <p className="mt-1 sm:mt-1.5 mb-0 text-[12px] sm:text-[13px] md:text-[14px] text-white/80 font-light font-sans tracking-wide whitespace-nowrap">
            {monthYear.replace(" ", ", ")}
          </p>
        </div>
      </div>
    </div>
  );
};
