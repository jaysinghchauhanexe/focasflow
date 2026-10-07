import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Task, Category, Priority, CustomCategoryItem, CustomPriorityItem } from '../types';
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
  Palette
} from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { CustomSelect } from '../components/CustomSelect';
import { playClickSound } from '../utils/soundEffects';
import { getDailyFocusSeconds, getWeeklyFocusData, calculateRealStreak, formatFocusTime } from '../utils/metrics';

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
    addCustomPriority,
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

  // Hover state for Focus Graph Tooltip
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
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
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    playClickSound();
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleJumpToday = () => {
    playClickSound();
    setSelectedDate(todayStr);
  };

  // Metric 1: Tasks Done / Completion Rate for Active Date
  const todayTasksList = useMemo(() => {
    return tasks.filter((t) => t.scheduledDate === todayStr || (!t.scheduledDate && t.status !== 'completed'));
  }, [tasks, todayStr]);

  const todayCompletedCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed' && (t.scheduledDate === todayStr || !t.scheduledDate)).length;
  }, [tasks, todayStr]);

  const todayTotalCount = todayTasksList.length || 1;
  const completionPercentage = Math.round((todayCompletedCount / todayTotalCount) * 100);

  // Metric 2: Accurate Focus Time Logged for Today
  const todayFocusSec = useMemo(() => {
    return getDailyFocusSeconds(
      todayStr,
      tasks,
      taskElapsedSeconds,
      activeFocusTaskId,
      focusElapsedSeconds,
      isFocusTimerRunning
    );
  }, [todayStr, tasks, taskElapsedSeconds, activeFocusTaskId, focusElapsedSeconds, isFocusTimerRunning]);

  const formattedFocus = formatFocusTime(todayFocusSec);

  // Metric 3: Real Streak Calculation (Unified Centralized Engine)
  const { currentStreak, sparklinePoints } = useMemo(() => {
    return calculateRealStreak(tasks, habits, history);
  }, [tasks, habits, history]);

  // Filter tasks based on global criteria
  const applyFilter = (taskList: Task[]) => {
    return taskList.filter((t) => {
      if (taskSearchQuery && !t.title.toLowerCase().includes(taskSearchQuery.toLowerCase())) return false;
      if (taskCategoryFilter !== 'All' && t.category !== taskCategoryFilter) return false;
      if (taskPriorityFilter !== 'All' && taskPriorityFilter !== 'all') {
        if (taskPriorityFilter === 'important') {
          if (t.priority !== 'critical' && t.priority !== 'important') return false;
        } else if (taskPriorityFilter === 'flexible') {
          if (t.priority !== 'flexible') return false;
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
    const tomorrow = new Date(todayStr);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date(todayStr);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return applyFilter(
      tasks.filter((t) => t.scheduledDate && t.scheduledDate >= tomStr && t.scheduledDate <= nextWeekStr && t.status !== 'completed')
    );
  }, [tasks, todayStr, taskSearchQuery, taskCategoryFilter, taskPriorityFilter, taskStatusFilter]);

  const sectionLaterTasks = useMemo(() => {
    const nextWeek = new Date(todayStr);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

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

  const getCategoryClass = (cat: string) => {
    switch (cat) {
      case 'Health': return 'badge-health';
      case 'Work': return 'badge-work';
      case 'Personal': return 'badge-personal';
      case 'Learning': return 'badge-learning';
      default: return 'badge-neutral';
    }
  };

  // Dots are strictly reserved for priority levels
  const getPriorityDot = (t: Task) => {
    if (t.status === 'completed') return 'bg-tag-health';
    if (t.priority === 'critical' || t.priority === 'important') return 'bg-[#E5484D]';
    if (t.priority === 'flexible') return 'bg-[#D97706]';
    if (t.priority === 'optional') return 'bg-[#64748B]';
    return 'bg-[#6366F1]';
  };

  // Category counts & Icons breakdown (Icons instead of dots)
  const categoryData = useMemo(() => {
    const map: Record<string, { label: string; count: number; icon: React.ReactNode; colorClass: string; customHex?: string }> = {
      Work: {
        label: 'Work',
        count: 0,
        icon: <Briefcase size={13} className="text-tag-work" />,
        colorClass: 'badge-work',
      },
      Personal: {
        label: 'Personal',
        count: 0,
        icon: <User size={13} className="text-tag-personal" />,
        colorClass: 'badge-personal',
      },
      Health: {
        label: 'Health',
        count: 0,
        icon: <Heart size={13} className="text-tag-health" />,
        colorClass: 'badge-health',
      },
      Learning: {
        label: 'Learning',
        count: 0,
        icon: <BookOpen size={13} className="text-tag-learning" />,
        colorClass: 'badge-learning',
      },
      Neutral: {
        label: 'Neutral',
        count: 0,
        icon: <Layers size={13} className="text-tag-neutral" />,
        colorClass: 'badge-neutral',
      },
    };

    if (settings.customCategories) {
      settings.customCategories.forEach((cc) => {
        const IconComponent = AVAILABLE_ICONS.find(i => i.name === cc.iconName)?.icon || Sparkles;
        const hex = cc.colorClass?.startsWith('#') ? cc.colorClass : undefined;
        map[cc.label] = {
          label: cc.label,
          count: 0,
          icon: <IconComponent size={13} style={hex ? { color: hex } : undefined} className={!hex ? "text-primary" : undefined} />,
          colorClass: cc.colorClass || 'badge-work',
          customHex: hex,
        };
      });
    }

    tasks.forEach((t) => {
      const cat = t.category || 'Work';
      if (map[cat]) {
        map[cat].count++;
      } else {
        map.Work.count++;
      }
    });

    return map;
  }, [tasks, settings.customCategories]);

  // Priorities counts & Colored Dots breakdown (Dots only for priority level)
  const priorityData = useMemo(() => {
    const map: Record<string, { label: string; count: number; dotColor: string }> = {
      important: { label: 'Important', count: 0, dotColor: 'bg-[#E5484D]' },
      flexible: { label: 'Flexible', count: 0, dotColor: 'bg-[#D97706]' },
      optional: { label: 'Optional', count: 0, dotColor: 'bg-[#64748B]' },
    };

    if (settings.customPriorities) {
      settings.customPriorities.forEach((cp) => {
        map[cp.id] = {
          label: cp.label,
          count: 0,
          dotColor: cp.dotColor,
        };
      });
    }

    tasks.forEach((t) => {
      if (t.priority === 'critical' || t.priority === 'important') {
        map.important.count++;
      } else if (t.priority === 'flexible') {
        map.flexible.count++;
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
    addCustomCategory({
      id: `cat-${Date.now()}`,
      label: newCatName.trim(),
      iconName: newCatIcon,
      colorClass: newCatColorHex,
    });
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleCreatePriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrioName.trim()) return;
    const prioKey = newPrioName.trim().toLowerCase().replace(/\s+/g, '-');
    addCustomPriority({
      id: prioKey,
      label: newPrioName.trim(),
      dotColor: newPrioDotColor,
    });
    setNewPrioName('');
    setIsAddingPriority(false);
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
            onClick={() => toggleTaskStatus(task.id)}
            className={`w-[20px] h-[20px] rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-75 hover:scale-110 flex-shrink-0 ${
              isCompleted
                ? 'bg-tag-health text-white shadow-xs'
                : 'border border-borderToken hover:border-primary bg-card'
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
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
              isCompleted ? 'opacity-50' : ''
            } ${getCategoryClass(task.category)}`}
          >
            {task.category}
          </span>

          {/* Date Badge if upcoming/different date */}
          {task.scheduledDate && task.scheduledDate !== todayStr && (
            <span className="text-[11.5px] font-normal text-mutedText font-sans hidden sm:inline-block">
              {task.scheduledDate === (() => { const d = new Date(todayStr); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()
                ? 'Tomorrow'
                : new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                className="absolute right-0 top-7 w-44 bg-card rounded-2xl shadow-float py-1.5 z-50 border border-borderToken animate-fade-in"
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
    <div className="space-y-5 animate-fade-in pb-12 sm:pb-16 select-none max-w-[1600px] mx-auto">
      {/* 1. TOP PAGE TITLE CARD */}
      <div className="bg-card rounded-[28px] p-5 sm:p-6 shadow-soft flex flex-wrap items-center justify-between gap-4 transition-all duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground tracking-tight">
            My Tasks
          </h1>
          <p className="text-[13px] sm:text-[14px] text-mutedText mt-0.5">
            Turn your intentions into progress. One step at a time.
          </p>
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

          {/* Filter Reset / Toggle Icon */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              if (taskCategoryFilter !== 'All' || taskPriorityFilter !== 'All' || taskStatusFilter !== 'All') {
                setTaskCategoryFilter('All');
                setTaskPriorityFilter('All');
                setTaskStatusFilter('All');
              }
            }}
            title={taskCategoryFilter !== 'All' || taskPriorityFilter !== 'All' || taskStatusFilter !== 'All' ? "Reset filters" : "Filters"}
            className={`h-[38px] px-3 rounded-2xl border border-borderToken flex items-center justify-center transition-colors cursor-pointer ${
              taskCategoryFilter !== 'All' || taskPriorityFilter !== 'All' || taskStatusFilter !== 'All'
                ? 'bg-primary-soft text-primary border-primary'
                : 'bg-card-subtle text-mutedText hover:text-foreground hover:bg-card-muted'
            }`}
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* Master + New Task Button */}
          <button
            type="button"
            onClick={() => openTaskModal()}
            className="flex items-center gap-1.5 px-4 h-[38px] rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-[13px] font-semibold transition-all shadow-xs cursor-pointer flex-shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Card 1: 7-Day Week Calendar Strip (6 Cols) */}
        <div className="lg:col-span-6 bg-card rounded-[26px] p-4 shadow-soft flex flex-col justify-between transition-all duration-300">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-borderToken">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-serif font-semibold text-foreground">
                {new Date(activeDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  className="p-1 rounded-lg text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="p-1 rounded-lg text-mutedText hover:text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleJumpToday}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                activeDate === todayStr
                  ? 'bg-primary-soft text-primary'
                  : 'bg-primary text-white shadow-xs hover:bg-primary-hover'
              }`}
            >
              Today
            </button>
          </div>

          {/* 7-Day Interactive Row (Audible Click Feedback) */}
          <div className="grid grid-cols-7 gap-1 text-center mt-1">
            {weekDays.map((day) => {
              const dayTasks = tasks.filter(t => t.scheduledDate === day.iso || (day.iso === todayStr && !t.scheduledDate));
              const hasPending = dayTasks.some(t => t.status !== 'completed' && t.status !== 'skipped');
              const hasCompleted = dayTasks.some(t => t.status === 'completed');

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedDate(day.iso);
                  }}
                  className={`flex flex-col items-center py-1.5 rounded-2xl cursor-pointer transition-all border border-transparent ${
                    day.isSelected ? 'bg-primary-soft/60 border-primary/20' : 'hover:bg-card-subtle'
                  }`}
                >
                  <span className={`text-[11px] font-sans ${day.isSelected ? 'font-bold text-primary' : 'text-mutedText'}`}>
                    {day.dayLabel}
                  </span>
                  <div
                    className={`w-8 h-8 mt-1 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all ${
                      day.isSelected
                        ? 'bg-primary text-white shadow-xs scale-105'
                        : day.isToday
                          ? 'border border-primary text-primary font-bold'
                          : 'text-foreground'
                    }`}
                  >
                    {day.dayNum}
                  </div>
                  <div className="h-1.5 flex items-center gap-0.5 mt-1">
                    {hasPending && <span className="w-1 h-1 rounded-full bg-[#F97316]" />}
                    {hasCompleted && <span className="w-1 h-1 rounded-full bg-tag-health" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Tasks Done Metric (2 Cols) */}
        <div className="lg:col-span-2 bg-card rounded-[26px] p-4 shadow-soft flex items-center justify-between gap-3 transition-all duration-300">
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-border, #E5E7EB)" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--color-primary, #24584C)"
                strokeWidth="3.5"
                strokeDasharray={`${completionPercentage} 100`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-foreground font-mono">{completionPercentage}%</span>
          </div>
          <div>
            <div className="text-[17px] font-serif font-semibold text-foreground leading-none">
              {todayCompletedCount} / {todayTotalCount}
            </div>
            <p className="text-[11px] text-mutedText mt-1">Tasks done</p>
          </div>
        </div>

        {/* Card 3: Focus Time Metric with Interactive Hover Graph Tooltip (2 Cols) */}
        <div className="lg:col-span-2 bg-card rounded-[26px] p-4 shadow-soft flex flex-col justify-between transition-all duration-300 relative group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <Clock size={13} />
            </div>
            <span className="text-[11px] font-medium text-mutedText">Focus time</span>
          </div>
          <div>
            <div className="text-[17px] font-serif font-semibold text-foreground leading-none mt-2">
              {formattedFocus.displayString}
            </div>

            {/* Interactive 7-Day Mini Bar Sparkline with Hover Tooltip */}
            <div className="relative flex items-end gap-1.5 h-4.5 mt-2.5 pt-1">
              {weekDays.map((d, idx) => {
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                  >
                    {/* Floating Detailed Metric Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card border border-borderToken shadow-float px-2.5 py-1.5 rounded-xl text-[11px] z-50 whitespace-nowrap animate-fade-in pointer-events-none">
                        <div className="font-semibold text-foreground">{d.fullDateLabel}</div>
                        <div className="text-primary font-mono font-medium">
                          {d.focusMinutes >= 60
                            ? `${Math.floor(d.focusMinutes / 60)}h ${d.focusMinutes % 60}m focus`
                            : `${d.focusMinutes}m focus`}
                        </div>
                        <div className="text-[10px] text-mutedText">
                          {d.tasksCompleted}/{d.tasksTotal} outcomes done
                        </div>
                      </div>
                    )}

                    <div
                      className={`w-full rounded-t transition-all duration-200 ${
                        isHovered
                          ? 'bg-primary scale-y-110 shadow-xs'
                          : d.isSelected
                            ? 'bg-primary'
                            : 'bg-primary-soft hover:bg-primary/70'
                      }`}
                      style={{ height: `${d.heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Current Real Streak Metric (2 Cols) */}
        <div className="lg:col-span-2 bg-card rounded-[26px] p-4 shadow-soft flex flex-col justify-between transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#F97316]/15 text-[#F97316] flex items-center justify-center">
              <Flame size={14} fill="currentColor" />
            </div>
            <span className="text-[11px] font-medium text-mutedText">Current streak</span>
          </div>
          <div>
            <div className="text-[17px] font-serif font-semibold text-foreground leading-none mt-2">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
            {/* Dynamic streak activity curve */}
            <svg className="w-full h-3.5 mt-2 overflow-visible" viewBox="0 0 100 20" fill="none">
              <polyline
                points={sparklinePoints}
                stroke="var(--color-primary, #24584C)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. TAB FILTER & DROPDOWNS BAR */}
      <div className="bg-card rounded-[24px] p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-soft transition-all duration-300">
        {/* Left: View Tabs Segment */}
        <div className="flex items-center bg-card-subtle p-1 rounded-2xl border border-borderToken">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('all');
              setSelectedDate(todayStr);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'all' && !isSpecificDateSelected
                ? 'bg-card text-foreground shadow-xs'
                : 'text-mutedText hover:text-foreground'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'today' && !isSpecificDateSelected
                ? 'bg-card text-foreground shadow-xs'
                : 'text-mutedText hover:text-foreground'
            }`}
          >
            <span>Today</span>
            <span className="w-4 h-4 rounded-full bg-primary-soft text-primary text-[10px] flex items-center justify-center font-bold">
              {sectionTodayTasks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('upcoming');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-mutedText hover:text-foreground'
            }`}
          >
            <span>Upcoming</span>
            <span className="w-4 h-4 rounded-full bg-primary-soft text-primary text-[10px] flex items-center justify-center font-bold">
              {sectionUpcomingTasks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTab('backlog');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'backlog'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-mutedText hover:text-foreground'
            }`}
          >
            <span>Backlog</span>
            <span className="w-4 h-4 rounded-full bg-primary-soft text-primary text-[10px] flex items-center justify-center font-bold">
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

      {/* 4. MAIN 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Grouped Collapsible Sections (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Enhanced Rollover Card */}
          {pastUnfinishedTasks.length > 0 && !isSpecificDateSelected && (
            <div className="bg-card rounded-[26px] p-4 sm:p-5 shadow-soft border border-borderToken flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
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

          {/* Specific Date Selected View */}
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
                    className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
                    className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
                    className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
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

        {/* Right Column: Categories & Priorities Widgets */}
        <div className="lg:col-span-4 space-y-4">
          {/* Widget 1: Task Categories (With Color Picker & Icons) */}
          <div className="bg-card rounded-[28px] p-5 shadow-soft transition-all duration-300">
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
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
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
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isFiltered
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'hover:bg-card-subtle text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${data.colorClass}`}
                        style={hasCustomColor ? { backgroundColor: `${data.customHex}1f`, color: data.customHex } : undefined}
                      >
                        {data.icon}
                      </div>
                      <span className="text-[12.5px] font-medium">{data.label}</span>
                    </div>
                    <span className="text-[11.5px] font-mono text-mutedText font-semibold">{data.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 2: Task Priorities (With + Add button & Color Picker) */}
          <div className="bg-card rounded-[28px] p-5 shadow-soft transition-all duration-300">
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
                  onClick={() => setIsAddingPriority(!isAddingPriority)}
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
                return (
                  <div
                    key={prioKey}
                    onClick={() => {
                      playClickSound();
                      setTaskPriorityFilter(isFiltered ? 'All' : (prioKey as any));
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isFiltered
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'hover:bg-card-subtle text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${data.dotColor} flex-shrink-0`} />
                      <span className="text-[12.5px] font-medium">{data.label}</span>
                    </div>
                    <span className="text-[11.5px] font-mono text-mutedText font-semibold">{data.count}</span>
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
