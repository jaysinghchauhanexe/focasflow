import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, Priority } from '../types';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-card w-full max-w-lg rounded-[28px] shadow-float p-6 sm:p-7 border border-borderToken transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderToken">
          <h3 className="text-[20px] font-serif font-medium text-foreground">
            {editingTask ? 'Edit Outcome' : 'Add New Outcome'}
          </h3>
          <button
            onClick={closeTaskModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Outcome Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish client authentication module"
              className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[14px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Duration & Category Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Estimated Duration
              </label>
              <div className="flex items-center gap-1.5">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`flex-1 py-1.5 rounded-xl text-[12px] font-medium transition-all ${
                      duration === mins
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card-subtle text-textSecondary hover:bg-card-muted border border-borderToken'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
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
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`p-2.5 rounded-2xl text-left border transition-all ${
                    priority === p.id
                      ? 'border-primary bg-primary-soft'
                      : 'border-borderToken hover:border-primary/40 bg-card'
                  }`}
                >
                  <span className="block text-[12.5px] font-semibold text-foreground">{p.label}</span>
                  <span className="block text-[11px] text-mutedText">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Notes / Sub-steps (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional context or outcome checklist..."
              className="w-full px-4 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-borderToken">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-2xl text-[13px] font-medium text-mutedText hover:text-foreground hover:bg-card-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold transition-all shadow-xs"
            >
              {editingTask ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
