import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Task, Category, Priority } from '../types';
import { Plus, Search, Filter, Check, MoreHorizontal, Edit2, Trash2, Calendar, FastForward } from 'lucide-react';
import { formatTime12h } from '../engine/scheduler';

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
      case 'critical': return 'bg-[rgba(217,75,91,0.14)] text-[#c53030]';
      case 'important': return 'bg-[rgba(216,138,45,0.14)] text-[#c2781e]';
      case 'flexible': return 'bg-[rgba(50,143,155,0.14)] text-[#287c87]';
      default: return 'bg-[rgba(107,127,132,0.14)] text-[#556b70]';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6 select-none">
      {/* Header with Search and New Task */}
      <div className="bg-white rounded-[20px] p-6 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#05313A] tracking-tight">
            All Tasks & Backlog
          </h2>
          <p className="text-xs text-[rgba(5,49,58,0.6)] mt-0.5">
            Organize one-off outcomes and prioritize your work.
          </p>
        </div>

        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[20px] p-4 shadow-soft flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.08)]">
          <Search size={15} className="text-[rgba(5,49,58,0.4)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-transparent text-xs text-[#05313A] placeholder-[rgba(5,49,58,0.4)] outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.08)] text-xs text-[#05313A] outline-none"
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
          className="px-3 py-1.5 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.08)] text-xs text-[#05313A] outline-none"
        >
          <option value="All">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="important">Important</option>
          <option value="flexible">Flexible</option>
          <option value="optional">Optional</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-[20px] p-6 shadow-soft">
        <div className="divide-y divide-[rgba(5,49,58,0.04)]">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-[rgba(5,49,58,0.5)]">
              No tasks found matching your filter.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-[#F8FCFD] rounded-xl transition-all"
                >
                  {/* Checkbox + Title */}
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#328F9B] text-white'
                          : 'border border-[rgba(5,49,58,0.2)] bg-white hover:border-[#328F9B]'
                      }`}
                    >
                      {isCompleted && <Check size={13} strokeWidth={3} />}
                    </button>
                    <div>
                      <span
                        onClick={() => openTaskModal(task)}
                        className={`text-sm font-medium cursor-pointer transition-colors block ${
                          isCompleted
                            ? 'line-through text-[rgba(5,49,58,0.4)]'
                            : 'text-[#05313A] hover:text-[#328F9B]'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-[11px] text-[rgba(5,49,58,0.5)] truncate block max-w-md">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges & Meta */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-[6px] text-[10.5px] font-medium ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${getCategoryClass(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>

                    <span className="text-xs text-[rgba(5,49,58,0.6)] font-mono min-w-[50px] text-right">
                      {task.duration}m
                    </span>

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="p-1 rounded text-[rgba(5,49,58,0.4)] hover:text-[#05313A]"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === task.id && (
                        <div className="absolute right-0 top-7 w-40 bg-white rounded-xl shadow-float py-1 z-20 border border-[rgba(5,49,58,0.08)] animate-fade-in">
                          <button
                            onClick={() => {
                              openTaskModal(task);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              moveTaskToTomorrow(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
                          >
                            <FastForward size={13} />
                            <span>Move tomorrow</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#D94B5B] hover:bg-[rgba(217,75,91,0.08)]"
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
