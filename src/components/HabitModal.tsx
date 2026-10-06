import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category } from '../types';
import { X } from 'lucide-react';

export const HabitModal: React.FC = () => {
  const { isHabitModalOpen, closeHabitModal, editingHabit, addHabit, updateHabit } = useAppStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Learning');
  const [duration, setDuration] = useState(45);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'weekly'>('weekdays');
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setCategory(editingHabit.category);
      setDuration(editingHabit.duration);
      setFrequency(editingHabit.frequency);
      setPreferredTime(editingHabit.preferredTime);
    } else {
      setTitle('');
      setCategory('Learning');
      setDuration(45);
      setFrequency('weekdays');
      setPreferredTime('morning');
    }
  }, [editingHabit, isHabitModalOpen]);

  if (!isHabitModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingHabit) {
      updateHabit({
        ...editingHabit,
        title,
        category,
        duration: Number(duration),
        frequency,
        preferredTime,
      });
    } else {
      addHabit({
        title,
        category,
        duration: Number(duration),
        frequency,
        preferredTime,
        target: frequency === 'daily' ? 7 : 5,
        active: true,
      });
    }
  };

  const categories: Category[] = ['Health', 'Work', 'Personal', 'Learning', 'Neutral'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-card w-full max-w-md rounded-[28px] shadow-float p-6 sm:p-7 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-borderToken">
          <h3 className="text-[20px] font-serif font-medium text-foreground">
            {editingHabit ? 'Edit Habit' : 'Create Recurring Habit'}
          </h3>
          <button
            onClick={closeHabitModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mindful Walking, DSA Practice, Reading"
              className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[14px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
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

            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Duration (mins)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Monday–Friday</option>
                <option value="weekends">Weekends</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Preferred Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-borderToken">
            <button
              type="button"
              onClick={closeHabitModal}
              className="px-4 py-2 rounded-2xl text-[13px] font-medium text-mutedText hover:text-foreground hover:bg-card-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold shadow-xs"
            >
              {editingHabit ? 'Update Habit' : 'Save Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
