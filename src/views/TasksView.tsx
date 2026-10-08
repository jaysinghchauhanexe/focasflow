import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Task, Category, Priority, CustomCategoryItem, CustomPriorityItem } from '../types';
import { getTodayDateString, getTomorrowDateString, parseLocalDate, formatLocalDate, addDaysToDateString } from '../utils/dateUtils';
import {
  Plus,
  Search,
  Check,
  Play,
  Pause,
  MoreHorizontal,
  ArrowRight,
  Clock,
  Trash2,
  Edit2,
  FastForward,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flame,
  Calendar as CalendarIcon,
  Sparkles,
  Briefcase,
  User,
  Heart,
  BookOpen,
  Layers,
  Code2,
  Coffee,
  Dumbbell,
  Globe,
  Music,
  Camera,
  ShoppingBag,
  Terminal,
  Zap,
  Shield,
  Star,
  Bookmark,
  Compass,
  Laptop,
  Smile,
  Rocket,
  Cpu,
  SlidersHorizontal,
  Palette,
  Settings
} from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { CustomSelect } from '../components/CustomSelect';
import { playClickSound } from '../utils/soundEffects';
import { getDailyFocusSeconds, getWeeklyFocusData, calculateRealStreak, formatFocusTime } from '../utils/metrics';
import { DoodleTasks } from '../components/DoodleIllustrations';

const AVAILABLE_ICONS: { name: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'User', icon: User },
  { name: 'Heart', icon: Heart },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Layers', icon: Layers },
  { name: 'Code2', icon: Code2 },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Coffee', icon: Coffee },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Globe', icon: Globe },
  { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Terminal', icon: Terminal },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'Star', icon: Star },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Compass', icon: Compass },
  { name: 'Flame', icon: Flame },
  { name: 'Laptop', icon: Laptop },
  { name: 'Smile', icon: Smile },
  { name: 'Rocket', icon: Rocket },
  { name: 'Cpu', icon: Cpu },
];

const PRESET_CATEGORY_COLORS = [
  { label: 'Forest Green', hex: '#24584C', badgeClass: 'badge-work' },
  { label: 'Emerald', hex: '#16A34A', badgeClass: 'badge-health' },
  { label: 'Tangerine', hex: '#F97316', badgeClass: 'badge-work' },
  { label: 'Purple', hex: '#8B5CF6', badgeClass: 'badge-personal' },
  { label: 'Amber Gold', hex: '#D97706', badgeClass: 'badge-learning' },
  { label: 'Sky Blue', hex: '#0284C7', badgeClass: 'badge-neutral' },
  { label: 'Rose Pink', hex: '#EC4899', badgeClass: 'badge-personal' },
  { label: 'Crimson', hex: '#E5484D', badgeClass: 'badge-important' },
  { label: 'Slate', hex: '#64748B', badgeClass: 'badge-neutral' },
];

const PRESET_PRIORITY_DOTS = [
  { label: 'Crimson', dotColor: 'bg-[#E5484D]', hex: '#E5484D' },
  { label: 'Tangerine', dotColor: 'bg-[#F97316]', hex: '#F97316' },
  { label: 'Amber', dotColor: 'bg-[#D97706]', hex: '#D97706' },
  { label: 'Emerald', dotColor: 'bg-[#16A34A]', hex: '#16A34A' },
  { label: 'Sky', dotColor: 'bg-[#0284C7]', hex: '#0284C7' },
  { label: 'Indigo', dotColor: 'bg-[#6366F1]', hex: '#6366F1' },
  { label: 'Violet', dotColor: 'bg-[#8B5CF6]', hex: '#8B5CF6' },
  { label: 'Rose', dotColor: 'bg-[#EC4899]', hex: '#EC4899' },
  { label: 'Slate', dotColor: 'bg-[#64748B]', hex: '#64748B' },
];

