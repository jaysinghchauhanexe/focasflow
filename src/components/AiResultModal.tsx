import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const AiResultModal: React.FC = () => {
  const { isAiModalOpen, closeAiModal, lastAiResult, applySuggestion } = useAppStore();

  if (!isAiModalOpen || !lastAiResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05313A]/30 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[20px] shadow-float p-6 select-none border border-[rgba(5,49,58,0.06)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(5,49,58,0.06)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[rgba(50,143,155,0.12)] flex items-center justify-center text-[#328F9B]">
              <Sparkles size={16} />
            </div>
            <h3 className="text-xl font-serif font-medium text-[#05313A]">
              Assistant Plan Updates
            </h3>
          </div>
          <button
            onClick={closeAiModal}
            className="p-1 rounded-lg text-[rgba(5,49,58,0.4)] hover:text-[#05313A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#F4F9FB] border border-[rgba(50,143,155,0.15)] text-sm text-[#05313A] font-medium leading-relaxed">
          {lastAiResult.message}
        </div>

        {/* Structured Operations Applied */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-[rgba(5,49,58,0.6)] uppercase tracking-wider block mb-2">
            Validated Actions Applied
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {lastAiResult.operations.map((op, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FAFCFD] border border-[rgba(5,49,58,0.06)] text-xs text-[#05313A]"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#328F9B]" />
                  <span className="font-semibold">{op.op_type}</span>
                  <span className="text-[rgba(5,49,58,0.7)] truncate max-w-[200px]">
                    {op.title || op.notes}
                  </span>
                </div>
                {op.duration_minutes && (
                  <span className="font-mono text-[rgba(5,49,58,0.6)]">{op.duration_minutes}m</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions if any */}
        {lastAiResult.suggestions && lastAiResult.suggestions.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-semibold text-[rgba(5,49,58,0.6)] uppercase tracking-wider block mb-2">
              Optimization Suggestions
            </span>
            <div className="space-y-1.5">
              {lastAiResult.suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[rgba(50,143,155,0.06)] text-xs text-[#05313A]"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight size={13} className="text-[#328F9B]" />
                    <span>{sug}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-[rgba(5,49,58,0.06)]">
          <button
            onClick={closeAiModal}
            className="px-5 py-2 rounded-xl bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold shadow-sm"
          >
            Done & View Plan
          </button>
        </div>
      </div>
    </div>
  );
};
