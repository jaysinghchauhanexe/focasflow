import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Check, Play, Pause, FastForward } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { DoodleZenStones } from './DoodleIllustrations';

/* Clean Vector Calendar-Clock Icon for Left Squircle */
const TaskCalendarIcon: React.FC<{ size?: number; className?: string }> = ({ size = 26, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Calendar Top Binders */}
    <path d="M 8 2 V 5" />
    <path d="M 16 2 V 5" />
    {/* Calendar Header Line */}
    <path d="M 3 8.5 H 21" />
    {/* Calendar Outline */}
    <rect x="3" y="4" width="18" height="18" rx="4" />
    {/* Bottom Right Clock Overlay */}
    <circle cx="16.5" cy="16.5" r="4.2" fill="var(--color-card, #FFFFFF)" stroke="currentColor" strokeWidth="1.8" />
    <polyline points="16.5 14.5 16.5 16.5 18 16.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const CurrentTaskBanner: React.FC = () => {
  const { tasks, selectedDate, toggleTaskStatus, skipTask, moveTaskToTomorrow, openTaskModal } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const activeTasks = tasks.filter(
    (t) => (t.scheduledDate === selectedDate || !t.scheduledDate) && t.status !== 'completed' && t.status !== 'skipped'
  );

  const currentTask = activeTasks[0];

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!currentTask) {
    return (
      <div className="w-full bg-card rounded-[28px] p-6 select-none flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <DoodleZenStones size={52} />
          <div>
            <h4 className="text-[16px] font-serif font-medium text-foreground">You're all caught up with scheduled tasks.</h4>
            <p className="text-[12.5px] text-mutedText">Enjoy a peaceful breather or plant your next intentional milestone.</p>
          </div>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[12.5px] font-semibold rounded-xl transition-all"
        >
          Add Next Task
        </button>
      </div>
    );
  }

  const durationSeconds = (currentTask.duration || 45) * 60;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / durationSeconds) * 100));
  const remainingMins = Math.max(0, Math.ceil((durationSeconds - elapsedSeconds) / 60));

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timeString = currentTask.scheduledStart && currentTask.scheduledEnd
    ? `${formatTime12h(currentTask.scheduledStart)} – ${formatTime12h(currentTask.scheduledEnd)}`
    : `${currentTask.duration || 45}m planned`;

  return (
    <div className="w-full bg-card rounded-[28px] p-4 sm:p-5 md:px-7 md:py-4.5 shadow-soft select-none flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-6 relative overflow-hidden transition-colors">
      
      {/* Left Block: Squircle Icon + Text + Progress */}
      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* Rounded Squircle Icon Box */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] bg-primary-soft flex items-center justify-center text-primary flex-shrink-0 transition-colors">
          <TaskCalendarIcon size={26} className="text-primary" />
        </div>

        {/* Text & Inline/Under Progress */}
        <div className="flex-1 min-w-0">
          {/* Header Row: WHAT'S NEXT + Time */}
          <div className="flex items-center gap-2.5 mb-0.5">
            <span className="px-2.5 py-0.5 rounded-lg bg-primary-soft text-primary text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase">
              {isRunning ? 'FOCUSING NOW' : "WHAT'S NEXT"}
            </span>
            <span className="text-[12px] sm:text-[12.5px] text-mutedText font-normal">
              {timeString}
            </span>
          </div>

          {/* Title & Progress Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
            <h4 className="text-[18px] sm:text-[20px] font-sans font-bold text-foreground tracking-tight truncate min-w-0">
              {currentTask.title}
            </h4>

            {/* Clean Progress Pill Track */}
            <div className="flex items-center gap-3 w-full sm:w-[180px] md:w-[220px] flex-shrink-0">
              <div className="flex-1 h-2 sm:h-2.5 bg-primary-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(6, progressPercent)}%` }}
                />
              </div>
              <span className="text-[11.5px] sm:text-[12px] font-medium text-textSecondary font-sans whitespace-nowrap min-w-[45px] text-right">
                {isRunning ? formatElapsed(elapsedSeconds) : `${remainingMins}m left`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Block: Action Buttons with Subtle Divider */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 self-end lg:self-center pl-0 lg:pl-2">
        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-10 bg-borderToken hidden lg:block mr-2" />

        {/* Start Focus / Pause Button */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[13px] sm:text-[13.5px] font-semibold transition-all shadow-xs ${
            isRunning
              ? 'bg-primary-soft text-primary hover:opacity-85'
              : 'bg-primary hover:bg-primary-hover text-white'
          }`}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>

        {/* Complete Button */}
        <button
          onClick={() => {
            toggleTaskStatus(currentTask.id);
            setIsRunning(false);
            setElapsedSeconds(0);
          }}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-tag-healthBg text-tag-health hover:bg-[#D5EFE1] text-[13px] sm:text-[13.5px] font-semibold transition-all"
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Complete</span>
        </button>

        {/* Skip Button */}
        <button
          onClick={() => {
            skipTask(currentTask.id);
            setIsRunning(false);
          }}
          className="px-2.5 sm:px-3 py-2 rounded-xl text-mutedText hover:text-foreground text-[12.5px] sm:text-[13px] font-medium transition-all"
          title="Skip task"
        >
          Skip
        </button>

        {/* Move to Tomorrow Button */}
        <button
          onClick={() => moveTaskToTomorrow(currentTask.id)}
          className="p-2 rounded-xl text-mutedText hover:text-foreground text-[13px] font-medium transition-all"
          title="Move to tomorrow"
        >
          <FastForward size={16} />
        </button>
      </div>

    </div>
  );
};
