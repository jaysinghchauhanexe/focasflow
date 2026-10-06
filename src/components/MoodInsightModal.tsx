import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, ArrowRight, Wind, Coffee, Sparkles, Check, Flame, Volume2 } from 'lucide-react';
import { SmoothAutoHeight } from './SmoothAutoHeight';

/* Face SVGs with 1-shot animations matching theme */
interface FaceProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  isActive?: boolean;
}

const StressedFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.2, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-stressed' : 'group-hover:animate-face-stressed'}`}
  >
    <path d="M 6 7.5 L 9 9.5 L 6 11.5" className={isActive ? 'animate-pulse' : ''} />
    <path d="M 18 7.5 L 15 9.5 L 18 11.5" className={isActive ? 'animate-pulse' : ''} />
    <path d="M 7 16.5 Q 9.5 14 12 16.5 Q 14.5 19 17 16.5" />
  </svg>
);

const AnxiousFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.2, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-anxious' : 'group-hover:animate-face-anxious'}`}
  >
    <path d="M 6 6.5 L 9.5 8" />
    <path d="M 18 6.5 L 14.5 8" />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <g className={isActive ? 'animate-sweat-drip' : 'group-hover:animate-sweat-drip'}>
      <path d="M 20.5 4.5 C 20.5 4.5 19.2 5.8 19.2 6.8 C 19.2 7.5 19.7 8 20.5 8 C 21.3 8 21.8 7.5 21.8 6.8 C 21.8 5.8 20.5 4.5 20.5 4.5 Z" fill="currentColor" stroke="none" />
    </g>
    <path d="M 8 16 Q 10 14.5 12 16 Q 14 17.5 16 16" />
  </svg>
);

const OkayFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.2, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <g className={isActive ? 'animate-face-okay' : 'group-hover:animate-face-okay'}>
      <circle cx="8" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
    </g>
    <path d="M 8.5 15.5 H 15.5" />
  </svg>
);

const CalmFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.2, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-calm' : 'group-hover:animate-face-calm'}`}
  >
    <path d="M 6 8.5 Q 8 6.5 10 8.5" />
    <path d="M 14 8.5 Q 16 6.5 18 8.5" />
    <path d="M 8 15 Q 12 18.5 16 15" />
  </svg>
);

