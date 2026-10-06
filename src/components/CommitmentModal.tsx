import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category } from '../types';
import { X, Calendar } from 'lucide-react';

export const CommitmentModal: React.FC = () => {
  const { isCommitmentModalOpen, closeCommitmentModal, addTask, selectedDate } = useAppStore();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [duration, setDuration] = useState(45);
  const [category, setCategory] = useState<Category>('Work');

  if (!isCommitmentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      category,
      duration: Number(duration),
      priority: 'critical',
      status: 'pending',
      scheduledDate: selectedDate,
      scheduledStart: startTime,
      flexibility: 'fixed',
    });

    closeCommitmentModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-card w-full max-w-md rounded-[28px] shadow-float p-6 sm:p-7 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-borderToken">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <h3 className="text-[20px] font-serif font-medium text-foreground">
              Add Fixed Commitment / Event
            </h3>
          </div>
          <button
            onClick={closeCommitmentModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <p className="text-[12.5px] text-mutedText mt-2">
          Fixed commitments lock a specific time slot and protect it against schedule rearrangements.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Event / Meeting Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Client Sync Meeting, Doctor Appointment"
              className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[14px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                Duration (mins)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3.5 py-2 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground"
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-borderToken">
            <button
              type="button"
              onClick={closeCommitmentModal}
              className="px-4 py-2 rounded-2xl text-[13px] font-medium text-mutedText hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold shadow-xs"
            >
              Lock Into Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
