import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { LOFI_STATIONS, LOFI_STATION_LIST } from '../engine/lofiStations';
import {
  Play,
  Pause,
  AlertCircle,
  Flag,
  Calendar,
  Check,
  Leaf,
  Headphones,
  Zap,
  Coffee,
  Volume2,
  Volume1,
  VolumeX
} from 'lucide-react';

const stationIcons: Record<string, any> = {
  study: Headphones,
  work: Zap,
  coffee: Coffee,
};

/* Dynamic Time-of-Day Serene Sky Illustration (Morning, Afternoon, Evening/Sunset, Night) */
export const DiurnalSkyIllustration: React.FC<{ className?: string; svgClassName?: string }> = ({
  className = '',
  svgClassName = 'w-[190px] sm:w-[220px] h-[72px]',
}) => {
  const hour = new Date().getHours();

  const timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' =
    hour >= 5 && hour < 12 ? 'morning' :
      hour >= 12 && hour < 17 ? 'afternoon' :
        hour >= 17 && hour < 21 ? 'evening' : 'night';

  return (
    <div
      className={`relative select-none pointer-events-none flex items-center overflow-visible transition-all duration-700 ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 22%, black 72%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 82%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 22%, black 72%, transparent 100%)',
        maskComposite: 'intersect',
        WebkitMaskComposite: 'destination-in',
      }}
    >
      <svg
        viewBox="0 -18 240 103"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${svgClassName} overflow-visible`}
      >
        <defs>
          {/* Layer Blur Atmospheric Filters for Spreading Shine */}
          <filter id="atmosphericSpread" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="softRayBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>

          {/* Spreading Radial Glows for Natural Atmospheric Diffusion (Muted & Desaturated) */}
          <radialGradient id="morningSpreadGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.2" />
            <stop offset="75%" stopColor="#FDE68A" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="afternoonSpreadGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.2" />
            <stop offset="75%" stopColor="#FEF08A" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="eveningSpreadGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.48" />
            <stop offset="40%" stopColor="#FDBA74" stopOpacity="0.22" />
            <stop offset="75%" stopColor="#FB923C" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="nightSpreadGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
          </radialGradient>

          {/* Morning Sunrise Core (Pastel Warm Amber) */}
          <linearGradient id="morningSun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.8" />
          </linearGradient>

          {/* Afternoon Radiant Sun Core (Soft Warm Cream) */}
          <linearGradient id="afternoonSun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.8" />
          </linearGradient>

          {/* Evening Sunset Core (Soft Peach Amber) */}
          <linearGradient id="eveningSun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.92" />
            <stop offset="50%" stopColor="#FDBA74" stopOpacity="0.84" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0.75" />
          </linearGradient>

          {/* Night Moon Glow */}
          <linearGradient id="nightMoon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.4" />
          </linearGradient>

          {/* Mountain Gradient Layers */}
          <linearGradient id="mountBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={timeOfDay === 'night' ? '0.35' : '0.24'} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="mountMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={timeOfDay === 'night' ? '0.55' : '0.45'} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="mountFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={timeOfDay === 'night' ? '0.85' : '0.72'} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.16" />
          </linearGradient>
        </defs>

        {/* TIME SPECIFIC CELESTIAL BODIES WITH GENTLE LAYER BLUR */}
        {timeOfDay === 'morning' && (
          <>
            {/* Subtle Atmospheric Layer Blur */}
            <circle cx="106" cy="36" r="46" fill="url(#morningSpreadGlow)" filter="url(#atmosphericSpread)" opacity="0.8" />
            <circle cx="106" cy="36" r="28" fill="url(#morningSpreadGlow)" filter="url(#softRayBlur)" opacity="0.8" />
            {/* Morning Sun Core */}
            <circle cx="106" cy="36" r="18" fill="url(#morningSun)" />
            {/* Morning Birds */}
            <path d="M 128 17 Q 132 13 136 17 Q 140 13 144 17" stroke="var(--color-primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d="M 144 25 Q 147 22 150 25 Q 153 22 156 25" stroke="var(--color-primary)" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.6" />
          </>
        )}

        {timeOfDay === 'afternoon' && (
          <>
            {/* Subtle Atmospheric Layer Blur */}
            <circle cx="120" cy="22" r="46" fill="url(#afternoonSpreadGlow)" filter="url(#atmosphericSpread)" opacity="0.8" />
            <circle cx="120" cy="22" r="28" fill="url(#afternoonSpreadGlow)" filter="url(#softRayBlur)" opacity="0.8" />
            {/* High Afternoon Sun Core */}
            <circle cx="120" cy="22" r="17" fill="url(#afternoonSun)" />
            {/* Drifting Clouds */}
            <path d="M 45 22 Q 52 14 62 18 Q 72 14 80 20 Q 84 25 76 28 L 48 28 Z" fill="rgba(255, 255, 255, 0.45)" />
            <path d="M 155 16 Q 162 10 170 14 Q 178 11 184 16 L 158 20 Z" fill="rgba(255, 255, 255, 0.35)" />
            {/* Soaring Bird */}
            <path d="M 96 14 Q 100 10 104 14 Q 108 10 112 14" stroke="var(--color-primary)" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.6" />
          </>
        )}

        {timeOfDay === 'evening' && (
          <>
            {/* Subtle Atmospheric Sunset Layer Blur */}
            <circle cx="110" cy="42" r="48" fill="url(#eveningSpreadGlow)" filter="url(#atmosphericSpread)" opacity="0.8" />
            <circle cx="110" cy="42" r="30" fill="url(#eveningSpreadGlow)" filter="url(#softRayBlur)" opacity="0.8" />
            {/* Evening Sunset Sun Core dipping low */}
            <circle cx="110" cy="42" r="19" fill="url(#eveningSun)" />
            {/* Evening Birds Flying Home */}
            <path d="M 138 20 Q 142 16 146 20 Q 150 16 154 20" stroke="var(--color-primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 152 28 Q 155 25 158 28 Q 161 25 164 28" stroke="var(--color-primary)" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.65" />
            <path d="M 166 22 Q 169 19 172 22 Q 175 19 178 22" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
          </>
        )}

        {timeOfDay === 'night' && (
          <>
            {/* Spreading Lunar Atmosphere Blur */}
            <circle cx="120" cy="25" r="42" fill="url(#nightSpreadGlow)" filter="url(#atmosphericSpread)" />
            {/* Crescent Moon */}
            <path
              d="M 115 15 A 15 15 0 0 0 128 35 A 13 13 0 1 1 115 15 Z"
              fill="url(#nightMoon)"
              filter="drop-shadow(0 0 5px rgba(255,255,255,0.45))"
            />
            {/* Twinkling Stars */}
            <circle cx="48" cy="18" r="1.3" fill="#FFFFFF" opacity="0.85" className="animate-pulse" />
            <circle cx="75" cy="28" r="1.1" fill="#FFFFFF" opacity="0.7" style={{ animationDelay: '0.4s' }} className="animate-pulse" />
            <circle cx="150" cy="14" r="1.4" fill="#FFFFFF" opacity="0.9" style={{ animationDelay: '0.8s' }} className="animate-pulse" />
            <circle cx="178" cy="24" r="1" fill="#FFFFFF" opacity="0.75" style={{ animationDelay: '1.2s' }} className="animate-pulse" />
            <circle cx="196" cy="16" r="1.2" fill="#FFFFFF" opacity="0.85" style={{ animationDelay: '0.6s' }} className="animate-pulse" />
            <circle cx="92" cy="12" r="1" fill="#FFFFFF" opacity="0.6" style={{ animationDelay: '1s' }} className="animate-pulse" />
          </>
        )}

        {/* Background Mountain Layer */}
        <path d="M 0 85 L 0 58 Q 40 28 80 52 T 165 44 L 240 66 L 240 85 Z" fill="url(#mountBack)" />

        {/* Middle Mountain Layer */}
        <path d="M 10 85 L 48 52 Q 82 28 116 54 T 195 46 L 240 72 L 240 85 Z" fill="url(#mountMid)" />

        {/* Foreground Mountain Layer with crisp peaks */}
        <path d="M 25 85 L 68 42 L 92 58 L 126 32 L 158 62 L 186 48 L 225 78 L 240 85 Z" fill="url(#mountFront)" />
      </svg>
    </div>
  );
};

