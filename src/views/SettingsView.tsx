import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, Clock, Sparkles, Check, SlidersHorizontal, ArrowRight } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, openOnboarding, setCurrentTab } = useAppStore();

  const [userName, setUserName] = useState(settings.userName);
  const [wakeTime, setWakeTime] = useState(settings.wakeTime);
  const [sleepTime, setSleepTime] = useState(settings.sleepTime);
  const [workStart, setWorkStart] = useState(settings.workStart);
  const [workEnd, setWorkEnd] = useState(settings.workEnd);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey);
  const [model, setModel] = useState(settings.openRouterModel);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName,
      wakeTime,
      sleepTime,
      workStart,
      workEnd,
      breakDuration: Number(breakDuration),
      openRouterApiKey: apiKey,
      openRouterModel: model,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const models = [
    { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (Fast & Accurate)' },
    { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (Low latency)' },
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Balanced)' },
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct (Open Source)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-14 sm:pb-16 select-none w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
            Account & System Settings
          </h2>
          <p className="text-[13px] text-mutedText mt-0.5">
            Configure profile identities, daily schedule boundaries, working capacity hours, and OpenRouter AI integrations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('preferences')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-soft hover:bg-primary/20 text-primary text-[13px] font-semibold transition-all cursor-pointer border border-primary/20 self-start md:self-auto"
        >
          <SlidersHorizontal size={15} />
          <span>Manage Themes & Preferences</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Row 1: Profile & Schedule (Left) | AI Integration (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Personal Profile & Schedule Windows */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Personal Profile */}
            <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-4 transition-colors">
              <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
                <User size={18} className="text-primary" />
                <h3 className="text-[17px] font-serif font-semibold text-foreground">
                  Personal Profile
                </h3>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                  Your Name (for Hero Greetings)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13.5px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Schedule & Working Constraints */}
            <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-4 transition-colors flex-1">
              <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
                <Clock size={18} className="text-primary" />
                <h3 className="text-[17px] font-serif font-semibold text-foreground">
                  Schedule & Capacity Windows
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                    Wake-up Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13.5px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                    Sleep Time (Hard Boundary)
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13.5px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                    Working Hours Start
                  </label>
                  <input
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13.5px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                    Working Hours End
                  </label>
                  <input
                    type="time"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13.5px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                  Default Break Buffer (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13.5px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Right Column: AI Gateway / OpenRouter */}
          <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-4 transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
                <Sparkles size={18} className="text-primary" />
                <h3 className="text-[17px] font-serif font-semibold text-foreground">
                  OpenRouter AI Integration
                </h3>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                  OpenRouter API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13px] font-sans text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                />
                <p className="text-[11.5px] text-mutedText mt-1.5">
                  Keys are stored securely in your local environment. If left blank, offline heuristic parsing is used.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card-subtle border border-borderToken/50 mt-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-[13px] mb-1">
                <Sparkles size={15} />
                <span>AI Natural Language Assistant</span>
              </div>
              <p className="text-[12px] text-mutedText leading-relaxed">
                Use natural language to plan your day, batch create tasks, schedule focused deep work intervals, and auto-balance routine wellness.
              </p>
            </div>
          </div>
        </div>

        {/* Submit & Onboarding Actions Bar */}
        <div className="sticky bottom-0 z-30 bg-card/95 backdrop-blur-xl border border-borderToken rounded-[28px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-all duration-200">
          <button
            type="button"
            onClick={openOnboarding}
            className="px-5 py-2.5 rounded-2xl bg-card-subtle hover:bg-card-muted text-textSecondary text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={15} className="text-primary" />
            <span>Launch Onboarding Setup</span>
          </button>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-[13px] text-tag-health font-semibold flex items-center gap-1.5 animate-fade-in">
                <Check size={15} />
                <span>Settings Saved</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-[13px] font-semibold transition-all cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
