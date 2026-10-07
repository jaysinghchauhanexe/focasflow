import React, { useEffect } from 'react';
import { useAppStore, applyTheme, applyFont } from './store/useAppStore';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './views/TodayView';
import { TasksView } from './views/TasksView';
import { AnalyticsView } from './views/AnalyticsView';
import { HabitsView } from './views/HabitsView';
import { RoutinesView } from './views/RoutinesView';
import { GoalsView } from './views/GoalsView';
import { ScheduleView } from './views/ScheduleView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { PreferencesView } from './views/PreferencesView';
import { TaskModal } from './components/TaskModal';
import { HabitModal } from './components/HabitModal';
import { CommitmentModal } from './components/CommitmentModal';
import { AiResultModal } from './components/AiResultModal';
import { OverloadModal } from './components/OverloadModal';
import { BreathingModal } from './components/BreathingModal';
import { OnboardingModal } from './components/OnboardingModal';
import { MoodInsightModal } from './components/MoodInsightModal';
import { LofiBackgroundPlayer } from './components/LofiBackgroundPlayer';
import { setupGlobalClickSoundListener } from './utils/soundEffects';

export const App: React.FC = () => {
  const { currentTab, replanDay, settings, isFocusTimerRunning, setFocusElapsedSeconds } = useAppStore();

  useEffect(() => {
    // Initial calculation of daily capacity and schedule
    replanDay();
    const cleanupClickSounds = setupGlobalClickSoundListener();
    return cleanupClickSounds;
  }, []);

  // Global focus timer ticker
  useEffect(() => {
    let interval: any = null;
    if (isFocusTimerRunning) {
      interval = setInterval(() => {
        setFocusElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusTimerRunning, setFocusElapsedSeconds]);

  useEffect(() => {
    applyTheme(settings.theme || 'green');
  }, [settings.theme]);

  useEffect(() => {
    applyFont(settings.fontHeading || 'Gilda Display');
  }, [settings.fontHeading]);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'today':
        return <TodayView />;
      case 'tasks':
        return <TasksView />;
      case 'analytics':
        return <AnalyticsView />;
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
      case 'preferences':
        return <PreferencesView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div
      data-theme={settings.theme || 'green'}
      className="flex h-screen w-screen bg-background p-5 lg:p-6 overflow-hidden gap-6 font-sans antialiased text-foreground transition-colors duration-200"
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
        {renderActiveView()}
      </main>

      {/* Modals & Dialogs */}
      <TaskModal />
      <HabitModal />
      <CommitmentModal />
      <AiResultModal />
      <OverloadModal />
      <BreathingModal />
      <OnboardingModal />
      <MoodInsightModal />

      {/* Persistent Background Lofi Player */}
      <LofiBackgroundPlayer />
    </div>
  );
};

export default App;
