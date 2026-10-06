import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, Key, Clock, Sparkles, Check, Database, RotateCcw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

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
    <div className="space-y-4 animate-fade-in pb-8 select-none max-w-3xl mx-auto">
      <div className="bg-white rounded-[20px] p-6 shadow-soft">
        <h2 className="text-2xl font-serif font-medium text-[#05313A] tracking-tight">
          Application Preferences & AI Config
        </h2>
        <p className="text-xs text-[rgba(5,49,58,0.6)] mt-0.5">
          Configure personal schedule constraints, sleeping windows, and OpenRouter AI.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Personal Profile */}
        <div className="bg-white rounded-[20px] p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[rgba(5,49,58,0.06)]">
            <User size={18} className="text-[#328F9B]" />
            <h3 className="text-base font-serif font-semibold text-[#05313A]">
              Personal Profile
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Your Name (for Hero Greetings)
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full max-w-sm px-3.5 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A] outline-none"
            />
          </div>
        </div>

        {/* Schedule & Working Constraints */}
        <div className="bg-white rounded-[20px] p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[rgba(5,49,58,0.06)]">
            <Clock size={18} className="text-[#328F9B]" />
            <h3 className="text-base font-serif font-semibold text-[#05313A]">
              Schedule & Capacity Windows
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Wake-up Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Sleep Time (Hard Constraint)
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Working Hours Start
              </label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
                Working Hours End
              </label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              Default Break Buffer (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              className="w-full max-w-xs px-3.5 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
            />
          </div>
        </div>

        {/* AI Gateway / OpenRouter */}
        <div className="bg-white rounded-[20px] p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[rgba(5,49,58,0.06)]">
            <Sparkles size={18} className="text-[#328F9B]" />
            <h3 className="text-base font-serif font-semibold text-[#05313A]">
              OpenRouter AI Integration
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs font-mono text-[#05313A]"
            />
            <p className="text-[11px] text-[rgba(5,49,58,0.5)] mt-1">
              Keys are stored locally in your SQLite database and never exposed. If left blank, offline heuristic parsing is used.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgba(5,49,58,0.7)] uppercase tracking-wider mb-1.5">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F8FCFD] border border-[rgba(5,49,58,0.12)] text-xs text-[#05313A]"
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
            <span className="text-xs text-[#35A853] font-semibold flex items-center gap-1">
              <Check size={14} />
              <span>Preferences Saved</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#328F9B] hover:bg-[#287C87] text-white text-xs font-semibold shadow-sm transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
