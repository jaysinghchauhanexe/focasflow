import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  User,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  Camera,
  Save,
  Check,
  Bot,
  Zap,
  Briefcase,
  Code2,
  GraduationCap,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Upload,
  Crop,
  CheckSquare
} from 'lucide-react';
import { sendAiCommand } from '../engine/aiClient';
import { calculateRealStreak, getDailyFocusSeconds, formatFocusTime } from '../utils/metrics';

const PERSONA_TEMPLATES = [
  {
    title: 'Fullstack Developer (Rust / React / Next.js)',
    icon: <Code2 size={14} className="text-primary" />,
    context: `I am a fullstack software engineer specializing in Rust, React, Next.js, and TypeScript. I care about high-performance backends, clean component state, and automated tests. When suggesting daily tasks, organize them by architecture design, backend implementation, frontend polish, code review, and bug fixes.`
  },
  {
    title: 'Founder & Product Lead',
    icon: <Briefcase size={14} className="text-[#F97316]" />,
    context: `I am a startup founder wearing multiple hats across product strategy, customer interviews, feature prioritization, and team coordination. Keep my days balanced between high-leverage strategic work and async customer feedback.`
  },
  {
    title: 'Student & Deep Researcher',
    icon: <GraduationCap size={14} className="text-[#8B5CF6]" />,
    context: `I am studying and conducting research. My day requires deep focus blocks for reading scientific papers, writing thesis drafts, reviewing lectures, and solving problem sets without distractions.`
  },
  {
    title: 'UI/UX & Visual Designer',
    icon: <Layers size={14} className="text-[#EC4899]" />,
    context: `I am a product designer crafting user interfaces, motion design, design systems, and user testing sessions. Prioritize uninterrupted creative design flow and prototype reviews.`
  }
];

