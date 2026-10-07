import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, CornerDownLeft, Loader2, Mic, MicOff } from 'lucide-react';
import { sendAiCommand } from '../engine/aiClient';

export const AiCommandBar: React.FC = () => {
  const { tasks, habits, settings, applyAiOperations, aiLoading, setAiLoading } = useAppStore();
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);

  const samplePrompts = [
    'I have a meeting at 4 PM today',
    'Skip workout today',
    'Add 2 hours for client API',
    'Add 30 min reading every evening',
  ];

  const recognitionRef = React.useRef<any>(null);

  const toggleSpeechRecognition = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Voice dictation is supported in modern Chrome, Edge, and Chromium-based browsers.');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      alert('Microphone permission denied. Please allow microphone access in browser settings.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      const initialText = inputVal;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        const currentSpoken = (finalTrans || interimTrans).trim();
        if (currentSpoken) {
          const sep = initialText && !initialText.endsWith(' ') ? ' ' : '';
          setInputVal(initialText ? `${initialText}${sep}${currentSpoken}` : currentSpoken);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || aiLoading) return;

    const query = inputVal.trim();
    setInputVal('');
    setAiLoading(true);

    try {
      const result = await sendAiCommand(query, tasks, habits, settings);
      applyAiOperations(result);

      // Append to persistent chat history
      try {
        const existingHistory = JSON.parse(localStorage.getItem('focusflow_ai_chat_history') || '[]');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        existingHistory.push(
          {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: query,
            timestamp: time,
          },
          {
            id: `ai-${Date.now() + 1}`,
            sender: 'ai',
            text: result.message || 'Task operations processed successfully.',
            timestamp: time,
            payload: result,
            rawJson: JSON.stringify(result, null, 2),
          }
        );
        localStorage.setItem('focusflow_ai_chat_history', JSON.stringify(existingHistory));
      } catch {}
    } catch (err) {
      console.error('AI command failed:', err);
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full bg-card rounded-[28px] p-4 sm:p-5 shadow-soft select-none transition-colors">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* AI Icon */}
        <div className="w-9 h-9 rounded-2xl bg-primary-soft flex items-center justify-center text-primary flex-shrink-0">
          {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isListening ? "Listening to your voice..." : "Tell FocusFlow what's changed... (e.g. 'Meeting at 3 PM', 'Move DSA to tomorrow')"}
          className="flex-1 bg-transparent text-[14.5px] text-foreground placeholder-mutedText outline-none border-none font-medium"
        />

        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isListening 
              ? 'bg-tag-important text-white animate-pulse shadow-xs' 
              : 'bg-card-subtle hover:bg-card-muted text-mutedText hover:text-foreground'
          }`}
          title={isListening ? 'Listening (Click to stop)' : 'Voice Input (Hands-free)'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Submit Enter Button */}
        <button
          type="submit"
          disabled={!inputVal.trim() || aiLoading}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-[13px] font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>Ask</span>
          <CornerDownLeft size={13} />
        </button>
      </form>

      {/* Suggested Quick Chips */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-borderToken overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-mutedText font-semibold uppercase tracking-wider flex-shrink-0">
          Suggestions:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputVal(prompt)}
            className="px-3 py-1 rounded-full bg-card-subtle hover:bg-card-muted text-textSecondary hover:text-foreground whitespace-nowrap transition-colors font-sans cursor-pointer text-[12px]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
