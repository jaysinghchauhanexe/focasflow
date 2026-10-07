import React from 'react';
import { HeaderHero } from '../components/HeaderHero';
import { ProductivitySummary } from '../components/ProductivitySummary';
import { CurrentTaskBanner } from '../components/CurrentTaskBanner';
import { TodayTasksCard } from '../components/TodayTasksCard';
import { QuickActionsCard } from '../components/QuickActionsCard';

export const TodayView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12 sm:pb-16 w-full max-w-[1600px] mx-auto">
      {/* Top Row: Header Hero & Productivity Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch w-full">
        <div className="flex w-full">
          <HeaderHero />
        </div>
        <div className="flex w-full">
          <ProductivitySummary />
        </div>
      </div>

      {/* Spotlight: Focusing Now / What's Next Banner */}
      <CurrentTaskBanner />

      {/* Main Content Row: Today Tasks Left (8 cols), Quick Actions Right (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch w-full">
        <div className="xl:col-span-8 flex w-full">
          <TodayTasksCard />
        </div>
        <div className="xl:col-span-4 flex w-full">
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
};
