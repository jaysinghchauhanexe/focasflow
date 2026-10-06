export type Priority = 'critical' | 'important' | 'flexible' | 'optional';
export type TaskStatus = 'pending' | 'active' | 'completed' | 'skipped' | 'moved';
export type Category = 'Health' | 'Work' | 'Personal' | 'Learning' | 'Neutral';
export type EnergyLevel = 'high' | 'medium' | 'low';
export type Flexibility = 'fixed' | 'flexible';

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  priority: Priority;
  status: TaskStatus;
  deadline?: string; // YYYY-MM-DD
  scheduledDate?: string; // YYYY-MM-DD
  scheduledStart?: string; // HH:mm
  scheduledEnd?: string; // HH:mm
  category: Category;
  projectId?: string;
  energyLevel?: EnergyLevel;
  flexibility?: Flexibility;
  movedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: Category;
  duration: number; // minutes
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly';
  preferredTime: 'morning' | 'afternoon' | 'evening';
  target: number; // target times per week or day
  completedDates: string[]; // YYYY-MM-DD strings
  active: boolean;
  createdAt: string;
}

export interface Routine {
  id: string;
  title: string;
  type: 'morning' | 'evening' | 'custom';
  preferredTime: string; // HH:mm
  items: { id: string; title: string; duration: number; completed?: boolean }[];
  active: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: Category;
  targetDate?: string;
  progress: number; // 0 to 100
  description?: string;
  projects?: { id: string; title: string; tasksCount: number; completedCount: number }[];
}

export interface ScheduleBlock {
  id: string;
  title: string;
  blockType: 'task' | 'habit' | 'routine' | 'commitment' | 'break';
  itemId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: Category;
  isFixed: boolean;
  completed: boolean;
}

export interface HistoryLog {
  id: string;
  date: string; // YYYY-MM-DD
  plannedMinutes: number;
  completedMinutes: number;
  movedMinutes: number;
  skippedMinutes: number;
  completedTasksCount: number;
  totalTasksCount: number;
  notes?: string;
}

export type AppTheme = 'green' | 'teal' | 'blue' | 'monochrome' | 'dark';

export type LofiStationId = 'study' | 'work' | 'coffee';

export interface LofiStation {
  id: LofiStationId;
  label: string;
  subLabel: string;
  youtubeId: string;
  thumbnail: string;
  mood: string;
}

export interface UserPreferences {
  // Mood & Emotional Intelligence
  enableMoodInsightPopups: boolean;
  enableMoodFaceAnimations: boolean;
  enableDailyMoodCheckin: boolean;

  // Focus & Soundscapes
  autoPlayMusicOnFocus: boolean;
  defaultLofiStation: LofiStationId;
  enableOvertimeAlerts: boolean;
  taskCompletionChime: boolean;
  enableButtonClickSound: boolean;

  // Schedule & Capacity Automations
  enableOverloadWarnings: boolean;
  autoRollFlexibleTasks: boolean;
  strictBedtimeBoundary: boolean;
  smartBreakBuffers: boolean;

  // Visual & Experience
  enableSmoothAnimations: boolean;
  enableHapticFeedback: boolean;
  showShortcutsHint: boolean;
}

export interface AppSettings {
  userName: string;
  wakeTime: string; // e.g. "07:00"
  sleepTime: string; // e.g. "23:00"
  workStart: string; // e.g. "09:00"
  workEnd: string; // e.g. "18:00"
  breakDuration: number; // in minutes e.g. 15
  openRouterApiKey: string;
  openRouterModel: string;
  autoReschedule: boolean;
  theme: AppTheme;
  fontHeading?: string;
  hasCompletedOnboarding?: boolean;
  focusPriority?: 'tasks' | 'habits' | 'balance';
  preferences?: UserPreferences;
}

export interface AiOperation {
  op_type: 'ADD_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'MOVE_TASK' | 'SKIP_TASK' | 'COMPLETE_TASK' | 'CHANGE_PRIORITY' | 'CHANGE_DURATION' | 'CREATE_HABIT' | 'ADD_COMMITMENT' | 'REPLAN_DAY';
  title?: string;
  task_id?: string;
  duration_minutes?: number;
  priority?: Priority;
  category?: Category;
  target_date?: string;
  start_time?: string;
  end_time?: string;
  frequency?: string;
  preferred_time?: 'morning' | 'afternoon' | 'evening';
  notes?: string;
}

export interface AiResponsePayload {
  message: string;
  operations: AiOperation[];
  suggestions?: string[];
  is_overloaded?: boolean;
  overload_minutes?: number;
}

export interface AiRequestContext {
  current_time: string;
  current_date: string;
  remaining_tasks: string[];
  habits: string[];
  working_hours: string;
  sleep_hours: string;
  user_message: string;
  api_key?: string;
  model?: string;
}

export interface SchedulerSuggestion {

  id: string;
  actionType: 'move' | 'shorten' | 'skip';
  targetTaskId: string;
  taskTitle: string;
  explanation: string;
  targetDate?: string;
  newDuration?: number;
}

export interface DayCapacity {
  date: string;
  totalAvailableMinutes: number;
  totalPlannedMinutes: number;
  isOverloaded: boolean;
  overloadMinutes: number;
  focusMinutes: number;
  importantTasksCount: number;
  regularTasksCount: number;
  completedTasksCount: number;
  remainingTasksCount: number;
  suggestions: SchedulerSuggestion[];
}
