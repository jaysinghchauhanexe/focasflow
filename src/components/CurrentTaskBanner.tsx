import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Check, ArrowRight, Play, Pause, FastForward, Sparkles, Clock } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { DoodleZenStones } from './DoodleIllustrations';

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

  return (
    <div className="w-full bg-card rounded-[28px] p-6 shadow-soft select-none border-l-[6px] border-primary flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors">
      {/* Left info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-lg bg-primary-soft text-primary text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
            <Sparkles size={11} />
            <span>{isRunning ? 'FOCUSING NOW' : "WHAT'S NEXT"}</span>
          </span>
          <span className="text-[12.5px] text-mutedText font-medium flex items-center gap-1">
            <Clock size={12} />
            <span>
              {currentTask.scheduledStart && currentTask.scheduledEnd
                ? `${formatTime12h(currentTask.scheduledStart)} – ${formatTime12h(currentTask.scheduledEnd)}`
                : `${currentTask.duration}m planned`}
            </span>
          </span>
        </div>

        <h4 className="text-[17px] sm:text-[19px] font-sans font-semibold text-foreground truncate">
          {currentTask.title}
        </h4>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3.5 max-w-md">
          <div className="flex-1 h-2 bg-card-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <span className="text-[12.5px] font-semibold text-foreground font-mono min-w-[55px] text-right">
            {isRunning ? formatElapsed(elapsedSeconds) : `${remainingMins}m left`}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
            isRunning
              ? 'bg-primary-soft text-primary hover:opacity-80'
              : 'bg-primary hover:bg-primary-hover text-white'
          }`}
        >
          {isRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>

        <button
          onClick={() => {
            toggleTaskStatus(currentTask.id);
            setIsRunning(false);
            setElapsedSeconds(0);
          }}
          className="px-4 py-2 rounded-xl bg-tag-healthBg text-tag-health hover:opacity-80 text-[13px] font-semibold flex items-center gap-1.5 transition-all"
        >
          <Check size={15} strokeWidth={2.5} />
          <span>Complete</span>
        </button>

        <button
          onClick={() => {
            skipTask(currentTask.id);
            setIsRunning(false);
          }}
          className="px-3 py-2 rounded-xl text-mutedText hover:text-foreground hover:bg-card-subtle text-[13px] font-medium transition-all"
          title="Skip task"
        >
          <span>Skip</span>
        </button>

        <button
          onClick={() => moveTaskToTomorrow(currentTask.id)}
          className="p-2 rounded-xl text-mutedText hover:text-foreground hover:bg-card-subtle text-[13px] font-medium transition-all"
          title="Move to tomorrow"
        >
          <FastForward size={16} />
        </button>
      </div>
    </div>
  );
};
