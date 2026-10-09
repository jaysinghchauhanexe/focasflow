import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  X, 
  Minus, 
  Folder, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  HardDrive 
} from 'lucide-react';

export const SetupWizardModal: React.FC = () => {
  const { isSetupWizardOpen, closeSetupWizard, updateSettings } = useAppStore();

  const [progress, setProgress] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Customization preferences
  const [installPath, setInstallPath] = useState('C:\\Users\\Jay\\AppData\\Local\\Programs\\FocusFlow');
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [createStartMenu, setCreateStartMenu] = useState(true);

  const statusMessages = [
    'Tailoring your experience',
    'Configuring local offline database',
    'Setting up intelligent timeboxing engine',
    'Preparing your workspace',
    'Almost ready...'
  ];

  useEffect(() => {
    if (!isSetupWizardOpen) return;

    setProgress(0);
    setCurrentStatusIndex(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            updateSettings({ hasCompletedSetup: true });
            closeSetupWizard();
          }, 600);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 4;
        const next = Math.min(100, prev + increment);
        
        // Update status message based on percentage
        if (next < 25) setCurrentStatusIndex(0);
        else if (next < 50) setCurrentStatusIndex(1);
        else if (next < 75) setCurrentStatusIndex(2);
        else if (next < 95) setCurrentStatusIndex(3);
        else setCurrentStatusIndex(4);

        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isSetupWizardOpen, closeSetupWizard, updateSettings]);

  if (!isSetupWizardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      
      {/* Arc-Style Compact Installer Window */}
      <div className="relative w-full max-w-[420px] bg-white dark:bg-[#14171a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Sleek Minimal Title Bar */}
        <div className="h-10 bg-transparent flex items-center justify-between px-3.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">✦</span>
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              FocusFlow Setup
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={closeSetupWizard}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={closeSetupWizard}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main Arc-Style Body */}
        <div className="px-8 pt-8 pb-10 flex flex-col items-center text-center">
          
          {/* Centered Elevated 3D Squircle Logo */}
          <div className="relative mb-8 group">
            {/* Ambient Multi-color Glowing Halo */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-400/30 via-teal-300/30 to-blue-400/30 rounded-3xl blur-xl opacity-70 animate-pulse pointer-events-none" />
            
            {/* White Squircle Card Container */}
            <div className="relative w-32 h-32 rounded-[28px] bg-white dark:bg-[#1c2024] border border-black/5 dark:border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
              
              {/* Internal Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent" />
              
              {/* Dynamic FocusFlow Mascot / Icon SVG */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-20 h-20 drop-shadow-md"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="arcEmeraldFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="arcAccentGlow" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Flowing Organic Arc Petals */}
                <path
                  d="M50 15C50 15 32 30 32 52C32 64.5 40.5 75 50 75C59.5 75 68 64.5 68 52C68 30 50 15 50 15Z"
                  fill="url(#arcEmeraldFlow)"
                />
                <circle cx="50" cy="50" r="14" fill="white" className="dark:fill-[#1c2024]" />
                <circle cx="50" cy="50" r="8" fill="url(#arcAccentGlow)" />
                <path
                  d="M25 58C30 72 42 82 50 82C58 82 70 72 75 58"
                  stroke="url(#arcEmeraldFlow)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeOpacity="0.4"
                />
              </svg>
            </div>
          </div>

          {/* Typography */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
            Installing FocusFlow...
          </h2>
          
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5 min-h-[22px] transition-all duration-200">
            {statusMessages[currentStatusIndex]}
          </p>

          {/* Progress Section */}
          <div className="w-full mt-7 space-y-2">
            {/* Sleek Minimal Progress Track */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-xs animate-pulse" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 font-mono px-0.5">
              <span>{progress}%</span>
              <span>v1.0.0</span>
            </div>
          </div>

          {/* Optional Advanced Settings Toggle */}
          <div className="w-full mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <span>Installation options</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-black/20 rounded-xl text-left space-y-2.5 text-xs animate-fade-in border border-slate-200/60 dark:border-white/5">
                <div className="space-y-1">
                  <span className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 block">
                    Install Location
                  </span>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      value={installPath} 
                      onChange={(e) => setInstallPath(e.target.value)}
                      className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={createDesktopShortcut} 
                      onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span className="text-[11px]">Create Desktop Shortcut</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={createStartMenu} 
                      onChange={(e) => setCreateStartMenu(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span className="text-[11px]">Add to Windows Start Menu</span>
                  </label>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
