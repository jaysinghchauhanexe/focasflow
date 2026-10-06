import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Wind, Target, Sparkles, Check } from 'lucide-react';

export const QuickActionsCard: React.FC = () => {
  const { 
    openTaskModal, 
    openHabitModal, 
    openBreathingModal, 
    openAiModal,
    habits,
    toggleHabitDate,
    selectedDate
  } = useAppStore();

  const actions = [
    { label: 'Add Task', icon: Plus, onClick: () => openTaskModal(), bg: 'bg-primary-soft text-primary' },
    { label: 'Breathing Reset', icon: Wind, onClick: () => openBreathingModal(), bg: 'bg-tag-personalBg text-tag-personal' },
    { label: 'New Habit', icon: Target, onClick: () => openHabitModal(), bg: 'bg-tag-learningBg text-tag-learning' },
    { label: 'AI Plan Assist', icon: Sparkles, onClick: () => openAiModal(), bg: 'bg-tag-healthBg text-tag-health' },
  ];

  const todayHabits = habits.slice(0, 3);

  return (
    <div className="w-full bg-card rounded-[28px] p-6 sm:p-7 shadow-soft select-none flex flex-col justify-between border border-borderToken transition-colors">
      <div>
        <h3 className="text-[22px] sm:text-[24px] font-serif font-medium text-foreground tracking-tight mb-4">
          Quick Actions
        </h3>

        {/* 2x2 Grid of Calming Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`flex items-center justify-center gap-2 py-3.5 px-3 rounded-[18px] ${action.bg} text-[13px] font-semibold transition-all duration-150 group shadow-xs hover:scale-[1.02] hover:opacity-90`}
              >
                <Icon
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Today's Mini Habit Checkoff */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[12px] font-semibold text-mutedText uppercase tracking-wider">
              Today's Practices
            </span>
            <span className="text-[11.5px] text-primary font-medium">
              {habits.filter(h => h.completedDates.includes(selectedDate)).length}/{habits.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {todayHabits.map((habit) => {
              const isDone = habit.completedDates.includes(selectedDate);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabitDate(habit.id, selectedDate)}
                  className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-card-subtle hover:bg-card-muted cursor-pointer transition-all border border-borderToken"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-primary text-white shadow-xs'
                          : 'border border-borderToken bg-card'
                      }`}
                    >
                      {isDone && <Check size={13} strokeWidth={3} className="text-white" />}
                    </div>
                    <span
                      className={`text-[13px] truncate ${
                        isDone ? 'line-through text-mutedText' : 'text-foreground font-medium'
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>

                  <span className="text-[11px] text-mutedText font-sans flex-shrink-0">
                    {habit.duration}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mindful Tip footer */}
      <div className="pt-4 mt-2 border-t border-borderToken text-center">
        <p className="text-[12px] text-mutedText italic">
          “Small consistent practices build a tranquil life.”
        </p>
      </div>
    </div>
  );
};
