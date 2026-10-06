import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Home, 
  CheckSquare, 
  Calendar,
  Target, 
  Compass,
  Repeat,
  BarChart2, 
  Sparkles,
  Settings,
  Wind,
  Leaf
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, openAiModal, openBreathingModal, tasks } = useAppStore();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length || 13;

  const mainNavItems = [
    { id: 'today', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'schedule', label: 'Calendar', icon: Calendar },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'routines', label: 'Routines', icon: Repeat },
    { id: 'goals', label: 'Vision & Goals', icon: Compass },
    { id: 'history', label: 'Reflections', icon: BarChart2 },
    { id: 'breathing', label: 'Breathing', icon: Wind, isBreathing: true },
    { id: 'ai-planner', label: 'AI Assistant', icon: Sparkles, isAction: true },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] min-w-[260px] h-full bg-card rounded-[28px] p-5 flex flex-col justify-between shadow-soft select-none flex-shrink-0 transition-colors">
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-5">
          {/* Stylized FocusFlow Logo */}
          <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xs">
            <Leaf size={19} className="transform -rotate-12" />
          </div>
          <div>
            <span className="text-[20px] font-serif font-semibold tracking-tight text-foreground block leading-none">
              FocusFlow
            </span>
            <span className="text-[11px] text-mutedText font-sans font-medium tracking-wide">
              Daily Life OS
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 flex-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    openAiModal();
                  } else if (item.isBreathing) {
                    openBreathingModal();
                  } else {
                    setCurrentTab(item.id as any);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-textSecondary hover:text-foreground hover:bg-card-subtle'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={18} 
                    className={isActive ? 'text-primary' : 'text-mutedText'} 
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  <span className={isActive ? 'font-semibold text-primary' : 'text-textSecondary'}>
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-primary-soft text-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-2.5 pt-2 border-t border-borderToken">
        {/* Settings */}
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-textSecondary hover:text-foreground hover:bg-card-subtle'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-mutedText'} strokeWidth={1.9} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Profile Card */}
        <div className="p-2.5 rounded-2xl bg-card-subtle flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <img 
              src="/avatar_jay.jpg" 
              alt="Jay" 
              className="w-9 h-9 rounded-full object-cover border border-card shadow-xs"
            />
            <div className="text-left">
              <h4 className="text-[13.5px] font-semibold text-foreground leading-tight">Jay</h4>
              <p className="text-[11px] text-mutedText font-medium leading-tight mt-0.5">Stay calm & focused</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-tag-health" title="Active" />
        </div>
      </div>
    </aside>
  );
};
