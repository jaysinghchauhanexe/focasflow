import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Home, 
  CheckSquare, 
  Calendar,
  Target, 
  FileText,
  BarChart2, 
  Sparkles,
  Settings,
  HelpCircle,
  Crown
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, openAiModal, tasks } = useAppStore();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length || 13;

  const mainNavItems = [
    { id: 'today', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'schedule', label: 'Calendar', icon: Calendar },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'goals', label: 'Notes', icon: FileText },
    { id: 'history', label: 'Analytics', icon: BarChart2 },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles, isAction: true },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle, isAction: true },
  ];

  return (
    <aside className="w-[270px] min-w-[270px] h-full bg-white rounded-[26px] p-5 flex flex-col justify-between shadow-soft select-none flex-shrink-0">
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-2 pt-2 pb-6">
          {/* Stylized FocusFlow Logo */}
          <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ff-top-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
                <linearGradient id="ff-bot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#0369A1" />
                </linearGradient>
              </defs>
              {/* Top Cyan Bar */}
              <rect x="2" y="3.5" width="27" height="7" rx="3.5" fill="url(#ff-top-grad)" />
              {/* Middle Bar */}
              <rect x="2" y="13.5" width="22" height="7" rx="3.5" fill="url(#ff-bot-grad)" />
              {/* Vertical Stem */}
              <path d="M2 17C2 15.067 3.567 13.5 5.5 13.5H9C10.933 13.5 12.5 15.067 12.5 17V28.5C12.5 31.5376 10.0376 34 7 34C3.96243 34 2 31.5376 2 28.5V17Z" fill="url(#ff-bot-grad)" />
            </svg>
          </div>
          <span className="text-[21px] font-bold tracking-tight text-[#0F243E]">FocusFlow</span>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5 flex-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    openAiModal();
                  } else {
                    setCurrentTab(item.id as any);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[15px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#E6F4FE] text-[#0369A1] font-semibold'
                    : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon 
                    size={20} 
                    className={isActive ? 'text-[#0284C7]' : 'text-[#334155]'} 
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  <span className={isActive ? 'font-semibold text-[#0369A1]' : 'text-[#334155]'}>
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-[#BAE6FD] text-[#0369A1]' 
                      : 'bg-[#E0F2FE] text-[#0284C7]'
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
      <div className="space-y-3 pt-3">
        {/* Subtle Divider */}
        <div className="border-t border-slate-100 my-1" />

        {/* Settings & Help */}
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    openAiModal();
                  } else {
                    setCurrentTab(item.id as any);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#E6F4FE] text-[#0369A1] font-semibold'
                    : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#0284C7]' : 'text-[#334155]'} strokeWidth={1.9} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Profile Card */}
        <div className="mt-2 p-2.5 rounded-2xl border border-slate-100 bg-white shadow-xs flex items-center justify-between hover:border-slate-200 transition-colors">
          <div className="flex items-center gap-3">
            <img 
              src="/avatar_jay.jpg" 
              alt="Jay" 
              className="w-10 h-10 rounded-full object-cover shadow-xs border border-white"
            />
            <div className="text-left">
              <h4 className="text-[14px] font-semibold text-[#0F243E] leading-tight">Jay</h4>
              <p className="text-[11.5px] text-[#64748B] font-medium leading-tight mt-0.5">Stay consistent</p>
            </div>
          </div>
          <Crown size={17} className="text-[#F59E0B] fill-[#F59E0B] mr-1.5 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
};

