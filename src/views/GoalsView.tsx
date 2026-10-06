import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Compass, Plus, CheckCircle2 } from 'lucide-react';
import { DoodleMountainFlag } from '../components/DoodleIllustrations';

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
    <div className="space-y-5 animate-fade-in pb-12 sm:pb-16 select-none max-w-[1600px] mx-auto">
      <div className="bg-card rounded-[28px] p-6 sm:p-7 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <DoodleMountainFlag size={58} className="flex-shrink-0" />
          <div>
            <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
              High-Level Vision & Milestones
            </h2>
            <p className="text-[13px] text-mutedText mt-0.5">
              Connect your deep intentions into tangible, calm everyday milestones.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-2xl transition-all"
        >
          <Plus size={15} />
          <span>New Goal</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-card rounded-[26px] p-6 shadow-soft space-y-3.5 transition-colors">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal Title (e.g. Master Full-Stack Architecture)"
            className="w-full px-4 py-2.5 rounded-xl bg-card-subtle text-[13.5px] text-foreground outline-none focus:border-primary"
          />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key milestones and desired peaceful outcomes..."
            className="w-full px-4 py-2.5 rounded-xl bg-card-subtle text-[13.5px] text-foreground outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-[12.5px] text-mutedText hover:bg-card-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-[12.5px] font-semibold shadow-xs"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-card rounded-[26px] p-6 sm:p-7 shadow-soft space-y-4 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  {goal.category}
                </span>
                <h3 className="text-[20px] font-serif font-medium text-foreground mt-0.5">{goal.title}</h3>
                {goal.description && (
                  <p className="text-[13px] text-mutedText mt-1">{goal.description}</p>
                )}
              </div>
              <span className="text-[15px] font-serif font-semibold text-primary">{goal.progress}%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 bg-card-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            {/* Sub Projects */}
            {goal.projects && goal.projects.length > 0 && (
              <div className="pt-3 border-t border-borderToken space-y-2">
                <span className="text-[11px] font-bold text-mutedText uppercase tracking-wider block">
                  Milestone Projects
                </span>
                {goal.projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-card-subtle text-[13px] text-foreground"
                  >
                    <span>{p.title}</span>
                    <span className="font-sans text-[11.5px] text-mutedText">
                      {p.completedCount}/{p.tasksCount} Done
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