/* Corner Wave Organic Blob for bottom metric cards */
const CornerBlob: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 80"
    fill="currentColor"
    className={`absolute -right-1 -bottom-1 w-20 h-16 pointer-events-none ${className}`}
  >
    <path d="M 0 80 Q 30 20 70 35 T 100 0 L 100 80 Z" />
  </svg>
);

export const ProductivitySummary: React.FC = () => {
  const {
    tasks,
    selectedDate,
    getDayCapacity,
    openOverloadModal,
    activeLofiStation,
    isPlayingLofi,
    toggleLofi,
    setLofiStation,
    lofiVolume,
    setLofiVolume,
    navigateToTasks
  } = useAppStore();

  const capacity = getDayCapacity();

  const actualFocusedMinutes = capacity.actualFocusedMinutes || 0;
  const completedTasksDuration = tasks
    .filter((t) => t.status === 'completed' && (t.scheduledDate === selectedDate || !t.scheduledDate))
    .reduce((acc, t) => acc + (t.duration || 30), 0);
  const totalPlannedForDay = (capacity.totalPlannedMinutes || 0) + completedTasksDuration;

  const focusPercent = totalPlannedForDay > 0
    ? Math.min(100, Math.round((actualFocusedMinutes / totalPlannedForDay) * 100))
    : (actualFocusedMinutes > 0 ? 100 : 0);

  const trackRef = React.useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = React.useState<number>(300);

  React.useEffect(() => {
    if (!trackRef.current) return;
    const updateWidth = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.offsetWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  const targetBarWidth = actualFocusedMinutes === 0
    ? 26
    : Math.max(26, Math.min(100, focusPercent));

  // Ultra-Smooth Jitter-Free Animations
  const [isBarExpanded, setIsBarExpanded] = React.useState(false);
  const [animatedPercent, setAnimatedPercent] = React.useState(0);
  const [animatedFocusMins, setAnimatedFocusMins] = React.useState(0);

  React.useEffect(() => {
    // 1. Trigger hardware-accelerated CSS bar expansion on next frame
    const expandTimer = setTimeout(() => {
      setIsBarExpanded(true);
    }, 50);

    // 2. Smooth Quintic Ease-Out Number Count-Up
    let startTimestamp: number | null = null;
    const duration = 1300; // 1.3s synchronized with CSS transition

    let prevPercent = -1;
    let prevMins = -1;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Quintic ease out for silky deceleration
      const ease = 1 - Math.pow(1 - progress, 4);

      const nextPercent = Math.round(focusPercent * ease);
      const nextMins = Math.round(actualFocusedMinutes * ease);

      if (nextPercent !== prevPercent) {
        setAnimatedPercent(nextPercent);
        prevPercent = nextPercent;
      }
      if (nextMins !== prevMins) {
        setAnimatedFocusMins(nextMins);
        prevMins = nextMins;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animFrame = requestAnimationFrame(step);

    return () => {
      clearTimeout(expandTimer);
      cancelAnimationFrame(animFrame);
    };
  }, [actualFocusedMinutes, focusPercent]);

  const animHours = Math.floor(animatedFocusMins / 60);
  const animMins = animatedFocusMins % 60;
  const focusTimeString = `${animHours}h ${animMins > 0 ? `${animMins < 10 ? `0${animMins}` : animMins}m` : '00m'}`;

  // Task metrics
  const remainingCount = capacity.remainingTasksCount || 0;
  const importantCount = capacity.importantTasksCount;
  const regularCount = capacity.regularTasksCount;
  const completedCount = capacity.completedTasksCount;

  const currentStation = LOFI_STATIONS[activeLofiStation] || LOFI_STATIONS.study;

  return (
    <div className="w-full min-h-[350px] bg-card rounded-[28px] p-4 sm:p-5 md:p-6 shadow-soft select-none flex flex-col justify-between gap-3 sm:gap-3.5 relative overflow-hidden transition-colors">

      {/* 1. TOP ROW: Counter + Adaptive Sunset Illustration + Responsive Daily Focus Capacity */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Outcomes Remaining + Fading Sunset Illustration */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 flex-shrink-0">
          <div
            onClick={() => navigateToTasks({ status: 'pending' })}
            className="flex-shrink-0 cursor-pointer group/counter transition-transform hover:scale-105 active:scale-95"
            title="Click to view pending outcomes in My Tasks"
          >
            <div className="flex items-baseline leading-none">
              <span className="text-foreground tracking-tight text-[38px] sm:text-[46px] md:text-[50px] font-serif font-medium group-hover/counter:text-primary transition-colors">
                {remainingCount}
              </span>
              <span className="text-[15px] sm:text-[18px] font-normal text-textSecondary font-sans ml-1.5">
                left
              </span>
            </div>
            <p className="text-[12px] sm:text-[12.5px] text-mutedText font-normal mt-0.5 sm:mt-1 tracking-tight whitespace-nowrap">
              Today's Outcomes
            </p>
          </div>

          {/* Dynamic Sky Illustration (Morning, Afternoon, Evening/Sunset, Night) */}
          <DiurnalSkyIllustration className="hidden xl:flex flex-shrink min-w-0" />
        </div>

        {/* Right: Daily Focus Capacity Card */}
        <div className="bg-background rounded-[22px] p-2.5 sm:p-3 md:p-3.5 flex flex-col justify-center flex-1 sm:max-w-[340px] transition-colors">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2 px-1">
            <span className="text-[12.5px] sm:text-[13px] font-medium text-foreground tracking-tight">
              Daily Focus
            </span>
            {capacity.isOverloaded && (
              <span
                onClick={openOverloadModal}
                className="text-[11px] font-semibold text-tag-important flex items-center gap-1 cursor-pointer hover:underline"
              >
                <AlertCircle size={12} />
                <span>Overloaded</span>
              </span>
            )}
          </div>

          {/* Full-Pill Track with Wave Silk Texture & Dual-Layer Revealed Typography */}
          <div 
            ref={trackRef}
            className="w-full h-[40px] sm:h-[44px] rounded-full bg-primary-soft p-0.5 relative overflow-hidden select-none"
          >
            {/* 1. Base Layer (Visible when progress is unfilled: text in primary theme color) */}
            <div className="w-full h-full flex items-center justify-between pl-3.5 sm:pl-4 pr-3.5 sm:pr-4">
              <span 
                className="text-[12.5px] sm:text-[13.5px] font-sans font-medium text-primary tracking-tight whitespace-nowrap opacity-50"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {focusTimeString}
              </span>
              <div className="flex items-center gap-1.5 text-primary flex-shrink-0">
                <Leaf size={14} strokeWidth={2.3} className="text-primary flex-shrink-0" />
                <span 
                  className="text-[12.5px] sm:text-[13.5px] font-sans font-medium text-primary leading-none"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {animatedPercent}%
                </span>
              </div>
            </div>

            {/* 2. Filled Progress Pill with Animated Width & Overflow-Hidden Clipping */}
            <div
              onClick={capacity.isOverloaded ? openOverloadModal : undefined}
              className={`absolute inset-y-0.5 left-0.5 rounded-full overflow-hidden shadow-xs cursor-pointer ${
                capacity.isOverloaded ? 'bg-tag-important' : 'bg-primary'
              }`}
              style={{
                width: isBarExpanded ? `${targetBarWidth}%` : '0%',
                transition: 'width 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
                background: capacity.isOverloaded
                  ? undefined
                  : 'linear-gradient(90deg, var(--color-primary-hover) 0%, var(--color-primary) 55%, var(--color-primary-active) 100%)'
              }}
            >
              {/* Organic Silk Waves SVG Overlay */}
              <svg
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                viewBox="0 0 320 44"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M 0 0 C 80 18 160 32 240 12 C 275 3 295 10 320 22 L 320 0 Z"
                  fill="rgba(255, 255, 255, 0.18)"
                />
                <path
                  d="M 0 44 C 60 22 130 14 200 28 C 260 40 290 32 320 18 L 320 44 Z"
                  fill="rgba(255, 255, 255, 0.14)"
                />
                <path
                  d="M 0 35 Q 90 8 180 22 T 320 12 L 320 44 L 0 44 Z"
                  fill="rgba(0, 0, 0, 0.10)"
                />
                <path
                  d="M 40 0 Q 140 38 280 8"
                  stroke="rgba(255, 255, 255, 0.22)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Exact Track Overlay Layer (White Text & Leaf revealed exclusively where progress bar covers) */}
              <div 
                className="absolute inset-y-0 left-0 flex items-center justify-between pl-3 sm:pl-3.5 pr-3 sm:pr-3.5 text-white pointer-events-none select-none"
                style={{ width: `${Math.max(trackWidth - 4, 180)}px` }}
              >
                <span 
                  className="text-[12.5px] sm:text-[13.5px] font-sans font-medium text-white tracking-tight whitespace-nowrap drop-shadow-xs"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {focusTimeString}
                </span>
                <div className="flex items-center gap-1.5 text-white drop-shadow-xs flex-shrink-0">
                  <Leaf size={14} strokeWidth={2.3} className="text-white flex-shrink-0" />
                  <span 
                    className="text-[12.5px] sm:text-[13.5px] font-sans font-medium text-white leading-none"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {animatedPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: YouTube Lofi Focus Radio & Ambient Player Bar */}
      <div className="bg-background rounded-[20px] p-2 sm:p-2.5 px-2.5 sm:px-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 transition-colors">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Photo Thumbnail with Centered Play Button & Equalizer */}
          <div
            onClick={() => toggleLofi()}
            className="relative w-11 sm:w-12 md:w-14 h-9 sm:h-10 md:h-11 rounded-xl overflow-hidden shadow-xs cursor-pointer group flex-shrink-0"
            title={isPlayingLofi ? 'Pause Lofi Music' : 'Play Lofi Music'}
          >
            <img
              src={currentStation.thumbnail}
              alt={currentStation.label}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-colors group-hover:bg-black/45">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-md transition-transform duration-150 group-hover:scale-105">
                {isPlayingLofi ? (
                  <Pause size={11} fill="currentColor" />
                ) : (
                  <Play size={11} fill="currentColor" className="ml-0.5" />
                )}
              </div>
            </div>

            {/* Equalizer animation when playing */}
            {isPlayingLofi && (
              <div className="absolute bottom-1 right-1 flex items-end gap-0.5 bg-black/60 px-1 py-0.5 rounded">
                <span className="w-0.5 h-2 bg-tag-health animate-pulse rounded-full" />
                <span className="w-0.5 h-3 bg-tag-health animate-pulse delay-75 rounded-full" />
                <span className="w-0.5 h-1.5 bg-tag-health animate-pulse delay-150 rounded-full" />
              </div>
            )}
          </div>

          {/* Lofi Track / Mood Information */}
          <div className="min-w-0 flex-1 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] sm:text-[13px] font-semibold text-foreground block leading-tight truncate">
                {currentStation.label}
              </span>
              {isPlayingLofi && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tag-health-bg text-tag-health text-[9.5px] font-bold tracking-wide uppercase">
                  Live
                </span>
              )}
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-mutedText font-normal leading-tight mt-0.5 block truncate">
              {isPlayingLofi ? currentStation.subLabel : 'Audio-only YouTube lofi stream'}
            </span>
          </div>
        </div>

        {/* Lofi Station Switcher Pills & Volume Control */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end ml-auto flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {LOFI_STATION_LIST.map((s) => {
              const Icon = stationIcons[s.id] || Headphones;
              const isSel = activeLofiStation === s.id;
              const isCurrentPlaying = isSel && isPlayingLofi;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (activeLofiStation === s.id) {
                      toggleLofi();
                    } else {
                      setLofiStation(s.id);
                      if (!isPlayingLofi) toggleLofi(s.id);
                    }
                  }}
                  title={`${s.label}: ${s.subLabel}`}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[11.5px] font-medium transition-all cursor-pointer ${isCurrentPlaying
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : isSel
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'bg-card text-textSecondary hover:text-foreground hover:bg-card-subtle'
                    }`}
                >
                  <Icon size={12} className={isCurrentPlaying ? 'text-white' : isSel ? 'text-primary' : 'text-mutedText'} />
                  <span>{s.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Inline Volume Control */}
          <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-borderToken/70">
            <button
              onClick={() => setLofiVolume(lofiVolume === 0 ? 45 : 0)}
              className="text-mutedText hover:text-foreground transition-colors p-1 rounded-lg cursor-pointer"
              title={lofiVolume === 0 ? 'Unmute' : `Mute (Current: ${lofiVolume}%)`}
              aria-label="Toggle mute"
            >
              {lofiVolume === 0 ? (
                <VolumeX size={14} className="text-tag-important" />
              ) : lofiVolume < 50 ? (
                <Volume1 size={14} />
              ) : (
                <Volume2 size={14} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={lofiVolume}
              onChange={(e) => setLofiVolume(Number(e.target.value))}
              className="w-14 sm:w-16 h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${lofiVolume}%, var(--color-primary-soft) ${lofiVolume}%, var(--color-primary-soft) 100%)`
              }}
              title={`Music Volume: ${lofiVolume}%`}
            />
            <span className="text-[10px] text-mutedText font-mono w-5 text-right select-none hidden md:inline-block">
              {lofiVolume}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: 3 Distinct Taller Metric Cards Linked to My Tasks with Active Filters */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Card 1: Important Priority */}
        <div
          onClick={() => navigateToTasks({ priority: 'important' })}
          className="bg-[#E5484D]/[0.08] hover:bg-[#E5484D]/[0.14] rounded-[20px] sm:rounded-[22px] p-2.5 sm:p-3.5 md:p-4 min-h-[86px] sm:min-h-[96px] relative overflow-hidden flex items-center gap-2 sm:gap-3.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-98 group shadow-2xs"
          title="Click to view Important Priority outcomes in My Tasks"
        >
          <CornerBlob className="text-[#E5484D]/[0.12]" />

          {/* Centered Icon Badge */}
          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E5484D]/[0.12] flex items-center justify-center text-[#E5484D] flex-shrink-0 group-hover:scale-110 transition-transform">
            <Flag size={15} fill="currentColor" />
          </div>

          {/* Content Block */}
          <div className="relative z-10 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="text-foreground text-[22px] sm:text-[26px] md:text-[29px] font-serif font-semibold">
                {importantCount}
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E5484D] flex-shrink-0" />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] leading-[1.2] text-textSecondary font-medium mt-1 block">
              Important<br className="hidden xs:inline" /> Priority
            </span>
          </div>
        </div>

        {/* Card 2: Flexible Outcomes */}
        <div
          onClick={() => navigateToTasks({ priority: 'flexible' })}
          className="bg-[#D97706]/[0.08] hover:bg-[#D97706]/[0.14] rounded-[20px] sm:rounded-[22px] p-2.5 sm:p-3.5 md:p-4 min-h-[86px] sm:min-h-[96px] relative overflow-hidden flex items-center gap-2 sm:gap-3.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-98 group shadow-2xs"
          title="Click to view Flexible Outcomes in My Tasks"
        >
          <CornerBlob className="text-[#D97706]/[0.12]" />

          {/* Centered Icon Badge */}
          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D97706]/[0.12] flex items-center justify-center text-[#D97706] flex-shrink-0 group-hover:scale-110 transition-transform">
            <Calendar size={15} />
          </div>

          {/* Content Block */}
          <div className="relative z-10 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="text-foreground text-[22px] sm:text-[26px] md:text-[29px] font-serif font-semibold">
                {regularCount}
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D97706] flex-shrink-0" />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] leading-[1.2] text-textSecondary font-medium mt-1 block">
              Flexible<br className="hidden xs:inline" /> Outcomes
            </span>
          </div>
        </div>

        {/* Card 3: Completed Today */}
        <div
          onClick={() => navigateToTasks({ status: 'completed' })}
          className="bg-[#16A34A]/[0.08] hover:bg-[#16A34A]/[0.14] rounded-[20px] sm:rounded-[22px] p-2.5 sm:p-3.5 md:p-4 min-h-[86px] sm:min-h-[96px] relative overflow-hidden flex items-center gap-2 sm:gap-3.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-98 group shadow-2xs"
          title="Click to view Completed tasks in My Tasks"
        >
          <CornerBlob className="text-[#16A34A]/[0.12]" />

          {/* Centered Icon Badge */}
          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#16A34A]/[0.12] flex items-center justify-center text-[#16A34A] flex-shrink-0 group-hover:scale-110 transition-transform">
            <Check size={16} strokeWidth={2.8} />
          </div>

          {/* Content Block */}
          <div className="relative z-10 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="text-foreground text-[22px] sm:text-[26px] md:text-[29px] font-serif font-semibold">
                {completedCount}
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
            </div>
            <span className="text-[10.5px] sm:text-[11.5px] leading-[1.2] text-textSecondary font-medium mt-1 block">
              Completed<br className="hidden xs:inline" /> Today
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
