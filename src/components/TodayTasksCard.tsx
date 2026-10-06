import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Task, Category } from '../types';
import { Plus, Check, Play, MoreHorizontal, ArrowRight, Clock, Trash2, Edit2, FastForward, CheckCircle2 } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { DoodleCup } from './DoodleIllustrations';

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
    setCurrentTab
  } = useAppStore();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const dayTasks = tasks.filter(
    (t) => t.scheduledDate === selectedDate || (!t.scheduledDate && t.status !== 'completed' && t.status !== 'skipped')
  );

  const filteredTasks = dayTasks.filter((t) => {
    if (activeFilter === 'important') return t.priority === 'critical' || t.priority === 'important';
    if (activeFilter === 'regular') return t.priority === 'flexible' || t.priority === 'optional';
    return true;
  });

  const displayedTasks = filteredTasks.slice(0, 6);

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
    if (t.priority === 'critical' || t.priority === 'important') return 'bg-tag-important';
    if (t.priority === 'flexible') return 'bg-tag-learning';
    return 'bg-tag-health';
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
                  className={`px-3.5 py-1 text-[12.5px] font-medium rounded-lg capitalize transition-all ${
                    activeFilter === filter
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
              onClick={() => openTaskModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[12.5px] font-medium transition-all"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task Rows List with divider line under each task */}
        <div className="divide-y divide-borderToken mt-2">
          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <DoodleCup size={72} className="mb-2 transform hover:scale-105 transition-transform" />
              <span className="text-[15px] font-medium text-foreground font-sans">Your day is serene & clear</span>
              <span className="text-xs text-mutedText mt-0.5">Sip some tea or add an outcome you'd love to accomplish peacefully.</span>
            </div>
          ) : (
            displayedTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isSkipped = task.status === 'skipped';
              const timeDisplay = task.scheduledStart && task.scheduledEnd
                ? `${formatTime12h(task.scheduledStart)} - ${formatTime12h(task.scheduledEnd)}`
                : `${task.duration}m estimated`;

              return (
                <div
                  key={task.id}
                  className={`group relative flex items-center justify-between py-3.5 px-2 transition-all duration-150 hover:bg-card-subtle rounded-xl ${
                    isCompleted ? 'opacity-55' : ''
                  }`}
                >
                  {/* Left: Checkbox + Priority Dot + Title */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-[22px] h-[22px] rounded-[8px] flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'border border-borderToken hover:border-primary bg-card'
                      }`}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} className="text-white" />}
                    </button>

                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(task)}`} />

                    <span
                      onClick={() => openTaskModal(task)}
                      className={`text-[14px] font-sans truncate cursor-pointer transition-colors ${
                        isCompleted
                          ? 'line-through text-mutedText'
                          : isSkipped
                          ? 'italic line-through text-mutedText'
                          : 'text-foreground hover:text-primary font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Middle & Right: Category Badge + Time + Actions */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-xl text-[11.5px] font-medium ${getCategoryClass(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>

                    <span className="text-[12.5px] font-normal text-mutedText min-w-[125px] text-right font-sans">
                      {timeDisplay}
                    </span>

                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="p-1 text-mutedText hover:text-primary transition-colors"
                      title={isCompleted ? 'Mark incomplete' : 'Complete task'}
                    >
                      {isCompleted ? (
                        <Check size={16} className="text-tag-health" />
                      ) : (
                        <Play size={14} fill="currentColor" className="text-mutedText hover:text-primary" />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="p-1 rounded-lg text-mutedText hover:text-foreground hover:bg-card-subtle"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === task.id && (
                        <div className="absolute right-0 top-7 w-44 bg-card rounded-2xl shadow-float py-1.5 z-30 border border-borderToken animate-fade-in">
                          <button
                            onClick={() => {
                              openTaskModal(task);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle"
                          >
                            <Edit2 size={13} />
                            <span>Edit task</span>
                          </button>
                          <button
                            onClick={() => {
                              moveTaskToTomorrow(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle"
                          >
                            <FastForward size={13} />
                            <span>Move to tomorrow</span>
                          </button>
                          <button
                            onClick={() => {
                              moveTaskLater(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle"
                          >
                            <Clock size={13} />
                            <span>Move later today</span>
                          </button>
                          <button
                            onClick={() => {
                              skipTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-tag-learning hover:bg-tag-learningBg"
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
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-tag-important hover:bg-tag-importantBg"
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
      </div>

      {/* Bottom Link: "View all tasks" */}
      <div className="pt-4 mt-2 text-center border-t border-borderToken">
        <button
          onClick={() => setCurrentTab('tasks')}
          className="text-[13px] font-medium text-primary hover:underline underline-offset-4 tracking-wide"
        >
          View all tasks & backlog →
        </button>
      </div>
    </div>
  );
};
