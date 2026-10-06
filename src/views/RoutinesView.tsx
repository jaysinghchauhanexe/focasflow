import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sun, Moon, Check } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { DoodleRoutine } from '../components/DoodleIllustrations';

export const RoutinesView: React.FC = () => {
  const { routines, updateRoutine } = useAppStore();

  const toggleRoutineStep = (routineId: string, stepId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const updatedItems = routine.items.map((item) =>
      item.id === stepId ? { ...item, completed: !item.completed } : item
    );

    updateRoutine({ ...routine, items: updatedItems });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12 sm:pb-16 select-none max-w-[1600px] mx-auto">
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <DoodleRoutine size={58} className="flex-shrink-0" />
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
              Daily Routines & Sequences
            </h2>
            <p className="text-[13px] text-mutedText mt-0.5">
              Gentle rituals executed as a peaceful sequence to open and close your day.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {routines.map((routine) => {
          const totalDuration = routine.items.reduce((acc, i) => acc + (i.duration || 10), 0);
          const completedCount = routine.items.filter((i) => i.completed).length;
          const isMorning = routine.type === 'morning';

          return (
            <div key={routine.id} className="bg-card rounded-[26px] p-6 sm:p-7 shadow-soft space-y-4 transition-colors">
              {/* Routine Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-borderToken">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isMorning
                        ? 'bg-tag-learningBg text-tag-learning'
                        : 'bg-tag-personalBg text-tag-personal'
                    }`}
                  >
                    {isMorning ? <Sun size={20} /> : <Moon size={20} />}
                  </div>
                  <div>
                    <h3 className="text-[19px] font-serif font-medium text-foreground">{routine.title}</h3>
                    <span className="text-[12px] text-mutedText">
                      {formatTime12h(routine.preferredTime)} · {totalDuration}m total sequence
                    </span>
                  </div>
                </div>

                <span className="text-[12.5px] font-semibold text-primary">
                  {completedCount}/{routine.items.length} Done
                </span>
              </div>

              {/* Step Checklist */}
              <div className="space-y-2">
                {routine.items.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(routine.id, step.id)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-card-subtle hover:bg-card-muted cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          step.completed
                            ? 'bg-primary text-white shadow-xs'
                            : 'border border-borderToken bg-card'
                        }`}
                      >
                        {step.completed && <Check size={13} strokeWidth={3} className="text-white" />}
                      </div>
                      <span
                        className={`text-[13.5px] font-medium ${
                          step.completed ? 'line-through text-mutedText' : 'text-foreground'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>

                    <span className="text-[11.5px] text-mutedText font-sans">
                      {step.duration}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
