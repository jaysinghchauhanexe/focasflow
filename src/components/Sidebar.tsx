import React, { useEffect } from 'react';
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
  SlidersHorizontal,
  Wind,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    openAiModal,
    openBreathingModal,
    tasks,
    isSidebarCollapsed,
    toggleSidebar
  } = useAppStore();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length || 10;

  // Keyboard shortcut (Ctrl+B / Cmd+B) for quick collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

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
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="h-full bg-card rounded-[28px] p-3.5 flex flex-col justify-between shadow-soft select-none flex-shrink-0 transition-[width,min-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        width: isSidebarCollapsed ? '76px' : '285px',
        minWidth: isSidebarCollapsed ? '76px' : '285px',
      }}
    >
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Brand Header */}
        <div className="flex flex-col pb-3 pt-1 w-full">
          <div className="flex items-center justify-between h-10 px-1 relative w-full">
            {/* Logo & Animated App Name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => isSidebarCollapsed && toggleSidebar()}
                className={`w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                  isSidebarCollapsed ? 'cursor-pointer hover:scale-105' : ''
                }`}
                title={isSidebarCollapsed ? 'Click to expand sidebar (Ctrl+B)' : undefined}
              >
                <img src="/app-icon.png" alt="FocusFlow Icon" className="w-full h-full object-cover" />
              </button>

              {/* App Title & Subtitle with smooth slide & fade animation */}
              <div
                className="flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  maxWidth: isSidebarCollapsed ? '0px' : '150px',
                  opacity: isSidebarCollapsed ? 0 : 1,
                  transform: isSidebarCollapsed ? 'translateX(-12px)' : 'translateX(0)',
                  pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
                }}
              >
                <span className="text-[19px] font-serif font-semibold tracking-tight text-foreground block leading-none">
                  FocusFlow
                </span>
                <span className="text-[11px] text-mutedText font-sans font-medium tracking-wide mt-1">
                  Daily Life OS
                </span>
              </div>
            </div>

            {/* Collapse button on right (smoothly fades when collapsing) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-mutedText hover:text-primary hover:bg-primary-soft transition-all duration-300 flex-shrink-0 cursor-pointer"
              style={{
                opacity: isSidebarCollapsed ? 0 : 1,
                transform: isSidebarCollapsed ? 'scale(0.7) translateX(8px)' : 'scale(1) translateX(0)',
                pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
              }}
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={19} strokeWidth={1.9} className="transition-transform duration-150 hover:scale-110" />
            </button>
          </div>

          {/* Collapsed Expand Button (Smooth drop-in directly below the logo) */}
          <div
            className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex justify-center w-full"
            style={{
              maxHeight: isSidebarCollapsed ? '38px' : '0px',
              opacity: isSidebarCollapsed ? 1 : 0,
              transform: isSidebarCollapsed ? 'translateY(0)' : 'translateY(-8px)',
              pointerEvents: isSidebarCollapsed ? 'auto' : 'none',
            }}
          >
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-8 h-8 mt-1.5 rounded-xl flex items-center justify-center text-mutedText hover:text-primary hover:bg-primary-soft bg-card-subtle transition-all duration-200 cursor-pointer"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={19} strokeWidth={1.9} className="transition-transform duration-150 hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5 flex-1 w-full mt-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.isAction) {
                    openAiModal();
                  } else if (item.isBreathing) {
                    openBreathingModal();
                  } else {
                    setCurrentTab(item.id as any);
                  }
                }}
                title={isSidebarCollapsed ? `${item.label}${item.badge !== undefined ? ` (${item.badge})` : ''}` : undefined}
                className={`w-full h-11 flex items-center px-2.5 rounded-2xl text-[14px] font-medium transition-all duration-150 relative overflow-hidden group cursor-pointer ${isActive
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-textSecondary hover:text-foreground hover:bg-card-subtle'
                  }`}
              >
                {/* Fixed Icon container - Perfectly stationary during expand & collapse */}
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 relative">
                  <Icon
                    size={19}
                    className={`transition-colors duration-150 ${isActive ? 'text-primary' : 'text-mutedText group-hover:text-foreground'
                      }`}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />

                  {/* Compact notification badge dot when collapsed */}
                  {item.badge !== undefined && (
                    <span
                      className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{
                        opacity: isSidebarCollapsed ? 1 : 0,
                        transform: isSidebarCollapsed ? 'scale(1)' : 'scale(0.3)',
                        pointerEvents: 'none',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Animated Text Label and Expanded Badge container */}
                <div
                  className="flex items-center justify-between flex-1 min-w-0 ml-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap overflow-hidden"
                  style={{
                    maxWidth: isSidebarCollapsed ? '0px' : '190px',
                    opacity: isSidebarCollapsed ? 0 : 1,
                    transform: isSidebarCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                    pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
                  }}
                >
                  <span className={`text-[14px] truncate ${isActive ? 'font-semibold text-primary' : 'text-textSecondary'}`}>
                    {item.label}
                  </span>

                  {item.badge !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 transition-colors ${isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-primary-soft text-primary'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-2 pt-2 border-t border-borderToken w-full overflow-hidden">
        {/* Settings */}
        <div className="space-y-1 w-full">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id as any)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full h-10 flex items-center px-2.5 rounded-2xl text-[14px] font-medium transition-all duration-150 relative overflow-hidden group cursor-pointer ${isActive
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-textSecondary hover:text-foreground hover:bg-card-subtle'
                  }`}
              >
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                  <Icon
                    size={19}
                    className={`transition-colors duration-150 ${isActive ? 'text-primary' : 'text-mutedText group-hover:text-foreground'
                      }`}
                    strokeWidth={1.9}
                  />
                </div>
                <div
                  className="flex-1 min-w-0 ml-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap overflow-hidden text-left"
                  style={{
                    maxWidth: isSidebarCollapsed ? '0px' : '180px',
                    opacity: isSidebarCollapsed ? 0 : 1,
                    transform: isSidebarCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                    pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
                  }}
                >
                  <span className={isActive ? 'font-semibold text-primary' : 'text-textSecondary'}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* User Profile Card */}
        <div
          className="h-12 w-full px-2 rounded-2xl bg-card-subtle flex items-center transition-all duration-300 relative overflow-hidden"
          title={isSidebarCollapsed ? 'Jay (Active)' : undefined}
        >
          <div className="relative flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-card shadow-xs">
            <img
              src="/avatar_jay.jpg"
              alt="Jay"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Sliding & Fading user details */}
          <div
            className="flex items-center justify-between flex-1 min-w-0 ml-2.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap overflow-hidden"
            style={{
              maxWidth: isSidebarCollapsed ? '0px' : '180px',
              opacity: isSidebarCollapsed ? 0 : 1,
              transform: isSidebarCollapsed ? 'translateX(-10px)' : 'translateX(0)',
              pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
            }}
          >
            <div className="text-left min-w-0">
              <h4 className="text-[13px] font-semibold text-foreground leading-tight truncate">Jay</h4>
              <p className="text-[10.5px] text-mutedText font-medium leading-tight mt-0.5 truncate">Stay calm & focused</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-tag-health flex-shrink-0 ml-2" title="Active" />
          </div>

          {/* Active status indicator on avatar in collapsed mode */}
          <span
            className="absolute bottom-1.5 left-7 w-2.5 h-2.5 rounded-full bg-tag-health border-2 border-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              opacity: isSidebarCollapsed ? 1 : 0,
              transform: isSidebarCollapsed ? 'scale(1)' : 'scale(0.3)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </aside>
  );
};
