import React, { useState, useEffect } from 'react';
import { useAppStore, applyTheme } from '../store/useAppStore';
import { AppTheme } from '../types';
import { User, Clock, Sparkles, Check, Palette, Moon, Sun, Monitor } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

  const [theme, setTheme] = useState<AppTheme>(settings.theme || 'green');
  const [userName, setUserName] = useState(settings.userName);
  const [wakeTime, setWakeTime] = useState(settings.wakeTime);
  const [sleepTime, setSleepTime] = useState(settings.sleepTime);
  const [workStart, setWorkStart] = useState(settings.workStart);
  const [workEnd, setWorkEnd] = useState(settings.workEnd);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey);
  const [model, setModel] = useState(settings.openRouterModel);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme]);

  const handleSelectTheme = (selectedTheme: AppTheme) => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
    updateSettings({ theme: selectedTheme });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    applyTheme(theme);
    updateSettings({
      theme,
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

  const themes: { id: AppTheme; name: string; desc: string; primary: string; bg: string; card: string; text: string }[] = [
    {
      id: 'green',
      name: 'Calm Sage & Forest',
      desc: 'Tranquil eucalyptus & soft mist',
      primary: '#24584C',
      bg: '#F2F5F2',
      card: '#FFFFFF',
      text: '#122824',
    },
    {
      id: 'teal',
      name: 'Serene Teal',
      desc: 'Focus teal #328F9B & gentle cyan wash',
      primary: '#328F9B',
      bg: '#E9F4F6',
      card: '#FFFFFF',
      text: '#08282F',
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      desc: 'Crisp sky blue #2D90E0 & soft ice',
      primary: '#2D90E0',
      bg: '#EDF4FC',
      card: '#FFFFFF',
      text: '#0B2338',
    },
    {
      id: 'monochrome',
      name: 'Editorial Monochrome',
      desc: 'Minimalist slate & pure neutral paper',
      primary: '#1E293B',
      bg: '#F4F4F6',
      card: '#FFFFFF',
      text: '#0F172A',
    },
    {
      id: 'dark',
      name: 'Midnight Dark',
      desc: 'Deep obsidian & glowing cyan accents',
      primary: '#38BDF8',
      bg: '#0A0F1D',
      card: '#131B2E',
      text: '#F8FAFC',
    },
  ];

  const models = [
    { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (Fast & Accurate)' },
    { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (Low latency)' },
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Balanced)' },
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct (Open Source)' },
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-10 select-none max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft border border-borderToken transition-colors">
        <h2 className="text-[24px] sm:text-[26px] font-serif font-medium text-foreground tracking-tight">
          Application Preferences & Aesthetics
        </h2>
        <p className="text-[13px] text-mutedText mt-0.5">
          Customize themes, schedule boundaries, sleep constraints, and AI assistance.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Appearance & Color Themes */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-4 border border-borderToken transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
            <Palette size={18} className="text-primary" />
            <div>
              <h3 className="text-[17px] font-serif font-semibold text-foreground">
                Color Palette & Theme
              </h3>
              <p className="text-[12px] text-mutedText">
                Instant full-app color theme switching with custom design tokens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTheme(t.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-card shadow-sm'
                      : 'border-borderToken hover:border-primary/50 bg-card-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 border border-black/5">
                      <span
                        className="w-5 h-5 rounded-lg shadow-xs"
                        style={{ backgroundColor: t.bg }}
                        title="Background"
                      />
                      <span
                        className="w-5 h-5 rounded-lg shadow-xs"
                        style={{ backgroundColor: t.card }}
                        title="Card Surface"
                      />
                      <span
                        className="w-5 h-5 rounded-lg shadow-xs"
                        style={{ backgroundColor: t.primary }}
                        title="Primary Accent"
                      />
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[13.5px] font-semibold text-foreground leading-tight">
                      {t.name}
                    </h4>
                    <p className="text-[11.5px] text-mutedText mt-0.5 leading-snug">
                      {t.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personal Profile */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-4 border border-borderToken transition-colors">
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
              className="w-full max-w-sm px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13.5px] text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Schedule & Working Constraints */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-4 border border-borderToken transition-colors">
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
                className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13.5px] text-foreground"
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
                className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13.5px] text-foreground"
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
                className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13.5px] text-foreground"
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
                className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13.5px] text-foreground"
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
              className="w-full max-w-xs px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13.5px] text-foreground"
            />
          </div>
        </div>

        {/* AI Gateway / OpenRouter */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-4 border border-borderToken transition-colors">
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
              className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13px] font-mono text-foreground"
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
              className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-[13px] text-tag-health font-semibold flex items-center gap-1.5">
              <Check size={15} />
              <span>Preferences & Theme Saved</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold shadow-xs transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
