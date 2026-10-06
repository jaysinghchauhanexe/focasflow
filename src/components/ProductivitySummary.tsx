import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const ProductivitySummary: React.FC = () => {
  const { getDayCapacity, openOverloadModal, tasks } = useAppStore();
  const capacity = getDayCapacity();

  const totalFocusHours = Math.floor(capacity.focusMinutes / 60);
  const totalFocusMins = capacity.focusMinutes % 60;
  const focusTimeString = `${totalFocusHours}h ${totalFocusMins > 0 ? `${totalFocusMins}m` : '00m'}`;

  // Task metrics
  const remainingCount = capacity.remainingTasksCount || 13;
  const importantCount = capacity.importantTasksCount;
  const regularCount = capacity.regularTasksCount;
  const completedCount = capacity.completedTasksCount;

  return (
    <div className="w-full h-[350px] bg-white rounded-[26px] p-5 sm:p-7 shadow-soft select-none flex flex-col justify-between">
      {/* Top Row: Tasks Remaining & Focus Time Progress */}
      <div className="flex items-start justify-between gap-4 sm:gap-6">
        {/* Tasks Remaining Large Counter */}
        <div className="flex-shrink-0">
          <div className="flex items-start leading-none">
            <span
              className="text-[#09223A] tracking-tight text-[46px] sm:text-[56px] md:text-[64px]"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {remainingCount}
            </span>
            <span
              className="text-[20px] sm:text-[24px] md:text-[26px] font-light text-[#09223A]/70 ml-1 -mt-1"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              +
            </span>
          </div>
          <p className="text-[12.5px] sm:text-[14px] text-[#556980] font-normal mt-1 sm:mt-1.5 tracking-tight">
            Tasks Remaining
          </p>
        </div>

        {/* Focus Time Indicator with expanded width */}
        <div className="text-left flex-1 max-w-[340px]">
          <span className="text-[12.5px] sm:text-[13.5px] text-[#556980] font-normal block mb-1.5">
            Focus time
          </span>

          {/* Capsule Track */}
          <div className="w-full h-[46px] sm:h-[52px] rounded-[16px] bg-[#DEF0F5] p-1.5 flex items-center">
            <div
              onClick={capacity.isOverloaded ? openOverloadModal : undefined}
              className={`h-full px-3 sm:px-5 rounded-[12px] flex items-center justify-center text-[12px] sm:text-[13.5px] font-medium text-white shadow-xs cursor-pointer transition-all ${
                capacity.isOverloaded
                  ? 'bg-[#D94B5B] hover:bg-[#c53030]'
                  : 'bg-[#207581] hover:bg-[#1b646e]'
              }`}
              style={{
                width: '45%',
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 3.5px, rgba(255,255,255,0.12) 3.5px, rgba(255,255,255,0.12) 7px)',
              }}
            >
              <span className="whitespace-nowrap font-sans">{focusTimeString}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Expanded Light Blue Container with Tall 3 Metric Cards */}
      <div className="bg-[#DEF0F5] rounded-[22px] p-2.5 sm:p-4 grid grid-cols-3 gap-2.5 sm:gap-4 h-[180px]">
        {/* Important Tasks */}
        <div className="bg-white rounded-[18px] sm:rounded-[20px] py-4 sm:py-6 px-1.5 sm:px-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center h-full">
          <div className="flex items-start justify-center leading-none">
            <span
              className="text-[#09223A] text-[28px] sm:text-[34px] md:text-[36px]"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {importantCount}
            </span>
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#EF4444] ml-1 sm:ml-1.5 mt-1 flex-shrink-0" />
          </div>
          <span className="text-[11.5px] sm:text-[13px] leading-[1.3] text-[#556980] font-normal mt-2 sm:mt-3 block">
            Important<br />Tasks
          </span>
        </div>

        {/* Regular Tasks */}
        <div className="bg-white rounded-[18px] sm:rounded-[20px] py-4 sm:py-6 px-1.5 sm:px-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center h-full">
          <div className="flex items-start justify-center leading-none">
            <span
              className="text-[#09223A] text-[28px] sm:text-[34px] md:text-[36px]"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {regularCount}
            </span>
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#F59E0B] ml-1 sm:ml-1.5 mt-1 flex-shrink-0" />
          </div>
          <span className="text-[11.5px] sm:text-[13px] leading-[1.3] text-[#556980] font-normal mt-2 sm:mt-3 block">
            Regular<br />Tasks
          </span>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-[18px] sm:rounded-[20px] py-4 sm:py-6 px-1.5 sm:px-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center h-full">
          <div className="flex items-start justify-center leading-none">
            <span
              className="text-[#09223A] text-[28px] sm:text-[34px] md:text-[36px]"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {completedCount}
            </span>
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#22C55E] ml-1 sm:ml-1.5 mt-1 flex-shrink-0" />
          </div>
          <span className="text-[11.5px] sm:text-[13px] leading-[1.3] text-[#556980] font-normal mt-2 sm:mt-3 block">
            Completed<br />tasks
          </span>
        </div>
      </div>
    </div>
  );
};

