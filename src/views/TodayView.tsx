import React from 'react';
import { HeaderHero } from '../components/HeaderHero';
import { ProductivitySummary } from '../components/ProductivitySummary';
import { TodayTasksCard } from '../components/TodayTasksCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { AiCommandBar } from '../components/AiCommandBar';

export const TodayView: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-4 w-full">
      {/* Top Row: Exactly Equal Width (50% / 50% on xl+) and Matching 350px Height */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch w-full">
        <div className="flex w-full">
          <HeaderHero />
        </div>
        <div className="flex w-full">
          <ProductivitySummary />
        </div>
      </div>

      {/* Main Content Row: Today Tasks Left (8 cols on xl+), Quick Actions Right (4 cols on xl+) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch w-full">
        <div className="xl:col-span-8 flex w-full">
          <TodayTasksCard />
        </div>
        <div className="xl:col-span-4 flex w-full">
          <QuickActionsCard />
        </div>
      </div>

      {/* Persistent AI Natural Language Command Bar */}
      <AiCommandBar />
    </div>
  );
};
