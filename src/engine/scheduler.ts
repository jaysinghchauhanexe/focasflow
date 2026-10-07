import { Task, Habit, Routine, AppSettings, DayCapacity, SchedulerSuggestion, ScheduleBlock } from '../types';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const h12 = hours % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function calculateDayCapacity(
  date: string,
  tasks: Task[],
  habits: Habit[],
  settings: AppSettings,
  taskElapsedSeconds: Record<string, number> = {},
  activeFocusTaskId: string | null = null,
  focusElapsedSeconds: number = 0
): DayCapacity {
  const dayTasks = tasks.filter((t) => {
    if (t.scheduledDate === date) return true;
    if (t.status !== 'completed' && t.status !== 'skipped') return true;
    if (t.status === 'completed' && (!t.scheduledDate || t.scheduledDate === date)) return true;
    return false;
  });
  
  const wakeM = timeToMinutes(settings.wakeTime || '07:00');
  const sleepM = timeToMinutes(settings.sleepTime || '23:00');
  let totalAvailableMinutes = sleepM > wakeM ? (sleepM - wakeM) : (1440 - wakeM + sleepM);

  // Active planned tasks for today
  const activeTasks = dayTasks.filter(t => t.status !== 'completed' && t.status !== 'skipped');
  const completedTasks = dayTasks.filter(t => t.status === 'completed');

  let totalPlannedMinutes = 0;
  let importantCount = 0;
  let regularCount = 0;

  for (const t of activeTasks) {
    totalPlannedMinutes += t.duration || 30;
    if (t.priority === 'critical' || t.priority === 'important') {
      importantCount++;
    } else {
      regularCount++;
    }
  }

  // Calculate actual focused minutes until now
  let actualFocusedMinutes = 0;

  // 1. Completed tasks: The full planned task duration replaces whatever was on the timer
  for (const t of completedTasks) {
    const elapsedSec = taskElapsedSeconds[t.id] || 0;
    const taskMinutes = Math.max(t.duration || 30, Math.ceil(elapsedSec / 60));
    actualFocusedMinutes += taskMinutes;
  }

  // 2. Active / In-progress / Pending tasks: Count the running/recorded timer
  for (const t of activeTasks) {
    const isLive = activeFocusTaskId === t.id;
    const elapsedSec = isLive ? focusElapsedSeconds : (taskElapsedSeconds[t.id] || 0);
    if (elapsedSec > 0) {
      actualFocusedMinutes += Math.ceil(elapsedSec / 60);
    }
  }

  // 3. Completed habits for today
  for (const h of habits.filter(h => h.active && h.completedDates.includes(date))) {
    actualFocusedMinutes += h.duration || 15;
  }

  // Add habits for today
  const dayOfWeek = new Date(date).getDay(); // 0 is Sunday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const todayHabits = habits.filter(h => {
    if (!h.active) return false;
    if (h.frequency === 'daily') return true;
    if (h.frequency === 'weekdays' && !isWeekend) return true;
    if (h.frequency === 'weekends' && isWeekend) return true;
    return true;
  });

  for (const h of todayHabits) {
    if (!h.completedDates.includes(date)) {
      totalPlannedMinutes += h.duration || 30;
      regularCount++;
    }
  }

  const isOverloaded = totalPlannedMinutes > totalAvailableMinutes;
  const overloadMinutes = isOverloaded ? totalPlannedMinutes - totalAvailableMinutes : 0;

  // Generate intelligent suggestions
  const suggestions: SchedulerSuggestion[] = [];
  if (isOverloaded) {
    // 1. Suggest moving flexible or optional tasks
    const flexibleTasks = activeTasks.filter(t => t.priority === 'optional' || t.priority === 'flexible');
    for (const ft of flexibleTasks) {
      suggestions.push({
        id: `sug-move-${ft.id}`,
        actionType: 'move',
        targetTaskId: ft.id,
        taskTitle: ft.title,
        explanation: `Move ${ft.title} to tomorrow to free up ${ft.duration} minutes.`,
        targetDate: 'tomorrow',
      });
      if (suggestions.length >= 3) break;
    }

    // 2. Suggest shortening long tasks
    const longTasks = activeTasks.filter(t => t.duration > 60 && t.priority !== 'critical');
    for (const lt of longTasks) {
      suggestions.push({
        id: `sug-shorten-${lt.id}`,
        actionType: 'shorten',
        targetTaskId: lt.id,
        taskTitle: lt.title,
        explanation: `Shorten ${lt.title} from ${lt.duration}m to ${Math.round(lt.duration * 0.6)}m.`,
        newDuration: Math.round(lt.duration * 0.6),
      });
      if (suggestions.length >= 4) break;
    }
  }

  return {
    date,
    totalAvailableMinutes,
    totalPlannedMinutes,
    isOverloaded,
    overloadMinutes,
    focusMinutes: totalPlannedMinutes,
    actualFocusedMinutes,
    importantTasksCount: importantCount,
    regularTasksCount: regularCount,
    completedTasksCount: completedTasks.length,
    remainingTasksCount: activeTasks.length,
    suggestions,
  };
}

