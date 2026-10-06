import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './views/TodayView';
import { TasksView } from './views/TasksView';
import { HabitsView } from './views/HabitsView';
import { RoutinesView } from './views/RoutinesView';
import { GoalsView } from './views/GoalsView';
import { ScheduleView } from './views/ScheduleView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { TaskModal } from './components/TaskModal';
import { HabitModal } from './components/HabitModal';
import { CommitmentModal } from './components/CommitmentModal';
import { AiResultModal } from './components/AiResultModal';
import { OverloadModal } from './components/OverloadModal';

export const App: React.FC = () => {
  const { currentTab, replanDay } = useAppStore();

  useEffect(() => {
    // Initial calculation of daily capacity and schedule
    replanDay();
  }, []);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'today':
        return <TodayView />;
      case 'tasks':
        return <TasksView />;
      case 'habits':
        return <HabitsView />;
      case 'routines':
        return <RoutinesView />;
      case 'goals':
        return <GoalsView />;
      case 'schedule':
        return <ScheduleView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#DEEFF6] p-6 lg:p-7 overflow-hidden gap-6 font-sans antialiased text-[#05313A]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area with matched symmetrical padding */}
      <main className="flex-1 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {renderActiveView()}
      </main>

      {/* Modals & Dialogs */}
      <TaskModal />
      <HabitModal />
      <CommitmentModal />
      <AiResultModal />
      <OverloadModal />
    </div>
  );
};

export default App;