export const ProfileView: React.FC = () => {
  const {
    settings,
    updateUserProfile,
    tasks,
    habits,
    history,
    taskElapsedSeconds,
    activeFocusTaskId,
    focusElapsedSeconds,
    isFocusTimerRunning,
    applyAiOperations,
    setAiLoading,
    setLastAiResult,
    openAiModal,
  } = useAppStore();

  const [name, setName] = useState(settings.userName || 'Jay');
  const [role, setRole] = useState(settings.userRole || 'Fullstack Developer & Creator');
  const [bio, setBio] = useState(settings.userBio || 'Focused on building elegant software with calm intention.');
  const [aiContext, setAiContext] = useState(
    settings.aiUserContext ||
    'I am a fullstack software developer working with Rust, React, Next.js, and TypeScript. I love deep work sessions, clean modular code, and shipping calm, polished tools.'
  );
  const [avatar, setAvatar] = useState(settings.userAvatar || '/avatar_jay.jpg');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Image Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImageRef = useRef<HTMLImageElement | null>(null);

  // Unified Centralized Metrics
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayFocusSec = getDailyFocusSeconds(
    todayStr,
    tasks,
    taskElapsedSeconds,
    activeFocusTaskId,
    focusElapsedSeconds,
    isFocusTimerRunning
  );
  const formattedTodayFocus = formatFocusTime(todayFocusSec);

  // Total Lifetime Focus Time across all tasks
  const allTasksFocusSec = tasks.reduce((acc, t) => {
    return acc + (taskElapsedSeconds[t.id] || (t.status === 'completed' ? (t.duration || 30) * 60 : 0));
  }, 0) + (isFocusTimerRunning ? focusElapsedSeconds : 0);
  const totalFocusHours = Math.round((allTasksFocusSec / 3600) * 10) / 10;

  // Real Streak
  const { currentStreak } = calculateRealStreak(tasks, habits, history);

  const handleSaveProfile = () => {
    updateUserProfile({
      userName: name.trim() || 'Jay',
      userRole: role.trim(),
      userBio: bio.trim(),
      aiUserContext: aiContext.trim(),
      userAvatar: avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const handleAskAiToday = async () => {
    setIsGeneratingAi(true);
    setAiLoading(true);
    try {
      const userPrompt = `Based on my background and preferences ("${aiContext}"), what should I do today? Please generate 3-4 clear, high-impact tasks with estimated durations and priorities for my day.`;
      const result = await sendAiCommand(userPrompt, tasks, habits, {
        ...settings,
        userName: name,
        userRole: role,
        aiUserContext: aiContext,
      });

      if (result.operations && result.operations.length > 0) {
        applyAiOperations(result);
      }
      setLastAiResult(result);
      openAiModal();
    } catch (e) {
      console.error('AI error:', e);
    } finally {
      setIsGeneratingAi(false);
      setAiLoading(false);
    }
  };

  // Open file picker and load into crop modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRawImageSrc(reader.result);
          setZoom(1);
          setPan({ x: 0, y: 0 });
          setIsCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input
    e.target.value = '';
  };

  // Canvas Drawing for Crop Preview
  useEffect(() => {
    if (!isCropModalOpen || !rawImageSrc) return;

    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      previewImageRef.current = img;
      drawCropCanvas();
    };
  }, [isCropModalOpen, rawImageSrc, zoom, pan]);

  const drawCropCanvas = () => {
    const canvas = canvasRef.current;
    const img = previewImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Calculate dimensions
    const minDim = Math.min(img.width, img.height);
    const aspect = img.width / img.height;
    let drawW = size * zoom;
    let drawH = size * zoom;

    if (aspect > 1) {
      drawW = size * aspect * zoom;
    } else {
      drawH = (size / aspect) * zoom;
    }

    const drawX = (size - drawW) / 2 + pan.x;
    const drawY = (size - drawH) / 2 + pan.y;

    // Draw background image
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Draw Circular Mask Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2, true);
    ctx.fill();

    // Circle Outline
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const handleApplyCrop = () => {
    const img = previewImageRef.current;
    if (!img) return;

    const finalCanvas = document.createElement('canvas');
    const finalSize = 256;
    finalCanvas.width = finalSize;
    finalCanvas.height = finalSize;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    const aspect = img.width / img.height;
    let drawW = size * zoom;
    let drawH = size * zoom;
    if (aspect > 1) {
      drawW = size * aspect * zoom;
    } else {
      drawH = (size / aspect) * zoom;
    }

    const scaleFactor = finalSize / (size - 24);
    const drawX = ((size - drawW) / 2 + pan.x - 12) * scaleFactor;
    const drawY = ((size - drawH) / 2 + pan.y - 12) * scaleFactor;
    const finalDrawW = drawW * scaleFactor;
    const finalDrawH = drawH * scaleFactor;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(img, drawX, drawY, finalDrawW, finalDrawH);

    const croppedDataUrl = finalCanvas.toDataURL('image/png', 0.92);
    setAvatar(croppedDataUrl);
    updateUserProfile({ userAvatar: croppedDataUrl });
    setIsCropModalOpen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-[1400px] mx-auto select-none">
      {/* 1. TOP HEADER & PROFILE BANNER */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft border border-borderToken relative overflow-hidden transition-all duration-300">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Container with Upload & Crop Button */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-primary-soft shadow-xs flex items-center justify-center transition-transform group-hover:scale-105">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User size={36} className="text-primary" />
                )}
              </div>
              <label
                htmlFor="profile-photo-upload"
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-white"
                title="Upload and crop photo"
              >
                <Camera size={20} />
                <span className="text-[10px] font-semibold mt-1">Upload</span>
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground tracking-tight">
                  {name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-tag-healthBg text-tag-health text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tag-health" />
                  Active
                </span>
              </div>
              <p className="text-[13.5px] font-medium text-primary mt-1">
                {role}
              </p>
              <p className="text-[12px] text-mutedText mt-0.5 max-w-lg">
                {bio}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label
              htmlFor="profile-photo-upload"
              className="flex items-center gap-1.5 px-4 h-[40px] rounded-2xl bg-card-subtle hover:bg-card-muted border border-borderToken text-[13px] text-foreground font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Upload size={14} />
              <span>Change Photo</span>
            </label>

            <button
              type="button"
              onClick={handleSaveProfile}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 h-[40px] rounded-2xl text-[13px] font-semibold transition-all shadow-xs cursor-pointer ${
                savedSuccess
                  ? 'bg-tag-health text-white'
                  : 'bg-primary hover:bg-primary-hover active:bg-primary-active text-white'
              }`}
            >
              {savedSuccess ? <Check size={16} strokeWidth={2.5} /> : <Save size={15} />}
              <span>{savedSuccess ? 'Changes Saved!' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & STREAK METRICS ROW (100% Mathematically Consistent Across Views) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="bg-card rounded-[24px] p-5 shadow-soft border border-borderToken flex items-center gap-3.5 transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center flex-shrink-0">
            <Flame size={22} fill="currentColor" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-foreground leading-none block">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </span>
            <span className="text-[12px] text-mutedText mt-1 block">Current Active Streak</span>
          </div>
        </div>

        <div className="bg-card rounded-[24px] p-5 shadow-soft border border-borderToken flex items-center gap-3.5 transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-foreground leading-none block">
              {formattedTodayFocus.displayString}
            </span>
            <span className="text-[12px] text-mutedText mt-1 block">Focus Time Today</span>
          </div>
        </div>

        <div className="bg-card rounded-[24px] p-5 shadow-soft border border-borderToken flex items-center gap-3.5 transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl bg-tag-healthBg text-tag-health flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-foreground leading-none block">
              {completedTasksCount}
            </span>
            <span className="text-[12px] text-mutedText mt-1 block">Completed Outcomes</span>
          </div>
        </div>

        <div className="bg-card rounded-[24px] p-5 shadow-soft border border-borderToken flex items-center gap-3.5 transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl bg-tag-learningBg text-tag-learning flex items-center justify-center flex-shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-foreground leading-none block">
              {totalFocusHours} hrs
            </span>
            <span className="text-[12px] text-mutedText mt-1 block">Lifetime Logged Hours</span>
          </div>
        </div>
      </div>

      {/* 3. AI PERSONALIZATION & CONTEXT CARD */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft border border-borderToken transition-all duration-300 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borderToken">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-[17px] font-serif font-semibold text-foreground">
                AI Persona Context & Personalization
              </h3>
              <p className="text-[12px] text-mutedText mt-0.5">
                The AI adapts its tasks, schedule optimizations, and recommendations specifically to your role and preferences.
              </p>
            </div>
          </div>

          {/* Test with AI Button */}
          <button
            type="button"
            onClick={handleAskAiToday}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 px-4 h-[38px] rounded-2xl bg-primary text-white text-[12.5px] font-semibold hover:bg-primary-hover active:bg-primary-active transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Sparkles size={14} className={isGeneratingAi ? 'animate-spin' : ''} />
            <span>{isGeneratingAi ? 'Planning with AI...' : 'Ask AI: What should I do today?'}</span>
          </button>
        </div>

        {/* Preset Context Templates */}
        <div>
          <span className="text-[11.5px] font-semibold text-mutedText uppercase tracking-wider block mb-2">
            Quick Persona Templates:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PERSONA_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiContext(tmpl.context);
                  setRole(tmpl.title);
                }}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-card-subtle hover:bg-card-muted border border-borderToken text-left transition-all cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-card border border-borderToken flex-shrink-0 group-hover:scale-105 transition-transform">
                  {tmpl.icon}
                </div>
                <span className="text-[12px] font-medium text-foreground truncate">
                  {tmpl.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Multi-line AI Prompt Context Area */}
        <div className="space-y-1.5">
          <label className="text-[12.5px] font-semibold text-foreground flex items-center justify-between">
            <span>Your Personal Background & Instructions for AI:</span>
            <span className="text-[11px] text-mutedText font-normal">Available in all AI commands & plans</span>
          </label>
          <textarea
            rows={4}
            value={aiContext}
            onChange={(e) => setAiContext(e.target.value)}
            placeholder="E.g., I am a Rust and React engineer building web and desktop apps. I prefer deep work blocks, clear priorities, and automated testing..."
            className="w-full p-4 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground placeholder-mutedText outline-none focus:border-primary transition-all resize-y leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* 4. BASIC PROFILE DETAILS FORM */}
      <div className="bg-card rounded-[28px] p-6 sm:p-7 shadow-soft border border-borderToken transition-all duration-300 space-y-5">
        <h3 className="text-[17px] font-serif font-semibold text-foreground pb-2 border-b border-borderToken">
          Account & Persona Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-mutedText">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full h-[40px] px-3.5 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-mutedText">Title / Profession</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="E.g. Fullstack Developer & Designer"
              className="w-full h-[40px] px-3.5 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12.5px] font-medium text-mutedText">Personal Bio / Focus Motto</label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A brief sentence about what drives you"
            className="w-full h-[40px] px-3.5 rounded-2xl bg-card-subtle border border-borderToken text-[13px] text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-5 h-[40px] rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Save size={15} />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* 5. INTERACTIVE CROP PHOTO MODAL (Smooth Animation & Pan/Zoom) */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-[28px] p-6 max-w-md w-full shadow-float border border-borderToken space-y-4 animate-enter-up transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex items-center justify-between pb-2 border-b border-borderToken">
              <div className="flex items-center gap-2">
                <Crop size={18} className="text-primary" />
                <h3 className="text-[16px] font-serif font-semibold text-foreground">
                  Crop & Adjust Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="p-1 text-mutedText hover:text-foreground cursor-pointer rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-mutedText">
              Drag on the image to position, or use the zoom slider below to frame your photo perfectly.
            </p>

            {/* Interactive Canvas */}
            <div
              className="flex justify-center bg-card-subtle rounded-2xl p-2 border border-borderToken cursor-grab active:cursor-grabbing overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas ref={canvasRef} className="rounded-xl shadow-xs" />
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-mutedText">
                <span className="flex items-center gap-1"><ZoomOut size={13} /> Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-card-muted rounded-lg"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="px-4 h-[38px] rounded-2xl bg-card-subtle hover:bg-card-muted text-xs text-foreground font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex items-center gap-1.5 px-5 h-[38px] rounded-2xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Check size={15} strokeWidth={2.5} />
                <span>Apply & Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
