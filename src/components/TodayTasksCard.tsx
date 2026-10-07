import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Task, Category } from '../types';
import { Plus, Check, Play, Pause, MoreHorizontal, ArrowRight, Clock, Trash2, Edit2, FastForward } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { DoodleCup } from './DoodleIllustrations';
import { SmoothAutoHeight } from './SmoothAutoHeight';

export const TodayTasksCard: React.FC = () => {
  const {
    tasks,
    selectedDate,
    activeFilter,
    setActiveFilter,
    toggleTaskStatus,
    openTaskModal,
    deleteTask,
    moveTaskToTomorrow,
    moveTaskLater,
    skipTask,
    setCurrentTab,
    navigateToTasks,
    activeFocusTaskId,
    isFocusTimerRunning,
    focusElapsedSeconds,
    taskElapsedSeconds,
    toggleFocusTask,
    extendTaskDuration,
    settings,
  } = useAppStore();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeOvertimeMenuId, setActiveOvertimeMenuId] = useState<string | null>(null);
  const menuContainerRef = React.useRef<HTMLDivElement>(null);
  const overtimeContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeMenuId && !activeOvertimeMenuId) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
      if (overtimeContainerRef.current && !overtimeContainerRef.current.contains(e.target as Node)) {
        setActiveOvertimeMenuId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [activeMenuId, activeOvertimeMenuId]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const dayTasks = tasks.filter((t) => {
    if (t.scheduledDate === selectedDate) return true;
    if (t.status !== 'completed' && t.status !== 'skipped') return true;
    if (t.status === 'completed' && (!t.scheduledDate || t.scheduledDate === selectedDate)) return true;
    return false;
  });

  const filteredTasks = dayTasks.filter((t) => {
    if (activeFilter === 'important') return t.priority === 'critical' || t.priority === 'important';
    if (activeFilter === 'regular') return t.priority === 'flexible' || t.priority === 'optional';
    return true;
  });

  const displayedTasks = filteredTasks.slice(0, 8);

  const getCategoryClass = (cat: Category) => {
    switch (cat) {
      case 'Health': return 'badge-health';
      case 'Work': return 'badge-work';
      case 'Personal': return 'badge-personal';
      case 'Learning': return 'badge-learning';
      default: return 'badge-neutral';
    }
  };

  const getPriorityDot = (t: Task) => {
    if (t.status === 'completed') return 'bg-tag-health';
    if (t.priority === 'critical') return 'bg-[#E5484D]';
    if (t.priority === 'important') return 'bg-[#F97316]';
    if (t.priority === 'flexible') return 'bg-[#D97706]';
    return 'bg-[#64748B]';
  };

  return (
    <div className="w-full bg-card rounded-[28px] p-6 sm:p-7 select-none flex flex-col justify-between transition-colors">
      <div>
        {/* Card Header with Title, Filter Tabs, and + Add Task Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-borderToken">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[22px] sm:text-[24px] font-serif font-medium text-foreground tracking-tight">
              Today's Flow
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11.5px] font-semibold">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filter Pills Segment */}
            <div className="flex items-center bg-card-muted p-1 rounded-xl">
              {(['all', 'important', 'regular'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1 text-[12.5px] font-medium rounded-lg capitalize transition-all ${activeFilter === filter
                      ? 'bg-card text-foreground font-semibold'
                      : 'text-mutedText hover:text-foreground'
                    }`}
                >
                  {filter === 'all' ? 'All' : filter === 'important' ? 'Important' : 'Flexible'}
                </button>
              ))}
            </div>

            {/* + Add Task Button */}
            <button
              type="button"
              onClick={() => openTaskModal()}
              className="flex items-center gap-1.5 px-3.5 h-[34px] rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task Rows List with divider line under each task and smooth auto-height */}
        <SmoothAutoHeight duration={360} className="mt-2">
          <div className="divide-y divide-borderToken">
          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <DoodleCup size={72} className="mb-2 transform hover:scale-105 transition-transform" />
              <span className="text-[15px] font-medium text-foreground font-sans">Your day is serene & clear</span>
              <span className="text-xs text-mutedText mt-0.5">Sip some tea or add an outcome you'd love to accomplish peacefully.</span>
            </div>
          ) : (
            displayedTasks.map((task, idx) => {
              const isCompleted = task.status === 'completed';
              const isSkipped = task.status === 'skipped';
              const timeDisplay = task.scheduledStart && task.scheduledEnd
                ? `${formatTime12h(task.scheduledStart)} - ${formatTime12h(task.scheduledEnd)}`
                : `${task.duration}m estimated`;

              const isThisTaskActive = activeFocusTaskId === task.id;
              const isThisTaskRunning = isFocusTimerRunning && isThisTaskActive;
              const elapsedSeconds = isThisTaskActive ? focusElapsedSeconds : (taskElapsedSeconds[task.id] || 0);
              const estimatedSeconds = (task.duration || 45) * 60;
              const areOvertimeAlertsEnabled = settings.preferences?.enableOvertimeAlerts ?? true;
              const isOvertime = areOvertimeAlertsEnabled && elapsedSeconds > estimatedSeconds;

              return (
                <div
                  key={task.id}
                  style={{ animationDelay: `${idx * 45}ms` }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActiveMenuId(activeMenuId === task.id ? null : task.id);
                  }}
                  className={`group relative flex items-center justify-between py-3.5 px-2 transition-spring hover:bg-card-subtle rounded-xl animate-enter-up ${
                    activeMenuId === task.id ? 'z-30' : 'z-0'
                  }`}
                >
                  {/* Left: Checkbox + Priority Dot + Title */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <button
                      type="button"
                      data-completion-trigger="true"
                      data-no-click-sound="true"
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-[22px] h-[22px] rounded-[8px] flex items-center justify-center transition-spring cursor-pointer active:scale-75 hover:scale-115 ${isCompleted
                          ? 'bg-tag-health text-white shadow-xs'
                          : 'border border-borderToken hover:border-primary bg-card'
                        }`}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} className="text-white animate-check-pop" />}
                    </button>

                    <span className={`w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200 ${getPriorityDot(task)}`} />

                    <span
                      onClick={() => openTaskModal(task)}
                      className={`text-[14px] font-sans truncate cursor-pointer transition-colors ${isCompleted
                          ? 'line-through text-mutedText opacity-60'
                          : isSkipped
                            ? 'italic line-through text-mutedText opacity-60'
                            : 'text-foreground hover:text-primary font-medium'
                        }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Middle & Right: Category Badge + Time + Live Timer + Actions */}
                  <div className="flex items-center gap-3 sm:gap-3.5 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-xl text-[11.5px] font-medium transition-all group-hover:scale-105 duration-200 ${
                        isCompleted ? 'opacity-50' : ''
                      } ${getCategoryClass(task.category)}`}
                    >
                      {task.category}
                    </span>

                    <span className={`text-[12.5px] font-normal text-mutedText min-w-[125px] text-right font-sans transition-opacity ${
                      isCompleted ? 'opacity-50' : ''
                    }`}>
                      {timeDisplay}
                    </span>

                    {/* Task Timer (Live for pending, Total duration for completed) */}
                    {isCompleted ? (
                      <div
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-mono text-[11.5px] bg-tag-healthBg text-tag-health font-medium border border-tag-health/30 tracking-tight tabular-nums select-none"
                        title="Completed focus duration"
                      >
                        <Check size={11} strokeWidth={2.5} className="text-tag-health flex-shrink-0" />
                        <span>{formatTimer(Math.max((task.duration || 45) * 60, elapsedSeconds))}</span>
                      </div>
                    ) : (
                      <div 
                        className="relative"
                        ref={activeOvertimeMenuId === task.id ? overtimeContainerRef : null}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            if (isOvertime) {
                              e.stopPropagation();
                              setActiveOvertimeMenuId(activeOvertimeMenuId === task.id ? null : task.id);
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-mono text-[11.5px] tracking-tight tabular-nums transition-all select-none ${
                            isOvertime
                              ? 'bg-tag-importantBg text-tag-important font-bold border border-tag-important/30 shadow-xs animate-pulse cursor-pointer hover:scale-105'
                              : isThisTaskRunning
                                ? 'bg-primary-soft text-primary font-semibold border border-primary/25 cursor-default'
                                : elapsedSeconds > 0
                                  ? 'bg-card-muted text-foreground font-medium border border-borderToken cursor-default'
                                  : 'bg-card-subtle text-mutedText font-normal border border-borderToken/40 cursor-default'
                          }`}
                          title={
                            isOvertime
                              ? `Overtime limit exceeded (+${Math.floor((elapsedSeconds - estimatedSeconds)/60)}m). Click for options.`
                              : isThisTaskRunning
                                ? 'Task timer is running'
                                : 'Task timer'
                          }
                        >
                          <Clock size={11} className={`flex-shrink-0 ${isOvertime ? 'text-tag-important' : isThisTaskRunning ? 'text-primary' : 'text-mutedText'}`} />
                          <span>{formatTimer(elapsedSeconds)}</span>
                        </button>

                        {/* Overtime Smart Action Popover */}
                        {isOvertime && activeOvertimeMenuId === task.id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-7 w-52 bg-card rounded-2xl shadow-float py-2 px-1 z-50 border border-borderToken animate-fade-in text-left"
                          >
                            <div className="px-3 py-1 mb-1 border-b border-borderToken text-[11px] font-semibold text-tag-important flex items-center justify-between">
                              <span>Overtime (+{Math.floor((elapsedSeconds - estimatedSeconds) / 60)}m)</span>
                              <span className="text-[10px] text-mutedText">Recovery</span>
                            </div>
                            <button
                              onClick={() => {
                                extendTaskDuration(task.id, 15);
                                setActiveOvertimeMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle transition-colors cursor-pointer rounded-xl font-medium"
                            >
                              <Plus size={13} className="text-primary" />
                              <span>+15 Min Extension</span>
                            </button>
                            <button
                              onClick={() => {
                                toggleTaskStatus(task.id);
                                setActiveOvertimeMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-tag-health hover:bg-tag-healthBg transition-colors cursor-pointer rounded-xl font-medium"
                            >
                              <Check size={13} strokeWidth={2.5} />
                              <span>Mark Done & Log {Math.ceil(elapsedSeconds / 60)}m</span>
                            </button>
                            <button
                              onClick={() => {
                                moveTaskToTomorrow(task.id);
                                setActiveOvertimeMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-mutedText hover:bg-card-subtle hover:text-foreground transition-colors cursor-pointer rounded-xl"
                            >
                              <FastForward size={13} />
                              <span>Move Remainder Tomorrow</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {!isCompleted ? (
                      <button
                        onClick={() => toggleFocusTask(task.id)}
                        className="p-1 transition-spring hover:scale-125 active:scale-90 cursor-pointer text-mutedText hover:text-primary"
                        title={
                          isThisTaskRunning
                            ? 'Pause focus timer'
                            : 'Start focus timer'
                        }
                      >
                        {isThisTaskRunning ? (
                          <Pause size={15} className="text-primary fill-primary animate-pulse" />
                        ) : (
                          <Play size={15} fill="currentColor" className="text-mutedText hover:text-primary" />
                        )}
                      </button>
                    ) : (
                      <div className="p-1 text-tag-health opacity-60">
                        <Check size={15} strokeWidth={2.5} />
                      </div>
                    )}

                    <div className="relative" ref={activeMenuId === task.id ? menuContainerRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === task.id ? null : task.id);
                        }}
                        className="p-1 rounded-lg text-mutedText hover:text-foreground hover:bg-card-subtle transition-spring hover:scale-115 active:scale-90 cursor-pointer"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === task.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-8 w-44 bg-card rounded-2xl shadow-float py-1.5 z-50 border border-borderToken animate-fade-in opacity-100"
                        >
                            <button
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
                              onClick={() => {
                                skipTask(task.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-tag-learning hover:bg-tag-learningBg transition-colors cursor-pointer"
                            >
                              <ArrowRight size={13} />
                              <span>Skip today</span>
                            </button>
                            <div className="my-1 border-t border-borderToken" />
                            <button
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
            })
          )}
          </div>
        </SmoothAutoHeight>
      </div>

      {/* Bottom Link: "View all tasks" */}
      <div className="pt-4 mt-2 text-center border-t border-borderToken">
        <button
          onClick={() =>
            navigateToTasks({
              priority: activeFilter === 'important' ? 'important' : activeFilter === 'regular' ? 'flexible' : 'All',
            })
          }
          className="text-[13px] font-medium text-primary hover:underline underline-offset-4 tracking-wide cursor-pointer"
        >
          View all tasks & backlog {activeFilter !== 'all' ? `(${activeFilter})` : ''} →
        </button>
      </div>
    </div>
  );
};
