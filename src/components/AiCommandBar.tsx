import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';
import { sendAiCommand } from '../engine/aiClient';

export const AiCommandBar: React.FC = () => {
  const { tasks, habits, settings, applyAiOperations, aiLoading, setAiLoading } = useAppStore();
  const [inputVal, setInputVal] = useState('');

  const samplePrompts = [
    'I have a meeting at 4 PM today',
    'Skip workout today',
    'Add 2 hours for client API',
    'Add 30 min reading every evening',
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || aiLoading) return;

    const query = inputVal.trim();
    setInputVal('');
    setAiLoading(true);

    try {
      const result = await sendAiCommand(query, tasks, habits, settings);
      applyAiOperations(result);
    } catch (err) {
      console.error('AI command failed:', err);
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full bg-card rounded-[28px] p-4 sm:p-5 shadow-soft border border-borderToken select-none transition-colors">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* AI Icon */}
        <div className="w-9 h-9 rounded-2xl bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
          {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Tell FocusFlow what's changed... (e.g. 'Meeting at 3 PM', 'Move DSA to tomorrow')"
          className="flex-1 bg-transparent text-[14.5px] text-foreground placeholder-mutedText outline-none border-none font-medium"
        />

        {/* Submit Enter Button */}
        <button
          type="submit"
          disabled={!inputVal.trim() || aiLoading}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-[13px] font-medium flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span>Ask</span>
          <CornerDownLeft size={13} />
        </button>
      </form>

      {/* Suggested Quick Chips */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-borderToken overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-mutedText font-semibold uppercase tracking-wider flex-shrink-0">
          Suggestions:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputVal(prompt)}
            className="px-3 py-1 rounded-full bg-card-subtle hover:bg-card-muted text-textSecondary hover:text-foreground whitespace-nowrap transition-colors font-sans border border-borderToken"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
