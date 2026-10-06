import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Play, 
  Pause, 
  AlertCircle, 
  CloudRain, 
  Trees, 
  Wind, 
  Waves 
} from 'lucide-react';

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

  const soundscapes = [
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'forest', label: 'Forest', icon: Trees },
    { id: 'stream', label: 'Stream', icon: Wind },
    { id: 'waves', label: 'Waves', icon: Waves },
  ] as const;

  return (
    <div className="w-full h-[350px] bg-card rounded-[28px] p-6 sm:p-7 shadow-soft select-none flex flex-col justify-between border border-borderToken relative overflow-hidden transition-colors">
      {/* Top Row: Tasks Remaining Counter & Focus Time Progress */}
      <div className="flex items-start justify-between gap-4 sm:gap-6">
        {/* Tasks Remaining Large Counter */}
        <div className="flex-shrink-0">
          <div className="flex items-baseline leading-none">
            <span
              className="text-foreground tracking-tight text-[44px] sm:text-[52px] md:text-[60px] font-medium"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {remainingCount}
            </span>
            <span
              className="text-[18px] sm:text-[22px] font-light text-primary ml-1.5"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              left
            </span>
          </div>
          <p className="text-[13px] text-mutedText font-normal mt-1 tracking-tight">
            Today's Outcomes
          </p>
        </div>

        {/* Focus Time Indicator Capsule */}
        <div className="text-left flex-1 max-w-[320px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] text-mutedText font-medium">
              Daily Focus Capacity
            </span>
            {capacity.isOverloaded && (
              <span 
                onClick={openOverloadModal}
                className="text-[11.5px] font-semibold text-tag-important flex items-center gap-1 cursor-pointer hover:underline"
              >
                <AlertCircle size={13} />
                <span>Overloaded</span>
              </span>
            )}
          </div>

          {/* Capsule Track */}
          <div className="w-full h-[46px] rounded-[16px] bg-card-muted p-1.5 flex items-center transition-colors">
            <div
              onClick={capacity.isOverloaded ? openOverloadModal : undefined}
              className={`h-full px-4 rounded-[12px] flex items-center justify-center text-[13px] font-medium text-white shadow-xs cursor-pointer transition-all ${
                capacity.isOverloaded
                  ? 'bg-tag-important hover:opacity-90'
                  : 'bg-primary hover:bg-primary-hover'
              }`}
              style={{
                width: `${Math.min(100, Math.max(35, Math.round((capacity.totalPlannedMinutes / (capacity.totalAvailableMinutes || 480)) * 100)))}%`,
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.12) 4px, rgba(255,255,255,0.12) 8px)',
              }}
            >
              <span className="whitespace-nowrap font-sans text-white font-medium">{focusTimeString} planned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Ambient Soundscape Mini Player */}
      <div className="bg-card-subtle rounded-[18px] p-2.5 px-3.5 border border-borderToken flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toggleSoundscape()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isPlayingSoundscape
                ? 'bg-primary text-white shadow-xs scale-105'
                : 'bg-primary-soft text-primary hover:opacity-80'
            }`}
            title={isPlayingSoundscape ? 'Pause soundscape' : 'Play peaceful soundscape'}
          >
            {isPlayingSoundscape ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          </button>

          <div>
            <span className="text-[12.5px] font-semibold text-foreground block leading-tight">
              Calm Soundscape
            </span>
            <span className="text-[11px] text-mutedText font-normal leading-tight">
              {isPlayingSoundscape ? `Playing ${activeSoundscape} sounds` : 'Relax & focus ambient'}
            </span>
          </div>
        </div>

        {/* Soundscape Pills */}
        <div className="flex items-center gap-1.5">
          {soundscapes.map((s) => {
            const Icon = s.icon;
            const isSel = activeSoundscape === s.id && isPlayingSoundscape;
            return (
              <button
                key={s.id}
                onClick={() => toggleSoundscape(s.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11.5px] font-medium transition-all ${
                  isSel
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-card-muted text-textSecondary hover:bg-primary-soft'
                }`}
              >
                <Icon size={13} className={isSel ? 'text-white' : 'text-primary'} />
                <span className="hidden sm:inline-block">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: 3 Soft Metric Cards */}
      <div className="bg-card-muted/60 rounded-[22px] p-3 grid grid-cols-3 gap-3 transition-colors">
        {/* Important Tasks */}
        <div className="bg-card rounded-[16px] py-3.5 px-2 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-borderToken flex flex-col items-center justify-center transition-colors">
          <div className="flex items-center justify-center leading-none">
            <span
              className="text-foreground text-[26px] sm:text-[30px] font-medium"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {importantCount}
            </span>
            <span className="w-2 h-2 rounded-full bg-tag-important ml-1.5 flex-shrink-0" />
          </div>
          <span className="text-[11.5px] leading-[1.25] text-mutedText font-normal mt-1.5 block">
            Important<br />Priority
          </span>
        </div>

        {/* Regular Tasks */}
        <div className="bg-card rounded-[16px] py-3.5 px-2 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-borderToken flex flex-col items-center justify-center transition-colors">
          <div className="flex items-center justify-center leading-none">
            <span
              className="text-foreground text-[26px] sm:text-[30px] font-medium"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {regularCount}
            </span>
            <span className="w-2 h-2 rounded-full bg-tag-learning ml-1.5 flex-shrink-0" />
          </div>
          <span className="text-[11.5px] leading-[1.25] text-mutedText font-normal mt-1.5 block">
            Flexible<br />Outcomes
          </span>
        </div>

        {/* Completed Tasks */}
        <div className="bg-card rounded-[16px] py-3.5 px-2 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-borderToken flex flex-col items-center justify-center transition-colors">
          <div className="flex items-center justify-center leading-none">
            <span
              className="text-foreground text-[26px] sm:text-[30px] font-medium"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {completedCount}
            </span>
            <span className="w-2 h-2 rounded-full bg-tag-health ml-1.5 flex-shrink-0" />
          </div>
          <span className="text-[11.5px] leading-[1.25] text-mutedText font-normal mt-1.5 block">
            Completed<br />Today
          </span>
        </div>
      </div>
    </div>
  );
};
