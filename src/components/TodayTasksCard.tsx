import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Task, Category } from '../types';
import { Plus, Check, Play, MoreHorizontal, ArrowRight, Clock, Trash2, Edit2, FastForward } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';

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

  // Limit to maximum 6 tasks as explicitly requested
  const displayedTasks = filteredTasks.slice(0, 6);

  const getCategoryClass = (cat: Category) => {
    switch (cat) {
      case 'Health': return 'bg-[#48BB78]/25 text-[#22543D]';
      case 'Work': return 'bg-[#4299E1]/25 text-[#2A4365]';
      case 'Personal': return 'bg-[#9F7AEA]/25 text-[#44337A]';
      case 'Learning': return 'bg-[#ED8936]/25 text-[#652B19]';
      default: return 'bg-[#A0AEC0]/25 text-[#2D3748]';
    }
  };

  const getPriorityDot = (t: Task) => {
    if (t.priority === 'critical' || t.priority === 'important') return 'bg-[#E53E3E]';
    if (t.priority === 'flexible') return 'bg-[#DD6B20]';
    return 'bg-[#38A169]';
  };

  return (
    <div className="w-full bg-white rounded-[24px] p-6 lg:p-7 shadow-soft select-none flex flex-col justify-between">
      <div>
        {/* Card Header with Title, Filter Tabs, and + Add Task Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <h3 className="text-[24px] lg:text-[26px] font-serif font-normal text-[#05313A] tracking-tight">
            Today Tasks
          </h3>

          <div className="flex items-center gap-3">
            {/* Filter Pills Segment */}
            <div className="flex items-center bg-[#EDF6F9] p-1 rounded-xl">
              {(['all', 'important', 'regular'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 text-[13px] font-medium rounded-lg capitalize transition-all ${
                    activeFilter === filter
                      ? 'bg-white text-[#05313A] shadow-xs font-semibold'
                      : 'text-[rgba(5,49,58,0.6)] hover:text-[#05313A]'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter === 'important' ? 'Important' : 'Regular'}
                </button>
              ))}
            </div>

            {/* + Add Task Button */}
            <button
              onClick={() => openTaskModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#287C87] hover:bg-[#216C76] text-white text-[13px] font-medium transition-all shadow-xs"
            >
              <Plus size={15} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task Rows List - Max 6 tasks */}
        <div className="space-y-1 mt-1">
          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-base text-[rgba(5,49,58,0.6)] font-medium">Your day is clear.</span>
              <span className="text-xs text-[rgba(5,49,58,0.4)] mt-1">Add something you want to accomplish today.</span>
            </div>
          ) : (
            displayedTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isSkipped = task.status === 'skipped';
              const timeDisplay = task.scheduledStart && task.scheduledEnd
                ? `${formatTime12h(task.scheduledStart)} - ${formatTime12h(task.scheduledEnd)}`
                : `${task.duration} min`;

              return (
                <div
                  key={task.id}
                  className={`group relative flex items-center justify-between py-2.5 px-2 rounded-xl transition-all duration-150 hover:bg-[#F6FAFC] ${
                    isCompleted ? 'opacity-60' : ''
                  }`}
                >
                  {/* Left: Checkbox + Priority Dot + Title */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#287C87] text-white'
                          : 'border border-[rgba(5,49,58,0.25)] hover:border-[#287C87] bg-white'
                      }`}
                    >
                      {isCompleted && <Check size={14} strokeWidth={3} />}
                    </button>

                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(task)}`} />

                    <span
                      onClick={() => openTaskModal(task)}
                      className={`text-[15px] font-normal truncate cursor-pointer transition-colors ${
                        isCompleted
                          ? 'line-through text-[rgba(5,49,58,0.45)]'
                          : isSkipped
                          ? 'italic line-through text-[rgba(5,49,58,0.4)]'
                          : 'text-[#05313A] hover:text-[#287C87]'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Middle & Right: Category Badge + Time + Action Icons */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-[8px] text-[12px] font-medium ${getCategoryClass(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>

                    <span className="text-[13.5px] font-normal text-[rgba(5,49,58,0.7)] min-w-[135px] text-right font-sans">
                      {timeDisplay}
                    </span>

                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="p-1 text-[rgba(5,49,58,0.5)] hover:text-[#287C87] transition-colors"
                    >
                      {isCompleted ? (
                        <Check size={17} className="text-[#38A169]" />
                      ) : (
                        <Play size={14} fill="currentColor" className="text-[rgba(5,49,58,0.65)]" />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="p-1 rounded text-[rgba(5,49,58,0.4)] hover:text-[#05313A] hover:bg-[rgba(5,49,58,0.06)]"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {activeMenuId === task.id && (
                        <div className="absolute right-0 top-7 w-44 bg-white rounded-xl shadow-float py-1.5 z-30 border border-[rgba(5,49,58,0.08)] animate-fade-in">
                          <button
                            onClick={() => {
                              openTaskModal(task);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
                          >
                            <Edit2 size={13} />
                            <span>Edit task</span>
                          </button>
                          <button
                            onClick={() => {
                              moveTaskToTomorrow(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
                          >
                            <FastForward size={13} />
                            <span>Move to tomorrow</span>
                          </button>
                          <button
                            onClick={() => {
                              moveTaskLater(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
                          >
                            <Clock size={13} />
                            <span>Move later today</span>
                          </button>
                          <button
                            onClick={() => {
                              skipTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#D88A2D] hover:bg-[rgba(216,138,45,0.08)]"
                          >
                            <ArrowRight size={13} />
                            <span>Skip today</span>
                          </button>
                          <div className="my-1 border-t border-[rgba(5,49,58,0.06)]" />
                          <button
                            onClick={() => {
                              deleteTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#D94B5B] hover:bg-[rgba(217,75,91,0.08)]"
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
      <div className="pt-3 text-center">
        <button
          onClick={() => setCurrentTab('tasks')}
          className="text-[13.5px] font-medium text-[#287C87] hover:underline underline-offset-4 tracking-wide"
        >
          View all tasks
        </button>
      </div>
    </div>
  );
};
