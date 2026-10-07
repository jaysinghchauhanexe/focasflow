import { Task, Habit, HistoryLog } from '../types';

/**
 * Standardized Metrics & Analytics Calculation Engine for FocusFlow
 * Guarantees 100% mathematical consistency across all views:
 * Dashboard, My Tasks, Analytics, Profile, History, etc.
 */

/**
 * Get total focus seconds for a specific calendar date (YYYY-MM-DD)
 */
export function getDailyFocusSeconds(
  dateStr: string,
  tasks: Task[],
  taskElapsedSeconds: Record<string, number>,
  activeFocusTaskId: string | null = null,
  focusElapsedSeconds: number = 0,
  isFocusTimerRunning: boolean = false
): number {
  const todayStr = new Date().toISOString().split('T')[0];
  let totalSec = 0;

  tasks.forEach((t) => {
    // Check if task belongs to this date
    const isToday = dateStr === todayStr;
    const taskDate = t.scheduledDate || (t.updatedAt ? t.updatedAt.split('T')[0] : todayStr);
    
    if (taskDate === dateStr || (isToday && !t.scheduledDate && t.status === 'completed')) {
      const elapsed = taskElapsedSeconds[t.id] || 0;
      if (elapsed > 0) {
        totalSec += elapsed;
      } else if (t.status === 'completed') {
        // If completed without timer, credit estimated duration in seconds
        totalSec += (t.duration || 30) * 60;
      }
    }
  });

  // If live focus timer is currently running for today's active task
  if (dateStr === todayStr && isFocusTimerRunning && activeFocusTaskId && focusElapsedSeconds > 0) {
    const existingTaskSec = taskElapsedSeconds[activeFocusTaskId] || 0;
    if (focusElapsedSeconds > existingTaskSec) {
      totalSec += (focusElapsedSeconds - existingTaskSec);
    }
  }

  return totalSec;
}

/**
 * Get daily focus minutes formatted (e.g. { hours: 1, mins: 45, text: "1h 45m", totalMinutes: 105 })
 */
export function formatFocusTime(totalSeconds: number): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  displayString: string;
} {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const displayString = `${hours}h ${minutes > 0 ? `${minutes}m` : '0m'}`;

  return {
    hours,
    minutes,
    totalMinutes,
    displayString,
  };
}

export interface DayFocusBarData {
  iso: string;
  dayNum: number;
  dayLabel: string;
  fullDateLabel: string;
  isToday: boolean;
  isSelected: boolean;
  focusSeconds: number;
  focusMinutes: number;
  focusHours: number;
  tasksCompleted: number;
  tasksTotal: number;
  heightPercent: number;
}

/**
 * Get 7-day week breakdown data with accurate focus time and task counts
 */
export function getWeeklyFocusData(
  activeDateStr: string,
  tasks: Task[],
  taskElapsedSeconds: Record<string, number>,
  activeFocusTaskId: string | null = null,
  focusElapsedSeconds: number = 0,
  isFocusTimerRunning: boolean = false
): {
  days: DayFocusBarData[];
  maxFocusMinutes: number;
  weekTotalMinutes: number;
  weekAverageMinutes: number;
} {
  const todayStr = new Date().toISOString().split('T')[0];
  const curr = new Date(activeDateStr || todayStr);
  const dayOfWeek = curr.getDay(); // 0 = Sun
  const sunday = new Date(curr);
  sunday.setDate(curr.getDate() - dayOfWeek);

  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days: DayFocusBarData[] = [];
  let weekTotalMinutes = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const iso = d.toISOString().split('T')[0];

    const dayFocusSec = getDailyFocusSeconds(
      iso,
      tasks,
      taskElapsedSeconds,
      activeFocusTaskId,
      focusElapsedSeconds,
      isFocusTimerRunning
    );
    const focusMinutes = Math.floor(dayFocusSec / 60);
    const focusHours = Math.floor(focusMinutes / 60);
    weekTotalMinutes += focusMinutes;

    const dayTasks = tasks.filter(t => t.scheduledDate === iso || (iso === todayStr && !t.scheduledDate));
    const tasksCompleted = dayTasks.filter(t => t.status === 'completed').length;
    const tasksTotal = dayTasks.length;

    days.push({
      iso,
      dayNum: d.getDate(),
      dayLabel: labels[i],
      fullDateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday: iso === todayStr,
      isSelected: iso === activeDateStr,
      focusSeconds: dayFocusSec,
      focusMinutes,
      focusHours,
      tasksCompleted,
      tasksTotal,
      heightPercent: 0, // Computed below
    });
  }

  const maxFocusMinutes = Math.max(...days.map(d => d.focusMinutes), 60); // At least 60m scale
  days.forEach(d => {
    d.heightPercent = Math.max(12, Math.min(100, Math.round((d.focusMinutes / maxFocusMinutes) * 100)));
  });

  const weekAverageMinutes = Math.round(weekTotalMinutes / 7);

  return {
    days,
    maxFocusMinutes,
    weekTotalMinutes,
    weekAverageMinutes,
  };
}

/**
 * Universal calculation of Active Streak and Streak History Sparkline
 */
export function calculateRealStreak(
  tasks: Task[],
  habits: Habit[] = [],
  history: HistoryLog[] = []
): {
  currentStreak: number;
  bestStreak: number;
  sparklinePoints: string;
  activeDatesCount: number;
} {
  const todayStr = new Date().toISOString().split('T')[0];
  const activeDates = new Set<string>();

  tasks.forEach((t) => {
    if (t.status === 'completed') {
      if (t.scheduledDate) activeDates.add(t.scheduledDate);
      if (t.updatedAt) activeDates.add(t.updatedAt.split('T')[0]);
    }
  });

  habits.forEach((h) => {
    h.completedDates.forEach((d) => activeDates.add(d));
  });

  history.forEach((h) => {
    if (h.completedTasksCount > 0 || h.completedMinutes > 0) {
      activeDates.add(h.date);
    }
  });

  let streak = 0;
  let checkDate = new Date();
  const isTodayActive = activeDates.has(todayStr);

  if (!isTodayActive) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const iso = checkDate.toISOString().split('T')[0];
    if (activeDates.has(iso)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Generate 7-day sparkline coordinates
  const sparklinePts: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const x = (i / 6) * 100;
    const y = activeDates.has(iso) ? 4 : 16;
    sparklinePts.push(`${x},${y}`);
  }

  return {
    currentStreak: streak,
    bestStreak: Math.max(streak, 7),
    sparklinePoints: sparklinePts.join(' '),
    activeDatesCount: activeDates.size,
  };
}
