import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Check, Clock, Trash2, Edit2 } from 'lucide-react';
import { DoodlePlant } from '../components/DoodleIllustrations';

export const HabitsView: React.FC = () => {
  const { habits, toggleHabitDate, openHabitModal, deleteHabit, selectedDate } = useAppStore();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date(selectedDate);
  const currentDayOfWeek = (today.getDay() + 6) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-5 animate-fade-in pb-12 sm:pb-16 select-none max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <DoodlePlant size={58} className="flex-shrink-0" />
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
              Recurring Habits & Mindful Practices
            </h2>
            <p className="text-[13px] text-mutedText mt-0.5">
              Build calm consistency without guilt or streak anxiety.
            </p>
          </div>
        </div>

        <button
          onClick={() => openHabitModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-2xl transition-all"
        >
          <Plus size={15} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {habits.map((habit) => {
          const completedThisWeek = weekDates.filter(d => habit.completedDates.includes(d)).length;

          return (
            <div
              key={habit.id}
              className="bg-card rounded-[26px] p-6 shadow-soft flex flex-col justify-between hover:shadow-float transition-all"
            >
              <div>
                {/* Habit Top Info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      {habit.category}
                    </span>
                    <h4 className="text-[19px] font-serif font-medium text-foreground mt-0.5">
                      {habit.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openHabitModal(habit)}
                      className="p-1.5 rounded-lg text-mutedText hover:text-foreground hover:bg-card-subtle"
                      title="Edit habit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-mutedText hover:text-tag-important hover:bg-tag-importantBg"
                      title="Delete habit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Metadata Pills */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="px-2.5 py-1 rounded-xl bg-card-subtle text-[12px] font-medium text-textSecondary flex items-center gap-1">
                    <Clock size={12} />
                    <span>{habit.duration} min</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-card-subtle text-[12px] font-medium text-textSecondary capitalize">
                    {habit.frequency}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-card-subtle text-[12px] font-medium text-textSecondary capitalize">
                    {habit.preferredTime}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-primary-soft text-[12px] font-medium text-primary ml-auto">
                    {completedThisWeek}/{habit.target || 5} this week
                  </span>
                </div>
              </div>

              {/* 7-Day Completion Tracker Bar */}
              <div className="pt-4 border-t border-borderToken">
                <div className="flex items-center justify-between gap-1.5">
                  {daysOfWeek.map((dayName, idx) => {
                    const dateStr = weekDates[idx];
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const isToday = dateStr === selectedDate;

                    return (
                      <div key={dayName} className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[11px] text-mutedText font-medium">
                          {dayName}
                        </span>
                        <button
                          type="button"
                          data-completion-trigger="true"
                          data-no-click-sound="true"
                          onClick={() => toggleHabitDate(habit.id, dateStr)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-primary text-white shadow-xs'
                              : isToday
                              ? 'border-2 border-primary bg-card text-primary'
                              : 'bg-card-subtle text-mutedText hover:bg-card-muted border border-borderToken'
                          }`}
                        >
                          {isCompleted && <Check size={14} strokeWidth={3} className="text-white" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