const GreatFace: React.FC<FaceProps> = ({ size = 26, className = '', strokeWidth = 2.2, isActive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isActive ? 'animate-face-great' : 'group-hover:animate-face-great'}`}
  >
    <path d="M 6 8.5 C 6 6, 9.5 6, 9.5 8.5" />
    <path d="M 14.5 8.5 C 14.5 6, 18 6, 18 8.5" />
    <path d="M 6.5 13.5 C 6.5 20.5, 17.5 20.5, 17.5 13.5" />
  </svg>
);

const MOOD_OPTIONS = [
  { id: 'stressed', label: 'Stressed', icon: StressedFace, hint: 'Overwhelmed' },
  { id: 'anxious', label: 'Anxious', icon: AnxiousFace, hint: 'Restless' },
  { id: 'okay', label: 'Okay', icon: OkayFace, hint: 'Neutral' },
  { id: 'calm', label: 'Calm', icon: CalmFace, hint: 'Peaceful' },
  { id: 'great', label: 'Great', icon: GreatFace, hint: 'Energized' },
] as const;

export const MoodInsightModal: React.FC = () => {
  const {
    isMoodModalOpen,
    closeMoodModal,
    currentMood,
    setMood,
    lightenTodayLoad,
    openBreathingModal,
    setLofiStation,
    toggleLofi,
    isPlayingLofi,
    activeLofiStation,
    tasks,
    startFocusTask,
  } = useAppStore();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isMoodModalOpen) return null;

  const handleLightenLoad = () => {
    const count = lightenTodayLoad();
    if (count > 0) {
      setFeedbackMessage(`Moved ${count} flexible ${count === 1 ? 'task' : 'tasks'} to tomorrow. Breathing space restored!`);
    } else {
      setFeedbackMessage('All tasks today are essential. Focus only on one single step at a time.');
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleStartTopTask = () => {
    const topTask = tasks.find((t) => t.status !== 'completed' && t.status !== 'skipped');
    if (topTask) {
      startFocusTask(topTask.id);
      closeMoodModal();
    }
  };

  const handlePlayCozyMusic = () => {
    setLofiStation('coffee');
    if (!isPlayingLofi || activeLofiStation !== 'coffee') {
      toggleLofi('coffee');
    }
    setFeedbackMessage('Tuned in to Cozy Cafe Lo-Fi & Morning Jazz');
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const isCozyPlaying = isPlayingLofi && activeLofiStation === 'coffee';

  return (
    <div
      onClick={closeMoodModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4 sm:p-6 animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card w-full max-w-[500px] rounded-[30px] shadow-2xl p-6 sm:p-7 transition-all border border-borderToken animate-enter-up relative overflow-hidden"
      >
        {/* Subtle Ambient Glow in background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10 flex items-start justify-between gap-3 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-[11px] font-semibold tracking-wide uppercase mb-1.5 border border-primary/15">
              <Sparkles size={12} />
              <span>Mood-Adaptive Flow</span>
            </div>
            <h3 className="text-[20px] font-serif font-bold text-foreground tracking-tight">
              Tune Your Day to Your Headspace
            </h3>
          </div>

          <button
            onClick={closeMoodModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-all cursor-pointer border border-borderToken flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Interactive Mood Selector Bar */}
        <div className="relative z-10 my-3.5 p-3 rounded-2xl bg-card-muted/50 border border-borderToken flex flex-col items-center">
          <div className="w-full flex items-center justify-between gap-1 sm:gap-2">
            {MOOD_OPTIONS.map((m) => {
              const Icon = m.icon;
              const isSelected = currentMood === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMood(m.id as any);
                    setFeedbackMessage(null);
                  }}
                  className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer group relative ${
                    isSelected
                      ? 'bg-primary text-white shadow-md scale-[1.03]'
                      : 'text-textSecondary hover:text-foreground hover:bg-card/80'
                  }`}
                  title={`${m.label} (${m.hint})`}
                  aria-label={m.label}
                >
                  <Icon
                    key={`${m.id}-${isSelected ? 'active' : 'idle'}`}
                    size={24}
                    isActive={isSelected}
                    className={isSelected ? 'text-white' : 'text-textSecondary group-hover:text-foreground'}
                    strokeWidth={2.2}
                  />
                  <span className={`text-[11px] font-medium mt-1 leading-none ${isSelected ? 'text-white font-semibold' : 'text-mutedText'}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Smooth Auto-Height Dynamic Container */}
        <SmoothAutoHeight duration={380} className="relative z-10">
          <div className="space-y-3.5 pb-1">
            {/* Dynamic Mood Insight Card */}
            {(currentMood === 'stressed' || currentMood === 'anxious') && (
              <div className="p-4 rounded-2xl bg-tag-importantBg/70 border border-tag-important/20 animate-fade-in flex gap-3.5 items-start transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-tag-important/15 text-tag-important flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[15px] font-serif font-semibold text-tag-important">
                    Protect Your Energy & Peace
                  </h4>
                  <p className="text-[12.5px] text-textSecondary leading-relaxed">
                    Feeling overwhelmed? You don't have to carry everything at once. Let's ease the pressure, play cozy music, and create breathing space.
                  </p>
                </div>
              </div>
            )}

            {(currentMood === 'okay' || currentMood === 'calm') && (
              <div className="p-4 rounded-2xl bg-primary-soft/70 border border-primary/20 animate-fade-in flex gap-3.5 items-start transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[15px] font-serif font-semibold text-primary">
                    {currentMood === 'calm' ? 'Serene & Mindful Momentum' : 'Balanced & Steady Cadence'}
                  </h4>
                  <p className="text-[12.5px] text-textSecondary leading-relaxed">
                    You are in a clear, centered headspace. Let's keep this peaceful rhythm going with cozy coffeehouse tunes and gentle focus.
                  </p>
                </div>
              </div>
            )}

            {currentMood === 'great' && (
              <div className="p-4 rounded-2xl bg-tag-healthBg/70 border border-tag-health/25 animate-fade-in flex gap-3.5 items-start transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-tag-health/15 text-tag-health flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Flame size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[15px] font-serif font-semibold text-tag-health">
                    High Clarity & Peak Flow State
                  </h4>
                  <p className="text-[12.5px] text-textSecondary leading-relaxed">
                    High energy and positive focus! Ride this natural momentum into your highest-priority outcome or immerse yourself in warm cozy rhythms.
                  </p>
                </div>
              </div>
            )}

            {/* Feedback message banner if action executed */}
            {feedbackMessage && (
              <div className="p-3 rounded-xl bg-primary text-white text-[12.5px] font-medium flex items-center gap-2.5 shadow-sm animate-fade-in transition-all duration-300">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span className="flex-1">{feedbackMessage}</span>
              </div>
            )}

            {/* Suggested Flow Action Cards */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-mutedText uppercase tracking-wider">
                  Tailored Suggestions for You
                </span>
              </div>

              {/* ACTION 1: Cozy Music — ALWAYS available & specifically prominent */}
              <div
                onClick={handlePlayCozyMusic}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle hover:bg-card-muted/80 transition-all duration-200 border border-borderToken group cursor-pointer hover:border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-tag-learningBg text-tag-learning flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Coffee size={17} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-foreground group-hover:text-primary transition-colors">
                        Play Cozy Lo-Fi Music
                      </span>
                      {isCozyPlaying && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          <Volume2 size={11} className="animate-pulse" /> Playing
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-mutedText block">
                      Warm coffeehouse jazz & cozy chillhop to soothe your focus
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayCozyMusic();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer flex-shrink-0 ml-2 ${
                    isCozyPlaying
                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                      : 'bg-card hover:bg-primary hover:text-white text-foreground border border-borderToken shadow-xs'
                  }`}
                >
                  {isCozyPlaying ? 'Active' : 'Play'}
                </button>
              </div>

              {/* ACTION 2: Stressed/Anxious => Lighten Load / Breathing */}
              {(currentMood === 'stressed' || currentMood === 'anxious') && (
                <>
                  <div
                    onClick={handleLightenLoad}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle hover:bg-card-muted/80 transition-all duration-200 border border-borderToken group cursor-pointer hover:border-primary/30 animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-tag-importantBg text-tag-important flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <ArrowRight size={17} />
                      </div>
                      <div>
                        <span className="text-[13.5px] font-semibold text-foreground block group-hover:text-primary transition-colors">
                          Lighten Today's Load
                        </span>
                        <span className="text-[12px] text-mutedText block">
                          Postpone flexible & optional tasks to tomorrow with 1 click
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLightenLoad();
                      }}
                      className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-card hover:bg-primary hover:text-white text-foreground border border-borderToken shadow-xs transition-all cursor-pointer flex-shrink-0 ml-2"
                    >
                      Apply
                    </button>
                  </div>

                  <div
                    onClick={() => {
                      closeMoodModal();
                      openBreathingModal();
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle hover:bg-card-muted/80 transition-all duration-200 border border-borderToken group cursor-pointer hover:border-primary/30 animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Wind size={17} />
                      </div>
                      <div>
                        <span className="text-[13.5px] font-semibold text-foreground block group-hover:text-primary transition-colors">
                          2-Minute Box Breathing Reset
                        </span>
                        <span className="text-[12px] text-mutedText block">
                          Calm your nervous system and release muscle tension
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMoodModal();
                        openBreathingModal();
                      }}
                      className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-card hover:bg-primary hover:text-white text-foreground border border-borderToken shadow-xs transition-all cursor-pointer flex-shrink-0 ml-2"
                    >
                      Start
                    </button>
                  </div>
                </>
              )}

              {/* ACTION 3: Calm / Okay / Great => Focus on Top Outcome */}
              {(currentMood === 'okay' || currentMood === 'calm' || currentMood === 'great') && (
                <div
                  onClick={handleStartTopTask}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-card-subtle hover:bg-card-muted/80 transition-all duration-200 border border-borderToken group cursor-pointer hover:border-primary/30 animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles size={17} />
                    </div>
                    <div>
                      <span className="text-[13.5px] font-semibold text-foreground block group-hover:text-primary transition-colors">
                        Focus on Top Outcome
                      </span>
                      <span className="text-[12px] text-mutedText block">
                        Launch timer on your highest-priority outcome in full flow
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTopTask();
                    }}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-card hover:bg-primary hover:text-white text-foreground border border-borderToken shadow-xs transition-all cursor-pointer flex-shrink-0 ml-2"
                  >
                    Start
                  </button>
                </div>
              )}
            </div>
          </div>
        </SmoothAutoHeight>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-borderToken">
          <span className="text-[11.5px] text-mutedText">
            Adaptive suggestions update automatically
          </span>
          <button
            onClick={closeMoodModal}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-[13px] font-semibold transition-all shadow-xs cursor-pointer hover:shadow-md active:scale-95"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};

