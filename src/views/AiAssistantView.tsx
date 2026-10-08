import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { sendAiCommand } from '../engine/aiClient';
import { AiOperation, AiResponsePayload } from '../types';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
  Check,
  ArrowRight,
  Code2,
  Clock,
  Calendar,
  Terminal,
  Globe,
  Download,
  Trash2,
  RotateCcw,
  Plus,
  MoreHorizontal,
  Paperclip,
  SlidersHorizontal,
  Target,
  BookOpen,
  Sun,
  Flag,
  GraduationCap,
  Lightbulb,
  FileText,
  Leaf,
  MessageSquare,
  User,
  Wind,
  Headphones,
  ArrowUp,
  X,
  ChevronDown
} from 'lucide-react';
import { IN_APP_MODELS, loadInAppModel } from '../engine/webLlmService';
import {
  startWhisperRecording,
  stopWhisperRecordingAndTranscribe,
  cancelWhisperRecording,
  getWhisperTranscriber,
} from '../engine/whisperService';
import { DiurnalSkyIllustration } from '../components/ProductivitySummary';

const calculateEndTime = (startTimeStr: string | undefined, durationMinutes: number | undefined): string | null => {
  if (!startTimeStr || !durationMinutes) return null;
  const [hours, minutes] = startTimeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

const formatTime12h = (time24: string): string => {
  const [hoursStr, minutesStr] = time24.split(':');
  if (!hoursStr) return time24;
  let h = parseInt(hoursStr, 10);
  const m = minutesStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

const renderTimeBlock = (start: string | undefined, duration: number | undefined) => {
  if (!start) return 'Scheduled for today';
  const start12 = formatTime12h(start);
  if (!duration) return `@${start12}`;
  const end24 = calculateEndTime(start, duration);
  if (!end24) return `@${start12}`;
  return `@${start12} - ${formatTime12h(end24)}`;
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  payload?: AiResponsePayload;
  rawJson?: string;
  isApplied?: boolean;
  isDiscarded?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  dateLabel: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export const AiAssistantView: React.FC = () => {
  const { tasks, habits, settings, applyAiOperations, setCurrentTab, aiChatSessions: sessions, aiActiveSessionId: activeSessionId, setAiChatSessions: setSessions, setAiActiveSessionId: setActiveSessionId, aiLoading: loading, setAiLoading: setLoading } = useAppStore();

  const [inputVal, setInputVal] = useState(() => {
    try {
      return localStorage.getItem('focusflow_ai_input_draft') || '';
    } catch {
      return '';
    }
  });
  const [isListening, setIsListening] = useState(false);
  const [showRawJsonMap, setShowRawJsonMap] = useState<Record<string, boolean>>({});
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [quickPromptsOpen, setQuickPromptsOpen] = useState(false);
  const [refiningPromptHint, setRefiningPromptHint] = useState<string | null>(null);
  const [speechErrorToast, setSpeechErrorToast] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [whisperProgressText, setWhisperProgressText] = useState<string | null>(null);
  const [mobileViewTab, setMobileViewTab] = useState<'chat' | 'sidebar'>('chat');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Preload Whisper Tiny in background & clean up recording on unmount
  useEffect(() => {
    getWhisperTranscriber().catch(() => { });
    return () => {
      cancelWhisperRecording();
    };
  }, []);

  // Save input draft in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('focusflow_ai_input_draft', inputVal);
    } catch { }
  }, [inputVal]);

  // Helper to format friendly dates for previous chats
  const getFormattedDateLabel = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Yesterday';

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Current Active Session or empty state
  const currentSession = sessions.find((s) => s.id === activeSessionId) || null;
  const activeMessages: ChatMessage[] = currentSession ? currentSession.messages : [];

  // Provider & Model Connection Status
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'model_missing' | 'disconnected'>('testing');
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // In-App Download state
  const [downloadingInApp, setDownloadingInApp] = useState(false);
  const [downloadProgressPercent, setDownloadProgressPercent] = useState(0);
  const [downloadProgressText, setDownloadProgressText] = useState('');

  const provider = settings.aiProvider || 'in_app';
  const isLocal = provider === 'in_app' || provider === 'local_ollama';
  const activeModelId = settings.inAppModel || 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
  const currentInAppMeta = IN_APP_MODELS.find((m) => m.id === activeModelId) || IN_APP_MODELS[0];
  const activeModelName =
    provider === 'in_app'
      ? (currentInAppMeta?.name || 'Qwen 2.5 1.5B')
      : provider === 'local_ollama'
        ? (settings.localModel || 'qwen2.5:1.5b')
        : (settings.openRouterModel || 'GPT-4o');

  const localEndpoint = settings.localEndpoint || 'http://localhost:11434';

  // Dynamic greeting based on user time
  const currentHour = new Date().getHours();
  const greetingText =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
        ? 'Good afternoon'
        : 'Good evening';
  const userName = settings.userName || 'Jay';

  // Save Sessions & Active session to localStorage

  // Message windowing: Load couple of previous messages by default, load more on scroll up
  const INITIAL_VISIBLE_MESSAGES = 8;
  const [visibleMessageCount, setVisibleMessageCount] = useState<number>(INITIAL_VISIBLE_MESSAGES);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef<boolean>(false);
  const isPrependingRef = useRef<boolean>(false);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const anchorMsgIdRef = useRef<string | null>(null);
  const anchorOffsetTopRef = useRef<number>(0);
  const activeTimeoutsRef = useRef<Set<any>>(new Set());

  const safeTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      activeTimeoutsRef.current.delete(id);
      fn();
    }, ms);
    activeTimeoutsRef.current.add(id);
    return id;
  };

  useEffect(() => {
    return () => {
      activeTimeoutsRef.current.forEach((id) => clearTimeout(id));
      activeTimeoutsRef.current.clear();
    };
  }, []);

  // When changing active session, reset visible count to initial
  useEffect(() => {
    setVisibleMessageCount(INITIAL_VISIBLE_MESSAGES);
  }, [activeSessionId]);

  const totalMessages = activeMessages.length;
  const hasMoreMessages = totalMessages > visibleMessageCount;
  const hiddenCount = Math.max(0, totalMessages - visibleMessageCount);
  const displayedMessages = activeMessages.slice(Math.max(0, totalMessages - visibleMessageCount));

  // Synchronously restore scroll position after new older messages are prepended to the DOM
  useLayoutEffect(() => {
    if (isPrependingRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      if (anchorMsgIdRef.current) {
        const anchorEl = container.querySelector(`[data-msg-id="${anchorMsgIdRef.current}"]`) as HTMLElement;
        if (anchorEl) {
          container.scrollTop = anchorEl.offsetTop - anchorOffsetTopRef.current;
        } else {
          const heightDiff = container.scrollHeight - prevScrollHeightRef.current;
          container.scrollTop = prevScrollTopRef.current + heightDiff;
        }
      } else {
        const heightDiff = container.scrollHeight - prevScrollHeightRef.current;
        container.scrollTop = prevScrollTopRef.current + heightDiff;
      }
      isPrependingRef.current = false;
    }
  }, [displayedMessages.length]);

  const handleLoadMoreMessages = () => {
    if (!hasMoreMessages || isPrependingRef.current) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    isPrependingRef.current = true;
    prevScrollHeightRef.current = container.scrollHeight;
    prevScrollTopRef.current = container.scrollTop;

    // Use the first currently rendered message as an anchor
    const firstMsg = displayedMessages[0];
    if (firstMsg) {
      anchorMsgIdRef.current = firstMsg.id;
      const anchorEl = container.querySelector(`[data-msg-id="${firstMsg.id}"]`) as HTMLElement;
      if (anchorEl) {
        anchorOffsetTopRef.current = anchorEl.offsetTop - container.scrollTop;
      }
    }

    setVisibleMessageCount((prev) => Math.min(totalMessages, prev + 8));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop } = container;
    // When user scrolls up near the top (within 50px), load previous messages smoothly without jumping
    if (scrollTop < 50 && hasMoreMessages && !isPrependingRef.current && !isAutoScrollingRef.current) {
      handleLoadMoreMessages();
    }
  };

  const scrollToBottom = () => {
    isAutoScrollingRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    safeTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 400);
  };

  useEffect(() => {
    if (activeMessages.length > 0 && !isPrependingRef.current) {
      scrollToBottom();
    }
  }, [activeMessages.length, loading]);

  const testConnection = async () => {
    setConnectionStatus('testing');
    const start = performance.now();

    if (provider === 'in_app') {
      try {
        const cached = await import('../engine/webLlmService').then((m) => m.checkModelCached(activeModelId));
        const elapsed = Math.round(performance.now() - start);
        setConnectionLatency(elapsed);
        if (cached) {
          setConnectionStatus('connected');
          setStatusMessage('Downloaded & In-App Cached');
        } else {
          setConnectionStatus('model_missing');
          setStatusMessage(`Not Downloaded (${currentInAppMeta.size})`);
        }
      } catch {
        setConnectionStatus('disconnected');
        setStatusMessage('WebGPU Not Available');
      }
      return;
    }

    if (provider === 'local_ollama') {
      try {
        const endpoint = localEndpoint.replace(/\/$/, '');
        const res = await fetch(`${endpoint}/api/tags`, { method: 'GET' });
        const elapsed = Math.round(performance.now() - start);
        setConnectionLatency(elapsed);
        if (res.ok) {
          const data = await res.json();
          const installedNames: string[] = (data.models || []).map((m: any) => m.name || m.model);
          const target = settings.localModel || 'qwen2.5:1.5b';
          const hasModel = installedNames.some(
            (m) => m === target || m.startsWith(`${target}:`) || target.startsWith(`${m}:`)
          );

          if (hasModel) {
            setConnectionStatus('connected');
            setStatusMessage(`${elapsed}ms (Model Ready)`);
          } else {
            setConnectionStatus('model_missing');
            setStatusMessage(`Ollama online, but "${target}" not downloaded`);
          }
        } else {
          setConnectionStatus('disconnected');
          setStatusMessage('Ollama Daemon Offline');
        }
      } catch {
        setConnectionStatus('disconnected');
        setStatusMessage('Ollama Daemon Offline');
      }
      return;
    }

    // OpenRouter Cloud
    setConnectionLatency(35);
    if (settings.openRouterApiKey) {
      setConnectionStatus('connected');
      setStatusMessage('Cloud API Ready');
    } else {
      setConnectionStatus('model_missing');
      setStatusMessage('Missing OpenRouter API Key');
    }
  };

  useEffect(() => {
    testConnection();
  }, [provider, settings.inAppModel, settings.localModel, localEndpoint, settings.openRouterApiKey]);

  const handleDownloadInApp = async () => {
    setDownloadingInApp(true);
    setDownloadProgressPercent(0);
    setDownloadProgressText(`Initializing download for ${currentInAppMeta.name} from Hugging Face...`);

    try {
      await loadInAppModel(activeModelId, (report) => {
        setDownloadProgressText(report.text);
        if (report.progress !== undefined) {
          setDownloadProgressPercent(Math.round(report.progress * 100));
        }
      });
      setConnectionStatus('connected');
      setStatusMessage('Downloaded & In-App Cached');
      setDownloadProgressText('Model downloaded & loaded into WebGPU memory!');
    } catch (err: any) {
      setDownloadProgressText(`Download failed: ${err?.message || 'Error downloading weights'}`);
    } finally {
      safeTimeout(() => {
        setDownloadingInApp(false);
      }, 1500);
    }
  };

  const handleSpeechRecognition = async () => {
    // If currently listening, stop recording and run on-device Whisper Base transcription
    if (isListening) {
      setIsListening(false);
      setIsTranscribing(true);
      setWhisperProgressText('Transcribing voice with Whisper Base...');

      try {
        const text = await stopWhisperRecordingAndTranscribe((report) => {
          if (report.status === 'progress' && report.progress !== undefined) {
            setWhisperProgressText(`Loading Whisper Base: ${Math.round(report.progress)}%`);
          } else if (report.status === 'done') {
            setWhisperProgressText('Transcribing audio with Whisper Base...');
          }
        });

        if (text && text.trim().length > 0) {
          setInputVal((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${text.trim()}` : text.trim();
          });
          safeTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        } else {
          setSpeechErrorToast('No speech detected. Please speak clearly into your microphone.');
          safeTimeout(() => setSpeechErrorToast(null), 2500);
        }
      } catch (err: any) {
        console.warn('Whisper transcription error:', err);
        setSpeechErrorToast(`Whisper speech error: ${err?.message || 'Failed to process audio'}`);
        safeTimeout(() => setSpeechErrorToast(null), 3500);
      } finally {
        setIsTranscribing(false);
        setWhisperProgressText(null);
      }
      return;
    }

    // Start Recording
    try {
      setSpeechErrorToast(null);
      await startWhisperRecording();
      setIsListening(true);
    } catch (err: any) {
      console.warn('Microphone recording error:', err);
      setIsListening(false);
      setSpeechErrorToast('Microphone access denied. Please allow microphone permissions in settings.');
      safeTimeout(() => setSpeechErrorToast(null), 3500);
    }
  };

  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setInputVal('');
    setRefiningPromptHint(null);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleClearAllChats = () => {
    if (confirm('Clear all previous chat history?')) {
      setSessions([]);
      setActiveSessionId(null);
      localStorage.removeItem('focusflow_ai_chat_sessions');
      localStorage.removeItem('focusflow_ai_active_session');
    }
  };

  // Schedule button actions (Apply Changes, Refine, Discard)
  const handleApplyChanges = (msgId: string, payload: AiResponsePayload) => {
    // Guard against duplicate execution if already applied
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const targetMsg = currentSession?.messages.find((m) => m.id === msgId);
    if (targetMsg?.isApplied) return;

    applyAiOperations(payload);
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === msgId ? { ...m, isApplied: true, isDiscarded: false } : m
        ),
      }))
    );
  };

  const handleDiscardChanges = (msgId: string) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === msgId ? { ...m, isDiscarded: true, isApplied: false } : m
        ),
      }))
    );
  };

  const handleRefineChanges = (msgText: string) => {
    const hint = `Refining schedule: Specify what you'd like adjusted...`;
    setRefiningPromptHint(hint);
    setInputVal(`Refine schedule: `);
    safeTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputVal).trim();
    if (!textToSend || loading) return;

    setInputVal('');
    try {
      localStorage.removeItem('focusflow_ai_input_draft');
    } catch { }
    setRefiningPromptHint(null);
    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp,
    };

    let targetSessionId = activeSessionId;
    let currentSessionMessages: ChatMessage[] = [];

    if (!targetSessionId) {
      // Create a fresh new session with an intuitive auto-title and formatted date
      const newSessionId = `session-${Date.now()}`;
      const title = textToSend.length > 34 ? textToSend.slice(0, 34) + '...' : textToSend;
      const dateLabel = getFormattedDateLabel();
      const newSession: ChatSession = {
        id: newSessionId,
        title,
        dateLabel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [newUserMsg],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      targetSessionId = newSessionId;
      currentSessionMessages = [newUserMsg];
    } else {
      // Append to existing active session
      currentSessionMessages = [...activeMessages, newUserMsg];
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, updatedAt: new Date().toISOString(), messages: currentSessionMessages }
            : s
        )
      );
    }

    setLoading(true);

    try {
      const history = currentSessionMessages
        .filter((m) => m.text)
        .slice(-8)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      const result = await sendAiCommand(textToSend, tasks, habits, settings, history);

      // NOTE: DO NOT auto-apply operations! Actions are only applied when user clicks "Apply Changes"

      const aiMsgId = `ai-${Date.now()}`;
      const newAiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: result.message || 'I have proposed schedule adjustments below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        payload: result,
        rawJson: JSON.stringify(result, null, 2),
        isApplied: false,
        isDiscarded: false,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, updatedAt: new Date().toISOString(), messages: [...currentSessionMessages, newAiMsg] }
            : s
        )
      );
    } catch (err: any) {
      const errAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Command error: ${err?.message || 'Could not process schedule command.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, updatedAt: new Date().toISOString(), messages: [...currentSessionMessages, errAiMsg] }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Cards for the Hero view
  const heroActionCards = [
    {
      id: 'plan-day',
      icon: FileText,
      title: 'Plan my day',
      desc: 'Turn my tasks into a focused plan',
      prompt: 'Plan my day based on my current tasks and optimal focus windows.',
    },
    {
      id: 'build-habit',
      icon: Leaf,
      title: 'Build a habit',
      desc: 'Create a simple habit plan',
      prompt: 'Help me design a consistent mindful habit routine for today.',
    },
    {
      id: 'give-insights',
      icon: Lightbulb,
      title: 'Give me insights',
      desc: 'Analyze my productivity patterns',
      prompt: 'Analyze my current schedule balance, deep work capacity, and potential burnout risks.',
    },
    {
      id: 'just-chat',
      icon: MessageSquare,
      title: 'Just chat',
      desc: 'Ask me anything',
      prompt: 'Hi! How can you help me optimize my focus, tasks, and daily routine today?',
    },
  ];

  // Suggestions List for the Right Sidebar
  const sidebarSuggestions = [
    {
      icon: SlidersHorizontal,
      title: "Summarize today's tasks",
      prompt: "Summarize today's urgent tasks, commitments, and available focus blocks.",
    },
    {
      icon: Target,
      title: 'Help me stay focused',
      prompt: 'I am starting a 45-minute focus session. Help me stay on track and eliminate distractions.',
    },
    {
      icon: BookOpen,
      title: 'Create a study plan',
      prompt: 'Create a structured study and practice plan for my technical goals this week.',
    },
    {
      icon: Sun,
      title: 'Suggest a morning routine',
      prompt: 'Design an energizing, mindful 45-minute morning routine to start my day with calm focus.',
    },
    {
      icon: Flag,
      title: 'Break down a big goal',
      prompt: 'Help me break down my primary project goal into manageable 30-minute milestones.',
    },
    {
      icon: GraduationCap,
      title: 'Explain a concept',
      prompt: 'Explain cognitive load theory and deliberate practice in simple, practical terms.',
    },
    {
      icon: Lightbulb,
      title: 'Give me a productivity tip',
      prompt: 'Give me an evidence-based mindful productivity tip for managing energy and focus.',
    },
  ];

  // Render Schedule Timeline Item in AI Response (Matching Screenshot 2)
  const renderSchedulePreviewItem = (op: AiOperation, idx: number) => {
    const isDelete = op.op_type === 'DELETE_TASK';
    const isSkip = op.op_type === 'SKIP_TASK';
    const isMove = op.op_type === 'MOVE_TASK';
    const isComplete = op.op_type === 'COMPLETE_TASK';
    const isBreathing =
      op.title?.toLowerCase().includes('breath') ||
      op.title?.toLowerCase().includes('pause') ||
      op.title?.toLowerCase().includes('mindful');
    const isSync =
      op.title?.toLowerCase().includes('sync') ||
      op.title?.toLowerCase().includes('meeting') ||
      op.title?.toLowerCase().includes('call');
    const priority = op.priority || (isSync ? 'critical' : 'important');
    const category = op.category;

    if (isDelete) {
      return (
        <div
          key={idx}
          className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-tag-importantBg/30 border border-tag-important/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-tag-importantBg text-tag-important">
              <Trash2 size={17} />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-[13.5px] text-foreground line-through opacity-80 truncate">
                  {op.title || 'Task'}
                </span>

                {/* Delete Tag */}
                <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-tag-importantBg text-tag-important border border-tag-important/30">
                  Remove from Schedule
                </span>
              </div>

              <p className="text-[11.5px] text-tag-important/90 truncate">
                Will be deleted from your schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-tag-importantBg flex items-center justify-center text-tag-important">
              <Trash2 size={12} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={idx}
        className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-card border border-borderToken/70 shadow-xs hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isBreathing
                ? 'bg-tag-healthBg text-tag-health'
                : isSync
                  ? 'bg-tag-learningBg text-tag-learning'
                  : 'bg-primary-soft text-primary'
              }`}
          >
            {isBreathing ? (
              <Wind size={18} />
            ) : isSync ? (
              <Calendar size={18} />
            ) : (
              <Headphones size={18} />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-[13.5px] text-foreground truncate">
                {op.title || `${op.op_type.replace('_', ' ')}`}
              </span>

              {/* Priority Badge */}
              <span
                className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold capitalize ${priority === 'critical'
                    ? 'bg-tag-importantBg text-tag-important'
                    : priority === 'important'
                      ? 'bg-tag-learningBg text-tag-learning'
                      : priority === 'flexible'
                        ? 'bg-primary-soft text-primary'
                        : 'bg-card-muted text-mutedText'
                  }`}
              >
                {priority}
              </span>

              {/* Category Badge */}
              {category && (
                <span className="px-2 py-0.5 rounded-md bg-card-subtle border border-borderToken/50 text-mutedText text-[10.5px] font-medium">
                  {category}
                </span>
              )}
            </div>

            <p className="text-[11.5px] text-mutedText truncate">
              {renderTimeBlock(op.start_time, op.duration_minutes)}
              {op.target_date ? ` • ${op.target_date}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right flex-shrink-0">
          {op.duration_minutes && (
            <span className="text-[12px] font-mono font-semibold text-mutedText">
              {op.duration_minutes}m
            </span>
          )}
          <div className="w-6 h-6 rounded-full bg-primary-soft flex items-center justify-center text-primary">
            <Check size={13} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 h-full max-w-[1600px] mx-auto select-none animate-fade-in overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. LEFT / MAIN AI CHAT & HERO PANEL                                      */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex-col bg-card rounded-[24px] sm:rounded-[28px] shadow-soft overflow-hidden ${
        mobileViewTab === 'chat' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* TOP HEADER */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 flex-shrink-0 bg-card border-b border-borderToken/40 lg:border-none">
          <div>
            <h1 className="text-[18px] sm:text-[22px] font-serif font-bold text-foreground tracking-tight flex items-center gap-2">
              <span>FocusFlow AI</span>
            </h1>
            <p className="text-[11.5px] sm:text-[12px] text-mutedText">Your personal productivity companion</p>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Small Screen Tab Switcher */}
            <div className="flex lg:hidden items-center p-0.5 bg-card-subtle rounded-xl border border-borderToken/70">
              <button
                type="button"
                onClick={() => setMobileViewTab('chat')}
                className={`px-3 py-1 rounded-lg text-[11.5px] font-medium transition-all ${
                  mobileViewTab === 'chat'
                    ? 'bg-primary text-primary-text font-semibold shadow-xs'
                    : 'text-mutedText hover:text-foreground'
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setMobileViewTab('sidebar')}
                className={`px-3 py-1 rounded-lg text-[11.5px] font-medium transition-all flex items-center gap-1 ${
                  mobileViewTab === 'sidebar'
                    ? 'bg-primary text-primary-text font-semibold shadow-xs'
                    : 'text-mutedText hover:text-foreground'
                }`}
              >
                <span>History</span>
                {sessions.length > 0 && (
                  <span className="w-3.5 h-3.5 rounded-full bg-primary-soft text-primary text-[9.5px] flex items-center justify-center font-bold">
                    {sessions.length}
                  </span>
                )}
              </button>
            </div>

            {/* More Options Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu((v) => !v)}
                className="p-2 rounded-full bg-card-subtle hover:bg-card-muted text-textSecondary hover:text-foreground border border-borderToken/50 transition-all cursor-pointer"
                title="More Options"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-2xl shadow-xl border border-borderToken p-1.5 z-50 animate-enter-up space-y-1 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleStartNewChat();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>New Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleClearAllChats();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-tag-important hover:bg-tag-importantBg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Clear All Chats</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setCurrentTab('preferences');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                  >
                    <SettingsIcon size={14} />
                    <span>AI Preferences</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time In-App Model Download Progress Banner */}
        {downloadingInApp && (
          <div className="m-4 mb-0 bg-card rounded-[24px] p-4 border border-primary/30 shadow-soft space-y-2 animate-enter-up">
            <div className="flex items-center justify-between text-[12.5px] font-medium">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <RefreshCw size={14} className="animate-spin" />
                <span>Downloading {currentInAppMeta.name} from Hugging Face...</span>
              </div>
              <span className="font-mono font-bold text-primary">{downloadProgressPercent}%</span>
            </div>
            <div className="w-full bg-borderToken/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-mutedText font-mono truncate">{downloadProgressText}</p>
          </div>
        )}

        {/* CENTER CONTENT AREA */}
        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col">
          {/* ================================================================= */}
          {/* STATE A: EMPTY / NEW CHAT HERO SCREEN (Dashboard Vector Art)     */}
          {/* ================================================================= */}
          {activeMessages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center max-w-4xl mx-auto w-full my-auto space-y-5 sm:space-y-7 animate-fade-in">
              {/* Dynamic Dashboard SVG Sky Artwork (Morning/Afternoon/Evening/Night) - Grand Size */}
              <div className="flex justify-center items-center overflow-visible my-1 sm:my-2">
                <DiurnalSkyIllustration
                  className="overflow-visible"
                  svgClassName="w-[280px] sm:w-[420px] md:w-[520px] h-[110px] sm:h-[150px] md:h-[190px]"
                />
              </div>

              {/* Greeting Heading */}
              <div className="space-y-1 sm:space-y-1.5">
                <h2 className="text-[22px] sm:text-[30px] font-serif font-bold text-foreground tracking-tight">
                  {greetingText}, {userName}
                </h2>
                <p className="text-[13px] sm:text-[15px] text-mutedText font-medium">
                  How can I help you today?
                </p>
              </div>

              {/* 4 Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3.5 w-full pt-1">
                {heroActionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleSend(card.prompt)}
                      className="p-3.5 sm:p-4 rounded-2xl bg-card-subtle hover:bg-card-muted border border-borderToken/60 transition-colors duration-150 cursor-pointer text-left flex flex-col justify-between min-h-[110px] sm:h-[135px]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                        <Icon size={17} />
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <h3 className="text-[13px] sm:text-[13.5px] font-semibold text-foreground">
                          {card.title}
                        </h3>
                        <p className="text-[11px] text-mutedText line-clamp-2 mt-0.5 leading-snug">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* STATE B: ACTIVE CONVERSATION THREAD (Matching Screenshot 2)     */
            /* =============================================================== */
            <div className="space-y-5 max-w-4xl mx-auto w-full flex-1">
              {/* Load Previous Messages Trigger Banner */}
              {hasMoreMessages && (
                <div className="flex justify-center pb-2 pt-1 animate-fade-in">
                  <button
                    type="button"
                    onClick={handleLoadMoreMessages}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground text-[12px] font-medium border border-borderToken transition-all cursor-pointer shadow-none active:scale-95"
                  >
                    <RotateCcw size={13} className="text-primary" />
                    <span>Scroll up or click to load {hiddenCount} previous {hiddenCount === 1 ? 'message' : 'messages'}</span>
                  </button>
                </div>
              )}

              {(() => {
                const lastAiOpMsgId = [...displayedMessages]
                  .reverse()
                  .find((m) => m.sender === 'ai' && m.payload?.operations && m.payload.operations.length > 0)?.id;

                return displayedMessages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  const isJsonOpen = showRawJsonMap[msg.id];
                  const isLatestProposal = msg.id === lastAiOpMsgId;
                  const isNewest = msg.id === displayedMessages[displayedMessages.length - 1]?.id;

                  return (
                    <div key={msg.id} data-msg-id={msg.id} className={`space-y-2 ${isNewest ? 'animate-enter-up' : ''}`}>
                      {/* ----------------- USER MESSAGE BUBBLE (With Profile Image) ----------------- */}
                      {!isAi ? (
                        <div className="flex justify-end gap-3 items-start pl-8">
                          <div className="max-w-[85%] sm:max-w-[75%] rounded-[24px] bg-primary text-primary-text p-4 sm:p-5 shadow-xs space-y-1 text-left">
                            <div className="flex items-center justify-between gap-3 text-[11.5px] opacity-90 pb-1 font-medium">
                              <span className="font-semibold">{userName}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="text-[13.5px] sm:text-[14px] leading-relaxed select-text font-normal">
                              {msg.text}
                            </p>
                          </div>

                          {/* User Profile Avatar */}
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 mt-1 border border-borderToken shadow-xs">
                            <img
                              src={settings.userAvatar || '/avatar_jay.jpg'}
                              alt={userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If image fails, fallback gracefully to User icon
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <User size={15} />
                          </div>
                        </div>
                      ) : (
                        /* ----------------- AI RESPONSE CARD ----------------- */
                        <div className="flex justify-start gap-3 items-start pr-8">
                          <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 mt-1 border border-borderToken">
                            <Leaf size={15} />
                          </div>

                          <div className="max-w-[92%] sm:max-w-[85%] rounded-[24px] bg-card border border-borderToken/80 shadow-soft p-5 sm:p-6 space-y-4 text-left">
                            {/* AI Card Header */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-[15px] font-serif font-bold text-foreground">
                                  FocasFlow Assistant
                                </h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${msg.payload?.engineSource === 'heuristic_fallback'
                                    ? 'bg-tag-learningBg text-tag-learning border border-tag-learning/30'
                                    : msg.isDiscarded
                                      ? 'bg-tag-importantBg text-tag-important'
                                      : msg.isApplied
                                        ? 'bg-tag-healthBg text-tag-health'
                                        : !isLatestProposal && msg.payload?.operations && msg.payload.operations.length > 0
                                          ? 'bg-card-subtle text-mutedText border border-borderToken/60'
                                          : msg.payload?.operations && msg.payload.operations.length > 0
                                            ? 'bg-primary-soft text-primary'
                                            : 'bg-primary-soft text-primary'
                                  }`}>
                                  {msg.payload?.engineSource === 'heuristic_fallback'
                                    ? 'AI Offline (Rule Engine)'
                                    : msg.isDiscarded
                                      ? 'Discarded'
                                      : msg.isApplied
                                        ? 'Changes Applied'
                                        : !isLatestProposal && msg.payload?.operations && msg.payload.operations.length > 0
                                          ? 'Superseded'
                                          : msg.payload?.operations && msg.payload.operations.length > 0
                                            ? 'Proposed Schedule'
                                            : 'Assistant'}
                                </span>
                              </div>
                              <span className="text-[11.5px] text-mutedText">{msg.timestamp}</span>
                            </div>

                            {/* Offline Heuristic Fallback Notification Banner */}
                            {msg.payload?.engineSource === 'heuristic_fallback' && (
                              <div className="flex items-center gap-2 p-2.5 px-3 rounded-xl bg-tag-learningBg/80 border border-tag-learning/30 text-tag-learning text-[12px] font-medium">
                                <AlertCircle size={14} className="flex-shrink-0" />
                                <span>
                                  {msg.payload.warning || 'AI model is offline or unreachable. Responded using offline heuristic rule engine.'}
                                </span>
                              </div>
                            )}

                            {/* AI Response Text */}
                            <p className="text-[13.5px] sm:text-[14px] text-foreground leading-relaxed select-text whitespace-pre-wrap">
                              {msg.text}
                            </p>

                            {/* Render Structured Schedule Timeline (if operations were generated and not discarded) */}
                            {!msg.isDiscarded && msg.payload?.operations && msg.payload.operations.length > 0 && (
                              <div className="space-y-2 pt-1">
                                {msg.payload.operations.map((op, idx) =>
                                  renderSchedulePreviewItem(op, idx)
                                )}

                                {/* Action Buttons: ONLY on the latest active proposal! */}
                                {isLatestProposal && (
                                  <div className="pt-2">
                                    {msg.isApplied ? (
                                      /* Once changes are applied, show ONLY the confirmed status badge, NO discard / refine / re-apply buttons! */
                                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-tag-healthBg border border-tag-health/30 text-tag-health text-[12.5px] font-semibold w-fit">
                                        <Check size={15} strokeWidth={2.5} />
                                        <span>Changes Applied to Schedule</span>
                                      </div>
                                    ) : (
                                      /* Pending proposal: Show Apply Changes, Refine, Discard buttons */
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {/* 1. Apply Changes */}
                                        <button
                                          type="button"
                                          onClick={() => handleApplyChanges(msg.id, msg.payload!)}
                                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold bg-primary hover:bg-primary-hover text-white transition-all cursor-pointer shadow-none active:scale-95"
                                        >
                                          <Check size={14} strokeWidth={2.5} />
                                          <span>Apply Changes</span>
                                        </button>

                                        {/* 2. Refine Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleRefineChanges(msg.text)}
                                          className="px-3.5 py-2 rounded-xl bg-card-subtle hover:bg-card-muted text-foreground text-[12.5px] font-medium border border-borderToken/60 transition-all cursor-pointer shadow-none"
                                        >
                                          Refine
                                        </button>

                                        {/* 3. Discard Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleDiscardChanges(msg.id)}
                                          className="px-3.5 py-2 rounded-xl bg-card-subtle hover:bg-tag-importantBg text-textSecondary hover:text-tag-important text-[12.5px] font-medium border border-borderToken/60 transition-all cursor-pointer shadow-none"
                                        >
                                          Discard
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Discarded Notice */}
                            {msg.isDiscarded && (
                              <div className="p-2.5 rounded-xl bg-card-subtle text-mutedText text-[12px] italic border border-borderToken/40">
                                Proposed schedule changes were discarded.
                              </div>
                            )}

                            {/* AI Debug Telemetry & Raw JSON (Only if enabled in Preferences) */}
                            {settings.preferences?.enableAiDebugJson && (
                              <div className="pt-3 border-t border-borderToken/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-mutedText font-mono">
                                <span className="px-2 py-0.5 rounded-md bg-card-subtle">
                                  Latency: {msg.payload?.latencyMs || 0}ms • {msg.payload?.modelUsed || activeModelName}
                                </span>

                                {msg.rawJson && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowRawJsonMap((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                                    }
                                    className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
                                  >
                                    <Code2 size={12} />
                                    <span>{isJsonOpen ? 'Hide JSON' : 'Inspect JSON'}</span>
                                  </button>
                                )}

                                {isJsonOpen && msg.rawJson && (
                                  <div className="w-full mt-2 p-3 rounded-xl bg-black/80 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-white/10">
                                    <pre>{msg.rawJson}</pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex justify-start gap-3 items-center animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Leaf size={15} />
                  </div>
                  <div className="p-3.5 px-4 rounded-[22px] bg-card border border-borderToken text-mutedText text-[12.5px] flex items-center gap-2">
                    <RefreshCw size={13} className="animate-spin text-primary" />
                    <span>Recalibrating schedule with {activeModelName}...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* BOTTOM INPUT BAR (Same width as inner content, stacked layout matching reference) */}
        <div className="p-4 sm:p-5 bg-card pt-1 flex-shrink-0">
          <div className="max-w-4xl mx-auto w-full">
            {/* Refine mode prompt banner */}
            {refiningPromptHint && (
              <div className="mb-2.5 px-3.5 py-1.5 rounded-2xl bg-primary-soft text-primary text-[12px] font-medium flex items-center justify-between animate-fade-in border border-primary/20">
                <span>{refiningPromptHint}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRefiningPromptHint(null);
                    setInputVal('');
                  }}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Speech error toast feedback */}
            {speechErrorToast && (
              <div className="mb-2.5 px-3.5 py-2 rounded-2xl bg-tag-importantBg border border-tag-important/30 text-tag-important text-[12px] flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{speechErrorToast}</span>
                </div>
                <button type="button" onClick={() => setSpeechErrorToast(null)} className="hover:opacity-75 cursor-pointer">
                  <X size={13} />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="rounded-[24px] bg-card border border-borderToken p-3 sm:p-3.5 transition-all focus-within:border-primary/60 shadow-none flex flex-col justify-between min-h-[96px]"
            >
              {/* Top area: Input to write anything + Mic button to the right, just above send button */}
              <div className="flex items-start justify-between gap-2">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    isTranscribing
                      ? whisperProgressText || 'Transcribing voice with on-device Whisper Tiny...'
                      : isListening
                        ? '🔴 Recording voice... Click mic when done speaking'
                        : 'Ask anything...'
                  }
                  className="w-full bg-transparent text-[14px] sm:text-[14.5px] text-foreground placeholder-mutedText outline-none border-none font-normal resize-none px-1.5 pt-0.5"
                />

                {/* Mic Button to the right of "Ask anything...", positioned above the send button */}
                <button
                  type="button"
                  onClick={handleSpeechRecognition}
                  disabled={isTranscribing}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 ${isTranscribing
                      ? 'bg-primary-soft text-primary'
                      : isListening
                        ? 'bg-tag-important text-white animate-pulse'
                        : 'text-mutedText hover:text-foreground hover:bg-card-subtle'
                    }`}
                  title={
                    isTranscribing
                      ? 'Transcribing audio...'
                      : isListening
                        ? 'Click to finish & transcribe with Whisper Tiny'
                        : 'Voice Input (On-Device Whisper Tiny)'
                  }
                >
                  {isTranscribing ? (
                    <RefreshCw size={14} className="animate-spin text-primary" />
                  ) : isListening ? (
                    <MicOff size={16} />
                  ) : (
                    <Mic size={16} />
                  )}
                </button>
              </div>

              {/* Bottom row: + on left, Model pill + Send button on right */}
              <div className="flex items-center justify-between pt-2 px-0.5">
                {/* Left Action Button: + (Quick Prompts) */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setQuickPromptsOpen((v) => !v)}
                      className="w-8 h-8 rounded-full border border-borderToken/80 hover:border-primary/40 hover:bg-card-subtle text-mutedText hover:text-foreground flex items-center justify-center transition-all cursor-pointer shadow-none"
                      title="Quick Prompts"
                    >
                      <Plus size={15} />
                    </button>

                    {quickPromptsOpen && (
                      <div className="absolute bottom-11 left-0 w-64 bg-card rounded-2xl shadow-xl border border-borderToken p-1.5 z-50 animate-enter-up space-y-1 text-left">
                        <div className="px-2.5 py-1 text-[10.5px] font-semibold text-mutedText uppercase tracking-wider">
                          Insert Template
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInputVal('Reschedule my unfinished tasks to tomorrow morning');
                            setQuickPromptsOpen(false);
                          }}
                          className="w-full text-left p-2 rounded-xl text-[11.5px] text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                        >
                          Reschedule unfinished tasks
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputVal('Carve out a 15m mindful breathing pause at 2:00 PM');
                            setQuickPromptsOpen(false);
                          }}
                          className="w-full text-left p-2 rounded-xl text-[11.5px] text-foreground hover:bg-card-subtle transition-colors cursor-pointer"
                        >
                          Insert 15m breathing pause
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Tools: Current AI Model Selector Pill + Circular Send Arrow */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {/* Model Selector Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowModelDropdown((v) => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card-subtle hover:bg-card-muted text-foreground text-[12px] font-medium border border-borderToken/80 transition-all cursor-pointer shadow-none"
                    >
                      <Sparkles size={13} className="text-primary" />
                      <span className="font-mono text-[11.5px] font-semibold">{activeModelName || 'Default'}</span>
                      <ChevronDown size={13} className="text-mutedText" />
                    </button>

                    {showModelDropdown && (
                      <div className="absolute bottom-11 right-0 w-72 bg-card rounded-2xl shadow-xl border border-borderToken p-2.5 z-50 animate-enter-up space-y-1.5 text-left">
                        <div className="px-2.5 py-1 text-[10.5px] font-semibold text-mutedText uppercase tracking-wider">
                          Select Brain Engine
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowModelDropdown(false);
                            setCurrentTab('settings');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-card-subtle hover:bg-primary-soft text-foreground text-[12px] font-medium transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Cpu size={14} className="text-primary" />
                            <span>Configure Models & Keys</span>
                          </div>
                          <ArrowRight size={13} className="text-mutedText" />
                        </button>

                        <div className="p-2 rounded-xl bg-card-subtle text-[11px] text-mutedText flex items-center justify-between">
                          <span>Status: {statusMessage || 'Ready'}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${connectionStatus === 'connected'
                                ? 'bg-tag-health'
                                : connectionStatus === 'model_missing'
                                  ? 'bg-tag-learning'
                                  : 'bg-tag-important'
                              }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Circular Send Arrow Button */}
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || loading}
                    className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover active:scale-95 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-none"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT SIDEBAR PANEL: SINGLE CARD WITH DIVIDERS                        */}
      {/* ========================================================================= */}
      <div className={`w-full lg:w-[320px] bg-card rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-soft flex-col justify-between flex-shrink-0 overflow-y-auto border border-borderToken/70 ${
        mobileViewTab === 'sidebar' ? 'flex flex-1' : 'hidden lg:flex'
      }`}>
        <div className="space-y-4">
          {/* SECTION 1: SUGGESTIONS */}
          <div>
            <div className="flex items-center justify-between pb-2.5">
              <h2 className="text-[14px] font-serif font-bold text-foreground">Suggestions</h2>
              <button
                type="button"
                onClick={() => handleSend("Give me fresh suggestions for my focus blocks today.")}
                className="text-mutedText hover:text-foreground transition-colors p-1 cursor-pointer"
                title="Refresh suggestions"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            <div className="space-y-1.5">
              {sidebarSuggestions.map((sug, idx) => {
                const Icon = sug.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleSend(sug.prompt);
                      setMobileViewTab('chat');
                    }}
                    disabled={loading}
                    className="w-full flex items-center gap-2.5 p-2 px-3 rounded-xl bg-card-subtle hover:bg-primary-soft hover:text-primary text-textSecondary text-[12.5px] font-medium transition-colors text-left cursor-pointer border border-transparent hover:border-primary/20 disabled:opacity-50"
                  >
                    <Icon size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate text-foreground font-normal">{sug.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INNER CARD DIVIDER LINE */}
          <div className="border-t border-borderToken/60 my-2" />

          {/* SECTION 2: PREVIOUS CHATS & NEW CHAT BUTTON */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-serif font-bold text-foreground">Previous Chats</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    handleStartNewChat();
                    setMobileViewTab('chat');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-soft hover:bg-primary text-primary hover:text-primary-text text-[11px] font-semibold transition-all cursor-pointer"
                  title="Start a new chat thread"
                >
                  <Plus size={12} />
                  <span>New</span>
                </button>

                {sessions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllChats}
                    className="text-mutedText hover:text-tag-important transition-colors p-1 cursor-pointer"
                    title="Clear all chat history"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[220px] lg:max-h-[170px] overflow-y-auto space-y-1.5 pr-1">
              {sessions.length === 0 ? (
                <p className="text-[12px] text-mutedText text-center py-4">No previous chats yet.</p>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setMobileViewTab('chat');
                      }}
                      className={`group flex items-center justify-between gap-2 p-2 px-2.5 rounded-xl transition-all cursor-pointer border ${isActive
                          ? 'bg-primary-soft border-primary/30 font-medium'
                          : 'bg-card-subtle hover:bg-card-muted border-transparent'
                        }`}
                    >
                      <div className="min-w-0 flex items-center gap-2 flex-1">
                        <MessageSquare size={13} className="text-primary flex-shrink-0" />
                        <span className="text-[12px] text-foreground font-normal truncate">
                          {session.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10.5px] font-mono text-mutedText">
                          {session.dateLabel || 'Today'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-mutedText hover:text-tag-important transition-opacity cursor-pointer"
                          title="Delete chat"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM WATERMARK QUOTE SECTION */}
        <div className="mt-4 pt-3 border-t border-borderToken/60 relative overflow-hidden flex items-center min-h-[44px]">
          <p className="text-[11px] text-mutedText italic leading-relaxed relative z-10">
            &ldquo;Small consistent practices build a tranquil life.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