/**
 * Deterministic schedule builder
 * Takes commitments (fixed blocks) and schedules tasks & habits sequentially into free slots.
 */
export function buildDaySchedule(
  date: string,
  tasks: Task[],
  habits: Habit[],
  routines: Routine[],
  settings: AppSettings
): { scheduledTasks: Task[]; blocks: ScheduleBlock[] } {
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const wakeM = timeToMinutes(settings.wakeTime || '07:00');
  const sleepM = timeToMinutes(settings.sleepTime || '23:00');

  const blocks: ScheduleBlock[] = [];
  const scheduledTasks = [...tasks];

  // 1. Add routines
  for (const routine of routines.filter(r => r.active)) {
    if (routine.type === 'morning') {
      const rStart = wakeM;
      const rDuration = routine.items.reduce((acc, i) => acc + (i.duration || 10), 0) || 45;
      blocks.push({
        id: `block-routine-${routine.id}`,
        title: routine.title,
        blockType: 'routine',
        itemId: routine.id,
        date,
        startTime: minutesToTime(rStart),
        endTime: minutesToTime(rStart + rDuration),
        category: 'Personal',
        isFixed: true,
        completed: false,
      });
    }
  }

  // 2. Add fixed commitments (tasks marked with flexibility: 'fixed' or explicit scheduledStart)
  for (const task of tasks.filter(t => t.scheduledDate === date && t.flexibility === 'fixed' && t.scheduledStart)) {
    const startM = timeToMinutes(task.scheduledStart!);
    const endM = task.scheduledEnd ? timeToMinutes(task.scheduledEnd) : startM + task.duration;
    blocks.push({
      id: `block-fixed-${task.id}`,
      title: task.title,
      blockType: 'commitment',
      itemId: task.id,
      date,
      startTime: minutesToTime(startM),
      endTime: minutesToTime(endM),
      category: task.category,
      isFixed: true,
      completed: task.status === 'completed',
    });
  }

  // Sort existing fixed blocks
  blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // 3. Sort non-fixed tasks by Priority: Critical -> Important -> Flexible -> Optional
  const priorityWeight: Record<string, number> = {
    critical: 4,
    important: 3,
    flexible: 2,
    optional: 1,
  };

  const tasksToSchedule = tasks.filter(t => 
    (t.scheduledDate === date || !t.scheduledDate) &&
    t.status !== 'completed' &&
    t.status !== 'skipped' &&
    t.flexibility !== 'fixed'
  ).sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

  // 4. Sequentially place non-fixed tasks into open time windows starting after wake routine
  let cursorM = wakeM + 45; // Start after morning routine

  for (const task of tasksToSchedule) {
    const duration = task.duration || 45;

    // Check if current cursor overlaps with any fixed block
    let placed = false;
    while (!placed && cursorM + duration <= sleepM) {
      const taskStart = cursorM;
      const taskEnd = cursorM + duration;

      // Check overlap
      const conflict = blocks.find(b => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return (taskStart < bEnd && taskEnd > bStart);
      });

      if (conflict) {
        // Jump past the conflicting block
        cursorM = timeToMinutes(conflict.endTime) + 10; // 10 min transition buffer
      } else {
        // Place task here
        const startStr = minutesToTime(taskStart);
        const endStr = minutesToTime(taskEnd);

        // Update task model
        const idx = scheduledTasks.findIndex(t => t.id === task.id);
        if (idx !== -1) {
          scheduledTasks[idx] = {
            ...scheduledTasks[idx],
            scheduledDate: date,
            scheduledStart: startStr,
            scheduledEnd: endStr,
          };
        }

        blocks.push({
          id: `block-task-${task.id}`,
          title: task.title,
          blockType: 'task',
          itemId: task.id,
          date,
          startTime: startStr,
          endTime: endStr,
          category: task.category,
          isFixed: false,
          completed: false,
        });

        cursorM = taskEnd + (settings.breakDuration || 15);
        placed = true;
      }
    }
  }

  // Sort final blocks by start time
  blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return { scheduledTasks, blocks };
}
