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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05313A]/30 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[20px] shadow-float p-6 select-none border border-[rgba(5,49,58,0.06)]">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(5,49,58,0.06)]">
          <h3 className="text-xl font-serif font-medium text-[#05313A]">
            {editingHabit ? 'Edit Habit' : 'Create Recurring Habit'}
          </h3>
          <button
            onClick={closeHabitModal}
            className="p-1 rounded-lg text-[rgba(5,49,58,0.4)] hover:text-[#05313A] hover:bg-[rgba(5,49,58,0.05)]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DSA Practice, Morning Workout, Reading"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-sm text-[#05313A] focus:outline-none focus:border-[#328F9B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Duration (mins)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Monday–Friday</option>
                <option value="weekends">Weekends</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Preferred Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(5,49,58,0.06)]">
            <button
              type="button"
              onClick={closeHabitModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[rgba(5,49,58,0.6)] hover:text-[#05313A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold shadow-sm"
            >
              {editingHabit ? 'Update Habit' : 'Save Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
