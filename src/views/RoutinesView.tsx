import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sun, Moon, Plus, Check, Clock, Play } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';

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
    <div className="space-y-4 animate-fade-in pb-6 select-none">
      <div className="bg-white rounded-[20px] p-6 shadow-soft flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#05313A] tracking-tight">
            Daily Routines
          </h2>
          <p className="text-xs text-[rgba(5,49,58,0.6)] mt-0.5">
            Grouped habits executed as a sequence to begin and close your day calmly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routines.map((routine) => {
          const totalDuration = routine.items.reduce((acc, i) => acc + (i.duration || 10), 0);
          const completedCount = routine.items.filter((i) => i.completed).length;
          const isMorning = routine.type === 'morning';

          return (
            <div key={routine.id} className="bg-white rounded-[20px] p-6 shadow-soft space-y-4">
              {/* Routine Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(5,49,58,0.05)]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isMorning
                        ? 'bg-[rgba(216,138,45,0.12)] text-[#D88A2D]'
                        : 'bg-[rgba(139,92,246,0.12)] text-[#8B5CF6]'
                    }`}
                  >
                    {isMorning ? <Sun size={20} /> : <Moon size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-medium text-[#05313A]">{routine.title}</h3>
                    <span className="text-xs text-[rgba(5,49,58,0.5)]">
                      {formatTime12h(routine.preferredTime)} · {totalDuration} min total
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#328F9B]">
                  {completedCount}/{routine.items.length} Done
                </span>
              </div>

              {/* Step Checklist */}
              <div className="space-y-2">
                {routine.items.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => toggleRoutineStep(routine.id, step.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8FCFD] hover:bg-[#EAF3F7] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          step.completed
                            ? 'bg-[#328F9B] text-white'
                            : 'border border-[rgba(5,49,58,0.2)] bg-white'
                        }`}
                      >
                        {step.completed && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          step.completed ? 'line-through text-[rgba(5,49,58,0.4)]' : 'text-[#05313A]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>

                    <span className="text-[11px] text-[rgba(5,49,58,0.5)] font-mono">
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
