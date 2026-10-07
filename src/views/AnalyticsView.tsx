import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, Priority, Task } from '../types';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Zap,
  Filter,
  X,
  TrendingUp,
  Play,
  Layers,
  ChevronRight,
  Target,
  Sparkles,
  Briefcase,
  BookOpen,
  User,
  Heart,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { DoodleTasks } from '../components/DoodleIllustrations';

const categoryIcons: Record<Category, React.ComponentType<{ size?: number; className?: string }>> = {
  Work: Briefcase,
  Learning: BookOpen,
  Personal: User,
  Health: Heart,
  Neutral: HelpCircle,
};

const getCategoryBadgeClass = (cat: Category) => {
  switch (cat) {
    case 'Health':
      return 'badge-health';
    case 'Work':
      return 'badge-work';
    case 'Personal':
      return 'badge-personal';
    case 'Learning':
      return 'badge-learning';
    default:
      return 'badge-neutral';
  }
};

const getCategoryColor = (cat: Category) => {
  switch (cat) {
    case 'Work':
      return '#38BDF8';
    case 'Learning':
      return '#A855F7';
    case 'Personal':
      return '#EC4899';
    case 'Health':
      return '#22C55E';
    default:
      return '#94A3B8';
  }
};

export const AnalyticsView: React.FC = () => {
  const {
    tasks,
    taskElapsedSeconds,
    activeFocusTaskId,
    isFocusTimerRunning,
    focusElapsedSeconds,
    history,
    analyticsFilter,
    setAnalyticsFilter,
    navigateToTasks,
    startFocusTask,
    getDayCapacity
  } = useAppStore();

  const capacity = getDayCapacity();

  // Active filter state
  const timeRange = analyticsFilter.timeRange || 'today';
  const selectedCategory = analyticsFilter.category || 'All';
  const selectedPriority = analyticsFilter.priority || 'all';
  const selectedStatus = analyticsFilter.status || 'all';
  const selectedTaskId = analyticsFilter.taskId || null;

  // Helper date calculators
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const dateRangeLimit = useMemo(() => {
    const now = new Date();
    if (timeRange === 'today') {
      return { start: todayDateStr, end: todayDateStr };
    }
    if (timeRange === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { start: start.toISOString().split('T')[0], end: todayDateStr };
    }
    if (timeRange === 'month') {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return { start: start.toISOString().split('T')[0], end: todayDateStr };
    }
    return { start: '1970-01-01', end: '2099-12-31' };
  }, [timeRange, todayDateStr]);

  // Tasks in current time scope
  const periodTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (timeRange === 'all') return true;
      const taskDate = t.scheduledDate || todayDateStr;
      return taskDate >= dateRangeLimit.start && taskDate <= dateRangeLimit.end;
    });
  }, [tasks, timeRange, dateRangeLimit, todayDateStr]);

  // History logs in current time scope
  const periodHistory = useMemo(() => {
    return history.filter((h) => {
      if (timeRange === 'all') return true;
      return h.date >= dateRangeLimit.start && h.date <= dateRangeLimit.end;
    });
  }, [history, timeRange, dateRangeLimit]);

  // Helper to compute genuine tracked minutes for any task
  const getTaskTrackedMinutes = (task: Task) => {
    const isLiveActive = activeFocusTaskId === task.id && isFocusTimerRunning;
    const elapsedSec = isLiveActive ? focusElapsedSeconds : (taskElapsedSeconds[task.id] || 0);
    if (task.status === 'completed') {
      // If task is completed, the total duration of the task replaces the timer time
      return Math.max(task.duration || 30, Math.ceil(elapsedSec / 60));
    }
    if (elapsedSec > 0) {
      return Math.max(1, Math.ceil(elapsedSec / 60));
    }
    return 0;
  };

  // 1. Calculate Real Tracked Minutes
  const totalTrackedMinutes = useMemo(() => {
    let sum = 0;
    periodTasks.forEach((t) => {
      sum += getTaskTrackedMinutes(t);
    });
    // Add completed minutes from historical logs if outside today's active tasks in week/month/all view
    if (timeRange !== 'today' && periodHistory.length > 0) {
      const historicalMinutes = periodHistory
        .filter((h) => h.date !== todayDateStr)
        .reduce((acc, h) => acc + (h.completedMinutes || 0), 0);
      sum += historicalMinutes;
    }
    return sum;
  }, [periodTasks, periodHistory, timeRange, todayDateStr, activeFocusTaskId, isFocusTimerRunning, focusElapsedSeconds, taskElapsedSeconds]);

  const displayHours = Math.floor(totalTrackedMinutes / 60);
  const displayMins = totalTrackedMinutes % 60;

  // 2. Real Completion Counts
  const totalTasksCount = periodTasks.length;
  const totalCompletedCount = periodTasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasksCount > 0 ? Math.round((totalCompletedCount / totalTasksCount) * 100) : 0;

  // 3. Planned vs Completed Minutes for Real Deep Focus Quality
  const plannedMinutes = useMemo(() => {
    let sum = periodTasks.reduce((acc, t) => acc + (t.duration || 0), 0);
    if (timeRange !== 'today' && periodHistory.length > 0) {
      const histPlanned = periodHistory
        .filter((h) => h.date !== todayDateStr)
        .reduce((acc, h) => acc + (h.plannedMinutes || 0), 0);
      sum += histPlanned;
    }
    return sum || capacity.totalPlannedMinutes || 1;
  }, [periodTasks, periodHistory, timeRange, todayDateStr, capacity.totalPlannedMinutes]);

  const focusQualityPercent = plannedMinutes > 0
    ? Math.min(100, Math.round((totalTrackedMinutes / plannedMinutes) * 100))
    : 0;

  // 4. Real Task Distribution List (replacing fake sites)
  const taskFocusList = useMemo(() => {
    return periodTasks
      .map((t) => {
        const trackedMin = getTaskTrackedMinutes(t);
        const percentage = totalTrackedMinutes > 0 ? Math.round((trackedMin / totalTrackedMinutes) * 100) : 0;
        return {
          task: t,
          trackedMinutes: trackedMin,
          percentage,
        };
      })
      .filter((item) => {
        if (selectedCategory !== 'All' && item.task.category !== selectedCategory) return false;
        if (selectedTaskId && item.task.id !== selectedTaskId) return false;
        return true;
      })
      .sort((a, b) => b.trackedMinutes - a.trackedMinutes || (b.task.status === 'completed' ? 1 : -1));
  }, [periodTasks, totalTrackedMinutes, selectedCategory, selectedTaskId, activeFocusTaskId, isFocusTimerRunning, focusElapsedSeconds, taskElapsedSeconds]);

  // 5. Top Focus Category
  const categoryStats = useMemo(() => {
    const counts: Record<Category, { tasks: number; minutes: number; completed: number }> = {
      Work: { tasks: 0, minutes: 0, completed: 0 },
      Learning: { tasks: 0, minutes: 0, completed: 0 },
      Personal: { tasks: 0, minutes: 0, completed: 0 },
      Health: { tasks: 0, minutes: 0, completed: 0 },
      Neutral: { tasks: 0, minutes: 0, completed: 0 },
    };

    periodTasks.forEach((t) => {
      const cat = (t.category as Category) || 'Work';
      if (counts[cat]) {
        counts[cat].tasks += 1;
        counts[cat].minutes += getTaskTrackedMinutes(t);
        if (t.status === 'completed') counts[cat].completed += 1;
      }
    });

    const totalMin = Object.values(counts).reduce((acc, c) => acc + c.minutes, 0) || 1;

    return Object.entries(counts).map(([cat, val]) => ({
      category: cat as Category,
      tasks: val.tasks,
      minutes: val.minutes,
      completed: val.completed,
      percentage: totalMin > 0 && val.minutes > 0 ? Math.round((val.minutes / totalMin) * 100) : 0,
      color: getCategoryColor(cat as Category),
    }));
  }, [periodTasks, activeFocusTaskId, isFocusTimerRunning, focusElapsedSeconds, taskElapsedSeconds]);

  const topCategory = useMemo(() => {
    const sorted = [...categoryStats].filter((c) => c.minutes > 0).sort((a, b) => b.minutes - a.minutes);
    return sorted[0] || null;
  }, [categoryStats]);

  // 6. Priority Stats
  const priorityStats = useMemo(() => {
    const prios: Record<Priority, { count: number; completed: number }> = {
      critical: { count: 0, completed: 0 },
      important: { count: 0, completed: 0 },
      flexible: { count: 0, completed: 0 },
      optional: { count: 0, completed: 0 },
    };

    periodTasks.forEach((t) => {
      if (prios[t.priority]) {
        prios[t.priority].count += 1;
        if (t.status === 'completed') prios[t.priority].completed += 1;
      }
    });

    return [
      { id: 'critical', label: 'Critical Priority', ...prios.critical, color: '#E5484D', bg: 'bg-[#E5484D]/10 text-[#E5484D]' },
      { id: 'important', label: 'Important Priority', ...prios.important, color: '#F97316', bg: 'bg-[#F97316]/10 text-[#F97316]' },
      { id: 'flexible', label: 'Flexible Outcomes', ...prios.flexible, color: '#D97706', bg: 'bg-[#D97706]/10 text-[#D97706]' },
      { id: 'optional', label: 'Optional / Bonus', ...prios.optional, color: '#64748B', bg: 'bg-[#64748B]/10 text-[#64748B]' },
    ];
  }, [periodTasks]);

  // 7. Filtered Tasks Table at bottom
  const filteredTasks = useMemo(() => {
    return periodTasks.filter((t) => {
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'all') {
        if (selectedPriority === 'important') {
          if (t.priority !== 'critical' && t.priority !== 'important') return false;
        } else if (selectedPriority === 'flexible') {
          if (t.priority !== 'flexible' && t.priority !== 'optional') return false;
        } else if (t.priority !== selectedPriority) {
          return false;
        }
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'completed' && t.status !== 'completed') return false;
        if (selectedStatus === 'pending' && t.status === 'completed') return false;
      }
      if (selectedTaskId && t.id !== selectedTaskId) return false;
      return true;
    });
  }, [periodTasks, selectedCategory, selectedPriority, selectedStatus, selectedTaskId]);

  const hasActiveFilter =
    selectedCategory !== 'All' ||
    selectedPriority !== 'all' ||
    selectedStatus !== 'all' ||
    selectedTaskId !== null;

  const clearFilters = () => {
    setAnalyticsFilter({
      category: 'All',
      priority: 'all',
      status: 'all',
      taskId: undefined,
      site: undefined,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 select-none max-w-[1600px] mx-auto">
      {/* 1. HEADER & TIME CONTROLS */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 border border-borderToken transition-colors shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
            <BarChart3 size={28} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2.5">
              <span>Focus & Productivity Analytics</span>
              <span className="text-[12px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-tag-healthBg text-tag-health">
                Actual User Data
              </span>
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-mutedText mt-0.5">
              Real-time insights computed directly from your tasks, active focus sessions, and tracked completions.
            </p>
          </div>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center bg-card-subtle p-1 rounded-2xl border border-borderToken">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setAnalyticsFilter({ timeRange: period.id as any })}
              className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
                timeRange === period.id
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-mutedText hover:text-foreground'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE FILTER BANNER */}
      {hasActiveFilter && (
        <div className="bg-primary-soft border border-primary/20 rounded-[22px] px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 animate-enter-up">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-primary flex-shrink-0" />
            <span className="text-[12.5px] font-semibold text-primary">Active View Filters:</span>

            {selectedPriority !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Priority:</span>
                <strong className="capitalize text-primary">{selectedPriority}</strong>
                <button onClick={() => setAnalyticsFilter({ priority: 'all' })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Category:</span>
                <strong className="text-primary">{selectedCategory}</strong>
                <button onClick={() => setAnalyticsFilter({ category: 'All' })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Status:</span>
                <strong className="capitalize text-primary">{selectedStatus}</strong>
                <button onClick={() => setAnalyticsFilter({ status: 'all' })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedTaskId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-[12px] font-medium shadow-xs border border-borderToken">
                <span>Specific Task Filtered</span>
                <button onClick={() => setAnalyticsFilter({ taskId: undefined })} className="hover:text-tag-important">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline cursor-pointer"
          >
            <span>Reset All Filters</span>
            <X size={13} />
          </button>
        </div>
      )}

      {/* 2. REAL TOP METRIC SUMMARY CARDS (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Focus Time */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Actual Focus Time</span>
            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] sm:text-[32px] font-serif font-bold text-foreground leading-none">
              {displayHours}h {displayMins > 0 ? `${displayMins}m` : '00m'}
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-tag-health font-medium mt-1.5">
              <TrendingUp size={13} />
              <span>
                {totalTrackedMinutes > 0
                  ? `${totalTrackedMinutes}m recorded across ${periodTasks.length} task${periodTasks.length === 1 ? '' : 's'}`
                  : '0m recorded. Start a timer to track focus'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Focus Quality / Planned Ratio */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Planned Focus Ratio</span>
            <div className="w-9 h-9 rounded-xl bg-tag-learningBg flex items-center justify-center text-tag-learning">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] sm:text-[32px] font-serif font-bold text-foreground leading-none">
              {focusQualityPercent}%
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-tag-learning font-medium mt-1.5">
              <Sparkles size={13} />
              <span>
                {plannedMinutes > 0
                  ? `${totalTrackedMinutes}m of ${plannedMinutes}m planned load`
                  : 'No tasks scheduled'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Outcomes Completed */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Outcomes Completed</span>
            <div className="w-9 h-9 rounded-xl bg-tag-healthBg flex items-center justify-center text-tag-health">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[28px] sm:text-[32px] font-serif font-bold text-foreground leading-none">
              {totalCompletedCount} / {totalTasksCount}
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-textSecondary font-medium mt-1.5">
              <span>{completionRate}% completion rate</span>
            </div>
          </div>
        </div>

        {/* Card 4: Top Focus Category */}
        <div className="bg-card rounded-[24px] p-5 border border-borderToken flex flex-col justify-between shadow-soft hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-mutedText">Top Focus Category</span>
            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] sm:text-[24px] font-serif font-semibold text-foreground leading-tight truncate">
              {topCategory ? topCategory.category : 'None Yet'}
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-mutedText font-medium mt-1.5">
              <span>
                {topCategory
                  ? `${Math.floor(topCategory.minutes / 60)}h ${topCategory.minutes % 60}m tracked (${topCategory.percentage}%)`
                  : 'Start focusing to build stats'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: REAL TASK FOCUS BREAKDOWN + CATEGORY & PRIORITY BREAKDOWN */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 cols): Real Task & Focus Allocation */}
        <div className="xl:col-span-7 bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-borderToken">
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  <span>Task & Focus Session Distribution</span>
                </h3>
                <p className="text-[12.5px] text-mutedText mt-0.5">
                  Actual tracked focus minutes and task time allocations. Click any task to filter.
                </p>
              </div>

              {/* Quick Category Tabs */}
              <div className="flex items-center gap-1.5 bg-card-subtle p-1 rounded-xl">
                {['All', 'Work', 'Learning', 'Personal', 'Health'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAnalyticsFilter({ category: cat })}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-card text-foreground font-semibold shadow-xs'
                        : 'text-mutedText hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Task Focus List */}
            <div className="divide-y divide-borderToken mt-2">
              {taskFocusList.length === 0 ? (
                <div className="py-12 text-center text-mutedText flex flex-col items-center justify-center">
                  <DoodleTasks size={54} className="opacity-60 mb-2" />
                  <span className="font-serif text-[15px] font-medium text-foreground">No focus recorded for this period</span>
                  <span className="text-xs text-mutedText mt-1 max-w-sm">
                    Start a focus timer on any task in your backlog or Today view to see your real session analytics here.
                  </span>
                </div>
              ) : (
                taskFocusList.map(({ task, trackedMinutes, percentage }) => {
                  const CategoryIcon = categoryIcons[task.category as Category] || HelpCircle;
                  const isSelected = selectedTaskId === task.id;
                  const isLiveActive = activeFocusTaskId === task.id && isFocusTimerRunning;
                  const isDone = task.status === 'completed';
                  const taskHours = Math.floor(trackedMinutes / 60);
                  const taskMins = trackedMinutes % 60;
                  const categoryColor = getCategoryColor(task.category as Category);

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (selectedTaskId === task.id) {
                          setAnalyticsFilter({ taskId: undefined });
                        } else {
                          setAnalyticsFilter({ taskId: task.id, category: task.category });
                        }
                      }}
                      className={`flex items-center justify-between py-3.5 px-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary-soft/70 border border-primary/30 shadow-xs'
                          : 'hover:bg-card-subtle'
                      }`}
                    >
                      {/* Left: Category Icon + Task Title */}
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform group-hover:scale-105"
                          style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
                        >
                          <CategoryIcon size={19} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[14px] font-semibold truncate ${isDone ? 'line-through text-mutedText' : 'text-foreground'}`}>
                              {task.title}
                            </span>
                            {isLiveActive && (
                              <span className="px-1.5 py-0.2 rounded bg-tag-health text-white text-[10px] font-bold animate-pulse">
                                Live
                              </span>
                            )}
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded bg-primary text-white text-[10px] font-bold">
                                Filtered
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11.5px] text-mutedText mt-0.5">
                            <span className="font-mono">
                              {task.scheduledDate || todayDateStr}
                              {task.scheduledStart ? ` • ${task.scheduledStart}` : ''}
                            </span>
                            <span className="capitalize">• {task.priority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Category + Time Bar + Tracked Duration */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11.5px] font-medium hidden sm:inline-block ${getCategoryBadgeClass(task.category as Category)}`}>
                          {task.category}
                        </span>

                        {/* Mini Bar Indicator */}
                        <div className="w-16 sm:w-24 h-2 rounded-full bg-card-subtle overflow-hidden relative">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(percentage, trackedMinutes > 0 ? 8 : 0)}%`,
                              backgroundColor: categoryColor,
                            }}
                          />
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="text-[13.5px] font-mono font-semibold text-foreground block">
                            {taskHours > 0 ? `${taskHours}h ` : ''}{taskMins}m
                          </span>
                          <span className="text-[10.5px] text-mutedText font-medium">
                            {percentage > 0 ? `${percentage}% total` : isDone ? 'Completed' : 'Planned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 text-center border-t border-borderToken flex items-center justify-between text-[12px] text-mutedText">
            <span>Calculated from genuine focus timer sessions & completions</span>
            <span className="text-primary font-medium flex items-center gap-1">
              <Sparkles size={13} /> 100% Real Activity
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Category Breakdown & Priority Velocity */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* 1. Category Distribution Box */}
          <div className="bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft">
            <h3 className="text-[19px] sm:text-[20px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2 mb-4">
              <Layers size={19} className="text-primary" />
              <span>Category Focus Breakdown</span>
            </h3>

            {/* Stacked Percentage Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex gap-0.5 bg-card-subtle p-0.5 mb-5 shadow-inner">
              {categoryStats.filter((s) => s.percentage > 0).map((stat) => (
                <div
                  key={stat.category}
                  onClick={() => setAnalyticsFilter({ category: stat.category })}
                  style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                  className="h-full rounded-full transition-all duration-500 cursor-pointer hover:opacity-85"
                  title={`${stat.category}: ${stat.percentage}% (${stat.minutes}m)`}
                />
              ))}
              {categoryStats.every((s) => s.percentage === 0) && (
                <div className="w-full h-full bg-borderToken/30 rounded-full" />
              )}
            </div>

            {/* Category Rows */}
            <div className="space-y-2.5">
              {categoryStats.map((stat) => (
                <div
                  key={stat.category}
                  onClick={() => setAnalyticsFilter({ category: stat.category === selectedCategory ? 'All' : stat.category })}
                  className={`flex items-center justify-between p-2.5 px-3 rounded-2xl cursor-pointer transition-all ${
                    selectedCategory === stat.category
                      ? 'bg-primary-soft/60 border border-primary/20'
                      : 'hover:bg-card-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stat.color }} />
                    <span className="text-[13.5px] font-medium text-foreground">{stat.category}</span>
                    <span className="text-[11px] text-mutedText">({stat.tasks} task{stat.tasks === 1 ? '' : 's'})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-mono font-semibold text-foreground">
                      {Math.floor(stat.minutes / 60)}h {stat.minutes % 60}m
                    </span>
                    <span className="text-[12px] font-semibold text-mutedText min-w-[35px] text-right">
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Priority Velocity Card */}
          <div className="bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft">
            <h3 className="text-[19px] sm:text-[20px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2 mb-4">
              <Target size={19} className="text-primary" />
              <span>Priority Completion Velocity</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {priorityStats.map((prio) => (
                <div
                  key={prio.id}
                  onClick={() => setAnalyticsFilter({ priority: selectedPriority === prio.id ? 'all' : prio.id })}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedPriority === prio.id
                      ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'bg-card-subtle border-borderToken hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold text-textSecondary truncate">{prio.label}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: prio.color }} />
                  </div>
                  <div className="text-[20px] font-serif font-bold text-foreground">
                    {prio.completed} <span className="text-[13px] font-sans font-normal text-mutedText">/ {prio.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-card mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${prio.count > 0 ? (prio.completed / prio.count) * 100 : 0}%`,
                        backgroundColor: prio.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4. FILTERED OUTCOMES & SESSIONS EXPLORER */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 border border-borderToken shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-borderToken">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-serif font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              <span>Matching Tasks & Sessions</span>
            </h3>
            <p className="text-[12.5px] text-mutedText mt-0.5">
              Tasks matching your active filter criteria ({filteredTasks.length} found).
            </p>
          </div>

          <button
            onClick={() =>
              navigateToTasks({
                category: selectedCategory !== 'All' ? selectedCategory : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
              })
            }
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-xs"
          >
            <span>Open in Task Backlog</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-borderToken mt-2">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-mutedText flex flex-col items-center justify-center">
              <DoodleTasks size={60} className="opacity-70 mb-2" />
              <span className="font-serif text-[15px] font-medium text-foreground">No outcomes match the current filter</span>
              <span className="text-xs text-mutedText mt-0.5">Try resetting or selecting another category/priority.</span>
            </div>
          ) : (
            filteredTasks.slice(0, 10).map((task) => {
              const isDone = task.status === 'completed';
              const trackedMin = getTaskTrackedMinutes(task);
              const isThisActive = activeFocusTaskId === task.id && isFocusTimerRunning;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-3 px-2 hover:bg-card-subtle rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isDone
                          ? 'bg-tag-health'
                          : task.priority === 'critical'
                          ? 'bg-[#E5484D]'
                          : task.priority === 'important'
                          ? 'bg-[#F97316]'
                          : 'bg-[#D97706]'
                      }`}
                    />
                    <div className="min-w-0">
                      <span className={`text-[13.5px] font-medium block truncate ${isDone ? 'line-through text-mutedText' : 'text-foreground'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-mutedText font-mono mt-0.5">
                        {task.scheduledStart && (
                          <span>
                            {task.scheduledStart} - {task.scheduledEnd || ''}
                          </span>
                        )}
                        <span>• Planned: {task.duration}m</span>
                        {trackedMin > 0 && (
                          <span className="text-primary font-semibold">
                            • Tracked: {trackedMin}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11.5px] font-medium ${getCategoryBadgeClass(task.category as Category)}`}>
                      {task.category}
                    </span>

                    {!isDone && (
                      <button
                        onClick={() => startFocusTask(task.id)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isThisActive
                            ? 'bg-tag-health text-white'
                            : 'bg-card-subtle hover:bg-primary-soft text-mutedText hover:text-primary'
                        }`}
                        title={isThisActive ? 'Active Focus Session' : 'Start Focus Session'}
                      >
                        <Play size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
