import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar, CheckCircle2, Clock, FastForward, ArrowRight } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history } = useAppStore();

  return (
    <div className="space-y-4 animate-fade-in pb-6 select-none">
      <div className="bg-white rounded-[20px] p-6 shadow-soft">
        <h2 className="text-2xl font-serif font-medium text-[#05313A] tracking-tight">
          History & Daily Reviews
        </h2>
        <p className="text-xs text-[rgba(5,49,58,0.6)] mt-0.5">
          Calm reflections on past days to understand your capacity without guilt.
        </p>
      </div>

      <div className="space-y-3">
        {history.map((log) => {
          const plannedH = Math.floor(log.plannedMinutes / 60);
          const plannedM = log.plannedMinutes % 60;
          const completedH = Math.floor(log.completedMinutes / 60);
          const completedM = log.completedMinutes % 60;

          return (
            <div key={log.id} className="bg-white rounded-[20px] p-5 shadow-soft space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(5,49,58,0.05)]">
                <span className="text-base font-serif font-semibold text-[#05313A]">
                  {log.date}
                </span>
                <span className="text-xs font-semibold text-[#328F9B]">
                  {log.completedTasksCount}/{log.totalTasksCount} Tasks Completed
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-[#F8FCFD]">
                  <span className="text-xs font-serif font-medium text-[#05313A] block">
                    {plannedH}h {plannedM > 0 ? `${plannedM}m` : ''}
                  </span>
                  <span className="text-[10.5px] text-[rgba(5,49,58,0.5)]">Planned</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[rgba(53,168,83,0.08)]">
                  <span className="text-xs font-serif font-medium text-[#35A853] block">
                    {completedH}h {completedM > 0 ? `${completedM}m` : ''}
                  </span>
                  <span className="text-[10.5px] text-[rgba(5,49,58,0.6)]">Completed</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[rgba(216,138,45,0.08)]">
                  <span className="text-xs font-serif font-medium text-[#D88A2D] block">
                    {log.movedMinutes}m
                  </span>
                  <span className="text-[10.5px] text-[rgba(5,49,58,0.6)]">Moved</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FCFD]">
                  <span className="text-xs font-serif font-medium text-[rgba(5,49,58,0.5)] block">
                    {log.skippedMinutes}m
                  </span>
                  <span className="text-[10.5px] text-[rgba(5,49,58,0.5)]">Skipped</span>
                </div>
              </div>

              {log.notes && (
                <p className="text-xs text-[rgba(5,49,58,0.65)] italic bg-[#FBFDFE] p-2.5 rounded-lg">
                  "{log.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
