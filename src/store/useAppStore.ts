import { create } from 'zustand';
import { 
  Task, 
  Habit, 
  Routine, 
  Goal, 
  ScheduleBlock, 
  HistoryLog, 
  AppSettings, 
  UserPreferences,
  DayCapacity, 
  AiResponsePayload, 
  SchedulerSuggestion, 
  TaskStatus,
  Priority,
  Category,
  AppTheme,
  LofiStationId,
  AnalyticsFilter,
  AppSiteFocusItem
} from '../types';
import { calculateDayCapacity, buildDaySchedule } from '../engine/scheduler';
import { playCompletionSound } from '../utils/soundEffects';

interface AppState {
  currentTab: 'today' | 'tasks' | 'analytics' | 'habits' | 'routines' | 'goals' | 'schedule' | 'history' | 'settings' | 'preferences' | 'ai-planner' | 'profile';
  selectedDate: string; // YYYY-MM-DD
  tasks: Task[];
  habits: Habit[];
  routines: Routine[];
  goals: Goal[];
  scheduleBlocks: ScheduleBlock[];
  history: HistoryLog[];
  settings: AppSettings;
  appSiteFocusData: AppSiteFocusItem[];
  
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
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeFilter: 'all' | 'important' | 'regular';
  searchQuery: string;

  // Task Filters State (synchronized across views and sidebar)
  taskCategoryFilter: string;
  taskPriorityFilter: string;
  taskStatusFilter: string;
  taskSearchQuery: string;
  setTaskCategoryFilter: (category: string) => void;
  setTaskPriorityFilter: (priority: string) => void;
  setTaskStatusFilter: (status: string) => void;
  setTaskSearchQuery: (query: string) => void;
  navigateToTasks: (filters?: { category?: string; priority?: string; status?: string; search?: string }) => void;

  // Analytics Filter & Navigation
  analyticsFilter: AnalyticsFilter;
  setAnalyticsFilter: (filter: Partial<AnalyticsFilter>) => void;
  navigateToAnalytics: (filters?: Partial<AnalyticsFilter>) => void;

  // Focus Timer States
  activeFocusTaskId: string | null;
  isFocusTimerRunning: boolean;
  focusElapsedSeconds: number;
  taskElapsedSeconds: Record<string, number>;
  startFocusTask: (taskId: string) => void;
  pauseFocusTask: () => void;
  toggleFocusTask: (taskId: string) => void;
  setFocusElapsedSeconds: (sec: number | ((prev: number) => number)) => void;

  // Wellness & Music States
  currentMood: 'stressed' | 'anxious' | 'okay' | 'calm' | 'great';
  activeLofiStation: LofiStationId;
  isPlayingLofi: boolean;
  lofiVolume: number; // 0 - 100
  setLofiStation: (station: LofiStationId) => void;
  toggleLofi: (station?: LofiStationId) => void;
  setLofiVolume: (volume: number) => void;
  // Aliases for backwards compatibility
  activeSoundscape: string;
  isPlayingSoundscape: boolean;
  toggleSoundscape: (soundscape?: any) => void;

  // Onboarding
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  completeOnboarding: (payload: {
    userName: string;
    focusPriority: 'tasks' | 'habits' | 'balance';
    theme: AppTheme;
    fontHeading: string;
    wakeTime?: string;
    sleepTime?: string;
    initialTaskTitle?: string;
    initialTaskDuration?: number;
    initialTaskPriority?: Priority;
    initialTaskCategory?: Category;
  }) => void;

  // Actions
  setCurrentTab: (tab: AppState['currentTab']) => void;
  setSelectedDate: (date: string) => void;
  setActiveFilter: (filter: 'all' | 'important' | 'regular') => void;
  setSearchQuery: (query: string) => void;
  setMood: (mood: 'stressed' | 'anxious' | 'okay' | 'calm' | 'great') => void;
  openBreathingModal: () => void;
  closeBreathingModal: () => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  skipTask: (id: string) => void;
  moveTaskToTomorrow: (id: string) => void;
  moveTaskLater: (id: string) => void;
  lightenTodayLoad: () => number;
  extendTaskDuration: (taskId: string, extraMinutes: number) => void;

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

