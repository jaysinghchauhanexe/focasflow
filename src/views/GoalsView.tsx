import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Target, Plus, ChevronRight, CheckCircle2 } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, addGoal } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title,
      description,
      category: 'Learning',
      progress: 0,
      projects: [],
    });
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6 select-none">
      <div className="bg-white rounded-[20px] p-6 shadow-soft flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#05313A] tracking-tight">
            High-Level Goals & Projects
          </h2>
          <p className="text-xs text-[rgba(5,49,58,0.6)] mt-0.5">
            Connect high-level intentions into tangible everyday milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>New Goal</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white rounded-[20px] p-5 shadow-soft space-y-3">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal Title (e.g. Master Cloud Architecture)"
            className="w-full px-3.5 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.1)] text-xs text-[#05313A] outline-none"
          />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key milestones and desired outcomes..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.1)] text-xs text-[#05313A] outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[rgba(5,49,58,0.6)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#328F9B] text-white text-xs font-semibold"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-[20px] p-6 shadow-soft space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#328F9B] uppercase tracking-wider">
                  {goal.category}
                </span>
                <h3 className="text-lg font-serif font-medium text-[#05313A] mt-0.5">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-[rgba(5,49,58,0.6)] mt-1">{goal.description}</p>
                )}
              </div>
              <span className="text-sm font-serif font-semibold text-[#328F9B]">{goal.progress}%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 bg-[rgba(50,143,155,0.12)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#328F9B] rounded-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            {/* Sub Projects */}
            {goal.projects && goal.projects.length > 0 && (
              <div className="pt-2 border-t border-[rgba(5,49,58,0.05)] space-y-1.5">
                <span className="text-[11px] font-semibold text-[rgba(5,49,58,0.5)] uppercase tracking-wider block">
                  Active Projects
                </span>
                {goal.projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FCFD] text-xs text-[#05313A]"
                  >
                    <span>{p.title}</span>
                    <span className="font-mono text-[11px] text-[rgba(5,49,58,0.6)]">
                      {p.completedCount}/{p.tasksCount} Tasks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
