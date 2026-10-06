import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, Priority } from '../types';
import { X, Clock, AlertCircle } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, closeTaskModal, editingTask, addTask, updateTask, selectedDate } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState<Category>('Work');
  const [priority, setPriority] = useState<Priority>('important');
  const [deadline, setDeadline] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [flexibility, setFlexibility] = useState<'flexible' | 'fixed'>('flexible');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDuration(editingTask.duration || 60);
      setCategory(editingTask.category || 'Work');
      setPriority(editingTask.priority || 'important');
      setDeadline(editingTask.deadline || '');
      setScheduledStart(editingTask.scheduledStart || '');
      setFlexibility(editingTask.flexibility || 'flexible');
    } else {
      setTitle('');
      setDescription('');
      setDuration(45);
      setCategory('Work');
      setPriority('important');
      setDeadline('');
      setScheduledStart('');
      setFlexibility('flexible');
    }
  }, [editingTask, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        description,
        duration: Number(duration),
        category,
        priority,
        deadline: deadline || undefined,
        scheduledStart: scheduledStart || undefined,
        flexibility,
      });
    } else {
      addTask({
        title,
        description,
        duration: Number(duration),
        category,
        priority,
        status: 'pending',
        scheduledDate: selectedDate,
        deadline: deadline || undefined,
        scheduledStart: scheduledStart || undefined,
        flexibility,
      });
    }
  };

  const categories: Category[] = ['Health', 'Work', 'Personal', 'Learning', 'Neutral'];
  const priorities: { id: Priority; label: string; desc: string }[] = [
    { id: 'critical', label: 'Critical', desc: 'Must happen today' },
    { id: 'important', label: 'Important', desc: 'Should happen today' },
    { id: 'flexible', label: 'Flexible', desc: 'Can move if needed' },
    { id: 'optional', label: 'Optional', desc: 'Only if time permits' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05313A]/30 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[20px] shadow-float p-6 select-none border border-[rgba(5,49,58,0.06)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(5,49,58,0.06)]">
          <h3 className="text-xl font-serif font-medium text-[#05313A]">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={closeTaskModal}
            className="p-1 rounded-lg text-[rgba(5,49,58,0.4)] hover:text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish authentication API"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-sm text-[#05313A] focus:outline-none focus:border-[#328F9B] focus:ring-2 focus:ring-[rgba(50,143,155,0.2)]"
            />
          </div>

          {/* Duration & Category Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Estimated Duration (mins)
              </label>
              <div className="flex items-center gap-2">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      duration === mins
                        ? 'bg-[#328F9B] text-white shadow-xs'
                        : 'bg-[#F4F9FB] text-[rgba(5,49,58,0.7)] hover:bg-[#EAF3F7]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A] focus:outline-none focus:border-[#328F9B]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Model */}
          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    priority === p.id
                      ? 'border-[#328F9B] bg-[rgba(50,143,155,0.08)]'
                      : 'border-[rgba(5,49,58,0.08)] hover:border-[rgba(5,49,58,0.2)] bg-white'
                  }`}
                >
                  <span className="block text-xs font-semibold text-[#05313A]">{p.label}</span>
                  <span className="block text-[10.5px] text-[rgba(5,49,58,0.55)]">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Notes / Sub-steps (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional context or outcome checklist..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A] focus:outline-none focus:border-[#328F9B]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(5,49,58,0.06)]">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[rgba(5,49,58,0.6)] hover:text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold transition-all shadow-sm"
            >
              {editingTask ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
