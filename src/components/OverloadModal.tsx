import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AlertTriangle, X, FastForward, Scissors } from 'lucide-react';

export const OverloadModal: React.FC = () => {
  const { isOverloadModalOpen, closeOverloadModal, getDayCapacity, applySuggestion } = useAppStore();
  const capacity = getDayCapacity();

  if (!isOverloadModalOpen) return null;

  const hours = Math.floor(capacity.overloadMinutes / 60);
  const mins = capacity.overloadMinutes % 60;
  const overloadText = `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;

  return (
    <div 
      onClick={closeOverloadModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-card w-full max-w-lg rounded-[28px] shadow-float p-6 sm:p-7 transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderToken">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-tag-importantBg flex items-center justify-center text-tag-important">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-[19px] font-serif font-semibold text-foreground">
                Schedule Overload Detected
              </h3>
              <p className="text-[12px] text-mutedText">
                Your planned work exceeds available daytime capacity.
              </p>
            </div>
          </div>
          <button
            onClick={closeOverloadModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Overload Alert Badge */}
        <div className="mt-4 p-4 rounded-2xl bg-tag-importantBg">
          <span className="text-[14px] font-semibold text-tag-important block">
            Your day is overloaded by {overloadText || '45m'}.
          </span>
          <span className="text-[12.5px] text-mutedText mt-1 block">
            To prevent fatigue and preserve restful sleep, consider accepting one of the recommendations below.
          </span>
        </div>

        {/* Suggestions list */}
        <div className="mt-5 space-y-2.5">
          <span className="text-[12px] font-semibold text-mutedText uppercase tracking-wider block">
            Recommended Adjustments
          </span>

          {capacity.suggestions.length === 0 ? (
            <div className="p-3 text-[12.5px] text-mutedText">
              Try moving flexible tasks to tomorrow or shortening task durations.
            </div>
          ) : (
            capacity.suggestions.map((sug) => (
              <div
                key={sug.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle transition-all"
              >
                <div className="flex items-center gap-2.5">
                  {sug.actionType === 'move' ? (
                    <FastForward size={16} className="text-primary" />
                  ) : (
                    <Scissors size={16} className="text-tag-learning" />
                  )}
                  <div>
                    <span className="text-[13px] font-semibold text-foreground block">{sug.taskTitle}</span>
                    <span className="text-[11.5px] text-mutedText block">{sug.explanation}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    applySuggestion(sug);
                    closeOverloadModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[12px] font-medium transition-all shadow-xs"
                >
                  Apply
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-borderToken">
          <button
            onClick={closeOverloadModal}
            className="px-4 py-2 rounded-2xl text-[13px] font-medium text-mutedText hover:text-foreground"
          >
            Keep Current Plan
          </button>
        </div>
      </div>
    </div>
  );
};
