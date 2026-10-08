import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ChevronLeft, ChevronRight, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { getTodayDateString, parseLocalDate, formatLocalDate, addDaysToDateString } from '../utils/dateUtils';

export const WeekDateStrip: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { selectedDate, setSelectedDate, tasks } = useAppStore();

  const todayStr = React.useMemo(() => getTodayDateString(), []);
  const activeDate = selectedDate || todayStr;

  // Calculate 7 days of the active week starting on Sunday
  const weekDays = React.useMemo(() => {
    const curr = parseLocalDate(activeDate);
    const dayOfWeek = curr.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const iso = formatLocalDate(d);
      const hasTasks = tasks.some(t => t.scheduledDate === iso && t.status !== 'completed' && t.status !== 'skipped');
      const hasCompleted = tasks.some(t => (t.scheduledDate === iso || (!t.scheduledDate && iso === todayStr)) && t.status === 'completed');

      days.push({
        iso,
        dayNum: d.getDate(),
        dayLabel: labels[i],
        isToday: iso === todayStr,
        isSelected: iso === activeDate,
        isPast: iso < todayStr,
        hasTasks,
        hasCompleted,
      });
    }
    return days;
  }, [activeDate, todayStr, tasks]);

  const handlePrevWeek = () => {
    setSelectedDate(addDaysToDateString(activeDate, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(addDaysToDateString(activeDate, 7));
  };

  const handleJumpToday = () => {
    setSelectedDate(todayStr);
  };

  // Check if viewing past date with pending tasks
  const pastPendingTasks = React.useMemo(() => {
    if (activeDate >= todayStr) return [];
    return tasks.filter(t => t.scheduledDate === activeDate && t.status !== 'completed' && t.status !== 'skipped');
  }, [activeDate, todayStr, tasks]);

  const handleRollAllToToday = () => {
    pastPendingTasks.forEach(t => {
      // Reassign scheduledDate to today
      useAppStore.getState().updateTask({
        ...t,
        scheduledDate: todayStr,
        movedCount: (t.movedCount || 0) + 1,
      });
    });
  };

  const activeDateObj = parseLocalDate(activeDate);

  return (
    <div className={`bg-card rounded-[24px] p-3.5 sm:p-4 shadow-soft transition-colors select-none ${className}`}>
      {/* Top Bar with Month/Year + Navigation Controls */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-borderToken">
        <div className="flex items-center gap-2">
          <CalendarIcon size={15} className="text-primary" />
          <span className="text-[13.5px] sm:text-[14px] font-serif font-semibold text-foreground">
            {activeDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          {activeDate !== todayStr && (
            <button
              type="button"
              onClick={handleJumpToday}
              className="ml-2 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Jump to Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 7-Day Horizontal Strip */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {weekDays.map((day) => {
          return (
            <div
              key={day.iso}
              onClick={() => setSelectedDate(day.iso)}
              className="flex flex-col items-center cursor-pointer group py-1"
            >
              {/* Day Label (Sun, Mon, Tue...) */}
              <span className={`text-[11px] sm:text-[12px] font-sans transition-colors ${
                day.isSelected
                  ? 'font-bold text-foreground'
                  : 'text-mutedText group-hover:text-foreground'
              }`}>
                {day.dayLabel}
              </span>

              {/* Date Circle */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 mt-1.5 rounded-full flex items-center justify-center text-[13.5px] sm:text-[14.5px] font-medium transition-all ${
                day.isSelected
                  ? 'bg-primary text-white font-semibold shadow-xs scale-105'
                  : day.isToday
                    ? 'bg-primary-soft text-primary font-semibold hover:bg-primary/20'
                    : 'text-foreground hover:bg-card-subtle'
              }`}>
                {day.dayNum}
              </div>

              {/* Little status indicator dot underneath */}
              <div className="h-2 flex items-center justify-center mt-1">
                {day.hasTasks ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${day.isSelected ? 'bg-primary' : 'bg-primary/70'}`} />
                ) : day.hasCompleted ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-tag-health/70" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Past Incomplete Tasks Rollover Banner */}
      {pastPendingTasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-borderToken flex flex-wrap items-center justify-between gap-2 text-xs bg-tag-importantBg/50 p-2.5 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-2 text-tag-important font-medium">
            <RotateCcw size={13} />
            <span>
              {pastPendingTasks.length} unfinished outcome{pastPendingTasks.length > 1 ? 's' : ''} from this day.
            </span>
          </div>
          <button
            type="button"
            onClick={handleRollAllToToday}
            className="px-3 py-1 rounded-xl bg-primary text-white text-[11.5px] font-semibold hover:bg-primary-hover transition-all cursor-pointer shadow-xs"
          >
            Roll Over to Today
          </button>
        </div>
      )}
    </div>
  );
};
