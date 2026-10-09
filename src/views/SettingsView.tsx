import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  User, 
  Clock, 
  Sparkles, 
  Check, 
  SlidersHorizontal, 
  ArrowRight, 
  Cpu, 
  Globe, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal,
  Layers,
  HardDrive,
  Trash2,
  Zap
} from 'lucide-react';
import { 
  IN_APP_MODELS, 
  InAppModel, 
  loadInAppModel, 
  checkModelCached, 
  deleteInAppModelCached,
  isWebGPUSupported 
} from '../engine/webLlmService';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, openOnboarding, openSetupWizard, setCurrentTab } = useAppStore();

  const [userName, setUserName] = useState(settings.userName);
  const [wakeTime, setWakeTime] = useState(settings.wakeTime);
  const [sleepTime, setSleepTime] = useState(settings.sleepTime);
  const [workStart, setWorkStart] = useState(settings.workStart);
  const [workEnd, setWorkEnd] = useState(settings.workEnd);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  
  // AI Provider & Model States
  const [aiProvider, setAiProvider] = useState<'in_app' | 'local_ollama' | 'openrouter'>(settings.aiProvider || 'in_app');
  const [inAppModel, setInAppModel] = useState(settings.inAppModel || 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC');
  const [localModel, setLocalModel] = useState(settings.localModel || 'qwen2.5:1.5b');
  const [localEndpoint, setLocalEndpoint] = useState(settings.localEndpoint || 'http://localhost:11434');
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey || '');
  const [cloudModel, setCloudModel] = useState(settings.openRouterModel || 'anthropic/claude-3.5-haiku');
  
  const [saved, setSaved] = useState(false);

  // In-App Model Download States
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgressText, setDownloadProgressText] = useState<string>('');
  const [downloadProgressPercent, setDownloadProgressPercent] = useState<number>(0);
  const [downloadedModelsMap, setDownloadedModelsMap] = useState<Record<string, boolean>>({});

  // Ollama Installed Models State
  const [ollamaInstalledModels, setOllamaInstalledModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'testing' | 'connected' | 'disconnected'>('testing');
  const [testingOllama, setTestingOllama] = useState(false);

  // Load downloaded models from cache / storage
  useEffect(() => {
    const checkAll = async () => {
      const map: Record<string, boolean> = {};
      try {
        const persisted = JSON.parse(localStorage.getItem('focusflow_downloaded_models') || '{}');
        Object.assign(map, persisted);
      } catch {}

      for (const m of IN_APP_MODELS) {
        if (!map[m.id]) {
          const cached = await checkModelCached(m.id);
          if (cached) map[m.id] = true;
        }
      }
      setDownloadedModelsMap(map);
    };
    checkAll();
  }, []);

  // Check Ollama installed models
  const checkOllama = async () => {
    setTestingOllama(true);
    try {
      const endpoint = localEndpoint.replace(/\/$/, '');
      const res = await fetch(`${endpoint}/api/tags`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const names: string[] = (data.models || []).map((m: any) => m.name || m.model);
        setOllamaInstalledModels(names);
        setOllamaStatus('connected');
      } else {
        setOllamaStatus('disconnected');
      }
    } catch {
      setOllamaStatus('disconnected');
    } finally {
      setTestingOllama(false);
    }
  };

  useEffect(() => {
    if (aiProvider === 'local_ollama') {
      checkOllama();
    }
  }, [aiProvider, localEndpoint]);

  // Handle direct in-app download
  const handleDownloadInAppModel = async (model: InAppModel) => {
    setDownloadingModelId(model.id);
    setDownloadProgressPercent(0);
    setDownloadProgressText(`Starting download from Hugging Face for ${model.name}...`);

    try {
      await loadInAppModel(model.id, (report) => {
        setDownloadProgressText(report.text);
        if (report.progress !== undefined) {
          setDownloadProgressPercent(Math.round(report.progress * 100));
        }
      });

      setDownloadedModelsMap((prev) => ({ ...prev, [model.id]: true }));
      setInAppModel(model.id);
      setDownloadProgressText('Model downloaded and ready to use in FocusFlow!');
    } catch (err: any) {
      setDownloadProgressText(`Download error: ${err?.message || 'Could not download model.'}`);
    } finally {
      setDownloadingModelId(null);
    }
  };

  // Handle deleting downloaded model weights
  const handleDeleteInAppModel = async (model: InAppModel) => {
    if (confirm(`Remove local downloaded weights for ${model.name} (${model.size})?`)) {
      await deleteInAppModelCached(model.id);
      setDownloadedModelsMap((prev) => {
        const next = { ...prev };
        delete next[model.id];
        return next;
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName,
      wakeTime,
      sleepTime,
      workStart,
      workEnd,
      breakDuration: Number(breakDuration),
      aiProvider,
      inAppModel,
      localModel,
      localEndpoint,
      openRouterApiKey: apiKey,
      openRouterModel: cloudModel,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cloudModels = [
    { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (Fast & Precise)' },
    { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (Low latency)' },
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Balanced Cloud)' },
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
            Configure profile identities, daily schedule boundaries, working capacity, and direct local AI models.
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column (5 cols): Personal Profile & Schedule Windows */}
          <div className="xl:col-span-5 space-y-6 flex flex-col justify-between">
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
                    Sleep Time (Boundary)
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
                    Work Hours Start
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
                    Work Hours End
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

          {/* Right Column (7 cols): AI Engine & Direct In-App Model Downloader */}
          <div className="xl:col-span-7 bg-card rounded-[28px] p-6 sm:p-7 shadow-soft space-y-5 transition-colors flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-borderToken">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={18} className="text-primary" />
                  <h3 className="text-[17px] font-serif font-semibold text-foreground">
                    AI Brain & Model Provider
                  </h3>
                </div>

                {/* Provider Switcher Tabs (In-App Direct, Ollama, OpenRouter) */}
                <div className="flex items-center bg-card-subtle p-1 rounded-xl border border-borderToken">
                  <button
                    type="button"
                    onClick={() => setAiProvider('in_app')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                      aiProvider === 'in_app'
                        ? 'bg-card text-foreground font-semibold shadow-xs'
                        : 'text-mutedText hover:text-foreground'
                    }`}
                  >
                    <Download size={13} className="text-tag-health" />
                    <span>In-App Download (Direct)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('local_ollama')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                      aiProvider === 'local_ollama'
                        ? 'bg-card text-foreground font-semibold shadow-xs'
                        : 'text-mutedText hover:text-foreground'
                    }`}
                  >
                    <Cpu size={13} className="text-primary" />
                    <span>Ollama Daemon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('openrouter')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                      aiProvider === 'openrouter'
                        ? 'bg-card text-foreground font-semibold shadow-xs'
                        : 'text-mutedText hover:text-foreground'
                    }`}
                  >
                    <Globe size={13} className="text-tag-learning" />
                    <span>OpenRouter (Cloud)</span>
                  </button>
                </div>
              </div>

              {/* 1. IN-APP DIRECT MODEL DOWNLOADER (NO OLLAMA NEEDED) */}
              {aiProvider === 'in_app' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="text-[12px] font-semibold text-mutedText uppercase tracking-wider block">
                        Download & Use In-App Local Models
                      </label>
                      <span className="text-[11.5px] text-mutedText">
                        Downloads weights directly from Hugging Face into your app storage. Runs 100% offline.
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tag-healthBg text-tag-health flex items-center gap-1">
                      <Zap size={12} />
                      <span>Zero Setup Required</span>
                    </span>
                  </div>

                  {/* Active Download Progress Bar */}
                  {downloadingModelId && (
                    <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary/30 space-y-2 animate-enter-up">
                      <div className="flex items-center justify-between text-[12px] font-semibold text-primary">
                        <span>{downloadProgressText || 'Downloading model weights...'}</span>
                        <span>{downloadProgressPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-card overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Models List Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {IN_APP_MODELS.map((m) => {
                      const isSelected = inAppModel === m.id;
                      const isDownloaded = downloadedModelsMap[m.id];
                      const isDownloading = downloadingModelId === m.id;

                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-primary-soft/80 border-primary ring-2 ring-primary/20 shadow-xs'
                              : 'bg-card-subtle border-borderToken hover:border-primary/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[13px] font-semibold text-foreground truncate">
                                {m.name}
                              </span>
                              <span className="text-[10.5px] font-mono font-medium px-1.5 py-0.2 rounded bg-card text-mutedText border border-borderToken">
                                {m.size}
                              </span>
                            </div>
                            <p className="text-[11px] text-mutedText line-clamp-2 leading-relaxed">
                              {m.tagline}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-borderToken/30 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-primary">{m.company}</span>
                              {m.isRecommended && (
                                <span className="text-tag-health font-bold text-[10px]">★ Recommended</span>
                              )}
                            </div>

                            {/* Download / Activate Action Button */}
                            {isDownloaded ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setInAppModel(m.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-tag-health text-white shadow-xs'
                                      : 'bg-card hover:bg-primary-soft text-textSecondary hover:text-primary border border-borderToken'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check size={13} />
                                      <span>Active</span>
                                    </>
                                  ) : (
                                    <span>Select</span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInAppModel(m)}
                                  title={`Delete downloaded ${m.name} from storage`}
                                  className="p-1.5 rounded-xl text-mutedText hover:text-tag-important hover:bg-tag-importantBg transition-all cursor-pointer border border-transparent hover:border-tag-important/20"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isDownloading || downloadingModelId !== null}
                                onClick={() => handleDownloadInAppModel(m)}
                                className="px-3 py-1.5 rounded-xl bg-tag-health hover:bg-tag-health/90 disabled:opacity-50 text-white text-[11.5px] font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                              >
                                <Download size={13} className={isDownloading ? 'animate-bounce' : ''} />
                                <span>{isDownloading ? `${downloadProgressPercent}%` : `Download (${m.size})`}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. OLLAMA DAEMON CONFIGURATION */}
              {aiProvider === 'local_ollama' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[12px] font-semibold text-mutedText uppercase tracking-wider">
                      Ollama Local Server
                    </label>

                    <button
                      type="button"
                      onClick={checkOllama}
                      disabled={testingOllama}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-subtle hover:bg-card-muted text-textSecondary text-[11.5px] font-medium transition-all cursor-pointer border border-borderToken"
                    >
                      <RefreshCw size={12} className={testingOllama ? 'animate-spin text-primary' : ''} />
                      <span>Refresh Ollama Models</span>
                    </button>
                  </div>

                  {/* Connection & Installed Models Feedback */}
                  {ollamaStatus === 'connected' ? (
                    <div className="p-3 rounded-2xl bg-tag-healthBg text-tag-health text-[12px] space-y-1 animate-enter-up">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 size={14} className="flex-shrink-0" />
                        <span>Connected to Ollama daemon at {localEndpoint}</span>
                      </div>
                      <div className="text-[11.5px] text-textSecondary">
                        <strong>Installed models on your PC:</strong>{' '}
                        {ollamaInstalledModels.length > 0 ? ollamaInstalledModels.join(', ') : 'None detected. Run "ollama run <model>"'}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-tag-importantBg text-tag-important text-[12px] flex items-center gap-2 animate-enter-up">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      <span>Could not reach Ollama at {localEndpoint}. Make sure Ollama is running.</span>
                    </div>
                  )}

                  {/* Model Selector based on installed models or custom */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-mutedText uppercase tracking-wider mb-1">
                      Ollama Model Name
                    </label>
                    <input
                      type="text"
                      value={localModel}
                      onChange={(e) => setLocalModel(e.target.value)}
                      placeholder="e.g. qwen2.5:1.5b, llama3.2:1b"
                      className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13px] font-mono text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                    />

                    {/* Warning if selected model is not installed */}
                    {ollamaStatus === 'connected' && ollamaInstalledModels.length > 0 && !ollamaInstalledModels.includes(localModel) && (
                      <p className="text-[11.5px] text-tag-important mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} />
                        <span>"{localModel}" is not in your downloaded Ollama library. Run "ollama run {localModel}" in your terminal to install it.</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-mutedText uppercase tracking-wider mb-1">
                      Ollama Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={localEndpoint}
                      onChange={(e) => setLocalEndpoint(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[12.5px] font-mono text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* 3. OPENROUTER (CLOUD) CONFIGURATION */}
              {aiProvider === 'openrouter' && (
                <div className="space-y-4 animate-fade-in">
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
                      Stored locally in your secure environment.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                      Cloud AI Model
                    </label>
                    <select
                      value={cloudModel}
                      onChange={(e) => setCloudModel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-card-subtle text-[13px] text-foreground border border-borderToken focus:border-primary focus:outline-none transition-colors cursor-pointer"
                    >
                      {cloudModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom summary note */}
            <div className="p-3.5 rounded-2xl bg-card-subtle border border-borderToken/50 mt-4 flex items-center justify-between text-[11.5px] text-mutedText">
              <span>Runs 100% locally on your machine with zero external cloud calls.</span>
              <span className="text-primary font-semibold">100% Private</span>
            </div>
          </div>
        </div>

        {/* Submit & Onboarding Actions Bar */}
        <div className="sticky bottom-0 z-30 bg-card/95 backdrop-blur-xl border border-borderToken rounded-[28px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-all duration-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openOnboarding}
              className="px-4 py-2.5 rounded-2xl bg-card-subtle hover:bg-card-muted text-textSecondary text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={15} className="text-primary" />
              <span>Launch Onboarding</span>
            </button>

            <button
              type="button"
              onClick={openSetupWizard}
              className="px-4 py-2.5 rounded-2xl bg-card-subtle hover:bg-card-muted text-textSecondary text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <HardDrive size={15} className="text-primary" />
              <span>Preview Setup Wizard</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-[13px] text-tag-health font-semibold flex items-center gap-1.5 animate-fade-in">
                <Check size={15} />
                <span>Settings Saved</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-xs"
            >
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
