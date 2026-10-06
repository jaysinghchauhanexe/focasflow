import { create } from 'zustand';
import { Task, Habit, Routine, Goal, ScheduleBlock, HistoryLog, AppSettings, DayCapacity, AiResponsePayload, SchedulerSuggestion, TaskStatus } from '../types';
import { calculateDayCapacity, buildDaySchedule } from '../engine/scheduler';

interface AppState {
  currentTab: 'today' | 'tasks' | 'habits' | 'routines' | 'goals' | 'schedule' | 'history' | 'settings';
  selectedDate: string; // YYYY-MM-DD
  tasks: Task[];
  habits: Habit[];
  routines: Routine[];
  goals: Goal[];
  scheduleBlocks: ScheduleBlock[];
  history: HistoryLog[];
  settings: AppSettings;
  
  // Modals & UI States
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  isHabitModalOpen: boolean;
  editingHabit: Habit | null;
  isCommitmentModalOpen: boolean;
  isAiModalOpen: boolean;
  aiLoading: boolean;
  lastAiResult: AiResponsePayload | null;
  isOverloadModalOpen: boolean;
  isBreathingModalOpen: boolean;
  activeFilter: 'all' | 'important' | 'regular';
  searchQuery: string;

  // Wellness & Calm States
  currentMood: 'stressed' | 'anxious' | 'okay' | 'calm' | 'great';
  activeSoundscape: 'rain' | 'stream' | 'waves' | 'forest';
  isPlayingSoundscape: boolean;

  // Actions
  setCurrentTab: (tab: AppState['currentTab']) => void;
  setSelectedDate: (date: string) => void;
  setActiveFilter: (filter: 'all' | 'important' | 'regular') => void;
  setSearchQuery: (query: string) => void;
  setMood: (mood: 'stressed' | 'anxious' | 'okay' | 'calm' | 'great') => void;
  openBreathingModal: () => void;
  closeBreathingModal: () => void;
  toggleSoundscape: (soundscape?: 'rain' | 'stream' | 'waves' | 'forest') => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  skipTask: (id: string) => void;
  moveTaskToTomorrow: (id: string) => void;
  moveTaskLater: (id: string) => void;

  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (id: string, date: string) => void;

  // Routine Actions
  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;

  // Goal Actions
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Scheduler & AI
  replanDay: () => void;
  applyAiOperations: (result: AiResponsePayload) => void;
  applySuggestion: (suggestion: SchedulerSuggestion) => void;

  // Modal controls
  openTaskModal: (task?: Task) => void;
  closeTaskModal: () => void;
  openHabitModal: (habit?: Habit) => void;
  closeHabitModal: () => void;
  openCommitmentModal: () => void;
  closeCommitmentModal: () => void;
  openAiModal: () => void;
  closeAiModal: () => void;
  setAiLoading: (loading: boolean) => void;
  setLastAiResult: (res: AiResponsePayload | null) => void;
  openOverloadModal: () => void;
  closeOverloadModal: () => void;

  // Computed getters
  getDayCapacity: () => DayCapacity;
}

