import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Clock, Calendar, Lock, Play, Check } from 'lucide-react';
import { formatTime12h, timeToMinutes } from '../engine/scheduler';

export const ScheduleView: React.FC = () => {
  const { scheduleBlocks, selectedDate, tasks, toggleTaskStatus, replanDay } = useAppStore();

  const hoursList = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 AM to 11:00 PM

  return (
    <div className="space-y-4 animate-fade-in pb-6 select-none">
      <div className="bg-white rounded-[20px] p-6 shadow-soft flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#05313A] tracking-tight">
            Daily Visual Schedule
          </h2>
          <p className="text-xs text-[rgba(5,49,58,0.6)] mt-0.5">
            Deterministic timeline generated from your commitments, priorities, and habits.
          </p>
        </div>

        <button
          onClick={replanDay}
          className="px-4 py-2 bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          Recalculate Day
        </button>
      </div>

      <div className="bg-white rounded-[20px] p-6 shadow-soft">
        <div className="relative border-l border-[rgba(5,49,58,0.1)] ml-14 space-y-6 py-2">
          {hoursList.map((hour) => {
            const timeLabel = formatTime12h(`${String(hour).padStart(2, '0')}:00`);

            // Find blocks starting in this hour window
            const matchingBlocks = scheduleBlocks.filter((b) => {
              const bHour = parseInt(b.startTime.split(':')[0], 10);
              return bHour === hour;
            });

            return (
              <div key={hour} className="relative min-h-[50px]">
                {/* Time Label on left */}
                <div className="absolute -left-14 -top-2.5 text-[11px] font-medium text-[rgba(5,49,58,0.5)] font-sans w-12 text-right">
                  {timeLabel}
                </div>

                {/* Timeline node */}
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[rgba(50,143,155,0.3)] border border-[#328F9B]" />

                {/* Blocks in this slot */}
                <div className="ml-4 space-y-2">
                  {matchingBlocks.length === 0 ? (
                    <div className="h-6 border-b border-dashed border-[rgba(5,49,58,0.05)]" />
                  ) : (
                    matchingBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          block.isFixed
                            ? 'bg-[#EBF7F9] border-[rgba(50,143,155,0.3)]'
                            : 'bg-[#F8FCFD] border-[rgba(5,49,58,0.08)] hover:border-[#328F9B]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {block.isFixed && <Lock size={13} className="text-[#328F9B]" />}
                          <div>
                            <span className="text-xs font-semibold text-[#05313A] block">
                              {block.title}
                            </span>
                            <span className="text-[11px] text-[rgba(5,49,58,0.6)] font-sans">
                              {formatTime12h(block.startTime)} – {formatTime12h(block.endTime)} ({block.category})
                            </span>
                          </div>
                        </div>

                        {block.itemId && (
                          <button
                            onClick={() => toggleTaskStatus(block.itemId!)}
                            className="p-1 rounded text-[rgba(5,49,58,0.5)] hover:text-[#328F9B]"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
