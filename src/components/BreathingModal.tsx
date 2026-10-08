import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Play, Pause, RotateCcw, Flower2, Lightbulb } from 'lucide-react';

export const BreathingModal: React.FC = () => {
  const { isBreathingModalOpen, closeBreathingModal } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [mode, setMode] = useState<'478' | 'box'>('478');

  useEffect(() => {
    if (!isBreathingModalOpen) {
      setIsActive(false);
      setPhase('inhale');
      setSecondsLeft(4);
      setCyclesCompleted(0);
      return;
    }

    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (mode === '478') {
            if (phase === 'inhale') {
              setPhase('hold');
              return 7;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 8;
            } else {
              setPhase('inhale');
              setCyclesCompleted((c) => c + 1);
              return 4;
            }
          } else {
            if (phase === 'inhale') {
              setPhase('hold');
              return 4;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 4;
            } else if (phase === 'exhale') {
              setPhase('rest');
              return 4;
            } else {
              setPhase('inhale');
              setCyclesCompleted((c) => c + 1);
              return 4;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, mode, isBreathingModalOpen]);

  if (!isBreathingModalOpen) return null;

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Inhale Deeply';
      case 'hold': return 'Hold Gently';
      case 'exhale': return 'Exhale Slowly';
      case 'rest': return 'Rest & Settle';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Fill your belly with calm, clean air.';
      case 'hold': return 'Keep your shoulders soft and still.';
      case 'exhale': return 'Release all tension and stress.';
      case 'rest': return 'Pause in peaceful awareness.';
    }
  };

  const getMaxSeconds = () => {
    if (mode === '478') {
      if (phase === 'inhale') return 4;
      if (phase === 'hold') return 7;
      return 8;
    }
    return 4;
  };

  const maxSeconds = getMaxSeconds();
  // We want progress to feel like it's moving *towards* completion of the phase.
  const progressValue = ((maxSeconds - secondsLeft) / maxSeconds) * 100;
  
  const radius = 100;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none"
      onClick={closeBreathingModal}
    >
      <style>
        {`
          @keyframes slideWave {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
      <div 
        className="relative w-full max-w-[460px] bg-card rounded-[36px] shadow-2xl p-7 md:p-8 flex flex-col items-center text-center transition-colors cursor-default border border-borderToken overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-2 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[18px] bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
              <Flower2 size={24} strokeWidth={2} />
            </div>
            <div className="text-left">
              <h3 className="text-[19px] font-semibold text-foreground tracking-tight leading-tight">
                Breathing Reset
              </h3>
              <p className="text-[13px] text-mutedText font-medium mt-0.5">Calm your nervous system</p>
            </div>
          </div>

          <button
            onClick={closeBreathingModal}
            className="w-9 h-9 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-card-muted p-1 rounded-full mb-8 border border-borderToken">
          <button
            onClick={() => { setMode('478'); setPhase('inhale'); setSecondsLeft(4); setIsActive(false); }}
            className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all ${
              mode === '478'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-mutedText hover:text-foreground'
            }`}
          >
            4-7-8 Deep Calm
          </button>
          <button
            onClick={() => { setMode('box'); setPhase('inhale'); setSecondsLeft(4); setIsActive(false); }}
            className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all ${
              mode === 'box'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-mutedText hover:text-foreground'
            }`}
          >
            Box Reset (4-4-4-4)
          </button>
        </div>

        {/* Full width Waves Background */}
        <div className="absolute inset-x-0 bottom-0 top-[30%] overflow-hidden pointer-events-none z-0 rounded-b-[36px]">
          <svg className="absolute bottom-0 w-[200%] text-primary opacity-[0.04] fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ animation: isActive ? 'slideWave 12s linear infinite reverse' : 'none', height: '85%' }}>
            <path d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,149.3C672,160,768,160,864,138.7C960,117,1056,75,1152,85.3C1248,96,1344,160,1392,192L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <svg className="absolute bottom-0 w-[200%] text-primary opacity-[0.08] fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ animation: isActive ? 'slideWave 8s linear infinite' : 'none', height: '70%' }}>
            <path d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,144C672,149,768,203,864,213.3C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Breathing Visualization */}
        <div className="relative w-[260px] h-[260px] flex items-center justify-center mb-8 z-10">
          
          {/* Layer 1: Outer Circle with Inner Shadow */}
          <div className="absolute inset-0 rounded-full bg-transparent border border-borderToken/30 shadow-[inset_0_4px_16px_rgba(0,0,0,0.06)] z-0" />

          {/* Layer 2: SVG Progress Ring */}
          <svg className="absolute w-[240px] h-[240px] rotate-[-90deg] z-10 pointer-events-none">
            <circle
              stroke="var(--tw-colors-primary)"
              strokeOpacity="0.12"
              fill="transparent"
              strokeWidth={7}
              r={116.5}
              cx={120}
              cy={120}
            />
            <circle
              stroke="var(--tw-colors-primary)"
              fill="transparent"
              strokeWidth={7}
              strokeDasharray={2 * Math.PI * 116.5}
              style={{ 
                strokeDashoffset: (2 * Math.PI * 116.5) - (progressValue / 100) * (2 * Math.PI * 116.5), 
                transition: isActive ? 'stroke-dashoffset 1s linear' : 'none' 
              }}
              r={116.5}
              cx={120}
              cy={120}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Layer 2: Progress Dot Marker */}
          <div 
            className="absolute z-20 w-[18px] h-[18px] rounded-full bg-card shadow-md flex items-center justify-center"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${(progressValue / 100) * 360 - 90}deg) translate(116.5px) rotate(${-(progressValue / 100) * 360 + 90}deg)`,
              transition: isActive ? 'transform 1s linear' : 'none'
            }}
          >
            <div className="w-[10px] h-[10px] rounded-full bg-primary" />
          </div>

          {/* Layer 3: Inner Circle with Drop Shadow (Spacing from timer stroke) */}
          <div className="absolute w-[180px] h-[180px] rounded-full bg-card shadow-[0_4px_24px_rgba(0,0,0,0.08)] z-10 flex flex-col items-center justify-center">
            {/* Timer Display inside circle */}
            <span className="text-[12px] font-bold text-primary/80 uppercase tracking-widest mb-0.5">
              {phase}
            </span>
            <div className="flex items-baseline gap-1 text-primary">
              <span className="text-[56px] font-sans font-bold tracking-tighter leading-none text-foreground">
                {secondsLeft}s
              </span>
            </div>
            <span className="text-[12.5px] text-mutedText font-medium mt-1">
              of {maxSeconds}s
            </span>
          </div>
        </div>

        {/* Phase Guidance Text */}
        <div className="relative z-10 mb-5 min-h-[58px]">
          <h4 className="text-[22px] font-semibold text-foreground tracking-tight">
            {getPhaseText()}
          </h4>
          <p className="text-[14px] text-mutedText mt-1.5 font-normal">
            {getPhaseInstruction()}
          </p>
        </div>

        {/* Cycles Counter */}
        <div className="relative z-10 flex items-center gap-3 bg-card-subtle px-4 py-2 rounded-full mb-8">
          <div className="flex items-center gap-1.5">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-[7px] h-[7px] rounded-full transition-colors bg-primary ${
                  i === (cyclesCompleted % 4) ? 'opacity-100' : 'opacity-20'
                }`} 
              />
            ))}
          </div>
          <span className="text-[12.5px] font-medium text-mutedText">
            {(cyclesCompleted % 4) + 1} / 4 cycles
          </span>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex items-center justify-center gap-3 w-full">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[20px] bg-primary hover:bg-primary-hover text-white text-[14px] font-medium shadow-xs transition-all cursor-pointer"
          >
            {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>

          <button
            onClick={() => {
              setPhase('inhale');
              setSecondsLeft(4);
              setCyclesCompleted(0);
              setIsActive(false);
            }}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[20px] bg-card text-foreground border border-borderToken hover:bg-card-subtle transition-all cursor-pointer"
          >
            <RotateCcw size={16} className="text-mutedText" />
            <span className="text-[14px] font-medium">Restart</span>
          </button>
        </div>

        {/* Footer tip */}
        <div className="w-full mt-7 pt-4 border-t border-borderToken flex items-start gap-3 text-left">
          <div className="w-8 h-8 rounded-xl bg-card-subtle flex items-center justify-center text-mutedText flex-shrink-0">
            <Lightbulb size={15} />
          </div>
          <p className="text-[12.5px] text-mutedText leading-relaxed pt-1">
            Breathe slowly and naturally. Follow the on-screen guide.
          </p>
        </div>
      </div>
    </div>
  );
};
