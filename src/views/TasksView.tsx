import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Task, Category, Priority } from '../types';
import { Plus, Search, Check, MoreHorizontal, Edit2, Trash2, FastForward, CheckCircle2 } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';
import { DoodleTasks } from '../components/DoodleIllustrations';

export const TasksView: React.FC = () => {
  const { tasks, toggleTaskStatus, deleteTask, openTaskModal, moveTaskToTomorrow } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;
    return true;
  });

  const getCategoryClass = (cat: Category) => {
    switch (cat) {
      case 'Health': return 'badge-health';
      case 'Work': return 'badge-work';
      case 'Personal': return 'badge-personal';
      case 'Learning': return 'badge-learning';
      default: return 'badge-neutral';
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'critical': return 'bg-tag-importantBg text-tag-important';
      case 'important': return 'bg-tag-learningBg text-tag-learning';
      case 'flexible': return 'bg-primary-soft text-primary';
      default: return 'bg-tag-neutralBg text-tag-neutral';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12 sm:pb-16 select-none max-w-[1600px] mx-auto">
      {/* Header with Search and New Task */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <DoodleTasks size={58} className="flex-shrink-0" />
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
              All Tasks & Backlog
            </h2>
            <p className="text-[13px] text-mutedText mt-0.5">
              Organize one-off outcomes and prioritize your focus peacefully.
            </p>
          </div>
        </div>

        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-2xl transition-all"
        >
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card rounded-[24px] p-4 flex flex-wrap items-center gap-3 transition-colors">
        {/* Search */}
        <div className="flex-1 min-w-[220px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-card-subtle">
          <Search size={15} className="text-mutedText" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search outcomes..."
            className="w-full bg-transparent text-[13.5px] text-foreground placeholder-mutedText outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-card-subtle text-[13px] text-foreground outline-none font-medium"
        >
          <option value="All">All Categories</option>
          <option value="Work">Work</option>
          <option value="Health">Health</option>
          <option value="Personal">Personal</option>
          <option value="Learning">Learning</option>
        </select>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-card-subtle text-[13px] text-foreground outline-none font-medium"
        >
          <option value="All">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="important">Important</option>
          <option value="flexible">Flexible</option>
          <option value="optional">Optional</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-card rounded-[28px] p-6 transition-colors">
        <div className="divide-y divide-borderToken">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-[13.5px] text-mutedText flex flex-col items-center justify-center">
              <DoodleTasks size={68} className="mb-2 opacity-80" />
              <span className="font-serif text-[15px] font-medium text-foreground">No outcomes found matching your filter</span>
              <span className="text-xs text-mutedText mt-0.5">Try resetting search or create a new peaceful task.</span>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-3.5 px-3 hover:bg-card-subtle rounded-2xl transition-all"
                >
                  {/* Checkbox + Title */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-5 h-5 rounded-[7px] flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'border border-borderToken bg-card hover:border-primary'
                      }`}
                    >
                      {isCompleted && <Check size={13} strokeWidth={3} className="text-white" />}
                    </button>
                    <div>
                      <span
                        onClick={() => openTaskModal(task)}
                        className={`text-[14.5px] font-medium cursor-pointer transition-colors block ${
                          isCompleted
                            ? 'line-through text-mutedText'
                            : 'text-foreground hover:text-primary'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-[12px] text-mutedText truncate block max-w-md">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges & Meta */}
                  <div className="flex items-center gap-3.5 flex-shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold capitalize ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11.5px] font-medium ${getCategoryClass(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>

                    <span className="text-[12.5px] text-mutedText font-sans min-w-[50px] text-right">
                      {task.duration}m
                    </span>

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="p-1.5 rounded-lg text-mutedText hover:text-foreground hover:bg-card-subtle"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === task.id && (
                        <div className="absolute right-0 top-7 w-40 bg-card rounded-2xl shadow-float py-1.5 z-20 border border-borderToken animate-fade-in">
                          <button
                            onClick={() => {
                              openTaskModal(task);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              moveTaskToTomorrow(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-card-subtle"
                          >
                            <FastForward size={13} />
                            <span>Move tomorrow</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-tag-important hover:bg-tag-importantBg"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
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
    </div>
  );
};
