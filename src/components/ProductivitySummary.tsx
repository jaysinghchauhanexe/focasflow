import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Play, 
  Pause, 
  AlertCircle, 
  CloudRain, 
  Trees, 
  Wind, 
  Waves,
  Flag,
  Calendar,
  Check,
  Leaf
} from 'lucide-react';

/* Mountain Sunrise Serene Illustration with Left/Right/Bottom Edge Fades */
const MountainSunriseIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    className={`relative select-none pointer-events-none flex items-center overflow-visible ${className}`}
    style={{
      maskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 82%, transparent 100%), linear-gradient(to bottom, black 65%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 82%, transparent 100%), linear-gradient(to bottom, black 65%, transparent 100%)',
      maskComposite: 'intersect',
      WebkitMaskComposite: 'destination-in',
    }}
  >
    <svg
      viewBox="0 0 240 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[190px] sm:w-[220px] h-[66px]"
    >
      <defs>
        <linearGradient id="sunGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="mountBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.24" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="mountMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="mountFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.72" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      
      {/* Soft Golden Rising Sun */}
      <circle cx="106" cy="36" r="20" fill="url(#sunGlow)" />
      
      {/* Flying Birds in Sky */}
      <path d="M 128 17 Q 132 13 136 17 Q 140 13 144 17" stroke="var(--color-primary)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.65" />
      <path d="M 144 25 Q 147 22 150 25 Q 153 22 156 25" stroke="var(--color-primary)" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.5" />
      
      {/* Background Mountain Layer */}
      <path d="M 0 85 L 0 58 Q 40 28 80 52 T 165 44 L 240 66 L 240 85 Z" fill="url(#mountBack)" />
      
      {/* Middle Mountain Layer */}
      <path d="M 10 85 L 48 52 Q 82 28 116 54 T 195 46 L 240 72 L 240 85 Z" fill="url(#mountMid)" />
      
      {/* Foreground Mountain Layer with crisp peaks */}
      <path d="M 25 85 L 68 42 L 92 58 L 126 32 L 158 62 L 186 48 L 225 78 L 240 85 Z" fill="url(#mountFront)" />
    </svg>
  </div>
);

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
    getDayCapacity, 
    openOverloadModal, 
    activeSoundscape, 
    isPlayingSoundscape, 
    toggleSoundscape 
  } = useAppStore();
  
  const capacity = getDayCapacity();

  const totalFocusHours = Math.floor(capacity.focusMinutes / 60);
  const totalFocusMins = capacity.focusMinutes % 60;
  const focusTimeString = `${totalFocusHours}h ${totalFocusMins > 0 ? `${totalFocusMins}m` : '00m'}`;

  // Task metrics
  const remainingCount = capacity.remainingTasksCount || 13;
  const importantCount = capacity.importantTasksCount;
  const regularCount = capacity.regularTasksCount;
  const completedCount = capacity.completedTasksCount;

  const capacityPercent = Math.min(100, Math.round((capacity.totalPlannedMinutes / (capacity.totalAvailableMinutes || 480)) * 100)) || 72;

  const soundscapes = [
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'forest', label: 'Forest', icon: Trees },
    { id: 'stream', label: 'Stream', icon: Wind },
    { id: 'waves', label: 'Waves', icon: Waves },
  ] as const;

  return (
    <div className="w-full min-h-[350px] bg-card rounded-[28px] p-4 sm:p-5 md:p-6 shadow-soft select-none flex flex-col justify-between gap-3 sm:gap-3.5 relative overflow-hidden transition-colors">
      
      {/* 1. TOP ROW: Counter + Adaptive Sunset Illustration + Responsive Daily Focus Capacity */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Outcomes Remaining + Fading Sunset Illustration */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex-shrink-0">
            <div className="flex items-baseline leading-none">
              <span className="text-foreground tracking-tight text-[38px] sm:text-[46px] md:text-[50px] font-serif font-medium">
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

          {/* Sunset Illustration - gracefully visible when space allows */}
          <MountainSunriseIllustration className="hidden 2xl:flex flex-shrink min-w-0" />
        </div>

        {/* Right: Daily Focus Capacity Card */}
        <div className="bg-background rounded-[22px] p-2.5 sm:p-3 md:p-3.5 flex flex-col justify-center flex-1 sm:max-w-[340px] transition-colors">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2 px-1">
            <span className="text-[12.5px] sm:text-[13px] font-medium text-foreground tracking-tight">
              Daily Focus Capacity
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

          {/* Full-Pill Track with Wave Silk Texture */}
          <div className="w-full h-[40px] sm:h-[44px] rounded-full bg-primary-soft p-0.5 relative overflow-hidden flex items-center justify-between select-none">
            {/* Filled Progress Pill */}
            <div
              onClick={capacity.isOverloaded ? openOverloadModal : undefined}
              className={`h-full rounded-full relative overflow-hidden flex items-center pl-3.5 sm:pl-4 pr-3 cursor-pointer transition-all duration-500 shadow-xs ${
                capacity.isOverloaded
                  ? 'bg-tag-important'
                  : 'bg-primary'
              }`}
              style={{
                width: `${Math.max(45, Math.min(80, capacityPercent))}%`,
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
                {/* Top highlight wave */}
                <path 
                  d="M 0 0 C 80 18 160 32 240 12 C 275 3 295 10 320 22 L 320 0 Z" 
                  fill="rgba(255, 255, 255, 0.18)" 
                />
                {/* Center sweeping silk curve */}
                <path 
                  d="M 0 44 C 60 22 130 14 200 28 C 260 40 290 32 320 18 L 320 44 Z" 
                  fill="rgba(255, 255, 255, 0.14)" 
                />
                {/* Soft ambient depth shade */}
                <path 
                  d="M 0 35 Q 90 8 180 22 T 320 12 L 320 44 L 0 44 Z" 
                  fill="rgba(0, 0, 0, 0.10)" 
                />
                {/* Crest light accent */}
                <path 
                  d="M 40 0 Q 140 38 280 8" 
                  stroke="rgba(255, 255, 255, 0.22)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>

              <span className="relative z-10 text-[12.5px] sm:text-[13.5px] font-sans font-medium text-white tracking-tight whitespace-nowrap drop-shadow-xs">
                {focusTimeString}
              </span>
            </div>

            {/* Right Leaf + Percentage Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 pr-3 sm:pr-4 pl-1.5 sm:pl-2 text-primary flex-shrink-0 relative z-10">
              {/* Filled Twin-Leaf Sprout Icon */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-primary opacity-80" fill="currentColor">
                <path d="M 12 21 C 12 17 12 13.5 12 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M 12 15 C 13.8 11.5 17 9 20.5 8 C 21.2 11.8 19.2 15.5 14.5 16.5 C 13.2 16.8 12 15.8 12 15 Z" fill="currentColor" />
                <path d="M 6.5 15 C 5.8 11.8 7.8 8.8 11.5 9.5 C 11.8 12.8 10 16 6.5 15 Z" fill="currentColor" opacity="0.9" />
              </svg>
              <span className="text-[12.5px] sm:text-[13.5px] font-sans font-medium text-primary">
                {capacityPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Calm Soundscape Player Bar */}
      <div className="bg-background rounded-[20px] p-2 sm:p-2.5 px-2.5 sm:px-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 transition-colors">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Photo Thumbnail with Centered Play Button */}
          <div 
            onClick={() => toggleSoundscape()}
            className="relative w-10 sm:w-12 md:w-14 h-8 sm:h-9 md:h-10 rounded-xl overflow-hidden shadow-xs cursor-pointer group flex-shrink-0"
          >
            <img 
              src="/cyan-theme-bg.jpg" 
              alt="Calm soundscape ambient" 
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-xs">
                {isPlayingSoundscape ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
              </div>
            </div>
          </div>

          {/* Soundscape Titles */}
          <div className="min-w-0">
            <span className="text-[12.5px] sm:text-[13px] font-semibold text-foreground block leading-tight truncate">
              Calm Soundscape
            </span>
            <span className="text-[10.5px] sm:text-[11px] text-mutedText font-normal leading-tight mt-0.5 block truncate">
              {isPlayingSoundscape ? `Playing ${activeSoundscape}` : 'Relax & focus ambient'}
            </span>
          </div>
        </div>

        {/* Soundscape Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end ml-auto">
          {soundscapes.map((s) => {
            const Icon = s.icon;
            const isSel = activeSoundscape === s.id && isPlayingSoundscape;
            return (
              <button
                key={s.id}
                onClick={() => toggleSoundscape(s.id as any)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[11.5px] font-medium transition-all ${
                  isSel
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'bg-card text-textSecondary hover:text-foreground hover:bg-card-subtle'
                }`}
              >
                <Icon size={12} className={isSel ? 'text-primary' : 'text-mutedText'} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM ROW: 3 Distinct Taller Metric Cards with Top-Aligned Icons & Centered Flow */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Card 1: Important Priority */}
        <div className="bg-[#E5484D]/[0.08] rounded-[20px] sm:rounded-[22px] p-2.5 sm:p-3.5 md:p-4 min-h-[86px] sm:min-h-[96px] relative overflow-hidden flex items-start gap-2 sm:gap-3.5 transition-all">
          <CornerBlob className="text-[#E5484D]/[0.12]" />
          
          {/* Top-aligned Icon Badge */}
          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E5484D]/[0.12] flex items-center justify-center text-[#E5484D] flex-shrink-0 mt-0.5">
            <Flag size={15} fill="currentColor" />
          </div>

          {/* Content Block */}
          <div className="relative z-10 flex flex-col justify-start min-w-0">
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
        <div className="bg-[#D97706]/[0.08] rounded-[20px] sm:rounded-[22px] p-2.5 sm:p-3.5 md:p-4 min-h-[86px] sm:min-h-[96px] relative overflow-hidden flex items-start gap-2 sm:gap-3.5 transition-all">
          <CornerBlob className="text-[#D97706]/[0.12]" />
          
          {/* Top-aligned Icon Badge */}
          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D97706]/[0.12] flex items-center justify-center text-[#D97706] flex-shrink-0 mt-0.5">
            <Calendar size={15} />
          </div>

          {/* Content Block */}
          <div className="relative z-10 flex flex-col justify-start min-w-0">
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
        <div className="bg-[#16A34A]/[0.08] rounded-[20px] sm:rounded-[22px] p-2.5 sm:p-3.5 md:p-4 min-h-[86px] sm:min-h-[96px] relative overflow-hidden flex items-start gap-2 sm:gap-3.5 transition-all">
          <CornerBlob className="text-[#16A34A]/[0.12]" />
          
          {/* Top-aligned Icon Badge */}
          <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#16A34A]/[0.12] flex items-center justify-center text-[#16A34A] flex-shrink-0 mt-0.5">
            <Check size={16} strokeWidth={2.8} />
          </div>

          {/* Content Block */}
          <div className="relative z-10 flex flex-col justify-start min-w-0">
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