const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const initialTasks: Task[] = [
  {
    id: 't-1',
    title: 'Morning workout',
    category: 'Health',
    duration: 60,
    priority: 'important',
    status: 'completed',
    scheduledDate: getTodayDate(),
    scheduledStart: '07:00',
    scheduledEnd: '08:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Read through emails',
    category: 'Work',
    duration: 60,
    priority: 'important',
    status: 'pending',
    scheduledDate: getTodayDate(),
    scheduledStart: '08:00',
    scheduledEnd: '09:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'Lunch break',
    category: 'Personal',
    duration: 60,
    priority: 'flexible',
    status: 'completed',
    scheduledDate: getTodayDate(),
    scheduledStart: '09:00',
    scheduledEnd: '10:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Clean the project code...',
    category: 'Learning',
    duration: 60,
    priority: 'flexible',
    status: 'pending',
    scheduledDate: getTodayDate(),
    scheduledStart: '07:00',
    scheduledEnd: '08:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-5',
    title: 'Finish client API module',
    category: 'Work',
    duration: 120,
    priority: 'critical',
    status: 'pending',
    scheduledDate: getTodayDate(),
    scheduledStart: '10:30',
    scheduledEnd: '12:30',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-6',
    title: 'Client sync meeting',
    category: 'Work',
    duration: 45,
    priority: 'critical',
    status: 'pending',
    scheduledDate: getTodayDate(),
    scheduledStart: '16:00',
    scheduledEnd: '16:45',
    flexibility: 'fixed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-7',
    title: 'DSA Practice: Dynamic Programming',
    category: 'Learning',
    duration: 45,
    priority: 'flexible',
    status: 'pending',
    scheduledDate: getTodayDate(),
    scheduledStart: '14:00',
    scheduledEnd: '14:45',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialHabits: Habit[] = [
  {
    id: 'h-1',
    title: 'Morning Workout',
    category: 'Health',
    duration: 45,
    frequency: 'daily',
    preferredTime: 'morning',
    target: 7,
    completedDates: [getTodayDate()],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-2',
    title: 'DSA Practice',
    category: 'Learning',
    duration: 45,
    frequency: 'weekdays',
    preferredTime: 'morning',
    target: 5,
    completedDates: [],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-3',
    title: 'Read 20 Pages',
    category: 'Personal',
    duration: 30,
    frequency: 'daily',
    preferredTime: 'evening',
    target: 7,
    completedDates: [],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-4',
    title: 'Hydrate 3 Liters',
    category: 'Health',
    duration: 5,
    frequency: 'daily',
    preferredTime: 'morning',
    target: 7,
    completedDates: [getTodayDate()],
    active: true,
    createdAt: new Date().toISOString(),
  }
];

const initialRoutines: Routine[] = [
  {
    id: 'r-1',
    title: 'Morning Routine',
    type: 'morning',
    preferredTime: '07:00',
    items: [
      { id: 'ri-1', title: 'Wake up & hydrate', duration: 10, completed: true },
      { id: 'ri-2', title: 'Brush & wash', duration: 10, completed: true },
      { id: 'ri-3', title: 'Nutritious breakfast', duration: 20, completed: true },
      { id: 'ri-4', title: "Review today's plan", duration: 5, completed: true },
    ],
    active: true,
  },
  {
    id: 'r-2',
    title: 'Night Routine',
    type: 'evening',
    preferredTime: '22:30',
    items: [
      { id: 'ri-5', title: 'Stop work & screen off', duration: 15, completed: false },
      { id: 'ri-6', title: 'Review day & prepare tomorrow', duration: 10, completed: false },
      { id: 'ri-7', title: 'Wind down & sleep', duration: 20, completed: false },
    ],
    active: true,
  }
];

const initialGoals: Goal[] = [
  {
    id: 'g-1',
    title: 'Master Data Structures & Algorithms',
    category: 'Learning',
    targetDate: '2026-12-31',
    progress: 68,
    description: 'Solve 150 LeetCode problems and master Graph algorithms and Dynamic Programming.',
    projects: [
      { id: 'gp-1', title: 'Arrays & Two Pointers', tasksCount: 15, completedCount: 15 },
      { id: 'gp-2', title: 'Trees & Graphs', tasksCount: 20, completedCount: 14 },
      { id: 'gp-3', title: 'Dynamic Programming', tasksCount: 25, completedCount: 10 },
    ],
  },
  {
    id: 'g-2',
    title: 'Ship Client SaaS API Platform',
    category: 'Work',
    targetDate: '2026-11-15',
    progress: 82,
    description: 'Complete billing, webhook handlers, and production deployment for client release.',
    projects: [
      { id: 'gp-4', title: 'Auth & Multi-tenancy', tasksCount: 10, completedCount: 10 },
      { id: 'gp-5', title: 'Stripe Integration', tasksCount: 8, completedCount: 8 },
      { id: 'gp-6', title: 'API Documentation', tasksCount: 6, completedCount: 3 },
    ],
  }
];

const initialHistory: HistoryLog[] = [
  {
    id: 'hlog-1',
    date: '2026-10-30',
    plannedMinutes: 480,
    completedMinutes: 450,
    movedMinutes: 30,
    skippedMinutes: 0,
    completedTasksCount: 6,
    totalTasksCount: 7,
    notes: 'Great focus on core deliverables.',
  },
  {
    id: 'hlog-2',
    date: '2026-10-29',
    plannedMinutes: 510,
    completedMinutes: 420,
    movedMinutes: 60,
    skippedMinutes: 30,
    completedTasksCount: 5,
    totalTasksCount: 8,
    notes: 'Afternoon meeting extended by 30 mins.',
  }
];

const initialSettings: AppSettings = {
  userName: 'Jay',
  wakeTime: '07:00',
  sleepTime: '23:00',
  workStart: '09:00',
  workEnd: '18:00',
  breakDuration: 15,
  openRouterApiKey: '',
  openRouterModel: 'anthropic/claude-3.5-haiku',
  autoReschedule: true,
  theme: 'green',
};

export const applyTheme = (theme: string) => {
  const safeTheme = theme || 'green';
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', safeTheme);
      if (document.body) {
        document.body.setAttribute('data-theme', safeTheme);
      }
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('data-theme', safeTheme);
      }
    }
  } catch (e) {
    // SSR safe
  }
};

