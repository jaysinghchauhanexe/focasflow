import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Play, Pause, RotateCcw, Wind, Sparkles } from 'lucide-react';
import { DoodleWindClouds } from './DoodleIllustrations';

export const BreathingModal: React.FC = () => {
  const { isBreathingModalOpen, closeBreathingModal } = useAppStore();
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [mode, setMode] = useState<'478' | 'box'>('478');

  useEffect(() => {
    if (!isBreathingModalOpen) {
      setIsActive(true);
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
      case 'inhale': return 'Fill your belly with calm, clean air';
      case 'hold': return 'Keep your shoulders soft and still';
      case 'exhale': return 'Release all tension and stress';
      case 'rest': return 'Pause in peaceful awareness';
    }
  };

  const isExpanding = phase === 'inhale';
  const isHolding = phase === 'hold' || phase === 'rest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-card rounded-[32px] p-7 md:p-8 flex flex-col items-center text-center overflow-hidden transition-colors">
        {/* Top Header */}
        <div className="relative z-10 w-full flex items-center justify-between pb-2 mb-4">
          <div className="flex items-center gap-3">
            <DoodleWindClouds size={46} className="flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-[17px] font-semibold text-foreground tracking-tight">
                Breathing Reset
              </h3>
              <p className="text-[11.5px] text-mutedText font-medium">Calm your nervous system</p>
            </div>
          </div>

          <button
            onClick={closeBreathingModal}
            className="w-8 h-8 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="relative z-10 flex items-center bg-card-muted p-1 rounded-2xl mb-8">
          <button
            onClick={() => { setMode('478'); setPhase('inhale'); setSecondsLeft(4); }}
            className={`px-4 py-1.5 rounded-xl text-[12.5px] font-medium transition-all ${
              mode === '478'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-mutedText hover:text-foreground'
            }`}
          >
            4-7-8 Deep Calm
          </button>
          <button
            onClick={() => { setMode('box'); setPhase('inhale'); setSecondsLeft(4); }}
            className={`px-4 py-1.5 rounded-xl text-[12.5px] font-medium transition-all ${
              mode === 'box'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-mutedText hover:text-foreground'
            }`}
          >
            Box Reset (4-4-4-4)
          </button>
        </div>

        {/* Breathing Orb Visualization */}
        <div className="relative z-10 my-4 w-56 h-56 flex items-center justify-center">
          {/* Outer glowing ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-primary/30 transition-all duration-1000 ${
              isExpanding ? 'scale-110 opacity-80' : isHolding ? 'scale-100 opacity-60' : 'scale-90 opacity-30'
            }`}
          />

          {/* Secondary pulsating ripple */}
          <div
            className={`absolute w-44 h-44 rounded-full bg-primary-soft blur-md transition-all duration-1000 ${
              isExpanding ? 'scale-115' : 'scale-90'
            }`}
          />

          {/* Main Core Orb */}
          <div
            className={`w-36 h-36 rounded-full bg-primary text-white shadow-glow flex flex-col items-center justify-center transition-transform duration-1000 ${
              isExpanding ? 'scale-110' : isHolding ? 'scale-105' : 'scale-90'
            }`}
          >
            <span className="text-[34px] font-serif font-bold tracking-tight leading-none text-white">
              {secondsLeft}s
            </span>
            <span className="text-[11px] uppercase tracking-widest text-white/90 font-semibold mt-1">
              {phase}
            </span>
          </div>
        </div>

        {/* Phase Guidance Text */}
        <div className="relative z-10 mt-6 min-h-[58px]">
          <h4 className="text-[20px] font-serif font-medium text-foreground tracking-tight">
            {getPhaseText()}
          </h4>
          <p className="text-[13px] text-mutedText mt-1 font-normal">
            {getPhaseInstruction()}
          </p>
        </div>

        {/* Cycles Counter */}
        <div className="relative z-10 mt-2 mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-[12px] font-medium">
          <Sparkles size={13} />
          <span>{cyclesCompleted} {cyclesCompleted === 1 ? 'cycle' : 'cycles'} completed</span>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-[13.5px] font-medium shadow-xs transition-all"
          >
            {isActive ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            <span>{isActive ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={() => {
              setPhase('inhale');
              setSecondsLeft(4);
              setCyclesCompleted(0);
              setIsActive(true);
            }}
            className="p-2.5 rounded-2xl bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground transition-colors border border-borderToken"
            title="Restart cycle"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
