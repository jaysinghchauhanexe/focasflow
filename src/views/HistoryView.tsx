import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const HistoryView: React.FC = () => {
  const { history } = useAppStore();

  return (
    <div className="space-y-5 animate-fade-in pb-8 select-none max-w-[1600px] mx-auto">
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft border border-borderToken transition-colors">
        <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
          Reflections & Daily Reviews
        </h2>
        <p className="text-[13px] text-mutedText mt-0.5">
          Calm observations on past days to understand your capacity without guilt.
        </p>
      </div>

      <div className="space-y-4">
        {history.map((log) => {
          const plannedH = Math.floor(log.plannedMinutes / 60);
          const plannedM = log.plannedMinutes % 60;
          const completedH = Math.floor(log.completedMinutes / 60);
          const completedM = log.completedMinutes % 60;

          return (
            <div key={log.id} className="bg-card rounded-[26px] p-6 shadow-soft space-y-4 border border-borderToken transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-borderToken">
                <span className="text-[17px] font-serif font-semibold text-foreground">
                  {log.date}
                </span>
                <span className="text-[12.5px] font-semibold text-primary">
                  {log.completedTasksCount}/{log.totalTasksCount} Outcomes Completed
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-card-subtle border border-borderToken">
                  <span className="text-[14px] font-serif font-medium text-foreground block">
                    {plannedH}h {plannedM > 0 ? `${plannedM}m` : ''}
                  </span>
                  <span className="text-[11px] text-mutedText">Planned</span>
                </div>

                <div className="p-3 rounded-2xl bg-tag-healthBg">
                  <span className="text-[14px] font-serif font-medium text-tag-health block">
                    {completedH}h {completedM > 0 ? `${completedM}m` : ''}
                  </span>
                  <span className="text-[11px] text-tag-health/80">Completed</span>
                </div>

                <div className="p-3 rounded-2xl bg-tag-learningBg">
                  <span className="text-[14px] font-serif font-medium text-tag-learning block">
                    {log.movedMinutes}m
                  </span>
                  <span className="text-[11px] text-tag-learning/80">Moved</span>
                </div>

                <div className="p-3 rounded-2xl bg-card-subtle border border-borderToken">
                  <span className="text-[14px] font-serif font-medium text-mutedText block">
                    {log.skippedMinutes}m
                  </span>
                  <span className="text-[11px] text-mutedText">Skipped</span>
                </div>
              </div>

              {log.notes && (
                <p className="text-[13px] text-textSecondary italic bg-card-subtle p-3 rounded-2xl border border-borderToken">
                  “{log.notes}”
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