// Persistence helper
const loadPersisted = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`focusflow_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const savePersisted = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(`focusflow_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

const rawLoadedSettings = loadPersisted<Partial<AppSettings>>('settings', {});
const loadedSettings: AppSettings = {
  ...initialSettings,
  ...rawLoadedSettings,
};
applyTheme(loadedSettings.theme || 'green');

export const useAppStore = create<AppState>((set, get) => ({
  currentTab: 'today',
  selectedDate: getTodayDate(),
  tasks: loadPersisted('tasks', initialTasks),
  habits: loadPersisted('habits', initialHabits),
  routines: loadPersisted('routines', initialRoutines),
  goals: loadPersisted('goals', initialGoals),
  scheduleBlocks: [],
  history: loadPersisted('history', initialHistory),
  settings: loadedSettings,

  isTaskModalOpen: false,
  editingTask: null,
  isHabitModalOpen: false,
  editingHabit: null,
  isCommitmentModalOpen: false,
  isAiModalOpen: false,
  aiLoading: false,
  lastAiResult: null,
  isOverloadModalOpen: false,
  isBreathingModalOpen: false,
  activeFilter: 'all',
  searchQuery: '',
  currentMood: loadPersisted('mood', 'calm' as const),
  activeSoundscape: 'rain',
  isPlayingSoundscape: false,

  setCurrentTab: (tab) => set({ currentTab: tab }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMood: (mood) => {
    savePersisted('mood', mood);
    set({ currentMood: mood });
  },
  openBreathingModal: () => set({ isBreathingModalOpen: true }),
  closeBreathingModal: () => set({ isBreathingModalOpen: false }),
  toggleSoundscape: (soundscape) => set((state) => {
    const nextSoundscape = soundscape || state.activeSoundscape;
    const nextPlaying = soundscape ? (state.activeSoundscape === soundscape ? !state.isPlayingSoundscape : true) : !state.isPlayingSoundscape;
    return { activeSoundscape: nextSoundscape, isPlayingSoundscape: nextPlaying };
  }),

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newTask, ...state.tasks];
      savePersisted('tasks', updated);
      return { tasks: updated, isTaskModalOpen: false, editingTask: null };
    });
    get().replanDay();
  },

  updateTask: (task) => {
    set((state) => {
      const updated = state.tasks.map((t) => (t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t));
      savePersisted('tasks', updated);
      return { tasks: updated, isTaskModalOpen: false, editingTask: null };
    });
    get().replanDay();
  },

  deleteTask: (id) => {
    set((state) => {
      const updated = state.tasks.filter((t) => t.id !== id);
      savePersisted('tasks', updated);
      return { tasks: updated };
    });
    get().replanDay();
  },

  toggleTaskStatus: (id) => {
    set((state) => {
      const updated: Task[] = state.tasks.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      });
      savePersisted('tasks', updated);
      return { tasks: updated };
    });
    get().replanDay();
  },

  skipTask: (id) => {
    set((state) => {
      const updated = state.tasks.map((t) => {
        if (t.id === id) {
          return { ...t, status: 'skipped' as const, updatedAt: new Date().toISOString() };
        }
        return t;
      });
      savePersisted('tasks', updated);
      return { tasks: updated };
    });
    get().replanDay();
  },

  moveTaskToTomorrow: (id) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    set((state) => {
      const updated = state.tasks.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            scheduledDate: tomorrowStr,
            movedCount: (t.movedCount || 0) + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      savePersisted('tasks', updated);
      return { tasks: updated };
    });
    get().replanDay();
  },

  moveTaskLater: (id) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === id);
      if (!task) return state;
      const otherTasks = state.tasks.filter(t => t.id !== id);
      const updated = [...otherTasks, { ...task, priority: 'flexible' as const, movedCount: (task.movedCount || 0) + 1 }];
      savePersisted('tasks', updated);
      return { tasks: updated };
    });
    get().replanDay();
  },

  addHabit: (habitData) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [...state.habits, newHabit];
      savePersisted('habits', updated);
      return { habits: updated, isHabitModalOpen: false, editingHabit: null };
    });
    get().replanDay();
  },

  updateHabit: (habit) => {
    set((state) => {
      const updated = state.habits.map((h) => (h.id === habit.id ? habit : h));
      savePersisted('habits', updated);
      return { habits: updated, isHabitModalOpen: false, editingHabit: null };
    });
    get().replanDay();
  },

  deleteHabit: (id) => {
    set((state) => {
      const updated = state.habits.filter((h) => h.id !== id);
      savePersisted('habits', updated);
      return { habits: updated };
    });
    get().replanDay();
  },

  toggleHabitDate: (id, date) => {
    set((state) => {
      const updated = state.habits.map((h) => {
        if (h.id === id) {
          const completed = h.completedDates.includes(date)
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date];
          return { ...h, completedDates: completed };
        }
        return h;
      });
      savePersisted('habits', updated);
      return { habits: updated };
    });
  },

  addRoutine: (routineData) => {
    const newRoutine: Routine = {
      ...routineData,
      id: `routine-${Date.now()}`,
    };
    set((state) => {
      const updated = [...state.routines, newRoutine];
      savePersisted('routines', updated);
      return { routines: updated };
    });
  },

  updateRoutine: (routine) => {
    set((state) => {
      const updated = state.routines.map((r) => (r.id === routine.id ? routine : r));
      savePersisted('routines', updated);
      return { routines: updated };
    });
  },

  deleteRoutine: (id) => {
    set((state) => {
      const updated = state.routines.filter((r) => r.id !== id);
      savePersisted('routines', updated);
      return { routines: updated };
    });
  },

  addGoal: (goalData) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    set((state) => {
      const updated = [...state.goals, newGoal];
      savePersisted('goals', updated);
      return { goals: updated };
    });
  },

  updateGoal: (goal) => {
    set((state) => {
      const updated = state.goals.map((g) => (g.id === goal.id ? goal : g));
      savePersisted('goals', updated);
      return { goals: updated };
    });
  },

  deleteGoal: (id) => {
    set((state) => {
      const updated = state.goals.filter((g) => g.id !== id);
      savePersisted('goals', updated);
      return { goals: updated };
    });
  },

  updateSettings: (newSettings) => {
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      savePersisted('settings', updated);
      return { settings: updated };
    });
    get().replanDay();
  },

  replanDay: () => {
    const { selectedDate, tasks, habits, routines, settings } = get();
    const { scheduledTasks, blocks } = buildDaySchedule(selectedDate, tasks, habits, routines, settings);
    set({ tasks: scheduledTasks, scheduleBlocks: blocks });
    savePersisted('tasks', scheduledTasks);
  },

  applyAiOperations: (result) => {
    const { selectedDate, tasks, habits } = get();
    let updatedTasks = [...tasks];
    let updatedHabits = [...habits];

    for (const op of result.operations) {
      if (op.op_type === 'ADD_TASK') {
        updatedTasks.unshift({
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: op.title || 'New Task',
          duration: op.duration_minutes || 60,
          priority: op.priority || 'important',
          status: 'pending',
          category: op.category || 'Work',
          scheduledDate: op.target_date === 'tomorrow' ? undefined : selectedDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (op.op_type === 'ADD_COMMITMENT') {
        updatedTasks.unshift({
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: op.title || 'Fixed Commitment',
          duration: op.duration_minutes || 45,
          priority: 'critical',
          status: 'pending',
          category: op.category || 'Work',
          scheduledDate: selectedDate,
          scheduledStart: op.start_time || '16:00',
          flexibility: 'fixed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (op.op_type === 'SKIP_TASK') {
        const target = updatedTasks.find(t => t.title.toLowerCase().includes((op.title || '').toLowerCase()) || t.id === op.task_id);
        if (target) {
          target.status = 'skipped';
        }
      } else if (op.op_type === 'COMPLETE_TASK') {
        const target = updatedTasks.find(t => t.title.toLowerCase().includes((op.title || '').toLowerCase()) || t.id === op.task_id);
        if (target) {
          target.status = 'completed';
        }
      } else if (op.op_type === 'MOVE_TASK') {
        const target = updatedTasks.find(t => t.title.toLowerCase().includes((op.title || '').toLowerCase()) || t.id === op.task_id);
        if (target) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          target.scheduledDate = op.target_date === 'tomorrow' ? tomorrow.toISOString().split('T')[0] : selectedDate;
          target.movedCount = (target.movedCount || 0) + 1;
        }
      } else if (op.op_type === 'CREATE_HABIT') {
        updatedHabits.push({
          id: `habit-${Date.now()}`,
          title: op.title || 'New Habit',
          category: op.category || 'Learning',
          duration: op.duration_minutes || 45,
          frequency: (op.frequency as any) || 'weekdays',
          preferredTime: op.preferred_time || 'morning',
          target: 5,
          completedDates: [],
          active: true,
          createdAt: new Date().toISOString(),
        });
      }
    }

    set({
      tasks: updatedTasks,
      habits: updatedHabits,
      lastAiResult: result,
      isAiModalOpen: true,
      aiLoading: false,
    });
    savePersisted('tasks', updatedTasks);
    savePersisted('habits', updatedHabits);
    get().replanDay();
  },

  applySuggestion: (suggestion) => {
    if (suggestion.actionType === 'move') {
      get().moveTaskToTomorrow(suggestion.targetTaskId);
    } else if (suggestion.actionType === 'shorten' && suggestion.newDuration) {
      const task = get().tasks.find(t => t.id === suggestion.targetTaskId);
      if (task) {
        get().updateTask({ ...task, duration: suggestion.newDuration });
      }
    } else if (suggestion.actionType === 'skip') {
      get().skipTask(suggestion.targetTaskId);
    }
  },

  openTaskModal: (task) => set({ isTaskModalOpen: true, editingTask: task || null }),
  closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),
  openHabitModal: (habit) => set({ isHabitModalOpen: true, editingHabit: habit || null }),
  closeHabitModal: () => set({ isHabitModalOpen: false, editingHabit: null }),
  openCommitmentModal: () => set({ isCommitmentModalOpen: true }),
  closeCommitmentModal: () => set({ isCommitmentModalOpen: false }),
  openAiModal: () => set({ isAiModalOpen: true }),
  closeAiModal: () => set({ isAiModalOpen: false }),
  setAiLoading: (loading) => set({ aiLoading: loading }),
  setLastAiResult: (res) => set({ lastAiResult: res }),
  openOverloadModal: () => set({ isOverloadModalOpen: true }),
  closeOverloadModal: () => set({ isOverloadModalOpen: false }),

  getDayCapacity: () => {
    const { selectedDate, tasks, habits, settings } = get();
    return calculateDayCapacity(selectedDate, tasks, habits, settings);
  }
}));
