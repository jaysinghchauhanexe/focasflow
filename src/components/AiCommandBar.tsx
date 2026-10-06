import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';
import { sendAiCommand } from '../engine/aiClient';

export const AiCommandBar: React.FC = () => {
  const { tasks, habits, settings, applyAiOperations, aiLoading, setAiLoading } = useAppStore();
  const [inputVal, setInputVal] = useState('');

  const samplePrompts = [
    'I have a meeting at 4 PM today',
    'Skip exercise today',
    'Add 2 hours for client API',
    'Add 45 min DSA every weekday',
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
    <div className="w-full bg-white rounded-[24px] p-4 lg:p-5 shadow-soft border border-[rgba(50,143,155,0.15)] select-none">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* AI Icon */}
        <div className="w-8 h-8 rounded-xl bg-[rgba(50,143,155,0.12)] flex items-center justify-center text-[#287C87] flex-shrink-0">
          {aiLoading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Tell me what's changed... (e.g. 'Meeting at 4 PM', 'Skip reading today')"
          className="flex-1 bg-transparent text-[14.5px] text-[#05313A] placeholder-[rgba(5,49,58,0.45)] outline-none border-none font-medium"
        />

        {/* Submit Enter Button */}
        <button
          type="submit"
          disabled={!inputVal.trim() || aiLoading}
          className="px-4 py-2 rounded-xl bg-[#287C87] hover:bg-[#216C76] disabled:opacity-40 text-white text-[13px] font-medium flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span>Ask</span>
          <CornerDownLeft size={13} />
        </button>
      </form>

      {/* Suggested Quick Chips */}
      <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[rgba(5,49,58,0.04)] overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-[rgba(5,49,58,0.45)] font-semibold uppercase tracking-wider flex-shrink-0">
          Examples:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputVal(prompt)}
            className="px-3 py-1 rounded-full bg-[#F4F9FB] hover:bg-[#EAF3F7] text-[12px] text-[rgba(5,49,58,0.65)] hover:text-[#05313A] whitespace-nowrap transition-colors font-sans"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