export const TasksView: React.FC = () => {
  const {
    tasks,
    habits,
    history,
    selectedDate,
    setSelectedDate,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    openTaskModal,
    moveTaskToTomorrow,
    moveTaskLater,
    skipTask,
    activeFocusTaskId,
    isFocusTimerRunning,
    focusElapsedSeconds,
    taskElapsedSeconds,
    toggleFocusTask,
    settings,
    taskCategoryFilter,
    taskPriorityFilter,
    taskStatusFilter,
    taskSearchQuery,
    setTaskCategoryFilter,
    setTaskPriorityFilter,
    setTaskStatusFilter,
    setTaskSearchQuery,
    addCustomCategory,
    deleteCategory,
    addCustomPriority,
    deleteCustomPriority,
    resetTaskTimer,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'backlog'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Category Creator Modal & Color state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatColorHex, setNewCatColorHex] = useState('#24584C');
  const [isCustomColorPicker, setIsCustomColorPicker] = useState(false);

  // Priority Creator Modal & Color state
  const [isAddingPriority, setIsAddingPriority] = useState(false);
  const [newPrioName, setNewPrioName] = useState('');
  const [newPrioDotColor, setNewPrioDotColor] = useState('bg-[#E5484D]');

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);

  // Hover state for Focus Graph Tooltip
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => getTodayDateString(), []);
  const activeDate = selectedDate || todayStr;

  useEffect(() => {
    if (!activeMenuId) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [activeMenuId]);

  const toggleSectionCollapse = (sectionKey: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // 7-day Week Strip & Focus Graph Data (Unified Centralized Metrics)
  const { days: weekDays, maxFocusMinutes } = useMemo(() => {
    return getWeeklyFocusData(
      activeDate,
      tasks,
      taskElapsedSeconds,
      activeFocusTaskId,
      focusElapsedSeconds,
      isFocusTimerRunning
    );
  }, [activeDate, tasks, taskElapsedSeconds, activeFocusTaskId, focusElapsedSeconds, isFocusTimerRunning]);

  const handlePrevWeek = () => {
    playClickSound();
    setSelectedDate(addDaysToDateString(activeDate, -7));
  };

  const handleNextWeek = () => {
    playClickSound();
    setSelectedDate(addDaysToDateString(activeDate, 7));
  };

  const handleJumpToday = () => {
    playClickSound();
    setSelectedDate(todayStr);
  };

  // Metric 1: Tasks Done / Completion Rate for Active Date
  const activeDateTasksList = useMemo(() => {
    return tasks.filter((t) => t.scheduledDate === activeDate || (activeDate === todayStr && !t.scheduledDate));
  }, [tasks, activeDate, todayStr]);

  const activeDateCompletedCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed' && (t.scheduledDate === activeDate || (activeDate === todayStr && !t.scheduledDate))).length;
  }, [tasks, activeDate, todayStr]);

  const activeDateTotalCount = activeDateTasksList.length;
  const completionPercentage = activeDateTotalCount > 0 ? Math.round((activeDateCompletedCount / activeDateTotalCount) * 100) : 0;

  // Metric 2: Accurate Focus Time Logged for Active Date
  const activeDateFocusSec = useMemo(() => {
    return getDailyFocusSeconds(
      activeDate,
      tasks,
      taskElapsedSeconds,
      activeFocusTaskId,
      focusElapsedSeconds,
      isFocusTimerRunning
    );
  }, [activeDate, tasks, taskElapsedSeconds, activeFocusTaskId, focusElapsedSeconds, isFocusTimerRunning]);

  const formattedFocus = formatFocusTime(activeDateFocusSec);

  // Metric 3: Real Streak Calculation (Unified Centralized Engine)
  const { currentStreak, sparklinePoints } = useMemo(() => {
    return calculateRealStreak(tasks, habits, history);
  }, [tasks, habits, history]);

  // Filter tasks based on global criteria
  const applyFilter = (taskList: Task[]) => {
    const filtered = taskList.filter((t) => {
      if (taskSearchQuery && !t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())) return false;
      if (taskCategoryFilter !== 'All' && t.category !== taskCategoryFilter) return false;
      if (taskPriorityFilter !== 'All' && taskPriorityFilter !== 'all') {
        if (taskPriorityFilter === 'important') {
          if (t.priority !== 'critical' && t.priority !== 'important') return false;
        } else if (taskPriorityFilter === 'regular' || taskPriorityFilter === 'flexible') {
          if (t.priority !== 'regular' && t.priority !== 'flexible') return false;
        } else if (taskPriorityFilter === 'optional') {
          if (t.priority !== 'optional') return false;
        } else if (t.priority !== taskPriorityFilter) {
          return false;
        }
      }
      if (taskStatusFilter !== 'All' && taskStatusFilter !== 'all') {
        if (taskStatusFilter === 'completed' && t.status !== 'completed') return false;
        if (taskStatusFilter === 'pending' && t.status === 'completed') return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (a.scheduledStart && !b.scheduledStart) return -1;
      if (!a.scheduledStart && b.scheduledStart) return 1;
      if (a.scheduledStart && b.scheduledStart) {
        return a.scheduledStart.localeCompare(b.scheduledStart);
      }
      return 0;
    });
  };

  const isSpecificDateSelected = activeDate !== todayStr;

  const dateFilteredTasks = useMemo(() => {
    if (isSpecificDateSelected) {
      return applyFilter(tasks.filter((t) => t.scheduledDate === activeDate));
    }
    return [];
  }, [isSpecificDateSelected, tasks, activeDate, taskSearchQuery, taskCategoryFilter, taskPriorityFilter, taskStatusFilter]);

  // General All Tasks Groupings:
  const sectionTodayTasks = useMemo(() => {
    return applyFilter(
      tasks.filter((t) => t.scheduledDate === todayStr || (!t.scheduledDate && t.status !== 'completed' && t.status !== 'skipped'))
    );
  }, [tasks, todayStr, taskSearchQuery, taskCategoryFilter, taskPriorityFilter, taskStatusFilter]);

  const sectionUpcomingTasks = useMemo(() => {
    const tomStr = getTomorrowDateString();
    const nextWeekStr = addDaysToDateString(todayStr, 7);

    return applyFilter(
      tasks.filter((t) => t.scheduledDate && t.scheduledDate >= tomStr && t.scheduledDate <= nextWeekStr && t.status !== 'completed')
    );
  }, [tasks, todayStr, taskSearchQuery, taskCategoryFilter, taskPriorityFilter, taskStatusFilter]);

  const sectionLaterTasks = useMemo(() => {
    const nextWeekStr = addDaysToDateString(todayStr, 7);

    return applyFilter(
      tasks.filter((t) => (t.scheduledDate && t.scheduledDate > nextWeekStr) || (!t.scheduledDate && t.status === 'completed'))
    );
  }, [tasks, todayStr, taskSearchQuery, taskCategoryFilter, taskPriorityFilter, taskStatusFilter]);

  // Past unfinished tasks (for rollover prompt)
  const pastUnfinishedTasks = useMemo(() => {
    return tasks.filter((t) => t.scheduledDate && t.scheduledDate < todayStr && t.status !== 'completed' && t.status !== 'skipped');
  }, [tasks, todayStr]);

  const handleRollAllToToday = () => {
    playClickSound();
    pastUnfinishedTasks.forEach((t) => {
      updateTask({
        ...t,
        scheduledDate: todayStr,
        movedCount: (t.movedCount || 0) + 1,
      });
    });
  };

  const calculateTotalMinutes = (taskList: Task[]) => {
    const total = taskList.reduce((acc, t) => acc + (t.duration || 30), 0);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
    return `${m}m`;
  };

  const getCategoryStyle = (cat: string, isCompleted: boolean) => {
    const custom = settings.customCategories?.find((c) => c.label === cat);
    const baseClass = `px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all ${isCompleted ? 'opacity-50' : ''}`;
    
    if (custom && custom.colorClass && custom.colorClass.startsWith('#')) {
      return {
        className: baseClass,
        style: { backgroundColor: `${custom.colorClass}1f`, color: custom.colorClass }
      };
    }
    
    let colorClass = 'badge-neutral';
    switch (cat) {
      case 'Health': colorClass = 'badge-health'; break;
      case 'Work': colorClass = 'badge-work'; break;
      case 'Personal': colorClass = 'badge-personal'; break;
      case 'Learning': colorClass = 'badge-learning'; break;
    }
    return {
      className: `${baseClass} ${colorClass}`,
      style: undefined
    };
  };

  // Dots are strictly reserved for priority levels
  const getPriorityDot = (t: Task) => {
    if (t.status === 'completed') return 'bg-tag-health';
    if (t.priority === 'critical' || t.priority === 'important') return 'bg-[#E5484D]';
    if (t.priority === 'regular' || t.priority === 'flexible') return 'bg-[#D97706]';
    if (t.priority === 'optional') return 'bg-[#64748B]';
    return 'bg-[#6366F1]';
  };

  // Category counts & Icons breakdown (Icons instead of dots)
  const categoryData = useMemo(() => {
    const deletedCatSet = new Set((settings.deletedCategories || []).map(c => c.toLowerCase()));
    const map: Record<string, { label: string; count: number; iconName: string; icon: React.ReactNode; colorClass: string; customHex?: string }> = {};

    const defaultEntries: Record<string, { label: string; iconName: string; icon: React.ReactNode; colorClass: string }> = {
      Work: { label: 'Work', iconName: 'Briefcase', icon: <Briefcase size={13} className="text-tag-work" />, colorClass: 'badge-work' },
      Personal: { label: 'Personal', iconName: 'User', icon: <User size={13} className="text-tag-personal" />, colorClass: 'badge-personal' },
      Health: { label: 'Health', iconName: 'Heart', icon: <Heart size={13} className="text-tag-health" />, colorClass: 'badge-health' },
      Learning: { label: 'Learning', iconName: 'BookOpen', icon: <BookOpen size={13} className="text-tag-learning" />, colorClass: 'badge-learning' },
      Neutral: { label: 'Neutral', iconName: 'Layers', icon: <Layers size={13} className="text-tag-neutral" />, colorClass: 'badge-neutral' },
    };

    Object.entries(defaultEntries).forEach(([k, v]) => {
      if (!deletedCatSet.has(k.toLowerCase())) {
        map[k] = { ...v, count: 0 };
      }
    });

    if (settings.customCategories) {
      settings.customCategories.forEach((cc) => {
        if (!deletedCatSet.has(cc.label.toLowerCase())) {
          const IconComponent = AVAILABLE_ICONS.find(i => i.name === cc.iconName)?.icon || Sparkles;
          const hex = cc.colorClass?.startsWith('#') ? cc.colorClass : undefined;
          map[cc.label] = {
            label: cc.label,
            count: 0,
            iconName: cc.iconName,
            icon: <IconComponent size={13} style={hex ? { color: hex } : undefined} className={!hex ? "text-primary" : undefined} />,
            colorClass: cc.colorClass || 'badge-work',
            customHex: hex,
          };
        }
      });
    }

    tasks.forEach((t) => {
      const cat = t.category || 'Work';
      if (map[cat]) {
        map[cat].count++;
      }
    });

    return map;
  }, [tasks, settings.customCategories, settings.deletedCategories]);

  // Priorities counts & Colored Dots breakdown (Dots only for priority level)
  const priorityData = useMemo(() => {
    const map: Record<string, { label: string; count: number; dotColor: string }> = {
      important: { label: 'Important', count: 0, dotColor: 'bg-[#E5484D]' },
      regular: { label: 'Regular', count: 0, dotColor: 'bg-[#D97706]' },
      optional: { label: 'Optional', count: 0, dotColor: 'bg-[#64748B]' },
    };

    if (settings.customPriorities) {
      settings.customPriorities.forEach((cp) => {
        if (!['important', 'regular', 'flexible', 'optional'].includes(cp.id.toLowerCase())) {
          map[cp.id] = {
            label: cp.label,
            count: 0,
            dotColor: cp.dotColor || 'bg-[#6366F1]',
          };
        }
      });
    }

    tasks.forEach((t) => {
      if (t.priority === 'critical' || t.priority === 'important') {
        map.important.count++;
      } else if (t.priority === 'regular' || t.priority === 'flexible') {
        map.regular.count++;
      } else if (t.priority === 'optional') {
        map.optional.count++;
      } else if (map[t.priority]) {
        map[t.priority].count++;
      } else {
        map.optional.count++;
      }
    });

    return map;
  }, [tasks, settings.customPriorities]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    if (editingCategoryId) {
      if (editingCategoryId !== newCatName.trim()) {
        tasks.forEach(t => {
          if (t.category === editingCategoryId) {
            updateTask({ ...t, category: newCatName.trim() });
          }
        });
      }
      deleteCategory(editingCategoryId);
    }
    
    addCustomCategory({
      id: `cat-${Date.now()}`,
      label: newCatName.trim(),
      iconName: newCatIcon,
      colorClass: newCatColorHex,
    });
    setNewCatName('');
    setIsAddingCategory(false);
    setEditingCategoryId(null);
  };

  const handleCreatePriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrioName.trim()) return;
    const prioKey = newPrioName.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (editingPriorityId) {
      if (editingPriorityId !== newPrioName.trim()) {
        tasks.forEach(t => {
          if (t.priority === editingPriorityId || (t.priority as string) === editingPriorityId.toLowerCase()) {
            updateTask({ ...t, priority: prioKey as any });
          }
        });
      }
      deleteCustomPriority(editingPriorityId);
    }
    
    addCustomPriority({
      id: prioKey,
      label: newPrioName.trim(),
      dotColor: newPrioDotColor,
    });
    setNewPrioName('');
    setIsAddingPriority(false);
    setEditingPriorityId(null);
  };

  const renderTaskRow = (task: Task, idx: number) => {
    const isCompleted = task.status === 'completed';
    const isSkipped = task.status === 'skipped';
    const timeDisplay = task.scheduledStart && task.scheduledEnd
      ? `${formatTime12h(task.scheduledStart)} – ${formatTime12h(task.scheduledEnd)}`
      : `${task.duration || 30}m`;

    const isThisTaskActive = activeFocusTaskId === task.id;
    const isThisTaskRunning = isFocusTimerRunning && isThisTaskActive;
    const elapsedSeconds = isThisTaskActive ? focusElapsedSeconds : (taskElapsedSeconds[task.id] || 0);
    const estimatedSeconds = (task.duration || 30) * 60;
    const areOvertimeAlertsEnabled = settings.preferences?.enableOvertimeAlerts ?? true;
    const isOvertime = areOvertimeAlertsEnabled && elapsedSeconds > estimatedSeconds;

    return (
      <div
        key={task.id}
        style={{ animationDelay: `${idx * 25}ms` }}
        onContextMenu={(e) => {
          e.preventDefault();
          setActiveMenuId(activeMenuId === task.id ? null : task.id);
        }}
        className={`group relative flex items-center justify-between py-3 px-3 transition-all duration-200 hover:bg-card-subtle rounded-2xl animate-enter-up ${
          activeMenuId === task.id ? 'z-30 bg-card-subtle' : 'z-0'
        }`}
      >
        {/* Left: Checkbox + Priority Dot (Dots only for priority!) + Title & Subtitle */}
        <div className="flex items-center gap-3 min-w-0 pr-3 flex-1">
          <button
            type="button"
            data-completion-trigger="true"
            data-no-click-sound="true"
            data-no-rounded-full="true"
            onClick={() => toggleTaskStatus(task.id)}
            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            className={`w-[20px] h-[20px] rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-75 hover:scale-110 flex-shrink-0 ${
              isCompleted
                ? 'bg-tag-health text-white shadow-xs border border-tag-health'
                : 'border border-borderToken hover:border-primary bg-card-subtle'
            }`}
          >
            {isCompleted && <Check size={13} strokeWidth={3} className="text-white animate-check-pop" />}
          </button>

          <span
            title={`Priority: ${task.priority || 'important'}`}
            className={`w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200 ${getPriorityDot(task)}`}
          />

          <div className="min-w-0 flex-1">
            <span
              onClick={() => openTaskModal(task)}
              className={`text-[13.5px] sm:text-[14px] font-sans truncate cursor-pointer transition-colors block ${
                isCompleted
                  ? 'line-through text-mutedText opacity-60'
                  : isSkipped
                    ? 'italic line-through text-mutedText opacity-60'
                    : 'text-foreground hover:text-primary font-medium'
              }`}
            >
              {task.title}
            </span>
            <span
              onClick={() => openTaskModal(task)}
              className="text-[11.5px] text-mutedText truncate block cursor-pointer hover:text-foreground mt-0.5"
            >
              {task.description || 'Add a description...'}
            </span>
          </div>
        </div>

        {/* Right: Category Badge + Time + Live Timer + Focus Play + Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <span
            className={getCategoryStyle(task.category, isCompleted).className}
            style={getCategoryStyle(task.category, isCompleted).style}
          >
            {task.category}
          </span>

          {/* Date Badge if upcoming/different date */}
          {task.scheduledDate && task.scheduledDate !== todayStr && (
            <span className="text-[11.5px] font-normal text-mutedText font-sans hidden sm:inline-block">
              {task.scheduledDate === getTomorrowDateString()
                ? 'Tomorrow'
                : parseLocalDate(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}

          <span className={`text-[12px] font-normal text-mutedText font-sans transition-opacity ${
            isCompleted ? 'opacity-50' : ''
          }`}>
            {timeDisplay}
          </span>

          {/* Live timer badge */}
          {elapsedSeconds > 0 && !isCompleted && (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[11px] tabular-nums transition-colors ${
                isOvertime
                  ? 'bg-tag-importantBg text-tag-important border border-tag-important/30 animate-pulse font-bold'
                  : isThisTaskRunning
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'bg-card-subtle text-mutedText border border-borderToken/50'
              }`}
              title={isOvertime ? `Overtime limit exceeded (+${Math.floor((elapsedSeconds - estimatedSeconds)/60)}m)` : undefined}
            >
              <Clock size={10} className={isOvertime ? 'text-tag-important' : isThisTaskRunning ? 'text-primary' : 'text-mutedText'} />
              <span>{formatTimer(elapsedSeconds)}</span>
            </span>
          )}

          {/* Play/Pause Button */}
          {!isCompleted ? (
            <button
              type="button"
              onClick={() => toggleFocusTask(task.id)}
              className="p-1 transition-transform hover:scale-120 active:scale-90 cursor-pointer text-mutedText hover:text-primary"
              title={isThisTaskRunning ? 'Pause timer' : 'Start focus timer'}
            >
              {isThisTaskRunning ? (
                <Pause size={14} className="text-primary fill-primary animate-pulse" />
              ) : (
                <Play size={14} fill="currentColor" className="text-mutedText hover:text-primary" />
              )}
            </button>
          ) : (
            <div className="p-1 text-tag-health opacity-60">
              <Check size={14} strokeWidth={2.5} />
            </div>
          )}

          {/* More options menu */}
          <div className="relative" ref={activeMenuId === task.id ? menuContainerRef : null}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === task.id ? null : task.id);
              }}
              className="p-1 rounded-lg text-mutedText hover:text-foreground hover:bg-card transition-colors cursor-pointer"
            >
              <MoreHorizontal size={15} />
            </button>

            {activeMenuId === task.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 w-44 bg-card rounded-2xl shadow-float py-1.5 z-50 border border-borderToken animate-popup-enter"
              >
                <button
                  type="button"
                  onClick={() => {
                    openTaskModal(task);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>Edit task</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    moveTaskToTomorrow(task.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                >
                  <FastForward size={13} />
                  <span>Move to tomorrow</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    moveTaskLater(task.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                >
                  <Clock size={13} />
                  <span>Move later today</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    skipTask(task.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-tag-learning hover:bg-tag-learningBg transition-colors cursor-pointer"
                >
                  <ArrowRight size={13} />
                  <span>Skip task</span>
                </button>
                {elapsedSeconds > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      resetTaskTimer(task.id);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset timer</span>
                  </button>
                )}
                <div className="my-1 border-t border-borderToken" />
                <button
                  type="button"
                  onClick={() => {
                    deleteTask(task.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-tag-important hover:bg-tag-importantBg transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in select-none max-w-[1600px] mx-auto">
      {/* 1. TOP PAGE TITLE CARD */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <DoodleTasks size={58} className="flex-shrink-0" />
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
              My Tasks
            </h2>
            <p className="text-[13px] text-mutedText mt-0.5">
              Turn your intentions into progress. One step at a time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-3.5 h-[38px] rounded-2xl bg-card-subtle border border-borderToken w-[190px] sm:w-[250px]">
            <Search size={14} className="text-mutedText flex-shrink-0" />
            <input
              type="text"
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-transparent text-[13px] text-foreground placeholder-mutedText outline-none"
            />
            {taskSearchQuery && (
              <button
                type="button"
                onClick={() => setTaskSearchQuery('')}
                className="text-mutedText hover:text-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Primary New Task Button */}
          <button
            type="button"
            onClick={() => openTaskModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-2xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-4 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: Calendar Strip, Filters Bar (Same Width), & Tasks List
            ========================================================================= */}
        <div className="space-y-3.5 min-w-0">
          {/* Card 1: 7-Day Week Calendar Strip Card */}
          <div className="bg-card rounded-[22px] p-3.5 sm:p-4 shadow-soft transition-all duration-300">
            <div className="flex items-center justify-between pb-2 mb-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  className="p-1 rounded-full text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-[14.5px] font-serif font-semibold text-foreground px-0.5">
                  {new Date(activeDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="p-1 rounded-full text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleJumpToday}
                  className={`ml-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    activeDate === todayStr
                      ? 'bg-primary-soft text-primary'
                      : 'bg-card-subtle text-mutedText hover:text-foreground'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>

            {/* 7-Day Interactive Row (Compact Borderless Square Cards) */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mt-1.5">
              {weekDays.map((day) => {
                const dayTasks = tasks.filter(t => t.scheduledDate === day.iso || (day.iso === todayStr && !t.scheduledDate));
                const hasPending = dayTasks.some(t => t.status !== 'completed' && t.status !== 'skipped');
                const hasCompleted = dayTasks.some(t => t.status === 'completed');

                return (
                  <button
                    key={day.iso}
                    type="button"
                    data-no-rounded-full="true"
                    onClick={() => {
                      playClickSound();
                      setSelectedDate(day.iso);
                    }}
                    className={`flex flex-col items-center justify-between py-2 px-1 rounded-[14px] cursor-pointer transition-all duration-150 w-full max-w-[54px] h-[52px] mx-auto border-0 ${
                      day.isSelected
                        ? 'bg-primary text-white shadow-none'
                        : 'bg-card-subtle hover:bg-card-muted/80 text-foreground'
                    }`}
                  >
                    <span className={`text-[10.5px] font-sans leading-none ${day.isSelected ? 'text-white/80 font-medium' : 'text-mutedText'}`}>
                      {day.dayLabel}
                    </span>
                    
                    <span className={`text-[13.5px] font-sans font-bold leading-none ${
                      day.isSelected
                        ? 'text-white'
                        : day.isToday
                          ? 'text-primary'
                          : 'text-foreground'
                    }`}>
                      {day.dayNum}
                    </span>

                    <div className="h-1 flex items-center justify-center gap-0.5">
                      {hasPending && (
                        <span className={`w-1 h-1 rounded-full ${day.isSelected ? 'bg-white/80' : 'bg-[#F97316]'}`} />
                      )}
                      {hasCompleted && (
                        <span className={`w-1 h-1 rounded-full ${day.isSelected ? 'bg-white' : 'bg-tag-health'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Filters Bar Card (SAME WIDTH AS TASKS) */}
          <div className="bg-card rounded-[24px] p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-soft transition-all duration-300">
            {/* Left: View Tabs Segment */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('all');
                  setSelectedDate(todayStr);
                }}
                className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'all' && !isSpecificDateSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-mutedText hover:text-foreground hover:bg-card-subtle'
                }`}
              >
                All Tasks
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('today');
                  setSelectedDate(todayStr);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'today' && !isSpecificDateSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-mutedText hover:text-foreground hover:bg-card-subtle'
                }`}
              >
                <span>Today</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${
                  activeTab === 'today' && !isSpecificDateSelected ? 'bg-white/25 text-white' : 'bg-card-subtle text-mutedText'
                }`}>
                  {sectionTodayTasks.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('upcoming');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'upcoming'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-mutedText hover:text-foreground hover:bg-card-subtle'
                }`}
              >
                <span>Upcoming</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${
                  activeTab === 'upcoming' ? 'bg-white/25 text-white' : 'bg-card-subtle text-mutedText'
                }`}>
                  {sectionUpcomingTasks.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('backlog');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'backlog'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-mutedText hover:text-foreground hover:bg-card-subtle'
                }`}
              >
                <span>Backlog</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-bold ${
                  activeTab === 'backlog' ? 'bg-white/25 text-white' : 'bg-card-subtle text-mutedText'
                }`}>
                  {sectionLaterTasks.length}
                </span>
              </button>
            </div>

            {/* Right: Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              <CustomSelect
                value={taskCategoryFilter}
                onChange={(val) => setTaskCategoryFilter(val)}
                className="w-34"
                options={[
                  { value: 'All', label: 'All Categories' },
                  ...Object.keys(categoryData).map(k => ({ value: k, label: k }))
                ]}
              />

              <CustomSelect
                value={taskPriorityFilter}
                onChange={(val) => setTaskPriorityFilter(val)}
                className="w-32"
                options={[
                  { value: 'All', label: 'All Priorities' },
                  ...Object.entries(priorityData).map(([k, v]) => ({ value: k, label: v.label }))
                ]}
              />

              <CustomSelect
                value={taskStatusFilter}
                onChange={(val) => setTaskStatusFilter(val)}
                className="w-30"
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
            </div>
          </div>

          {/* Card 3: Enhanced Rollover Card (if any) */}
          {pastUnfinishedTasks.length > 0 && !isSpecificDateSelected && (
            <div className="bg-card rounded-[26px] p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E5484D]/12 text-[#E5484D] flex items-center justify-center flex-shrink-0">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-semibold text-foreground font-serif">
                    Unfinished Outcomes From Previous Days
                  </h4>
                  <p className="text-[12px] text-mutedText mt-0.5">
                    You have <span className="font-semibold text-foreground">{pastUnfinishedTasks.length} pending outcome{pastUnfinishedTasks.length > 1 ? 's' : ''}</span> that can be carried over.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRollAllToToday}
                className="flex items-center justify-center gap-2 px-4 h-[38px] rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-xs flex-shrink-0"
              >
                <RotateCcw size={14} />
                <span>Roll Over to Today</span>
              </button>
            </div>
          )}

          {/* Card 4: Tasks List Container */}
          {isSpecificDateSelected ? (
            <div className="bg-card rounded-[28px] p-5 shadow-soft transition-all duration-300">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-borderToken">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-serif font-semibold text-foreground">
                    Outcomes for {new Date(activeDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold">
                    {dateFilteredTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleJumpToday}
                  className="text-xs text-primary hover:underline cursor-pointer font-medium"
                >
                  Back to Today
                </button>
              </div>

              {dateFilteredTasks.length === 0 ? (
                <div className="py-8 text-center text-mutedText text-xs">
                  No outcomes scheduled for this date.
                </div>
              ) : (
                <div className="divide-y divide-borderToken">
                  {dateFilteredTasks.map((task, idx) => renderTaskRow(task, idx))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* SECTION 1: TODAY */}
              {(activeTab === 'all' || activeTab === 'today') && (
                <div className="bg-card rounded-[28px] p-4 sm:p-5 shadow-soft transition-all duration-300">
                  <div
                    onClick={() => toggleSectionCollapse('today')}
                    className="flex items-center justify-between pb-3 mb-1 border-b border-borderToken cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="transition-transform duration-300">
                        {collapsedSections.today ? <ChevronRight size={16} className="text-mutedText" /> : <ChevronDown size={16} className="text-mutedText" />}
                      </div>
                      <h3 className="text-[17px] font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                        Today
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold">
                        {sectionTodayTasks.length}
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-mutedText font-mono">
                      {calculateTotalMinutes(sectionTodayTasks)}
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsedSections.today ? 'overflow-hidden' : 'overflow-visible'}`}
                    style={{
                      maxHeight: collapsedSections.today ? '0px' : '2000px',
                      opacity: collapsedSections.today ? 0 : 1,
                    }}
                  >
                    <div className="divide-y divide-borderToken mt-1">
                      {sectionTodayTasks.length === 0 ? (
                        <div className="py-6 text-center text-mutedText text-xs">
                          No outcomes for today. Click "+ New Task" to create one.
                        </div>
                      ) : (
                        sectionTodayTasks.map((task, idx) => renderTaskRow(task, idx))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: UPCOMING */}
              {(activeTab === 'all' || activeTab === 'upcoming') && (
                <div className="bg-card rounded-[28px] p-4 sm:p-5 shadow-soft transition-all duration-300">
                  <div
                    onClick={() => toggleSectionCollapse('upcoming')}
                    className="flex items-center justify-between pb-3 mb-1 border-b border-borderToken cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="transition-transform duration-300">
                        {collapsedSections.upcoming ? <ChevronRight size={16} className="text-mutedText" /> : <ChevronDown size={16} className="text-mutedText" />}
                      </div>
                      <h3 className="text-[17px] font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                        Upcoming
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold">
                        {sectionUpcomingTasks.length}
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-mutedText font-mono">
                      {calculateTotalMinutes(sectionUpcomingTasks)}
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsedSections.upcoming ? 'overflow-hidden' : 'overflow-visible'}`}
                    style={{
                      maxHeight: collapsedSections.upcoming ? '0px' : '2000px',
                      opacity: collapsedSections.upcoming ? 0 : 1,
                    }}
                  >
                    <div className="divide-y divide-borderToken mt-1">
                      {sectionUpcomingTasks.length === 0 ? (
                        <div className="py-6 text-center text-mutedText text-xs">
                          No upcoming outcomes scheduled for this week.
                        </div>
                      ) : (
                        sectionUpcomingTasks.map((task, idx) => renderTaskRow(task, idx))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: LATER / BACKLOG */}
              {(activeTab === 'all' || activeTab === 'backlog') && (
                <div className="bg-card rounded-[28px] p-4 sm:p-5 shadow-soft transition-all duration-300">
                  <div
                    onClick={() => toggleSectionCollapse('later')}
                    className="flex items-center justify-between pb-3 mb-1 border-b border-borderToken cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="transition-transform duration-300">
                        {collapsedSections.later ? <ChevronRight size={16} className="text-mutedText" /> : <ChevronDown size={16} className="text-mutedText" />}
                      </div>
                      <h3 className="text-[17px] font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                        Later & Backlog
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold">
                        {sectionLaterTasks.length}
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-mutedText font-mono">
                      {calculateTotalMinutes(sectionLaterTasks)}
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsedSections.later ? 'overflow-hidden' : 'overflow-visible'}`}
                    style={{
                      maxHeight: collapsedSections.later ? '0px' : '2000px',
                      opacity: collapsedSections.later ? 0 : 1,
                    }}
                  >
                    <div className="divide-y divide-borderToken mt-1">
                      {sectionLaterTasks.length === 0 ? (
                        <div className="py-6 text-center text-mutedText text-xs">
                          No outcomes in later backlog.
                        </div>
                      ) : (
                        sectionLaterTasks.map((task, idx) => renderTaskRow(task, idx))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Today's Progress (Full), Focus Time (Half) + Streak (Half), Categories & Priorities
            ========================================================================= */}
        <div className="space-y-3.5 min-w-0">
          {/* Card 1: Today's Progress (Full Width of Right Column) */}
          <div className="bg-card rounded-[22px] p-4 shadow-soft transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-[14px] font-serif font-semibold text-foreground">Today's Progress</h3>
              <button
                type="button"
                onClick={() => openTaskModal()}
                className="p-1 rounded-full text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                title="Task settings / quick add"
              >
                <Settings size={13} />
              </button>
            </div>

            {/* Donut and Progress Stats Row */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                {/* Radial Donut Ring (Fixed 52px diameter) */}
                <div className="relative w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center">
                  <svg className="w-[52px] h-[52px] -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="14" fill="var(--color-card-subtle)" />
                    <circle cx="22" cy="22" r="17" fill="none" stroke="var(--color-card-muted)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="17"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="3.5"
                      strokeDasharray={2 * Math.PI * 17}
                      strokeDashoffset={2 * Math.PI * 17 * (1 - Math.min(1, Math.max(0, completionPercentage / 100)))}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  {completionPercentage === 100 && activeDateTotalCount > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center animate-popup-enter">
                      <div className="w-[34px] h-[34px] bg-tag-health rounded-full flex items-center justify-center shadow-md animate-check-pop">
                         <Check size={20} strokeWidth={3} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Fractions and Subtitle */}
                <div>
                  <div className="text-[18px] font-heading font-bold text-foreground leading-tight tracking-tight">
                    {activeDateCompletedCount} of {activeDateTotalCount}
                  </div>
                  <p className="text-[11.5px] text-mutedText font-medium mt-0.5">tasks done</p>
                </div>
              </div>

              {/* Bold Green Percentage */}
              <div className="text-[18px] font-heading font-bold text-primary tracking-tight">
                {completionPercentage}%
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="w-full bg-card-subtle rounded-full h-1.5 overflow-hidden mt-2">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Card 2: Split Row (Focus Time Half + Current Streak Half) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left Half: Focus Time Card */}
            <div className="bg-card rounded-[20px] p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 min-h-[108px] relative group shadow-soft">
              <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                <Clock size={13} strokeWidth={2.2} />
              </div>

              <div className="flex items-end justify-between mt-1.5">
                <div>
                  <div className="text-[16.5px] font-heading font-bold text-foreground tracking-tight leading-none">
                    {formattedFocus.displayString}
                  </div>
                  <p className="text-[10.5px] text-mutedText font-medium mt-1">Focus time</p>
                </div>

                <div className="flex items-end gap-0.5 h-5 flex-shrink-0 mb-0.5">
                  {[20, 32, 45, 60, 75, 88, 100].map((hPct, idx) => {
                    const d = weekDays[idx];
                    const isHovered = hoveredBarIndex === idx;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        className="relative flex flex-col items-center justify-end h-full cursor-pointer"
                      >
                        {isHovered && d && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card border border-borderToken px-2 py-0.5 rounded-lg text-[9.5px] z-50 whitespace-nowrap animate-fade-in pointer-events-none shadow-xs">
                            <span className="font-semibold text-foreground">{d.focusMinutes}m</span>
                          </div>
                        )}
                        <div
                          className={`w-1 rounded-t-[1.5px] transition-all duration-200 ${
                            idx === 6 || isHovered
                              ? 'bg-primary'
                              : 'bg-primary/35 hover:bg-primary/60'
                          }`}
                          style={{ height: `${hPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Half: Current Streak Card */}
            <div className="bg-card rounded-[20px] p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 min-h-[108px] shadow-soft">
              <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Flame size={13} strokeWidth={2.2} />
              </div>

              <div className="flex items-end justify-between mt-1.5">
                <div>
                  <div className="text-[16.5px] font-heading font-bold text-foreground tracking-tight leading-none">
                    {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                  </div>
                  <p className="text-[10.5px] text-mutedText font-medium mt-1">Current streak</p>
                </div>

                <div className="w-14 h-5 flex-shrink-0 mb-0.5">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="streakAreaGradSidebar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary, #24584C)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--color-primary, #24584C)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 30 C 20 28, 35 25, 48 20 C 62 14, 75 7, 85 4 C 92 1.5, 96 4, 100 3 L 100 35 L 0 35 Z"
                      fill="url(#streakAreaGradSidebar)"
                    />
                    <path
                      d="M 0 30 C 20 28, 35 25, 48 20 C 62 14, 75 7, 85 4 C 92 1.5, 96 4, 100 3"
                      fill="none"
                      stroke="var(--color-primary, #24584C)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 1: Task Categories (With Color Picker & Icons) */}
          <div className="bg-card rounded-[22px] p-3.5 sm:p-4 shadow-soft transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[13px] font-semibold text-foreground font-serif">Task Categories</h4>
              <div className="flex items-center gap-1.5">
                {taskCategoryFilter !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setTaskCategoryFilter('All')}
                    className="text-[11px] text-primary hover:underline cursor-pointer font-medium mr-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setNewCatName('');
                    setNewCatColorHex('#24584C');
                    setNewCatIcon('Sparkles');
                    setIsAddingCategory(!isAddingCategory);
                  }}
                  className="w-6 h-6 rounded-lg bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-borderToken"
                  title="Add new category"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Inline Add Category Form with Color & Custom Hex Picker */}
            <div
              className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                maxHeight: isAddingCategory ? '450px' : '0px',
                opacity: isAddingCategory ? 1 : 0,
              }}
            >
              <form onSubmit={handleCreateCategory} className="mb-3 p-3.5 rounded-2xl bg-card-subtle border border-borderToken space-y-3">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name (e.g. Design)"
                  className="w-full h-8 px-3 rounded-xl bg-card border border-borderToken text-[12.5px] text-foreground focus:outline-none focus:border-primary"
                  autoFocus
                />

                {/* Category Color Picker (Presets + Custom Color Input) */}
                <div>
                  <div className="flex items-center justify-between text-[10.5px] font-medium text-mutedText mb-1.5">
                    <span>Category Color:</span>
                    <label className="flex items-center gap-1 cursor-pointer text-primary hover:underline">
                      <Palette size={11} />
                      <span>Custom Color</span>
                      <input
                        type="color"
                        value={newCatColorHex}
                        onChange={(e) => setNewCatColorHex(e.target.value)}
                        className="w-4 h-4 opacity-0 absolute pointer-events-none"
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap p-1.5 bg-card rounded-xl border border-borderToken">
                    {PRESET_CATEGORY_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setNewCatColorHex(c.hex)}
                        className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                          newCatColorHex === c.hex ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                    {/* Custom chosen preview */}
                    <div
                      className="w-5 h-5 rounded-full border border-borderToken relative overflow-hidden"
                      style={{ backgroundColor: newCatColorHex }}
                      title="Selected Color"
                    />
                  </div>
                </div>

                {/* Icon Grid Picker */}
                <div>
                  <span className="text-[10.5px] font-medium text-mutedText block mb-1">Select Icon:</span>
                  <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto [scrollbar-width:none] p-1 bg-card rounded-xl border border-borderToken">
                    {AVAILABLE_ICONS.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setNewCatIcon(item.name)}
                          className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                            newCatIcon === item.name ? 'bg-primary text-white shadow-xs' : 'hover:bg-card-subtle text-mutedText'
                          }`}
                        >
                          <IconComp size={14} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-2.5 py-1 rounded-lg text-xs text-mutedText hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs cursor-pointer"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-1.5">
              {Object.entries(categoryData).map(([catKey, data]) => {
                const isFiltered = taskCategoryFilter === catKey;
                const hasCustomColor = !!data.customHex;

                return (
                  <div
                    key={catKey}
                    onClick={() => {
                      playClickSound();
                      setTaskCategoryFilter(isFiltered ? 'All' : catKey);
                    }}
                    className={`group/cat flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isFiltered
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'hover:bg-card-subtle text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${data.colorClass}`}
                        style={hasCustomColor ? { backgroundColor: `${data.customHex}1f`, color: data.customHex } : undefined}
                      >
                        {data.icon}
                      </div>
                      <span className="text-[12.5px] font-medium truncate">{data.label}</span>
                    </div>
                    <div className="flex items-center justify-end min-w-[24px]">
                      <span className="text-[11.5px] font-mono text-mutedText font-semibold transition-all duration-300">
                        {data.count}
                      </span>
                      <div className="flex items-center overflow-hidden max-w-0 opacity-0 group-hover/cat:max-w-[60px] group-hover/cat:opacity-100 transition-all duration-300 ease-out pl-0 group-hover/cat:pl-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategoryId(catKey);
                            setNewCatName(data.label);
                            setNewCatColorHex(data.customHex || PRESET_CATEGORY_COLORS.find(c => c.badgeClass === data.colorClass)?.hex || '#24584C');
                            setNewCatIcon(data.iconName || 'Sparkles');
                            setIsAddingCategory(true);
                          }}
                          title={`Edit ${data.label}`}
                          className="p-1 text-mutedText hover:text-primary transition-opacity cursor-pointer rounded-lg hover:bg-card-subtle"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(catKey);
                          }}
                          title={`Delete ${data.label} category`}
                          className="p-1 text-mutedText hover:text-tag-important transition-opacity cursor-pointer rounded-lg hover:bg-tag-importantBg"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 2: Task Priorities (With + Add button & Color Picker) */}
          <div className="bg-card rounded-[22px] p-3.5 sm:p-4 shadow-soft transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[13px] font-semibold text-foreground font-serif">Task Priorities</h4>
              <div className="flex items-center gap-1.5">
                {taskPriorityFilter !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setTaskPriorityFilter('All')}
                    className="text-[11px] text-primary hover:underline cursor-pointer font-medium mr-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingPriorityId(null);
                    setNewPrioName('');
                    setNewPrioDotColor('bg-[#E5484D]');
                    setIsAddingPriority(!isAddingPriority);
                  }}
                  className="w-6 h-6 rounded-lg bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-borderToken"
                  title="Add new priority tag"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Inline Add Priority Form with Smooth Transition */}
            <div
              className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                maxHeight: isAddingPriority ? '300px' : '0px',
                opacity: isAddingPriority ? 1 : 0,
              }}
            >
              <form onSubmit={handleCreatePriority} className="mb-3 p-3.5 rounded-2xl bg-card-subtle border border-borderToken space-y-3">
                <input
                  type="text"
                  value={newPrioName}
                  onChange={(e) => setNewPrioName(e.target.value)}
                  placeholder="Priority name (e.g. Critical)"
                  className="w-full h-8 px-3 rounded-xl bg-card border border-borderToken text-[12.5px] text-foreground focus:outline-none focus:border-primary"
                  autoFocus
                />

                {/* Dot Color Picker */}
                <div>
                  <span className="text-[10.5px] font-medium text-mutedText block mb-1">Select Dot Color:</span>
                  <div className="flex items-center gap-1.5 p-1.5 bg-card rounded-xl border border-borderToken overflow-x-auto [scrollbar-width:none]">
                    {PRESET_PRIORITY_DOTS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setNewPrioDotColor(item.dotColor)}
                        className={`w-5 h-5 rounded-full ${item.dotColor} flex-shrink-0 transition-transform ${
                          newPrioDotColor === item.dotColor ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPriority(false)}
                    className="px-2.5 py-1 rounded-lg text-xs text-mutedText hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs cursor-pointer"
                  >
                    Add Priority
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-1.5">
              {Object.entries(priorityData).map(([prioKey, data]) => {
                const isFiltered = taskPriorityFilter === prioKey;
                const isCustom = !['important', 'regular', 'flexible', 'optional'].includes(prioKey.toLowerCase());
                return (
                  <div
                    key={prioKey}
                    onClick={() => {
                      playClickSound();
                      setTaskPriorityFilter(isFiltered ? 'All' : (prioKey as any));
                    }}
                    className={`group/prio flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isFiltered
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'hover:bg-card-subtle text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${data.dotColor} flex-shrink-0`} />
                      <span className="text-[12.5px] font-medium truncate">{data.label}</span>
                    </div>
                    <div className="flex items-center justify-end min-w-[24px]">
                      <span className="text-[11.5px] font-mono text-mutedText font-semibold transition-all duration-300">
                        {data.count}
                      </span>
                      <div className="flex items-center overflow-hidden max-w-0 opacity-0 group-hover/prio:max-w-[60px] group-hover/prio:opacity-100 transition-all duration-300 ease-out pl-0 group-hover/prio:pl-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPriorityId(prioKey);
                            setNewPrioName(data.label);
                            setNewPrioDotColor(data.dotColor);
                            setIsAddingPriority(true);
                          }}
                          title={`Edit ${data.label} priority`}
                          className="p-1 text-mutedText hover:text-primary transition-opacity cursor-pointer rounded-lg hover:bg-card-subtle"
                        >
                          <Edit2 size={12} />
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomPriority(prioKey);
                            }}
                            title={`Delete ${data.label} priority`}
                            className="p-1 text-mutedText hover:text-tag-important transition-opacity cursor-pointer rounded-lg hover:bg-tag-importantBg"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
