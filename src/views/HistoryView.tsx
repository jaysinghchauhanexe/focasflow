import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { DoodleJournal } from '../components/DoodleIllustrations';
import { Target, Clock, TrendingUp, Sparkles } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, tasks, taskElapsedSeconds } = useAppStore();

  // Compute live focus accuracy analytics across completed tasks
  const completedTasksWithEstimates = tasks.filter((t) => t.status === 'completed');
  let totalPlannedMins = 0;
  let totalActualMins = 0;

  completedTasksWithEstimates.forEach((t) => {
    const planned = t.duration || 45;
    const actual = Math.max(5, Math.ceil((taskElapsedSeconds[t.id] || planned * 60) / 60));
    totalPlannedMins += planned;
    totalActualMins += actual;
  });

  const accuracyRate = totalPlannedMins > 0 
    ? Math.min(100, Math.round(100 - (Math.abs(totalActualMins - totalPlannedMins) / totalPlannedMins) * 100))
    : 94;

  return (
    <div className="space-y-5 animate-fade-in pb-12 sm:pb-16 select-none max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <DoodleJournal size={58} className="flex-shrink-0" />
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
              Reflections & Daily Reviews
            </h2>
            <p className="text-[13px] text-mutedText mt-0.5">
              Calm observations on past days and focus velocity to understand your capacity without guilt.
            </p>
          </div>
        </div>

        {/* Live Estimation Accuracy Badge */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-primary-soft border border-primary/20">
          <Target size={18} className="text-primary flex-shrink-0" />
          <div className="text-left">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">Estimation Accuracy</span>
            <span className="text-[14px] font-sans font-bold text-foreground">{accuracyRate}% on track</span>
          </div>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex items-center gap-3.5 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs text-mutedText block font-medium">Logged Focus Velocity</span>
            <span className="text-lg font-serif font-semibold text-foreground">
              {Math.floor(totalActualMins / 60)}h {totalActualMins % 60}m tracked
            </span>
          </div>
        </div>

        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex items-center gap-3.5 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-tag-healthBg flex items-center justify-center text-tag-health flex-shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs text-mutedText block font-medium">Completed Milestones</span>
            <span className="text-lg font-serif font-semibold text-tag-health">
              {completedTasksWithEstimates.length} Outcomes
            </span>
          </div>
        </div>

        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex items-center gap-3.5 transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-tag-learningBg flex items-center justify-center text-tag-learning flex-shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-xs text-mutedText block font-medium">Mindful Calibration</span>
            <span className="text-lg font-serif font-semibold text-tag-learning">
              Balanced Flow
            </span>
          </div>
        </div>
      </div>

      {/* History Log Cards */}
      <div className="space-y-4">
        {history.map((log) => {
          const plannedH = Math.floor(log.plannedMinutes / 60);
          const plannedM = log.plannedMinutes % 60;
          const completedH = Math.floor(log.completedMinutes / 60);
          const completedM = log.completedMinutes % 60;

          return (
            <div key={log.id} className="bg-card rounded-[26px] p-6 shadow-soft space-y-4 transition-colors border border-borderToken">
              <div className="flex items-center justify-between pb-3 border-b border-borderToken">
                <span className="text-[17px] font-serif font-semibold text-foreground">
                  {log.date}
                </span>
                <span className="text-[12.5px] font-semibold text-primary bg-primary-soft px-3 py-0.5 rounded-full">
                  {log.completedTasksCount}/{log.totalTasksCount} Outcomes Completed
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-card-subtle">
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

                <div className="p-3 rounded-2xl bg-card-subtle">
                  <span className="text-[14px] font-serif font-medium text-mutedText block">
                    {log.skippedMinutes}m
                  </span>
                  <span className="text-[11px] text-mutedText">Skipped</span>
                </div>
              </div>

              {log.notes && (
                <p className="text-[13px] text-textSecondary italic bg-card-subtle p-3.5 rounded-2xl border border-borderToken/50">
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
