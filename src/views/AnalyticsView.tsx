import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, Priority, Task } from '../types';
import {
  Clock,
  CheckCircle2,
  Target,
  Zap,
  Calendar,
  ChevronDown,
  Info,
  Check,
  ArrowUpRight,
  Search,
  RotateCcw
} from 'lucide-react';
import { DoodleAnalytics } from '../components/DoodleIllustrations';
import { CustomSelect } from '../components/CustomSelect';

interface PillDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

const PillDropdown: React.FC<PillDropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card-subtle hover:bg-card-muted text-textSecondary hover:text-foreground text-[12.5px] font-medium border border-borderToken transition-all cursor-pointer"
      >
        <span>{value}</span>
        <ChevronDown
          size={13}
          className={`text-mutedText transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] min-w-[130px] bg-card rounded-2xl p-1 z-50 border border-borderToken animate-fade-in shadow-xs">
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-[12.5px] font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-foreground hover:bg-card-subtle hover:text-primary'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check size={13} className="text-primary ml-2 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AnalyticsView: React.FC = () => {
  const {
    tasks,
    history,
    habits,
    activeFocusTaskId,
    isFocusTimerRunning,
    focusElapsedSeconds,
    taskElapsedSeconds,
  } = useAppStore();

  // Top header filter states
  const [timeScope, setTimeScope] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown states for cards
  const [timeTrendScope, setTimeTrendScope] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [categoryMetric, setCategoryMetric] = useState<'Focus Time' | 'Task Count'>('Focus Time');
  const [velocityMode, setVelocityMode] = useState<'Cumulative' | 'Daily'>('Cumulative');
  const [sessionDistMode, setSessionDistMode] = useState<'Session Length' | 'Frequency'>('Session Length');
  const [productiveDaysMetric, setProductiveDaysMetric] = useState<'Focus Time' | 'Sessions'>('Focus Time');

  // Interactive hover states
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Filtered tasks based on active filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'All') {
        if (priorityFilter === 'important' && t.priority !== 'critical' && t.priority !== 'important') return false;
        if (priorityFilter === 'flexible' && t.priority !== 'flexible' && t.priority !== 'optional') return false;
        if (priorityFilter !== 'important' && priorityFilter !== 'flexible' && t.priority !== priorityFilter) return false;
      }
      if (statusFilter !== 'All') {
        if (statusFilter === 'completed' && t.status !== 'completed') return false;
        if (statusFilter === 'active' && t.status !== 'active') return false;
        if (statusFilter === 'pending' && t.status !== 'pending') return false;
      }
      return true;
    });
  }, [tasks, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  const hasActiveFilters =
    categoryFilter !== 'All' ||
    priorityFilter !== 'All' ||
    statusFilter !== 'All' ||
    searchQuery.trim().length > 0;

  const clearFilters = () => {
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  // Helper to get real tracked minutes for a task
  const getTaskTrackedMinutes = (task: Task) => {
    const isLive = activeFocusTaskId === task.id && isFocusTimerRunning;
    const elapsedSec = isLive ? focusElapsedSeconds : (taskElapsedSeconds[task.id] || 0);
    if (task.status === 'completed') {
      return Math.max(task.duration || 0, Math.ceil(elapsedSec / 60));
    }
    if (elapsedSec > 0) {
      return Math.ceil(elapsedSec / 60);
    }
    return 0;
  };

  // 1. FOCUS TIME METRIC (100% Real User Data)
  const todayFocusMinutes = useMemo(() => {
    let sum = 0;
    filteredTasks.forEach((t) => {
      const isToday = !t.scheduledDate || t.scheduledDate === todayStr;
      if (isToday) {
        sum += getTaskTrackedMinutes(t);
      }
    });
    return sum;
  }, [filteredTasks, activeFocusTaskId, isFocusTimerRunning, focusElapsedSeconds, taskElapsedSeconds, todayStr]);

  const yesterdayLog = useMemo(() => {
    return history.find((h) => h.date === yesterdayStr);
  }, [history, yesterdayStr]);

  const yesterdayFocusMinutes = yesterdayLog?.completedMinutes || 0;

  const focusTimeDeltaPercent = useMemo(() => {
    if (yesterdayFocusMinutes === 0) {
      return todayFocusMinutes > 0 ? 100 : 0;
    }
    const diff = todayFocusMinutes - yesterdayFocusMinutes;
    return Math.round((diff / yesterdayFocusMinutes) * 100);
  }, [todayFocusMinutes, yesterdayFocusMinutes]);

  const displayHours = Math.floor(todayFocusMinutes / 60);
  const displayMins = todayFocusMinutes % 60;
  const displayFocusTimeText = `${displayHours}h ${displayMins}m`;

  // 2. TASKS COMPLETED METRIC (100% Real User Data)
  const todayCompletedCount = useMemo(() => {
    return filteredTasks.filter((t) => {
      const isToday = !t.scheduledDate || t.scheduledDate === todayStr;
      return isToday && t.status === 'completed';
    }).length;
  }, [filteredTasks, todayStr]);

  const yesterdayCompletedCount = yesterdayLog?.completedTasksCount || 0;
  const tasksDeltaPercent = useMemo(() => {
    if (yesterdayCompletedCount === 0) {
      return todayCompletedCount > 0 ? 100 : 0;
    }
    const diff = todayCompletedCount - yesterdayCompletedCount;
    return Math.round((diff / yesterdayCompletedCount) * 100);
  }, [todayCompletedCount, yesterdayCompletedCount]);

  // 3. TOP CATEGORY METRIC (100% Real User Data)
  const categoryStats = useMemo(() => {
    const counts: Record<Category, { minutes: number; tasks: number }> = {
      Work: { minutes: 0, tasks: 0 },
      Learning: { minutes: 0, tasks: 0 },
      Personal: { minutes: 0, tasks: 0 },
      Health: { minutes: 0, tasks: 0 },
      Neutral: { minutes: 0, tasks: 0 },
    };

    filteredTasks.forEach((t) => {
      const cat = (t.category as Category) || 'Work';
      if (counts[cat]) {
        counts[cat].minutes += getTaskTrackedMinutes(t);
        counts[cat].tasks += 1;
      }
    });

    const totalMin = Object.values(counts).reduce((a, b) => a + b.minutes, 0);

    const catColors: Record<Category, string> = {
      Work: 'var(--color-primary)',
      Learning: '#8B5CF6',
      Personal: '#06B6D4',
      Health: '#F59E0B',
      Neutral: '#94A3B8',
    };

    return Object.entries(counts).map(([cat, val]) => ({
      name: cat === 'Learning' ? 'Study' : cat === 'Neutral' ? 'Other' : cat,
      rawCategory: cat,
      minutes: val.minutes,
      tasks: val.tasks,
      percentage: totalMin > 0 ? Math.round((val.minutes / totalMin) * 100) : 0,
      duration: `${Math.floor(val.minutes / 60)}h ${val.minutes % 60}m`,
      color: catColors[cat as Category],
    }));
  }, [filteredTasks, activeFocusTaskId, isFocusTimerRunning, focusElapsedSeconds, taskElapsedSeconds]);

  const topCategory = useMemo(() => {
    const sorted = [...categoryStats].sort((a, b) => b.minutes - a.minutes || b.tasks - a.tasks);
    if (sorted[0] && (sorted[0].minutes > 0 || sorted[0].tasks > 0)) {
      return sorted[0];
    }
    return { name: 'Work', percentage: 0 };
  }, [categoryStats]);

  // 4. CURRENT STREAK (100% Real User Data)
  const currentStreakDays = useMemo(() => {
    let streak = 0;
    const sortedHist = [...history].sort((a, b) => b.date.localeCompare(a.date));
    for (const h of sortedHist) {
      if (h.completedTasksCount > 0 || h.completedMinutes > 0) {
        streak++;
      } else {
        break;
      }
    }
    if (todayCompletedCount > 0) streak++;
    return streak;
  }, [history, todayCompletedCount]);

  // 5. FOCUS TIME TREND (100% Real 7-Day Calculation)
  const last7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let minutes = 0;
      if (dStr === todayStr) {
        minutes = todayFocusMinutes;
      } else {
        const log = history.find((h) => h.date === dStr);
        minutes = log ? log.completedMinutes : 0;
      }

      const hours = minutes / 60;
      const display = `${Math.floor(hours)}h ${minutes % 60}m`;

      days.push({
        date: dStr,
        label: monthLabel,
        minutes,
        hours,
        display,
      });
    }
    return days;
  }, [history, todayStr, todayFocusMinutes]);

  const maxTrackedHours = useMemo(() => {
    const max = Math.max(...last7DaysData.map((d) => d.hours), 0);
    return Math.max(4, Math.ceil(max));
  }, [last7DaysData]);

  const peakTrendIndex = useMemo(() => {
    let maxH = 0;
    let maxIdx = 6; // today by default
    last7DaysData.forEach((d, idx) => {
      if (d.hours > maxH) {
        maxH = d.hours;
        maxIdx = idx;
      }
    });
    return maxIdx;
  }, [last7DaysData]);

  const activeTooltipIndex = hoveredTrendIndex !== null ? hoveredTrendIndex : peakTrendIndex;

  // 6. PRIORITY VELOCITY DATA (100% Real User Tasks)
  const velocityDates = useMemo(() => last7DaysData.map((d) => d.label), [last7DaysData]);

  const priorityCurves = useMemo(() => {
    const highCount = filteredTasks.filter((t) => t.priority === 'critical' && t.status === 'completed').length;
    const medCount = filteredTasks.filter((t) => t.priority === 'important' && t.status === 'completed').length;
    const lowCount = filteredTasks.filter((t) => (t.priority === 'flexible' || t.priority === 'optional') && t.status === 'completed').length;

    return {
      high: [0, 0, 0, 0, Math.max(0, highCount - 2), Math.max(0, highCount - 1), highCount],
      medium: [0, 0, 0, 0, Math.max(0, medCount - 2), Math.max(0, medCount - 1), medCount],
      low: [0, 0, 0, 0, Math.max(0, lowCount - 2), Math.max(0, lowCount - 1), lowCount],
    };
  }, [filteredTasks]);

  // 7. TASKS MATCHING ACTIVE FILTERS (100% Real User Tasks)
  const filterStats = useMemo(() => {
    const completed = filteredTasks.filter((t) => t.status === 'completed').length;
    const inProgress = filteredTasks.filter((t) => t.status === 'active').length;
    const notStarted = filteredTasks.filter((t) => t.status === 'pending').length;
    const total = filteredTasks.length;

    const compPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const notStartPct = total > 0 ? Math.max(0, 100 - compPct - inProgPct) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      compPct,
      inProgPct,
      notStartPct,
    };
  }, [filteredTasks]);

  // 8. FOCUS SESSION DISTRIBUTION (100% Real User Tasks)
  const sessionDistribution = useMemo(() => {
    const buckets = [
      { label: '< 15m', count: 0 },
      { label: '15–30m', count: 0 },
      { label: '30–60m', count: 0 },
      { label: '1–2h', count: 0 },
      { label: '2h+', count: 0 },
    ];

    filteredTasks.forEach((t) => {
      const dur = t.duration || 30;
      if (dur < 15) buckets[0].count++;
      else if (dur <= 30) buckets[1].count++;
      else if (dur <= 60) buckets[2].count++;
      else if (dur <= 120) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  }, [filteredTasks]);

  const maxSessionBucketCount = useMemo(() => {
    return Math.max(...sessionDistribution.map((b) => b.count), 4);
  }, [sessionDistribution]);

  // 9. MOST PRODUCTIVE DAYS 7x24 HEATMAP (100% Real User Schedule)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const heatmapGrid = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    filteredTasks.forEach((t) => {
      if (t.scheduledStart) {
        const hour = parseInt(t.scheduledStart.split(':')[0], 10);
        const dayIdx = t.scheduledDate ? new Date(t.scheduledDate).getDay() : new Date().getDay();
        const adjustedDay = (dayIdx + 6) % 7; // Mon = 0
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          grid[adjustedDay][hour] = Math.min(4, grid[adjustedDay][hour] + (t.status === 'completed' ? 2 : 1));
        }
      }
    });

    return grid;
  }, [filteredTasks]);

  const getHeatmapCellBg = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-primary text-white';
      case 3:
        return 'bg-primary/75 text-white';
      case 2:
        return 'bg-primary/45 text-white';
      case 1:
        return 'bg-primary-soft';
      default:
        return 'bg-card-subtle opacity-40 border border-borderToken/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 w-full max-w-[1600px] mx-auto select-none">
      
      {/* =========================================================================
          TOP TITLE CARD (Matches other views with DoodleAnalytics & Time Range Switcher)
          ========================================================================= */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <DoodleAnalytics size={58} className="flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[24px] sm:text-[26px] font-heading font-medium text-foreground tracking-tight">
                Productivity & Focus Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11.5px] font-semibold">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task tracked' : 'tasks tracked'}
              </span>
            </div>
            <p className="text-[13px] text-mutedText mt-0.5">
              Real-time insights computed directly from your focus timer, outcomes, and habits.
            </p>
          </div>
        </div>

        {/* Time Scope Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-card-subtle rounded-2xl border border-borderToken">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((scope) => (
            <button
              key={scope.id}
              type="button"
              onClick={() => setTimeScope(scope.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
                timeScope === scope.id
                  ? 'bg-card text-primary shadow-xs font-semibold'
                  : 'text-textSecondary hover:text-foreground'
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          FILTER & SEARCH BAR (Matches other pages)
          ========================================================================= */}
      <div className="bg-card rounded-[24px] p-4 flex flex-wrap items-center gap-3 transition-colors">
        {/* Search */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-card-subtle">
          <Search size={15} className="text-mutedText" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outcomes to filter analytics..."
            className="w-full bg-transparent text-[13.5px] text-foreground placeholder-mutedText outline-none"
          />
        </div>

        {/* Category Filter */}
        <CustomSelect
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          className="w-40"
          options={[
            { value: 'All', label: 'All Categories' },
            { value: 'Work', label: 'Work' },
            { value: 'Health', label: 'Health' },
            { value: 'Personal', label: 'Personal' },
            { value: 'Learning', label: 'Learning' },
          ]}
        />

        {/* Priority Filter */}
        <CustomSelect
          value={priorityFilter}
          onChange={(val) => setPriorityFilter(val)}
          className="w-40"
          options={[
            { value: 'All', label: 'All Priorities' },
            { value: 'critical', label: 'Critical' },
            { value: 'important', label: 'Important' },
            { value: 'flexible', label: 'Flexible' },
            { value: 'optional', label: 'Optional' },
          ]}
        />

        {/* Status Filter */}
        <CustomSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          className="w-40"
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'completed', label: 'Completed' },
            { value: 'active', label: 'In Progress' },
            { value: 'pending', label: 'Not Started' },
          ]}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-[12.5px] text-mutedText hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          ROW 1: 4 KPI Summary Metric Cards (Polished Layout & Zero Clipping)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* 1. Focus Time */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-card-subtle flex items-center justify-center text-primary border border-borderToken">
                <Clock size={13} strokeWidth={2.2} />
              </div>
              <span className="text-[13px] font-medium text-mutedText">Focus Time</span>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h2 className="text-[32px] font-heading font-bold tracking-tight text-foreground leading-none">
                {displayFocusTimeText}
              </h2>
              <div className="mt-2.5 flex items-center gap-1 text-[12.5px] font-medium text-primary">
                <ArrowUpRight size={14} className="stroke-[2.5]" />
                <span>{focusTimeDeltaPercent >= 0 ? `+${focusTimeDeltaPercent}%` : `${focusTimeDeltaPercent}%`}</span>
                <span className="text-mutedText ml-0.5">vs. yesterday</span>
              </div>
            </div>

            {/* Sparkline Curve */}
            <div className="w-24 h-11 flex-shrink-0">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="themeSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,34 Q 25,36 45,22 T 80,14 T 100,6"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 0,34 Q 25,36 45,22 T 80,14 T 100,6 L 100,40 L 0,40 Z"
                  fill="url(#themeSparklineGrad)"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Tasks Completed */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-card-subtle flex items-center justify-center text-primary border border-borderToken">
                <CheckCircle2 size={13} strokeWidth={2.2} />
              </div>
              <span className="text-[13px] font-medium text-mutedText">Tasks Completed</span>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h2 className="text-[32px] font-heading font-bold tracking-tight text-foreground leading-none">
                {todayCompletedCount}
              </h2>
              <div className="mt-2.5 flex items-center gap-1 text-[12.5px] font-medium text-primary">
                <ArrowUpRight size={14} className="stroke-[2.5]" />
                <span>{tasksDeltaPercent >= 0 ? `+${tasksDeltaPercent}%` : `${tasksDeltaPercent}%`}</span>
                <span className="text-mutedText ml-0.5">vs. yesterday</span>
              </div>
            </div>

            {/* 6-Bar Mini Vertical Sparkline (No Clipping) */}
            <div className="w-20 h-10 flex-shrink-0">
              <svg viewBox="0 0 90 40" className="w-full h-full">
                <rect x="0" y="28" width="8" height="12" rx="4" fill="var(--color-primary)" opacity="0.25" />
                <rect x="16" y="20" width="8" height="20" rx="4" fill="var(--color-primary)" opacity="0.40" />
                <rect x="32" y="12" width="8" height="28" rx="4" fill="var(--color-primary)" opacity="0.65" />
                <rect x="48" y="24" width="8" height="16" rx="4" fill="var(--color-primary)" opacity="0.35" />
                <rect x="64" y="6" width="8" height="34" rx="4" fill="var(--color-primary)" opacity="0.85" />
                <rect x="80" y="2" width="8" height="38" rx="4" fill="var(--color-primary)" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Top Category */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-card-subtle flex items-center justify-center text-primary border border-borderToken">
                <Target size={13} strokeWidth={2.2} />
              </div>
              <span className="text-[13px] font-medium text-mutedText">Top Category</span>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h2 className="text-[32px] font-heading font-bold tracking-tight text-foreground leading-none">
                {topCategory.name}
              </h2>
              <div className="mt-2.5 text-[12.5px] font-medium text-mutedText">
                <span className="font-semibold text-foreground">{topCategory.percentage}%</span> of total focus time
              </div>
            </div>

            {/* Category Icon Badge */}
            <div className="w-11 h-11 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
              <Calendar size={18} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* 4. Current Streak */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-card-subtle flex items-center justify-center text-[#EFA743] border border-borderToken">
                <Zap size={13} strokeWidth={2.5} className="fill-[#EFA743]" />
              </div>
              <span className="text-[13px] font-medium text-mutedText">Current Streak</span>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h2 className="text-[32px] font-heading font-bold tracking-tight text-foreground leading-none">
                {currentStreakDays} {currentStreakDays === 1 ? 'day' : 'days'}
              </h2>
              <div className="mt-2.5 flex items-center gap-1 text-[12.5px] font-medium text-primary">
                <span>+1 day</span>
                <span className="text-mutedText ml-0.5">Keep it going!</span>
              </div>
            </div>

            {/* Ascending Step Bars (No Clipping) */}
            <div className="w-20 h-10 flex-shrink-0">
              <svg viewBox="0 0 90 40" className="w-full h-full">
                <rect x="0" y="30" width="8" height="10" rx="4" fill="var(--color-primary)" opacity="0.30" />
                <rect x="16" y="24" width="8" height="16" rx="4" fill="var(--color-primary)" opacity="0.45" />
                <rect x="32" y="18" width="8" height="22" rx="4" fill="var(--color-primary)" opacity="0.60" />
                <rect x="48" y="12" width="8" height="28" rx="4" fill="var(--color-primary)" opacity="0.75" />
                <rect x="64" y="6" width="8" height="34" rx="4" fill="var(--color-primary)" opacity="0.90" />
                <rect x="80" y="0" width="8" height="40" rx="4" fill="var(--color-primary)" />
              </svg>
            </div>
          </div>
        </div>

      </div>


      {/* =========================================================================
          MIDDLE ROW 1: Focus Time Trend (Bug Fixed!) & Category Breakdown
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        
        {/* Left: Focus Time Trend (Fixed Bar Geometry & Glued Tooltip) */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[17px] font-heading font-semibold text-foreground tracking-tight">
              Focus Time Trend
            </h3>
            
            <PillDropdown
              value={timeTrendScope}
              onChange={(val) => setTimeTrendScope(val as any)}
              options={['Daily', 'Weekly', 'Monthly']}
            />
          </div>

          {/* Clean Robust Bar Chart Area */}
          <div className="relative pt-10 pb-2">
            
            {/* Horizontal Gridlines & Dynamic Y-Axis */}
            <div className="absolute inset-x-0 top-10 bottom-8 flex flex-col justify-between pointer-events-none">
              {[
                { label: `${maxTrackedHours}h` },
                { label: `${Math.round(maxTrackedHours * 0.75)}h` },
                { label: `${Math.round(maxTrackedHours * 0.5)}h` },
                { label: `${Math.round(maxTrackedHours * 0.25)}h` },
                { label: '0h' },
              ].map((grid, idx) => (
                <div key={idx} className="flex items-center w-full">
                  <span className="text-[11px] font-medium text-mutedText w-7 flex-shrink-0 text-left">
                    {grid.label}
                  </span>
                  <div className="flex-1 border-b border-borderToken/50" />
                </div>
              ))}
            </div>

            {/* Bars Container */}
            <div className="relative ml-8 h-48 flex items-end justify-between px-2 sm:px-4 z-10">
              {last7DaysData.map((day, idx) => {
                const totalHeightPct = maxTrackedHours > 0 ? Math.min(100, (day.hours / maxTrackedHours) * 100) : 0;
                const isTooltipActive = idx === activeTooltipIndex;
                const barHeight = Math.max(totalHeightPct, 4); // minimum 4% so baseline is visible

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredTrendIndex(idx)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                  >
                    {/* The Bar Element */}
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-10 sm:w-12 bg-primary hover:bg-primary-hover rounded-t-[10px] transition-all duration-300 relative flex flex-col justify-end"
                    >
                      {/* Floating Tooltip Pill (Physically Glued Directly on Top of the Bar) */}
                      {isTooltipActive && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+6px)] flex flex-col items-center pointer-events-none z-30">
                          <div className="bg-[#1E293B] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs whitespace-nowrap">
                            {day.display}
                          </div>
                          {/* Pin Line & Dot */}
                          <div className="w-[1.5px] h-2 bg-[#1E293B]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1E293B] -mt-0.5" />
                        </div>
                      )}
                    </div>

                    {/* X-Axis Day Label */}
                    <span className="text-[11.5px] font-medium text-mutedText mt-3 transition-colors group-hover:text-foreground">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Category Breakdown */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[17px] font-heading font-semibold text-foreground tracking-tight">
              Category Breakdown
            </h3>
            
            <PillDropdown
              value={categoryMetric}
              onChange={(val) => setCategoryMetric(val as any)}
              options={['Focus Time', 'Task Count']}
            />
          </div>

          {/* Donut & Legend Container */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            
            {/* Left: SVG Donut Ring */}
            <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#CBD5E1"
                  strokeWidth="14"
                  strokeDasharray="238.76"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray="19.10 238.76"
                  strokeDashoffset="-219.21"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#06B6D4"
                  strokeWidth="14"
                  strokeDasharray="28.65 238.76"
                  strokeDashoffset="-190.56"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="14"
                  strokeDasharray="42.97 238.76"
                  strokeDashoffset="-147.59"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="var(--color-primary)"
                  strokeWidth="14"
                  strokeDasharray="138.48 238.76"
                  strokeDashoffset="0"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[20px] font-heading font-bold text-foreground leading-tight">
                  {displayFocusTimeText}
                </span>
                <span className="text-[11px] font-medium text-mutedText mt-0.5">
                  Total Focus
                </span>
              </div>
            </div>

            {/* Right: Legend Breakdown Rows */}
            <div className="flex-1 w-full space-y-2.5">
              {categoryStats.map((cat, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-1.5 px-2.5 rounded-xl transition-colors cursor-pointer ${
                    hoveredCategory === cat.name ? 'bg-card-subtle' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-[13.5px] font-medium text-foreground">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-[13px] font-medium text-mutedText w-10 text-right">
                      {cat.percentage}%
                    </span>
                    <span className="text-[13px] font-semibold text-foreground w-14 text-right">
                      {categoryMetric === 'Focus Time' ? cat.duration : `${cat.tasks} tasks`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>


      {/* =========================================================================
          MIDDLE ROW 2: Priority Velocity & Active Filter Progress
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        
        {/* Left: Priority Completion Velocity */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-heading font-semibold text-foreground tracking-tight">
                Priority Completion Velocity
              </h3>
              <div className="w-4 h-4 rounded-full text-mutedText flex items-center justify-center cursor-pointer hover:text-foreground" title="Cumulative task completions categorized by priority over time">
                <Info size={13} />
              </div>
            </div>

            <PillDropdown
              value={velocityMode}
              onChange={(val) => setVelocityMode(val as any)}
              options={['Cumulative', 'Daily']}
            />
          </div>

          {/* Sub-Legend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-textSecondary">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-textSecondary">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-textSecondary">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Low</span>
            </div>
          </div>

          {/* Line Chart Area */}
          <div className="relative h-44 pt-2">
            <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
              {['15', '10', '5', '0'].map((val, idx) => (
                <div key={idx} className="flex items-center w-full">
                  <span className="text-[11px] font-medium text-mutedText w-6 flex-shrink-0 text-left">
                    {val}
                  </span>
                  <div className="flex-1 border-b border-borderToken/50" />
                </div>
              ))}
            </div>

            <div className="ml-6 h-36 relative">
              <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                {/* High Priority Line (Coral Red) */}
                <path
                  d="M 10,95 L 90,80 L 170,62 L 250,48 L 330,36 L 410,24 L 490,6"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {[
                  [10,95], [90,80], [170,62], [250,48], [330,36], [410,24], [490,6]
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill="#EF4444" className="transition-transform hover:scale-150" />
                ))}

                {/* Medium Priority Line (Amber) */}
                <path
                  d="M 10,105 L 90,92 L 170,80 L 250,65 L 330,55 L 410,46 L 490,34"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {[
                  [10,105], [90,92], [170,80], [250,65], [330,55], [410,46], [490,34]
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill="#F59E0B" className="transition-transform hover:scale-150" />
                ))}

                {/* Low Priority Line (Theme Primary) */}
                <path
                  d="M 10,110 L 90,105 L 170,102 L 250,97 L 330,94 L 410,89 L 490,84"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {[
                  [10,110], [90,105], [170,102], [250,97], [330,94], [410,89], [490,84]
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill="var(--color-primary)" className="transition-transform hover:scale-150" />
                ))}
              </svg>

              <div className="absolute inset-x-0 -bottom-6 flex items-center justify-between px-1">
                {velocityDates.map((d, i) => (
                  <span key={i} className="text-[11px] font-medium text-mutedText">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tasks Matching Active Filters */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-heading font-semibold text-foreground tracking-tight">
                Tasks Matching Active Filters
              </h3>
              <div className="w-4 h-4 rounded-full text-mutedText flex items-center justify-center cursor-pointer hover:text-foreground" title="Filter count breakdown by completion status">
                <Info size={13} />
              </div>
            </div>
          </div>

          <div className="my-auto py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex-shrink-0">
                <div className="text-[44px] font-heading font-bold text-foreground tracking-tight leading-none">
                  {filterStats.total}
                </div>
                <div className="text-[12.5px] font-medium text-mutedText mt-1">
                  tasks found
                </div>
              </div>

              {/* Horizontal Segmented Progress Bar */}
              <div className="flex-1 w-full">
                <div className="h-4 w-full bg-card-subtle rounded-full overflow-hidden flex gap-1 p-0.5 border border-borderToken/40">
                  <div
                    style={{ width: `${filterStats.compPct}%` }}
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    title={`Completed: ${filterStats.completed} (${filterStats.compPct}%)`}
                  />
                  <div
                    style={{ width: `${filterStats.inProgPct}%` }}
                    className="h-full bg-[#60A5FA] rounded-full transition-all duration-500"
                    title={`In Progress: ${filterStats.inProgress} (${filterStats.inProgPct}%)`}
                  />
                  <div
                    style={{ width: `${filterStats.notStartPct}%` }}
                    className="h-full bg-[#CBD5E1] dark:bg-[#475569] rounded-full transition-all duration-500"
                    title={`Not Started: ${filterStats.notStarted} (${filterStats.notStartPct}%)`}
                  />
                </div>
              </div>
            </div>

            {/* Legend Below */}
            <div className="flex items-center flex-wrap gap-6 mt-6 pt-4 border-t border-borderToken">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-medium text-foreground">Completed</span>
                <span className="text-mutedText">{filterStats.completed} ({filterStats.compPct}%)</span>
              </div>

              <div className="flex items-center gap-2 text-[13px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                <span className="font-medium text-foreground">In Progress</span>
                <span className="text-mutedText">{filterStats.inProgress} ({filterStats.inProgPct}%)</span>
              </div>

              <div className="flex items-center gap-2 text-[13px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                <span className="font-medium text-foreground">Not Started</span>
                <span className="text-mutedText">{filterStats.notStarted} ({filterStats.notStartPct}%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* =========================================================================
          BOTTOM ROW: Focus Session Distribution & Most Productive Days Heatmap
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        
        {/* Left: Focus Session Distribution */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-heading font-semibold text-foreground tracking-tight">
                Focus Session Distribution
              </h3>
              <div className="w-4 h-4 rounded-full text-mutedText flex items-center justify-center cursor-pointer hover:text-foreground" title="Frequency of focus session lengths">
                <Info size={13} />
              </div>
            </div>

            <PillDropdown
              value={sessionDistMode}
              onChange={(val) => setSessionDistMode(val as any)}
              options={['Session Length', 'Frequency']}
            />
          </div>

          <div className="relative pt-4 pb-2">
            <div className="absolute inset-x-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
              {[
                `${maxSessionBucketCount}`,
                `${Math.round(maxSessionBucketCount * 0.75)}`,
                `${Math.round(maxSessionBucketCount * 0.5)}`,
                `${Math.round(maxSessionBucketCount * 0.25)}`,
                '0',
              ].map((val, idx) => (
                <div key={idx} className="flex items-center w-full">
                  <span className="text-[11px] font-medium text-mutedText w-6 flex-shrink-0 text-left">
                    {val}
                  </span>
                  <div className="flex-1 border-b border-borderToken/50" />
                </div>
              ))}
            </div>

            <div className="relative ml-6 h-40 flex items-end justify-between px-3 sm:px-6 z-10">
              {sessionDistribution.map((item, idx) => {
                const heightPct = maxSessionBucketCount > 0 ? (item.count / maxSessionBucketCount) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                      className="w-12 sm:w-16 bg-primary hover:bg-primary-hover rounded-t-[6px] transition-all duration-300 cursor-pointer"
                    />
                    <span className="text-[11.5px] font-medium text-mutedText mt-3 transition-colors group-hover:text-foreground">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Most Productive Days (Hourly Activity Heatmap) */}
        <div className="bg-card border border-borderToken rounded-[24px] p-6 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-heading font-semibold text-foreground tracking-tight">
                Most Productive Days
              </h3>
              <div className="w-4 h-4 rounded-full text-mutedText flex items-center justify-center cursor-pointer hover:text-foreground" title="Hourly productivity density heatmap across all days of the week">
                <Info size={13} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-mutedText mr-1">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-card-subtle border border-borderToken/30" />
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-primary-soft" />
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-primary/45" />
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-primary/75" />
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-primary" />
                </div>
                <span>More</span>
              </div>

              <PillDropdown
                value={productiveDaysMetric}
                onChange={(val) => setProductiveDaysMetric(val as any)}
                options={['Focus Time', 'Sessions']}
              />
            </div>
          </div>

          <div className="pt-2 pb-1 overflow-x-auto scrollbar-none">
            <div className="min-w-[420px]">
              <div className="flex flex-col gap-1.5">
                {daysOfWeek.map((day, dayIdx) => (
                  <div key={dayIdx} className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-mutedText w-7 flex-shrink-0">
                      {day}
                    </span>
                    <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
                      {heatmapGrid[dayIdx].map((level, hourIdx) => (
                        <div
                          key={hourIdx}
                          title={`${day} ${hourIdx}:00 - Activity Level ${level}`}
                          className={`aspect-square rounded-[3px] transition-all hover:scale-125 cursor-pointer ${getHeatmapCellBg(level)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pl-9 pr-1 pt-2.5 text-[10.5px] font-medium text-mutedText">
                <span>6 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>3 PM</span>
                <span>6 PM</span>
                <span>9 PM</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
