import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AlertTriangle, X, Check, FastForward, Scissors, ArrowRight } from 'lucide-react';

export const OverloadModal: React.FC = () => {
  const { isOverloadModalOpen, closeOverloadModal, getDayCapacity, applySuggestion } = useAppStore();
  const capacity = getDayCapacity();

  if (!isOverloadModalOpen) return null;

  const hours = Math.floor(capacity.overloadMinutes / 60);
  const mins = capacity.overloadMinutes % 60;
  const overloadText = `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05313A]/30 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[20px] shadow-float p-6 select-none border border-[rgba(217,75,91,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(5,49,58,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(217,75,91,0.12)] flex items-center justify-center text-[#D94B5B]">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#05313A]">
                Schedule Overload Detected
              </h3>
              <p className="text-xs text-[rgba(5,49,58,0.6)]">
                Your planned work exceeds available daytime capacity.
              </p>
            </div>
          </div>
          <button
            onClick={closeOverloadModal}
            className="p-1 rounded-lg text-[rgba(5,49,58,0.4)] hover:text-[#05313A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Overload Alert Badge */}
        <div className="mt-4 p-4 rounded-xl bg-[rgba(217,75,91,0.08)] border border-[rgba(217,75,91,0.2)]">
          <span className="text-sm font-semibold text-[#c53030] block">
            Your day is overloaded by {overloadText || '45m'}.
          </span>
          <span className="text-xs text-[rgba(5,49,58,0.7)] mt-1 block">
            To prevent fatigue and preserve sleep, consider accepting one of the recommendations below.
          </span>
        </div>

        {/* Suggestions list */}
        <div className="mt-5 space-y-2.5">
          <span className="text-xs font-semibold text-[rgba(5,49,58,0.65)] uppercase tracking-wider block">
            Recommended Adjustments
          </span>

          {capacity.suggestions.length === 0 ? (
            <div className="p-3 text-xs text-[rgba(5,49,58,0.6)]">
              Try moving flexible tasks to tomorrow or shortening task durations.
            </div>
          ) : (
            capacity.suggestions.map((sug) => (
              <div
                key={sug.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.08)] hover:border-[#328F9B] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  {sug.actionType === 'move' ? (
                    <FastForward size={16} className="text-[#328F9B]" />
                  ) : (
                    <Scissors size={16} className="text-[#D88A2D]" />
                  )}
                  <div>
                    <span className="text-xs font-semibold text-[#05313A] block">{sug.taskTitle}</span>
                    <span className="text-[11px] text-[rgba(5,49,58,0.6)] block">{sug.explanation}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    applySuggestion(sug);
                    closeOverloadModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-medium transition-all shadow-xs"
                >
                  Apply
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-[rgba(5,49,58,0.06)]">
          <button
            onClick={closeOverloadModal}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[rgba(5,49,58,0.6)] hover:text-[#05313A]"
          >
            Keep Current Plan
          </button>
        </div>
      </div>
    </div>
  );
};
