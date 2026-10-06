import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Clock, Lock, Check } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { DoodleCalendar } from '../components/DoodleIllustrations';

export const ScheduleView: React.FC = () => {
  const { scheduleBlocks, toggleTaskStatus, replanDay } = useAppStore();

  const hoursList = Array.from({ length: 17 }, (_, i) => i + 7); // 7:00 AM to 11:00 PM

  return (
    <div className="space-y-5 animate-fade-in pb-12 sm:pb-16 select-none max-w-[1600px] mx-auto">
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <DoodleCalendar size={58} className="flex-shrink-0" />
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
              Daily Visual Schedule
            </h2>
            <p className="text-[13px] text-mutedText mt-0.5">
              A peaceful, realistic timeline built around your natural circadian rhythms and priorities.
            </p>
          </div>
        </div>

        <button
          onClick={replanDay}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-2xl transition-all"
        >
          Rebalance Day
        </button>
      </div>

      <div className="bg-card rounded-[28px] p-6 sm:p-8 shadow-soft transition-colors">
        <div className="relative border-l-2 border-borderToken ml-16 space-y-7 py-2">
          {hoursList.map((hour) => {
            const timeLabel = formatTime12h(`${String(hour).padStart(2, '0')}:00`);

            const matchingBlocks = scheduleBlocks.filter((b) => {
              const bHour = parseInt(b.startTime.split(':')[0], 10);
              return bHour === hour;
            });

            return (
              <div key={hour} className="relative min-h-[52px]">
                {/* Time Label on left */}
                <div className="absolute -left-16 -top-2.5 text-[12px] font-medium text-mutedText font-sans w-12 text-right">
                  {timeLabel}
                </div>

                {/* Timeline node */}
                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-card border-2 border-primary" />

                {/* Blocks in this slot */}
                <div className="ml-5 space-y-2.5">
                  {matchingBlocks.length === 0 ? (
                    <div className="h-6 border-b border-dashed border-borderToken" />
                  ) : (
                    matchingBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={`p-3.5 px-4 rounded-2xl flex items-center justify-between transition-all ${
                          block.isFixed
                            ? 'bg-primary-soft text-foreground'
                            : 'bg-card-subtle text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {block.isFixed ? (
                            <Lock size={14} className="text-primary" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                          <div>
                            <span className="text-[13.5px] font-semibold text-foreground block">
                              {block.title}
                            </span>
                            <span className="text-[11.5px] text-mutedText font-sans">
                              {formatTime12h(block.startTime)} – {formatTime12h(block.endTime)} · {block.category}
                            </span>
                          </div>
                        </div>

                        {block.itemId && (
                          <button
                            onClick={() => toggleTaskStatus(block.itemId!)}
                            className="p-1.5 rounded-xl bg-card text-mutedText hover:text-primary hover:bg-card-muted transition-colors"
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
