import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauriEnv, setIsTauriEnv] = useState(false);

  useEffect(() => {
    // Check if running inside Tauri environment and disable native decorations
    const checkTauri = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const appWin = getCurrentWindow();
        if (appWin) {
          setIsTauriEnv(true);
          // Dynamically disable native OS decorations in runtime
          try {
            await appWin.setDecorations(false);
          } catch {}

          const max = await appWin.isMaximized();
          setIsMaximized(max);

          // Listen for resize / maximize events
          const unlisten = await appWin.onResized(async () => {
            const isMax = await appWin.isMaximized();
            setIsMaximized(isMax);
          });

          return () => {
            unlisten();
          };
        }
      } catch {
        setIsTauriEnv(false);
      }
    };

    checkTauri();
  }, []);

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch {}
  };

  const handleToggleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().toggleMaximize();
      const max = await getCurrentWindow().isMaximized();
      setIsMaximized(max);
    } catch {}
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch {}
  };

  return (
    <div
      data-tauri-drag-region
      onDoubleClick={handleToggleMaximize}
      className="w-full h-8 bg-background flex items-center justify-between px-3 select-none z-50 border-b border-borderToken/30 transition-colors flex-shrink-0"
    >
      {/* Left: App Brand & Icon */}
      <div data-tauri-drag-region className="flex items-center gap-2 pointer-events-none">
        <img src="/app-icon.png" alt="FocusFlow Icon" className="w-4 h-4 rounded-md object-cover" />
        <span className="text-[11.5px] font-medium text-textSecondary tracking-wide">
          FocusFlow <span className="text-mutedText font-normal">— Daily Life OS</span>
        </span>
      </div>

      {/* Center Drag Region */}
      <div data-tauri-drag-region className="flex-1 h-full cursor-default" />

      {/* Right: Window Controls */}
      <div className="flex items-center gap-1 -mr-1">
        {/* Minimize Button */}
        <button
          type="button"
          data-tauri-control="true"
          onClick={handleMinimize}
          className="w-8 h-6 flex items-center justify-center rounded-md text-textSecondary hover:text-foreground hover:bg-card-muted transition-colors cursor-pointer"
          title="Minimize"
        >
          <Minus size={13} strokeWidth={2} />
        </button>

        {/* Maximize / Restore Button */}
        <button
          type="button"
          data-tauri-control="true"
          onClick={handleToggleMaximize}
          className="w-8 h-6 flex items-center justify-center rounded-md text-textSecondary hover:text-foreground hover:bg-card-muted transition-colors cursor-pointer"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <Copy size={11} strokeWidth={2} className="rotate-90" />
          ) : (
            <Square size={11} strokeWidth={2} />
          )}
        </button>

        {/* Close Button */}
        <button
          type="button"
          data-tauri-control="true"
          onClick={handleClose}
          className="w-8 h-6 flex items-center justify-center rounded-md text-textSecondary hover:text-white hover:bg-[#E81123] transition-colors cursor-pointer"
          title="Close"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
