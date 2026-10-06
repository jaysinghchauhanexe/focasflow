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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05313A]/30 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[20px] shadow-float p-6 select-none border border-[rgba(5,49,58,0.06)]">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(5,49,58,0.06)]">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#328F9B]" />
            <h3 className="text-xl font-serif font-medium text-[#05313A]">
              Add Fixed Commitment / Event
            </h3>
          </div>
          <button
            onClick={closeCommitmentModal}
            className="p-1 rounded-lg text-[rgba(5,49,58,0.4)] hover:text-[#05313A]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[rgba(5,49,58,0.6)] mt-2">
          Fixed commitments lock a specific time slot and protect it against schedule rearrangements.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Event / Meeting Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Client Sync Meeting, Doctor Appointment"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-sm text-[#05313A] focus:outline-none focus:border-[#328F9B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Duration (mins)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(5,49,58,0.06)]">
            <button
              type="button"
              onClick={closeCommitmentModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[rgba(5,49,58,0.6)] hover:text-[#05313A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold shadow-sm"
            >
              Lock Into Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
