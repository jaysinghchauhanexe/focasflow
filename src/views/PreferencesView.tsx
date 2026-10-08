import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, applyTheme, applyFont, defaultPreferences } from '../store/useAppStore';
import { UserPreferences, LofiStationId, AppTheme } from '../types';
import { playCompletionSound, playClickSound } from '../utils/soundEffects';
import {
  SlidersHorizontal,
  Smile,
  Volume2,
  Calendar,
  Sparkles,
  Check,
  RotateCcw,
  Coffee,
  Headphones,
  Music,
  Type,
  Palette,
  Shield,
  Clock,
  Sparkle,
  Play,
  Cpu,
  Code2
} from 'lucide-react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  id?: string;
}

const ToggleSwitch: React.FC<ToggleProps> = ({ checked, onChange, label, id }) => {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
        checked ? 'bg-primary' : 'bg-card-muted hover:bg-borderToken'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export const PreferencesView: React.FC = () => {
  const { settings, updateSettings, updatePreferences } = useAppStore();
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const [theme, setTheme] = useState<AppTheme>(settings.theme || 'green');
  const [fontHeading, setFontHeading] = useState(settings.fontHeading || 'Gilda Display');

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
    if (settings.fontHeading) {
      setFontHeading(settings.fontHeading);
    }
  }, [settings.theme, settings.fontHeading]);

  const preferences: UserPreferences = {
    ...defaultPreferences,
    ...(settings.preferences || {}),
  };

  const handleSelectTheme = (selectedTheme: AppTheme) => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
    updateSettings({ theme: selectedTheme });
    triggerSavedFeedback('Theme updated');
  };

  const handleSelectFont = (fontName: string) => {
    setFontHeading(fontName);
    applyFont(fontName);
    updateSettings({ fontHeading: fontName });
    triggerSavedFeedback('Font updated');
  };

  const handleToggle = (key: keyof UserPreferences) => {
    const nextValue = !preferences[key];
    updatePreferences({ [key]: nextValue });
    triggerSavedFeedback();
  };

  const handleSetStation = (station: LofiStationId) => {
    updatePreferences({ defaultLofiStation: station });
    triggerSavedFeedback('Default soundscape updated');
  };

  const handleResetDefaults = () => {
    updatePreferences(defaultPreferences);
    handleSelectFont('Gilda Display');
    handleSelectTheme('green');
    triggerSavedFeedback('Preferences reset to default values');
  };

  const feedbackTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const triggerSavedFeedback = (msg = 'Preferences saved') => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setSavedFeedback(msg);
    feedbackTimerRef.current = setTimeout(() => setSavedFeedback(null), 2500);
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
      bg: '#DEEFF6',
      card: '#FFFFFF',
      text: '#05313A',
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
      bg: '#030712',
      card: '#0B0F19',
      text: '#F9FAFB',
    },
  ];

  const fontOptions = [
    {
      id: 'Gilda Display',
      name: 'Gilda Display',
      category: 'Classical Serif',
      family: "'Gilda Display', Georgia, serif",
      tag: 'Serif · Editorial & Serene',
      previewText: 'Mindful Flow & Focus',
      desc: 'Graceful classical serif with elegant proportions for a calm, quiet luxury feel.',
    },
    {
      id: 'DM Sans',
      name: 'DM Sans',
      category: 'Geometric Sans',
      family: "'DM Sans', 'Inter', sans-serif",
      tag: 'Sans · Modern & Clean',
      previewText: 'Mindful Flow & Focus',
      desc: 'Clean geometric sans designed for maximum legibility and daily reading comfort.',
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-16 animate-fade-in select-none">
      {/* Page Header */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-serif font-bold text-foreground tracking-tight">
            Application Preferences
          </h1>
          <p className="text-[13.5px] text-mutedText mt-1 max-w-3xl leading-relaxed">
            Customize typography, color theme aesthetics, mood insight pop-ups, background soundscapes, and overtime intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {savedFeedback && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tag-healthBg text-tag-health text-[12px] font-semibold animate-fade-in border border-tag-health/20">
              <Check size={14} strokeWidth={3} />
              <span>{savedFeedback}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-medium text-mutedText hover:text-foreground hover:bg-card-subtle transition-all cursor-pointer border border-borderToken"
            title="Restore initial preferences"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Row 1: Aesthetics & Design System (Typography + Color Theme) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        {/* Typography Studio */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft flex flex-col justify-between transition-colors">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <Type size={18} />
              </div>
              <div>
                <h2 className="text-[17px] font-serif font-semibold text-foreground">
                  Heading & Title Typography
                </h2>
                <p className="text-[12px] text-mutedText">
                  Switch between classical serif or modern geometric sans across all titles.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {fontOptions.map((f) => {
                const isSelected = fontHeading === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelectFont(f.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between border-2 ${
                      isSelected
                        ? 'bg-primary-soft border-primary shadow-xs'
                        : 'bg-card-subtle border-transparent hover:bg-card-muted'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[11px] font-bold text-primary tracking-wide">
                          {f.tag}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <p 
                        className="text-[20px] text-foreground font-medium mb-1 leading-snug"
                        style={{ fontFamily: f.family }}
                      >
                        {f.previewText}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-borderToken/50 mt-3">
                      <span className="text-[13px] font-semibold text-foreground block">
                        {f.name} ({f.category})
                      </span>
                      <p className="text-[11.5px] text-mutedText mt-0.5 leading-snug">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Color Palette & Theme Studio */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft flex flex-col justify-between transition-colors">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <Palette size={18} />
              </div>
              <div>
                <h2 className="text-[17px] font-serif font-semibold text-foreground">
                  Color Palette & Theme
                </h2>
                <p className="text-[12px] text-mutedText">
                  Instant full-app color theme switching with custom calibrated tokens.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between border-2 ${
                      isSelected
                        ? 'bg-primary-soft border-primary shadow-xs'
                        : 'bg-card-subtle border-transparent hover:bg-card-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      {/* Swatch Preview */}
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5">
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
        </div>
      </div>

      {/* Row 2: Mood & Focus Cadence */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        {/* SECTION: MOOD & EMOTIONAL CADENCE */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Smile size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-serif font-semibold text-foreground">
                Mood & Emotional Cadence
              </h2>
              <p className="text-[12px] text-mutedText">
                Control mood interaction pop-ups and expressive animations.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Preference: Mood Pop-up Notifications */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-semibold text-foreground">
                    Mood-Adaptive Flow Pop-ups
                  </span>
                  <span className="text-[10.5px] font-semibold text-primary px-1.5 py-0.5 rounded-full bg-primary-soft">
                    2s Delay
                  </span>
                </div>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  When enabled, clicking a mood face will display supportive suggestions & cozy actions after a 2-second delay. When disabled, your mood is recorded quietly.
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.enableMoodInsightPopups}
                onChange={() => handleToggle('enableMoodInsightPopups')}
                label="Enable Mood-Adaptive Flow Pop-ups"
              />
            </div>

            {/* Preference: Face Expressions & Micro-Animations */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-semibold text-foreground">
                    Expressive Smiley Micro-Animations
                  </span>
                  <span className="text-[10.5px] font-semibold text-tag-health px-1.5 py-0.5 rounded-full bg-tag-healthBg">
                    1-Shot
                  </span>
                </div>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Animate faces with individual emotional expressions on hover/click (tension shiver, sweat drop, calm breath, or joyful bounce).
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.enableMoodFaceAnimations}
                onChange={() => handleToggle('enableMoodFaceAnimations')}
                label="Enable Expressive Smiley Micro-Animations"
              />
            </div>

            {/* Preference: Daily Mood Check-in */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <span className="text-[13.5px] font-semibold text-foreground block">
                  Daily Morning Check-in Prompts
                </span>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Gently invite mindful reflection at the start of your day to balance high-energy outcomes and wellness.
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.enableDailyMoodCheckin}
                onChange={() => handleToggle('enableDailyMoodCheckin')}
                label="Enable Daily Morning Check-in Prompts"
              />
            </div>
          </div>
        </div>

        {/* SECTION: FOCUS, TIMERS & SOUNDSCAPES */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Volume2 size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-serif font-semibold text-foreground">
                Focus, Audio & Soundscapes
              </h2>
              <p className="text-[12px] text-mutedText">
                Configure background lo-fi music habits and overtime intelligence.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Preference: Auto-play music on focus start */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-semibold text-foreground">
                    Auto-Play Cozy Music on Focus Start
                  </span>
                  <span className="text-[10.5px] font-semibold text-tag-learning px-1.5 py-0.5 rounded-full bg-tag-learningBg">
                    Lo-Fi
                  </span>
                </div>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Automatically start playing your preferred cozy soundscape when you launch a task timer.
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.autoPlayMusicOnFocus}
                onChange={() => handleToggle('autoPlayMusicOnFocus')}
                label="Auto-Play Cozy Music on Focus Start"
              />
            </div>

            {/* Default Soundscape Station Selector */}
            <div className="p-4 rounded-2xl bg-card-subtle space-y-2">
              <span className="text-[12px] font-semibold text-mutedText uppercase tracking-wider block">
                Default Focus Soundscape Station
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'coffee', label: 'Cozy Cafe', icon: Coffee, desc: 'Warm jazz' },
                  { id: 'work', label: 'Deep Work', icon: Headphones, desc: 'Synthwave' },
                  { id: 'study', label: 'Study & Chill', icon: Music, desc: 'Chillhop' },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSel = preferences.defaultLofiStation === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSetStation(st.id as LofiStationId)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                        isSel
                          ? 'bg-primary-soft border-primary/50 text-primary'
                          : 'bg-card border-transparent hover:bg-card-muted text-textSecondary'
                      }`}
                    >
                      <Icon size={16} className={isSel ? 'text-primary' : 'text-mutedText'} />
                      <span className={`text-[12px] font-semibold mt-1 ${isSel ? 'text-primary' : 'text-foreground'}`}>
                        {st.label}
                      </span>
                      <span className="text-[10px] text-mutedText">{st.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preference: Task Overtime Warnings */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-semibold text-foreground">
                    Task Overtime Warnings & Buffer Tools
                  </span>
                  <span className="text-[10.5px] font-semibold text-tag-important px-1.5 py-0.5 rounded-full bg-tag-importantBg">
                    Overtime
                  </span>
                </div>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Turn timer pill red with pulse animation when exceeding estimated task duration, and provide 1-click +15m buffer extensions.
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.enableOvertimeAlerts}
                onChange={() => handleToggle('enableOvertimeAlerts')}
                label="Task Overtime Warnings & Buffer Tools"
              />
            </div>

            {/* Preference: Completion Chime (tick-ting.mp3) */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-foreground">
                    Task & Habit Completion Chime
                  </span>
                  <span className="text-[10.5px] font-semibold text-tag-health px-1.5 py-0.5 rounded-full bg-tag-healthBg">
                    Ting-Ting
                  </span>
                </div>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Plays a rewarding physical chime whenever a task, habit, or routine step is completed.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playCompletionSound();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-soft hover:bg-primary/20 text-primary text-[11.5px] font-semibold transition-all cursor-pointer mt-1"
                >
                  <Play size={11} fill="currentColor" />
                  <span>Preview Completion Sound</span>
                </button>
              </div>

              <ToggleSwitch
                checked={preferences.taskCompletionChime}
                onChange={() => handleToggle('taskCompletionChime')}
                label="Task & Habit Completion Chime"
              />
            </div>

            {/* Preference: Tactile Button Click Sound (mouse-click-single.mp3) */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-foreground">
                    Tactile Button Click Feedback
                  </span>
                  <span className="text-[10.5px] font-semibold text-primary px-1.5 py-0.5 rounded-full bg-primary-soft">
                    Mouse Click
                  </span>
                </div>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Plays a crisp physical click sound whenever buttons, tabs, switches, and interactive elements are pressed.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-soft hover:bg-primary/20 text-primary text-[11.5px] font-semibold transition-all cursor-pointer mt-1"
                >
                  <Play size={11} fill="currentColor" />
                  <span>Preview Click Sound</span>
                </button>
              </div>

              <ToggleSwitch
                checked={preferences.enableButtonClickSound}
                onChange={() => handleToggle('enableButtonClickSound')}
                label="Tactile Button Click Feedback"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Schedule Automations & Visual Polish */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        {/* SECTION: SCHEDULE & CAPACITY AUTOMATIONS */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-serif font-semibold text-foreground">
                Schedule & Capacity Intelligence
              </h2>
              <p className="text-[12px] text-mutedText">
                Automated protections against overload and burnout.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Preference: Day Overload Warnings */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <span className="text-[13.5px] font-semibold text-foreground block">
                  Overload Capacity Detection Alerts
                </span>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Alert when scheduled commitments exceed daytime capacity and recommend 1-click rescheduling.
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.enableOverloadWarnings}
                onChange={() => handleToggle('enableOverloadWarnings')}
                label="Overload Capacity Detection Alerts"
              />
            </div>

            {/* Preference: Auto-roll flexible tasks */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <span className="text-[13.5px] font-semibold text-foreground block">
                  Auto-Roll Unfinished Flexible Tasks
                </span>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Seamlessly move unfinished flexible and optional outcomes to the next morning without manual effort.
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.autoRollFlexibleTasks}
                onChange={() => handleToggle('autoRollFlexibleTasks')}
                label="Auto-Roll Unfinished Flexible Tasks"
              />
            </div>

            {/* Preference: Strict Bedtime Boundary */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
              <div className="space-y-0.5 pr-2">
                <span className="text-[13.5px] font-semibold text-foreground block">
                  Strict Bedtime Rest Boundary Protection
                </span>
                <p className="text-[12px] text-mutedText leading-relaxed">
                  Prevent tasks from scheduling past your configured sleep time to safeguard rest.
                </p>
              </div>

              <ToggleSwitch
                checked={preferences.strictBedtimeBoundary}
                onChange={() => handleToggle('strictBedtimeBoundary')}
                label="Strict Bedtime Rest Boundary Protection"
              />
            </div>
          </div>
        </div>

        {/* SECTION: VISUAL POLISH & SHORTCUTS */}
        <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-5 transition-colors flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-[17px] font-serif font-semibold text-foreground">
                  Visual Polish & Interactions
                </h2>
                <p className="text-[12px] text-mutedText">
                  Fluid layout transitions and keyboard power controls.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Preference: Smooth Auto-Height */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
                <div className="space-y-0.5 pr-2">
                  <span className="text-[13.5px] font-semibold text-foreground block">
                    Liquid Smooth Height Transitions
                  </span>
                  <p className="text-[12px] text-mutedText leading-relaxed">
                    Smoothly animate card and list expansions without jarring layout jumps.
                  </p>
                </div>

                <ToggleSwitch
                  checked={preferences.enableSmoothAnimations}
                  onChange={() => handleToggle('enableSmoothAnimations')}
                  label="Liquid Smooth Height Transitions"
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference Card */}
          <div className="p-4 rounded-2xl bg-card-subtle space-y-2.5 mt-4">
            <span className="text-[12px] font-semibold text-mutedText uppercase tracking-wider block">
              Keyboard Power Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card">
                <span className="text-textSecondary">Toggle Sidebar</span>
                <kbd className="px-1.5 py-0.5 rounded bg-card-muted text-[10.5px] font-mono font-bold text-foreground">
                  Ctrl + B
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card">
                <span className="text-textSecondary">AI Assistant</span>
                <kbd className="px-1.5 py-0.5 rounded bg-card-muted text-[10.5px] font-mono font-bold text-foreground">
                  Ctrl + K
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: AI Assistant & Developer Intelligence */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-5 transition-colors">
        <div className="flex items-center gap-2.5 pb-3 border-b border-borderToken">
          <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <Cpu size={18} />
          </div>
          <div>
            <h2 className="text-[17px] font-serif font-semibold text-foreground">
              AI Assistant & Developer Intelligence
            </h2>
            <p className="text-[12px] text-mutedText">
              Configure assistant output formatting and deep debugging telemetry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preference: AI Debug Mode & Raw JSON */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
            <div className="space-y-0.5 pr-2">
              <span className="text-[13.5px] font-semibold text-foreground block">
                Debug AI & JSON Inspector
              </span>
              <p className="text-[12px] text-mutedText leading-relaxed">
                Show &quot;Inspect JSON&quot; technical triggers and latency telemetry on chat bubbles (off by default).
              </p>
            </div>

            <ToggleSwitch
              checked={preferences.enableAiDebugJson || false}
              onChange={() => handleToggle('enableAiDebugJson')}
              label="Debug AI & JSON Inspector"
            />
          </div>

          {/* Preference: Show Executed Operations Breakdown */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card-subtle hover:bg-card-muted/60 transition-colors">
            <div className="space-y-0.5 pr-2">
              <span className="text-[13.5px] font-semibold text-foreground block">
                Show Executed Operations Breakdown
              </span>
              <p className="text-[12px] text-mutedText leading-relaxed">
                Display the detailed action badge list under AI message bubbles instead of text-only (off by default).
              </p>
            </div>

            <ToggleSwitch
              checked={preferences.showAiOperationsByDefault || false}
              onChange={() => handleToggle('showAiOperationsByDefault')}
              label="Show Executed Operations Breakdown"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

