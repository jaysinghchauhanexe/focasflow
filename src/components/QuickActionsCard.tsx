import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus } from 'lucide-react';

export const QuickActionsCard: React.FC = () => {
  const { openTaskModal } = useAppStore();

  const actions = [
    { label: 'Add Task', onClick: () => openTaskModal() },
    { label: 'Add Task', onClick: () => openTaskModal() },
    { label: 'Add Task', onClick: () => openTaskModal() },
    { label: 'Add Task', onClick: () => openTaskModal() },
  ];

  return (
    <div className="w-full bg-white rounded-[24px] p-6 lg:p-7 shadow-soft select-none flex flex-col justify-start">
      <h3 className="text-[24px] lg:text-[26px] font-serif font-normal text-[#05313A] tracking-tight mb-6">
        Quick Actions
      </h3>

      {/* 2x2 Grid matching reference design */}
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="flex items-center justify-center gap-2 py-4 px-3 rounded-[14px] bg-[#E1F0F5] hover:bg-[#D4EBF3] text-[#05313A] text-[14px] font-medium transition-all duration-150 group shadow-xs"
          >
            <Plus
              size={16}
              className="text-[#05313A] group-hover:scale-110 transition-transform"
            />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
