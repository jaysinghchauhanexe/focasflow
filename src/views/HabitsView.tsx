import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Check, Clock, Calendar, Flame, Trash2, Edit2 } from 'lucide-react';

export const HabitsView: React.FC = () => {
  const { habits, toggleHabitDate, openHabitModal, deleteHabit, selectedDate } = useAppStore();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Generate 7 days of current week
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
    <div className="space-y-4 animate-fade-in pb-6 select-none">
      {/* Header */}
      <div className="bg-white rounded-[20px] p-6 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#05313A] tracking-tight">
            Recurring Habits & Practices
          </h2>
          <p className="text-xs text-[rgba(5,49,58,0.6)] mt-0.5">
            Build consistency without guilt or streak pressure.
          </p>
        </div>

        <button
          onClick={() => openHabitModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => {
          const completedCount = habit.completedDates.length;
          const isDoneToday = habit.completedDates.includes(selectedDate);

          return (
            <div
              key={habit.id}
              className="bg-white rounded-[20px] p-5 shadow-soft flex flex-col justify-between hover:shadow-float transition-all"
            >
              <div>
                {/* Habit Top Info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-[#328F9B] uppercase tracking-wider">
                      {habit.category}
                    </span>
                    <h4 className="text-lg font-serif font-medium text-[#05313A] mt-0.5">
                      {habit.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openHabitModal(habit)}
                      className="p-1 rounded text-[rgba(5,49,58,0.4)] hover:text-[#05313A]"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 rounded text-[rgba(5,49,58,0.4)] hover:text-[#D94B5B]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Metadata Pills */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F4F9FB] text-[11px] font-medium text-[rgba(5,49,58,0.7)] flex items-center gap-1">
                    <Clock size={12} />
                    <span>{habit.duration} min</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F4F9FB] text-[11px] font-medium text-[rgba(5,49,58,0.7)] capitalize">
                    {habit.frequency}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F4F9FB] text-[11px] font-medium text-[rgba(5,49,58,0.7)] capitalize">
                    {habit.preferredTime}
                  </span>
                </div>
              </div>

              {/* 7-Day Completion Tracker Bar */}
              <div className="pt-3 border-t border-[rgba(5,49,58,0.05)]">
                <div className="flex items-center justify-between gap-1">
                  {daysOfWeek.map((dayName, idx) => {
                    const dateStr = weekDates[idx];
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const isToday = dateStr === selectedDate;

                    return (
                      <div key={dayName} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-[10px] text-[rgba(5,49,58,0.5)] font-medium">
                          {dayName}
                        </span>
                        <button
                          onClick={() => toggleHabitDate(habit.id, dateStr)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[#328F9B] text-white shadow-xs'
                              : isToday
                              ? 'border-2 border-[#328F9B] bg-white text-[#328F9B]'
                              : 'bg-[#F4F9FB] text-[rgba(5,49,58,0.3)] hover:bg-[#EAF3F7]'
                          }`}
                        >
                          {isCompleted && <Check size={14} strokeWidth={3} />}
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
