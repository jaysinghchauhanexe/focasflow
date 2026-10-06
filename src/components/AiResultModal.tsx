import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const AiResultModal: React.FC = () => {
  const { isAiModalOpen, closeAiModal, lastAiResult } = useAppStore();

  if (!isAiModalOpen || !lastAiResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-card w-full max-w-lg rounded-[28px] shadow-float p-6 sm:p-7 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderToken">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <h3 className="text-[20px] font-serif font-medium text-foreground">
              Assistant Plan Updates
            </h3>
          </div>
          <button
            onClick={closeAiModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Message */}
        <div className="mt-4 p-4 rounded-2xl bg-primary-soft text-[14px] text-foreground font-medium leading-relaxed">
          {lastAiResult.message}
        </div>

        {/* Structured Operations Applied */}
        <div className="mt-4">
          <span className="text-[12px] font-semibold text-mutedText uppercase tracking-wider block mb-2">
            Validated Actions Applied
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {lastAiResult.operations.map((op, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-card-subtle text-[12.5px] text-foreground"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  <span className="font-semibold">{op.op_type}</span>
                  <span className="text-mutedText truncate max-w-[200px]">
                    {op.title || op.notes}
                  </span>
                </div>
                {op.duration_minutes && (
                  <span className="font-sans text-mutedText">{op.duration_minutes}m</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions if any */}
        {lastAiResult.suggestions && lastAiResult.suggestions.length > 0 && (
          <div className="mt-4">
            <span className="text-[12px] font-semibold text-mutedText uppercase tracking-wider block mb-2">
              Optimization Suggestions
            </span>
            <div className="space-y-1.5">
              {lastAiResult.suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-card-subtle text-[12.5px] text-foreground border border-borderToken"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight size={13} className="text-primary" />
                    <span>{sug}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-borderToken">
          <button
            onClick={closeAiModal}
            className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold shadow-xs"
          >
            Done & View Plan
          </button>
        </div>
      </div>
    </div>
  );
};
