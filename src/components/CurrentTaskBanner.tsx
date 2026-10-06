import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Check, ArrowRight, Play, Pause, FastForward } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';

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
      <div className="w-full bg-white rounded-[24px] p-6 shadow-soft select-none flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[rgba(53,168,83,0.12)] flex items-center justify-center text-[#35A853]">
            <Check size={22} />
          </div>
          <div>
            <h4 className="text-[16px] font-semibold text-[#05313A]">You're all caught up for now.</h4>
            <p className="text-[13px] text-[rgba(5,49,58,0.6)]">All planned items are completed or clear.</p>
          </div>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="px-4 py-2 bg-[#287C87] hover:bg-[#216C76] text-white text-[13px] font-semibold rounded-xl transition-all shadow-xs"
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
    <div className="w-full bg-white rounded-[24px] p-6 shadow-soft select-none border-l-[5px] border-[#287C87] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-md bg-[rgba(50,143,155,0.14)] text-[#287C87] text-[11px] font-bold tracking-wider uppercase">
            {isRunning ? 'FOCUSING NOW' : "WHAT'S NEXT"}
          </span>
          <span className="text-[13px] text-[rgba(5,49,58,0.55)] font-medium">
            {currentTask.scheduledStart && currentTask.scheduledEnd
              ? `${formatTime12h(currentTask.scheduledStart)} – ${formatTime12h(currentTask.scheduledEnd)}`
              : `${currentTask.duration} min estimated`}
          </span>
        </div>

        <h4 className="text-[19px] font-serif font-medium text-[#05313A] truncate">
          {currentTask.title}
        </h4>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3.5">
          <div className="flex-1 h-2 bg-[rgba(50,143,155,0.12)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#287C87] transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <span className="text-[13px] font-semibold text-[#05313A] font-mono min-w-[55px] text-right">
            {isRunning ? formatElapsed(elapsedSeconds) : `${remainingMins}m left`}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
            isRunning
              ? 'bg-[#E5F3F8] text-[#05313A] hover:bg-[#d5eaf2]'
              : 'bg-[#287C87] hover:bg-[#216C76] text-white'
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
          className="px-4 py-2.5 rounded-xl bg-[rgba(53,168,83,0.12)] text-[#2e8b46] hover:bg-[rgba(53,168,83,0.2)] text-[13px] font-semibold flex items-center gap-1.5 transition-all"
        >
          <Check size={15} strokeWidth={2.5} />
          <span>Complete</span>
        </button>

        <button
          onClick={() => {
            skipTask(currentTask.id);
            setIsRunning(false);
          }}
          className="px-3 py-2.5 rounded-xl text-[rgba(5,49,58,0.6)] hover:text-[#05313A] hover:bg-[rgba(5,49,58,0.06)] text-[13px] font-medium transition-all"
          title="Skip task"
        >
          <span>Skip</span>
        </button>

        <button
          onClick={() => moveTaskToTomorrow(currentTask.id)}
          className="px-3 py-2.5 rounded-xl text-[rgba(5,49,58,0.6)] hover:text-[#05313A] hover:bg-[rgba(5,49,58,0.06)] text-[13px] font-medium transition-all"
          title="Move to tomorrow"
        >
          <FastForward size={15} />
        </button>
      </div>
    </div>
  );
};