  // Custom Categories & Priorities Actions
  addCustomCategory: (category: { id: string; label: string; iconName: string; colorClass?: string }) => void;
  deleteCustomCategory: (id: string) => void;
  deleteCategory: (labelOrId: string) => void;
  addCustomPriority: (priority: { id: string; label: string; dotColor: string }) => void;
  deleteCustomPriority: (id: string) => void;
  resetTaskTimer: (taskId: string) => void;
  updateUserProfile: (profile: Partial<AppSettings>) => void;

  // Settings & Preferences Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;

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
  isMoodModalOpen: boolean;
  openMoodModal: () => void;
  closeMoodModal: () => void;

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

export const defaultPreferences: UserPreferences = {
  enableMoodInsightPopups: true,
  enableMoodFaceAnimations: true,
  enableDailyMoodCheckin: true,
  autoPlayMusicOnFocus: false,
  defaultLofiStation: 'coffee',
  enableOvertimeAlerts: true,
  taskCompletionChime: true,
  enableButtonClickSound: true,
  enableOverloadWarnings: true,
  autoRollFlexibleTasks: true,
  strictBedtimeBoundary: true,
  smartBreakBuffers: true,
  enableSmoothAnimations: true,
  enableHapticFeedback: true,
  showShortcutsHint: true,
  enableAiDebugJson: false,
  showAiOperationsByDefault: false,
};

const initialSettings: AppSettings = {
  userName: 'Jay',
  wakeTime: '07:00',
  sleepTime: '23:00',
  workStart: '09:00',
  workEnd: '18:00',
  breakDuration: 15,
  openRouterApiKey: '',
  openRouterModel: 'anthropic/claude-3.5-haiku',
  aiProvider: 'in_app',
  inAppModel: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  localModel: 'qwen2.5:1.5b',
  localEndpoint: 'http://localhost:11434',
  autoReschedule: true,
  theme: 'green',
  fontHeading: 'Gilda Display',
  hasCompletedOnboarding: false,
  focusPriority: 'balance',
  preferences: defaultPreferences,
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

export const applyFont = (fontName: string) => {
  const safeFont = fontName || 'Gilda Display';
  try {
    if (typeof document !== 'undefined') {
      const isSans = safeFont === 'DM Sans';
      const fontValue = isSans
        ? `'DM Sans', 'Inter', 'Plus Jakarta Sans', sans-serif`
        : `'Gilda Display', Georgia, serif`;
      const fontAttr = isSans ? 'dm-sans' : 'gilda';

      document.documentElement.setAttribute('data-font', fontAttr);
      document.documentElement.style.setProperty('--font-heading', fontValue);

      if (document.body) {
        document.body.setAttribute('data-font', fontAttr);
        document.body.style.setProperty('--font-heading', fontValue);
      }
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('data-font', fontAttr);
        root.style.setProperty('--font-heading', fontValue);
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
  preferences: {
    ...defaultPreferences,
    ...(rawLoadedSettings.preferences || {}),
  },
};

const initialAppSites: AppSiteFocusItem[] = [];

applyTheme(loadedSettings.theme || 'green');
applyFont(loadedSettings.fontHeading || 'Gilda Display');

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
  appSiteFocusData: loadPersisted('app_site_focus', []),

  isOnboardingOpen: !loadedSettings.hasCompletedOnboarding,
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
  isMoodModalOpen: false,
  isSidebarCollapsed: loadPersisted('sidebar_collapsed', false),
  toggleSidebar: () => set((state) => {
    const next = !state.isSidebarCollapsed;
    savePersisted('sidebar_collapsed', next);
    return { isSidebarCollapsed: next };
  }),
  setSidebarCollapsed: (collapsed: boolean) => {
    savePersisted('sidebar_collapsed', collapsed);
    set({ isSidebarCollapsed: collapsed });
  },
  activeFilter: 'all',
  searchQuery: '',

  // Task Filters State (synchronized across views and sidebar)
  taskCategoryFilter: 'All',
  taskPriorityFilter: 'All',
  taskStatusFilter: 'All',
  taskSearchQuery: '',
  setTaskCategoryFilter: (category) => set({ taskCategoryFilter: category }),
  setTaskPriorityFilter: (priority) => set({ taskPriorityFilter: priority }),
  setTaskStatusFilter: (status) => set({ taskStatusFilter: status }),
  setTaskSearchQuery: (query) => set({ taskSearchQuery: query }),
  navigateToTasks: (filters) => set((state) => ({
    currentTab: 'tasks',
    taskCategoryFilter: filters?.category !== undefined ? filters.category : 'All',
    taskPriorityFilter: filters?.priority !== undefined ? filters.priority : 'All',
    taskStatusFilter: filters?.status !== undefined ? filters.status : 'All',
    taskSearchQuery: filters?.search !== undefined ? filters.search : '',
  })),

  // Analytics Filter & Navigation
  analyticsFilter: {
    timeRange: 'today',
    category: 'All',
    priority: 'all',
    status: 'all',
  },
  setAnalyticsFilter: (filter) => set((state) => ({
    analyticsFilter: { ...state.analyticsFilter, ...filter }
  })),
  navigateToAnalytics: (filters) => set((state) => ({
    currentTab: 'analytics',
    analyticsFilter: {
      ...state.analyticsFilter,
      ...(filters || {})
    }
  })),

  // Focus Timer States
  activeFocusTaskId: null,
  isFocusTimerRunning: false,
  focusElapsedSeconds: 0,
  taskElapsedSeconds: (() => {
    const raw = loadPersisted<Record<string, number>>('task_elapsed_seconds', {});
    const tasks = loadPersisted<Task[]>('tasks', initialTasks);
    const cleaned = { ...raw };
    tasks.forEach((t) => {
      if (t.status === 'pending' && (cleaned[t.id] === (t.duration || 30) * 60 || cleaned[t.id] === 3600)) {
        delete cleaned[t.id];
      }
    });
    return cleaned;
  })(),
  startFocusTask: (taskId) => set((state) => {
    const elapsed = state.taskElapsedSeconds[taskId] || 0;
    const shouldAutoPlayMusic = state.settings.preferences?.autoPlayMusicOnFocus;
    if (shouldAutoPlayMusic && !state.isPlayingLofi) {
      const station = state.settings.preferences?.defaultLofiStation || 'coffee';
      savePersisted('lofi_station', station);
      return {
        activeFocusTaskId: taskId,
        isFocusTimerRunning: true,
        focusElapsedSeconds: elapsed,
        activeLofiStation: station,
        isPlayingLofi: true,
        activeSoundscape: station,
        isPlayingSoundscape: true,
      };
    }
    if (state.activeFocusTaskId === taskId) {
      return { isFocusTimerRunning: true };
    }
    return { activeFocusTaskId: taskId, isFocusTimerRunning: true, focusElapsedSeconds: elapsed };
  }),
  pauseFocusTask: () => set({ isFocusTimerRunning: false }),
  toggleFocusTask: (taskId) => set((state) => {
    if (state.activeFocusTaskId === taskId) {
      return { isFocusTimerRunning: !state.isFocusTimerRunning };
    }
    const elapsed = state.taskElapsedSeconds[taskId] || 0;
    return { activeFocusTaskId: taskId, isFocusTimerRunning: true, focusElapsedSeconds: elapsed };
  }),
  setFocusElapsedSeconds: (sec) => set((state) => {
    const nextSec = typeof sec === 'function' ? sec(state.focusElapsedSeconds) : sec;
    const nextMap = state.activeFocusTaskId
      ? { ...state.taskElapsedSeconds, [state.activeFocusTaskId]: nextSec }
      : state.taskElapsedSeconds;
    if (state.activeFocusTaskId) {
      savePersisted('task_elapsed_seconds', nextMap);
    }
    return {
      focusElapsedSeconds: nextSec,
      taskElapsedSeconds: nextMap,
    };
  }),

  currentMood: loadPersisted('mood', 'calm' as const),
  activeLofiStation: loadPersisted<LofiStationId>('lofi_station', 'coffee'),
  isPlayingLofi: false,
  lofiVolume: loadPersisted<number>('lofi_volume', 45),
  activeSoundscape: 'coffee',
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
  setLofiStation: (station) => {
    savePersisted('lofi_station', station);
    set({ activeLofiStation: station, activeSoundscape: station });
  },
  toggleLofi: (station) => set((state) => {
    const nextStation = station || state.activeLofiStation;
    savePersisted('lofi_station', nextStation);
    const nextPlaying = station 
      ? (state.activeLofiStation === station ? !state.isPlayingLofi : true)
      : !state.isPlayingLofi;
    return { 
      activeLofiStation: nextStation, 
      isPlayingLofi: nextPlaying,
      activeSoundscape: nextStation,
      isPlayingSoundscape: nextPlaying
    };
  }),
  setLofiVolume: (volume) => {
    savePersisted('lofi_volume', volume);
    set({ lofiVolume: volume });
  },
  toggleSoundscape: (soundscape) => set((state) => {
    const nextStation = (soundscape as LofiStationId) || state.activeLofiStation;
    const nextPlaying = soundscape ? (state.activeLofiStation === nextStation ? !state.isPlayingLofi : true) : !state.isPlayingLofi;
    return { 
      activeLofiStation: nextStation, 
      isPlayingLofi: nextPlaying,
      activeSoundscape: nextStation,
      isPlayingSoundscape: nextPlaying 
    };
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
      const isCurrentActive = state.activeFocusTaskId === id;
      return { 
        tasks: updated,
        ...(isCurrentActive ? { activeFocusTaskId: null, isFocusTimerRunning: false, focusElapsedSeconds: 0 } : {})
      };
    });
    get().replanDay();
  },

  toggleTaskStatus: (id) => {
    set((state) => {
      let isNowCompleted = false;
      const targetTask = state.tasks.find(t => t.id === id);
      const updated: Task[] = state.tasks.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === 'completed' ? 'pending' : 'completed';
          if (nextStatus === 'completed') isNowCompleted = true;
          return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      });

      if (isNowCompleted) {
        playCompletionSound();
      }

      savePersisted('tasks', updated);

      const isCurrentActive = state.activeFocusTaskId === id;
      let nextElapsedMap = { ...state.taskElapsedSeconds };

      // If active focus timer was running on this task, save real tracked seconds
      if (isCurrentActive && state.focusElapsedSeconds > 0) {
        nextElapsedMap[id] = state.focusElapsedSeconds;
        savePersisted('task_elapsed_seconds', nextElapsedMap);
      } else if (!isNowCompleted) {
        // If task is marked undone and was previously logged with exact duration, reset to 0
        if (targetTask && (nextElapsedMap[id] === (targetTask.duration || 30) * 60 || nextElapsedMap[id] === 3600)) {
          delete nextElapsedMap[id];
          savePersisted('task_elapsed_seconds', nextElapsedMap);
        }
      }

      return { 
        tasks: updated,
        taskElapsedSeconds: nextElapsedMap,
        ...(isCurrentActive && isNowCompleted ? { isFocusTimerRunning: false, focusElapsedSeconds: 0, activeFocusTaskId: null } : {})
      };
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
      const isCurrentActive = state.activeFocusTaskId === id;
      return { 
        tasks: updated,
        ...(isCurrentActive ? { activeFocusTaskId: null, isFocusTimerRunning: false, focusElapsedSeconds: 0 } : {})
      };
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

  lightenTodayLoad: () => {
    const todayStr = get().selectedDate || new Date().toISOString().split('T')[0];
    const tomorrow = new Date(todayStr);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let count = 0;
    set((state) => {
      const updated = state.tasks.map((t) => {
        const isToday = t.scheduledDate === todayStr || (!t.scheduledDate && t.status !== 'completed' && t.status !== 'skipped');
        const isFlexibleOrOptional = t.priority === 'flexible' || t.priority === 'optional';
        if (isToday && isFlexibleOrOptional && t.status !== 'completed' && t.status !== 'skipped') {
          count++;
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
    return count;
  },

  extendTaskDuration: (taskId, extraMinutes) => {
    set((state) => {
      const updated = state.tasks.map((t) => {
        if (t.id === taskId) {
          const newDuration = Math.max(5, (t.duration || 45) + extraMinutes);
          return { ...t, duration: newDuration, updatedAt: new Date().toISOString() };
        }
        return t;
      });
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
      let isCompletedNow = false;
      const updated = state.habits.map((h) => {
        if (h.id === id) {
          const isRemoving = h.completedDates.includes(date);
          const completed = isRemoving
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date];
          if (!isRemoving) isCompletedNow = true;
          return { ...h, completedDates: completed };
        }
        return h;
      });
      if (isCompletedNow) {
        playCompletionSound();
      }
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

  addCustomCategory: (cat) => {
    set((state) => {
      const existing = state.settings.customCategories || [];
      const updated = [...existing.filter(c => c.id !== cat.id), cat];
      const updatedSettings: AppSettings = { ...state.settings, customCategories: updated };
      savePersisted('settings', updatedSettings);
      return { settings: updatedSettings };
    });
  },

  deleteCustomCategory: (id) => {
    get().deleteCategory(id);
  },

  deleteCategory: (labelOrId) => {
    set((state) => {
      const existing = state.settings.customCategories || [];
      const updatedCustom = existing.filter(c => c.id !== labelOrId && c.label.toLowerCase() !== labelOrId.toLowerCase());
      const deletedCats = Array.from(new Set([...(state.settings.deletedCategories || []), labelOrId.toLowerCase()]));
      const updatedSettings: AppSettings = {
        ...state.settings,
        customCategories: updatedCustom,
        deletedCategories: deletedCats,
      };
      savePersisted('settings', updatedSettings);
      const isFiltered = state.taskCategoryFilter.toLowerCase() === labelOrId.toLowerCase();
      return {
        settings: updatedSettings,
        ...(isFiltered ? { taskCategoryFilter: 'All' } : {})
      };
    });
  },

  addCustomPriority: (prio) => {
    set((state) => {
      const existing = state.settings.customPriorities || [];
      const updated = [...existing.filter(p => p.id !== prio.id), prio];
      const updatedSettings: AppSettings = { ...state.settings, customPriorities: updated };
      savePersisted('settings', updatedSettings);
      return { settings: updatedSettings };
    });
  },

  deleteCustomPriority: (id) => {
    if (['important', 'regular', 'flexible', 'optional', 'critical'].includes(id.toLowerCase())) {
      return; // 3 default priorities cannot be deleted
    }
    set((state) => {
      const existing = state.settings.customPriorities || [];
      const updated = existing.filter(p => p.id !== id && p.label.toLowerCase() !== id.toLowerCase());
      const updatedSettings: AppSettings = { ...state.settings, customPriorities: updated };
      savePersisted('settings', updatedSettings);
      const isFiltered = state.taskPriorityFilter.toLowerCase() === id.toLowerCase();
      return {
        settings: updatedSettings,
        ...(isFiltered ? { taskPriorityFilter: 'all' } : {})
      };
    });
  },

  resetTaskTimer: (taskId) => {
    set((state) => {
      const nextMap = { ...state.taskElapsedSeconds };
      delete nextMap[taskId];
      savePersisted('task_elapsed_seconds', nextMap);
      const isCurrentActive = state.activeFocusTaskId === taskId;
      return {
        taskElapsedSeconds: nextMap,
        ...(isCurrentActive ? { activeFocusTaskId: null, isFocusTimerRunning: false, focusElapsedSeconds: 0 } : {})
      };
    });
  },

  updateUserProfile: (profile) => {
    set((state) => {
      const updated: AppSettings = { ...state.settings, ...profile };
      savePersisted('settings', updated);
      return { settings: updated };
    });
  },

  updateSettings: (newSettings) => {
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
    if (newSettings.fontHeading) {
      applyFont(newSettings.fontHeading);
    }
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      savePersisted('settings', updated);
      return { settings: updated };
    });
    get().replanDay();
  },

  updatePreferences: (newPreferences) => {
    set((state) => {
      const updatedPrefs: UserPreferences = {
        ...defaultPreferences,
        ...(state.settings.preferences || {}),
        ...newPreferences,
      };
      const updatedSettings: AppSettings = {
        ...state.settings,
        preferences: updatedPrefs,
      };
      savePersisted('settings', updatedSettings);
      return { settings: updatedSettings };
    });
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
        const targetDate = op.target_date === 'tomorrow'
          ? (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()
          : (op.target_date && op.target_date !== 'today' ? op.target_date : selectedDate);

        updatedTasks.unshift({
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: op.title || 'New Task',
          duration: op.duration_minutes || 45,
          priority: op.priority || 'important',
          status: 'pending',
          category: op.category || 'Work',
          scheduledDate: targetDate,
          scheduledStart: op.start_time || undefined,
          scheduledEnd: op.end_time || undefined,
          timeMode: op.start_time ? 'scheduled' : 'duration',
          flexibility: op.start_time ? 'fixed' : 'flexible',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (op.op_type === 'ADD_COMMITMENT') {
        updatedTasks.unshift({
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: op.title || 'Fixed Commitment',
          duration: op.duration_minutes || 45,
          priority: op.priority || 'important',
          status: 'pending',
          category: op.category || 'Work',
          scheduledDate: selectedDate,
          scheduledStart: op.start_time || '16:00',
          scheduledEnd: op.end_time || undefined,
          timeMode: 'scheduled',
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
          playCompletionSound();
        }
      } else if (op.op_type === 'MOVE_TASK') {
        const target = updatedTasks.find(t => t.title.toLowerCase().includes((op.title || '').toLowerCase()) || t.id === op.task_id);
        if (target) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          target.scheduledDate = op.target_date === 'tomorrow' ? tomorrow.toISOString().split('T')[0] : selectedDate;
          target.movedCount = (target.movedCount || 0) + 1;
        }
      } else if (op.op_type === 'DELETE_TASK') {
        const rawTitle = (op.title || '').trim().toLowerCase();
        if (rawTitle === 'all' || rawTitle === 'all tasks' || rawTitle === 'everything' || rawTitle === 'all_tasks') {
          updatedTasks = [];
        } else {
          const rangeMatch = rawTitle.match(/task\s*(\d+)\s*(?:through|to|-)\s*(?:task\s*)?(\d+)/i) || rawTitle.match(/(\d+)\s*(?:through|to|-)\s*(\d+)/);
          if (rangeMatch) {
            const start = parseInt(rangeMatch[1], 10) - 1;
            const end = parseInt(rangeMatch[2], 10) - 1;
            updatedTasks = updatedTasks.filter((_, idx) => idx < start || idx > end);
          } else {
            const indexMatch = rawTitle.match(/^task\s*(\d+)$/i) || rawTitle.match(/^#(\d+)$/);
            const targetIdx = indexMatch ? parseInt(indexMatch[1], 10) - 1 : -1;

            updatedTasks = updatedTasks.filter((t, idx) => {
              if (op.task_id && t.id === op.task_id) return false;
              if (targetIdx !== -1 && idx === targetIdx) return false;
              if (rawTitle && (t.title.toLowerCase().includes(rawTitle) || rawTitle.includes(t.title.toLowerCase()))) return false;
              return true;
            });
          }
        }
      } else if (op.op_type === 'UPDATE_TASK' || op.op_type === 'CHANGE_DURATION' || op.op_type === 'CHANGE_PRIORITY') {
        const rawTitle = (op.title || '').trim().toLowerCase();
        const target = updatedTasks.find(t => t.id === op.task_id || (rawTitle && (t.title.toLowerCase().includes(rawTitle) || rawTitle.includes(t.title.toLowerCase()))));
        if (target) {
          if (op.duration_minutes) target.duration = op.duration_minutes;
          if (op.priority) target.priority = op.priority;
          if (op.category) target.category = op.category;
          if (op.start_time) target.scheduledStart = op.start_time;
          if (op.target_date) target.scheduledDate = op.target_date === 'tomorrow' ? undefined : selectedDate;
          target.updatedAt = new Date().toISOString();
        } else if (op.title) {
          // If task didn't exist in store yet (e.g. user refining a newly proposed task), insert it!
          updatedTasks.unshift({
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: op.title,
            duration: op.duration_minutes || 25,
            priority: op.priority || 'important',
            status: 'pending',
            category: op.category || 'Work',
            scheduledStart: op.start_time,
            scheduledDate: op.target_date === 'tomorrow' ? undefined : selectedDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
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
      isAiModalOpen: false,
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
  openMoodModal: () => set({ isMoodModalOpen: true }),
  closeMoodModal: () => set({ isMoodModalOpen: false }),

  // Onboarding handlers
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),
  completeOnboarding: (payload) => {
    const {
      userName,
      focusPriority,
      theme,
      fontHeading,
      wakeTime,
      sleepTime,
      initialTaskTitle,
      initialTaskDuration,
      initialTaskPriority,
      initialTaskCategory,
    } = payload;

    applyTheme(theme);
    applyFont(fontHeading);

    set((state) => {
      const updatedSettings: AppSettings = {
        ...state.settings,
        userName: userName?.trim() || state.settings.userName,
        focusPriority: focusPriority || state.settings.focusPriority,
        theme,
        fontHeading,
        wakeTime: wakeTime || state.settings.wakeTime,
        sleepTime: sleepTime || state.settings.sleepTime,
        hasCompletedOnboarding: true,
      };
      savePersisted('settings', updatedSettings);

      let updatedTasks = state.tasks;
      if (initialTaskTitle && initialTaskTitle.trim()) {
        const newTask: Task = {
          id: `task-onboard-${Date.now()}`,
          title: initialTaskTitle.trim(),
          duration: initialTaskDuration || 45,
          priority: initialTaskPriority || 'important',
          category: initialTaskCategory || 'Work',
          status: 'pending',
          scheduledDate: getTodayDate(),
          scheduledStart: '10:00',
          scheduledEnd: '10:45',
          flexibility: 'flexible',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedTasks = [newTask, ...state.tasks];
        savePersisted('tasks', updatedTasks);
      }

      return {
        settings: updatedSettings,
        tasks: updatedTasks,
        isOnboardingOpen: false,
        currentTab: focusPriority === 'habits' ? 'habits' : 'today',
      };
    });

    get().replanDay();
  },

  getDayCapacity: () => {
    const { selectedDate, tasks, habits, settings, taskElapsedSeconds, activeFocusTaskId, focusElapsedSeconds } = get();
    return calculateDayCapacity(selectedDate, tasks, habits, settings, taskElapsedSeconds, activeFocusTaskId, focusElapsedSeconds);
  }
}));
