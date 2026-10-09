import React, { useState, useEffect } from 'react';
import { useAppStore, applyTheme, applyFont } from '../store/useAppStore';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Leaf, 
  Scale, 
  Sparkles, 
  Clock, 
  Sun, 
  Moon, 
  Type, 
  Palette,
  Flag,
  ArrowRight
} from 'lucide-react';
import { AppTheme, Priority, Category } from '../types';

/* Mountain Sunrise Serene Illustration for Welcome & Finish */
const MountainSunriseGraphic: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    className={`relative select-none pointer-events-none flex items-center justify-center overflow-visible ${className}`}
    style={{
      maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, black 70%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, black 70%, transparent 100%)',
      maskComposite: 'intersect',
      WebkitMaskComposite: 'destination-in',
    }}
  >
    <svg
      viewBox="0 0 260 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[260px] h-[80px]"
    >
      <defs>
        <linearGradient id="onbSunGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="onbMountBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="onbMountMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.48" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="onbMountFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.20" />
        </linearGradient>
      </defs>
      
      {/* Soft Golden Rising Sun */}
      <circle cx="118" cy="38" r="22" fill="url(#onbSunGlow)" />
      
      {/* Flying Birds */}
      <path d="M 145 18 Q 149 14 153 18 Q 157 14 161 18" stroke="var(--color-primary)" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.65" />
      <path d="M 160 26 Q 163 23 166 26 Q 169 23 172 26" stroke="var(--color-primary)" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.5" />
      
      {/* Background Mountain Layer */}
      <path d="M 0 90 L 0 60 Q 45 28 90 54 T 180 46 L 260 68 L 260 90 Z" fill="url(#onbMountBack)" />
      
      {/* Middle Mountain Layer */}
      <path d="M 12 90 L 55 52 Q 92 26 130 55 T 215 48 L 260 74 L 260 90 Z" fill="url(#onbMountMid)" />
      
      {/* Foreground Mountain Layer */}
      <path d="M 30 90 L 76 40 L 102 58 L 138 30 L 174 64 L 205 48 L 246 80 L 260 90 Z" fill="url(#onbMountFront)" />
    </svg>
  </div>
);

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, completeOnboarding, settings } = useAppStore();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form states
  const [userName, setUserName] = useState(settings.userName || 'Jay');
  const [wakeTime, setWakeTime] = useState(settings.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(settings.sleepTime || '23:00');
  const [focusPriority, setFocusPriority] = useState<'tasks' | 'habits' | 'balance'>('balance');
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(settings.theme || 'green');
  
  // Task state for step 4
  const [taskTitle, setTaskTitle] = useState('Deep Work: Core Project Architecture');
  const [taskDuration, setTaskDuration] = useState(45);
  const [taskPriority, setTaskPriority] = useState<Priority>('important');
  const [taskCategory, setTaskCategory] = useState<Category>('Work');

  // Preview live changes
  useEffect(() => {
    if (isOnboardingOpen) {
      applyTheme(selectedTheme);
    }
  }, [selectedTheme, isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  const themes: Array<{ id: AppTheme; name: string; desc: string; bg: string; card: string; primary: string }> = [
    { id: 'green', name: 'Sage Green', desc: 'Calming, organic forest tones', bg: '#F2F5F2', card: '#FFFFFF', primary: '#24584C' },
    { id: 'teal', name: 'Teal Ocean', desc: 'Serene coastal atmosphere', bg: '#DEEFF6', card: '#FFFFFF', primary: '#328F9B' },
    { id: 'blue', name: 'Sky Blue', desc: 'Clean, open, and spacious', bg: '#EBF3FA', card: '#FFFFFF', primary: '#3B82F6' },
    { id: 'monochrome', name: 'Monochrome', desc: 'Neutral slate & minimalist', bg: '#F4F4F5', card: '#FFFFFF', primary: '#27272A' },
    { id: 'dark', name: 'Midnight Dark', desc: 'Deep focus nighttime mode', bg: '#090D0C', card: '#111716', primary: '#34D399' },
  ];

  const taskInspirations = [
    { title: 'Deep Work: Core Project Architecture', duration: 45, category: 'Work' as Category, priority: 'important' as Priority },
    { title: 'Review Daily Plan & Inbox Zero', duration: 30, category: 'Personal' as Category, priority: 'flexible' as Priority },
    { title: 'Algorithms & Data Structures Practice', duration: 60, category: 'Learning' as Category, priority: 'important' as Priority },
    { title: 'Mindful Reading & Reflection', duration: 25, category: 'Health' as Category, priority: 'flexible' as Priority },
  ];

  const handleFinish = () => {
    completeOnboarding({
      userName,
      focusPriority,
      theme: selectedTheme,
      fontHeading: 'DM Sans',
      wakeTime,
      sleepTime,
      initialTaskTitle: taskTitle,
      initialTaskDuration: taskDuration,
      initialTaskPriority: taskPriority,
      initialTaskCategory: taskCategory,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-card rounded-[32px] p-6 sm:p-9 shadow-soft flex flex-col justify-between max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300">
        
        {/* Top Header & Progress Steps */}
        <div className="flex items-center justify-between pb-6 border-b border-borderToken">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs flex-shrink-0">
              <img src="/app-icon.png" alt="FocusFlow Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[18px] font-serif font-semibold text-foreground leading-tight block">
                FocusFlow Setup
              </span>
              <span className="text-[11.5px] text-mutedText font-medium">
                Step {step} of {totalSteps}
              </span>
            </div>
          </div>

          {/* Step Indicator Pills */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-primary'
                    : s < step
                    ? 'w-3 bg-primary/40'
                    : 'w-2 bg-card-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="py-6 min-h-[330px] flex flex-col justify-center">
          
          {/* STEP 1: Welcome & Identity */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <MountainSunriseGraphic className="mx-auto mb-2" />
                <h2 className="text-[28px] sm:text-[32px] font-serif font-semibold text-foreground tracking-tight leading-tight">
                  Welcome to FocusFlow
                </h2>
                <p className="text-[13.5px] text-mutedText max-w-md mx-auto leading-relaxed">
                  A calm operating system designed for deep work, daily rituals, and serene focus.
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto pt-2">
                <div>
                  <label className="block text-[12px] font-semibold text-textSecondary uppercase tracking-wider mb-2">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-3 rounded-2xl bg-card-subtle text-foreground text-[14px] font-medium border border-borderToken focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-mutedText mb-1.5">
                      <Sun size={13} className="text-amber-500" />
                      <span>Wake-Up Time</span>
                    </label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card-subtle text-foreground text-[13px] font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-mutedText mb-1.5">
                      <Moon size={13} className="text-indigo-400" />
                      <span>Wind-Down Time</span>
                    </label>
                    <input
                      type="time"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card-subtle text-foreground text-[13px] font-medium outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Focus Priority */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <h2 className="text-[26px] sm:text-[30px] font-serif font-semibold text-foreground tracking-tight">
                  What do you prioritize most?
                </h2>
                <p className="text-[13px] text-mutedText max-w-md mx-auto">
                  Tailor your dashboard to match how you like to organize your day.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* Option 1: Tasks */}
                <div
                  onClick={() => setFocusPriority('tasks')}
                  className={`p-4 rounded-[22px] cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden border-2 ${
                    focusPriority === 'tasks'
                      ? 'bg-primary-soft border-primary shadow-xs'
                      : 'bg-card-subtle border-transparent hover:bg-card-muted'
                  }`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Target size={20} />
                    </div>
                    <h3 className="text-[15px] font-serif font-semibold text-foreground mb-1">
                      Tasks & Execution
                    </h3>
                    <p className="text-[11.5px] text-mutedText leading-relaxed">
                      Outcome-driven. Clear priority queues, deadlines, and deep work blocks.
                    </p>
                  </div>
                  {focusPriority === 'tasks' && (
                    <div className="mt-3 flex items-center gap-1 text-[11.5px] font-semibold text-primary">
                      <Check size={14} />
                      <span>Selected</span>
                    </div>
                  )}
                </div>

                {/* Option 2: Habits */}
                <div
                  onClick={() => setFocusPriority('habits')}
                  className={`p-4 rounded-[22px] cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden border-2 ${
                    focusPriority === 'habits'
                      ? 'bg-primary-soft border-primary shadow-xs'
                      : 'bg-card-subtle border-transparent hover:bg-card-muted'
                  }`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Leaf size={20} />
                    </div>
                    <h3 className="text-[15px] font-serif font-semibold text-foreground mb-1">
                      Habits & Rituals
                    </h3>
                    <p className="text-[11.5px] text-mutedText leading-relaxed">
                      Mindful consistency. Daily routines, streaks, wellness, and self-care.
                    </p>
                  </div>
                  {focusPriority === 'habits' && (
                    <div className="mt-3 flex items-center gap-1 text-[11.5px] font-semibold text-primary">
                      <Check size={14} />
                      <span>Selected</span>
                    </div>
                  )}
                </div>

                {/* Option 3: Balance */}
                <div
                  onClick={() => setFocusPriority('balance')}
                  className={`p-4 rounded-[22px] cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden border-2 ${
                    focusPriority === 'balance'
                      ? 'bg-primary-soft border-primary shadow-xs'
                      : 'bg-card-subtle border-transparent hover:bg-card-muted'
                  }`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Scale size={20} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[15px] font-serif font-semibold text-foreground mb-1">
                        Harmonious Balance
                      </h3>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold mb-1">
                      Recommended
                    </span>
                    <p className="text-[11.5px] text-mutedText leading-relaxed">
                      Equal harmony between deep focus outcomes and restorative mindful habits.
                    </p>
                  </div>
                  {focusPriority === 'balance' && (
                    <div className="mt-3 flex items-center gap-1 text-[11.5px] font-semibold text-primary">
                      <Check size={14} />
                      <span>Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Color Theme Atmosphere */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-1">
                <h2 className="text-[26px] sm:text-[30px] font-bold text-foreground tracking-tight">
                  Choose Your Visual Atmosphere
                </h2>
                <p className="text-[13px] text-mutedText max-w-md mx-auto">
                  Experience calibrated serene color themes tuned for peace of mind and focus.
                </p>
              </div>

              {/* Color Theme Options */}
              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-semibold text-textSecondary uppercase tracking-wider mb-2.5">
                  <Palette size={14} className="text-primary" />
                  <span>Color Theme</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTheme(t.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border-2 ${
                        selectedTheme === t.id
                          ? 'bg-primary-soft border-primary shadow-xs'
                          : 'bg-card-subtle border-transparent hover:bg-card-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: t.bg }} />
                          <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: t.primary }} />
                        </div>
                        <div>
                          <span className="text-[14px] font-semibold text-foreground block">
                            {t.name}
                          </span>
                          <span className="text-[11.5px] text-mutedText block">
                            {t.desc}
                          </span>
                        </div>
                      </div>
                      {selectedTheme === t.id && (
                        <Check size={16} className="text-primary shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Task Intention */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <h2 className="text-[26px] sm:text-[30px] font-serif font-semibold text-foreground tracking-tight">
                  Plant Your First Intention
                </h2>
                <p className="text-[13px] text-mutedText max-w-md mx-auto">
                  What is the most important outcome you want to achieve today?
                </p>
              </div>

              {/* Inspiration Chips */}
              <div className="space-y-2">
                <span className="text-[11.5px] font-semibold text-mutedText uppercase tracking-wider block">
                  Quick Inspirations
                </span>
                <div className="flex flex-wrap gap-2">
                  {taskInspirations.map((insp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTaskTitle(insp.title);
                        setTaskDuration(insp.duration);
                        setTaskCategory(insp.category);
                        setTaskPriority(insp.priority);
                      }}
                      className="px-3 py-1.5 rounded-full bg-card-subtle hover:bg-card-muted text-textSecondary text-[12px] font-medium transition-all"
                    >
                      {insp.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Title Input */}
              <div>
                <label className="block text-[12px] font-semibold text-textSecondary uppercase tracking-wider mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Design app architecture..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-foreground text-[14px] font-medium border border-borderToken focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Duration & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-[11.5px] font-semibold text-mutedText mb-1.5">
                    <Clock size={13} />
                    <span>Focus Duration</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[25, 45, 60, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTaskDuration(d)}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-all ${
                          taskDuration === d
                            ? 'bg-primary text-white font-semibold'
                            : 'bg-card-subtle text-textSecondary hover:bg-card-muted'
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11.5px] font-semibold text-mutedText mb-1.5">
                    <Flag size={13} />
                    <span>Priority</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTaskPriority('important')}
                      className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-all ${
                        taskPriority === 'important'
                          ? 'bg-[#E5484D]/15 text-[#E5484D] font-semibold ring-1 ring-[#E5484D]/30'
                          : 'bg-card-subtle text-textSecondary hover:bg-card-muted'
                      }`}
                    >
                      Important
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskPriority('flexible')}
                      className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-all ${
                        taskPriority === 'flexible'
                          ? 'bg-[#D97706]/15 text-[#D97706] font-semibold ring-1 ring-[#D97706]/30'
                          : 'bg-card-subtle text-textSecondary hover:bg-card-muted'
                      }`}
                    >
                      Flexible
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Ready & Summary */}
          {step === 5 && (
            <div className="space-y-6 text-center animate-fadeIn">
              <MountainSunriseGraphic className="mx-auto" />

              <div className="space-y-2">
                <h2 className="text-[28px] sm:text-[32px] font-serif font-semibold text-foreground tracking-tight">
                  You're Ready, {userName || 'Friend'}
                </h2>
                <p className="text-[13.5px] text-mutedText max-w-md mx-auto leading-relaxed">
                  Your personalized sanctuary of daily clarity and calm focus has been configured.
                </p>
              </div>

              {/* Summary Capsule Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-1">
                <div className="bg-card-subtle rounded-2xl p-3 text-center">
                  <span className="text-[11px] font-semibold text-mutedText uppercase tracking-wider block">
                    Priority
                  </span>
                  <span className="text-[13px] font-semibold text-foreground capitalize mt-0.5 block">
                    {focusPriority}
                  </span>
                </div>

                <div className="bg-card-subtle rounded-2xl p-3 text-center">
                  <span className="text-[11px] font-semibold text-mutedText uppercase tracking-wider block">
                    Active Hours
                  </span>
                  <span className="text-[13px] font-semibold text-foreground mt-0.5 block">
                    {wakeTime} – {sleepTime}
                  </span>
                </div>

                <div className="bg-card-subtle rounded-2xl p-3 text-center">
                  <span className="text-[11px] font-semibold text-mutedText uppercase tracking-wider block">
                    Theme
                  </span>
                  <span className="text-[13px] font-semibold text-foreground capitalize mt-0.5 block">
                    {selectedTheme}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-borderToken">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-card-subtle hover:bg-card-muted text-textSecondary text-[13px] font-medium transition-all"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13.5px] font-semibold shadow-xs transition-all"
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[14px] font-semibold shadow-xs transition-all transform hover:scale-[1.02]"
            >
              <Sparkles size={16} />
              <span>Enter FocusFlow</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
