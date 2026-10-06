/**
 * Sound Effects Engine for FocusFlow
 * Handles instant tactile click sounds and completion "thing-thing" chimes.
 */

const COMPLETION_SOUND_PATH = '/sound effects/tick-ting.mp3';
const CLICK_SOUND_PATH = '/sound effects/mouse-click-single.mp3';

class SoundEffectsManager {
  private completionAudioPool: HTMLAudioElement[] = [];
  private clickAudioPool: HTMLAudioElement[] = [];
  private poolSize = 6;
  private completionIndex = 0;
  private clickIndex = 0;
  private lastClickTime = 0;
  private lastCompletionTime = 0;
  private isInitialized = false;

  constructor() {
    this.initPools();
  }

  private initPools() {
    if (typeof window === 'undefined') return;

    try {
      for (let i = 0; i < this.poolSize; i++) {
        const compAudio = new Audio(COMPLETION_SOUND_PATH);
        compAudio.preload = 'auto';
        this.completionAudioPool.push(compAudio);

        const clickAudio = new Audio(CLICK_SOUND_PATH);
        clickAudio.preload = 'auto';
        this.clickAudioPool.push(clickAudio);
      }
      this.isInitialized = true;
    } catch {
      // Audio not supported or SSR
    }
  }

  /**
   * Play the completion sound (tick-ting.mp3)
   * Used when completing a task, checking a habit, finishing a goal, etc.
   * Cancels and silences any overlapping click sound.
   */
  public playCompletion(volume = 0.75) {
    try {
      this.lastCompletionTime = performance.now();

      // Immediately silence any mouse click audio that may have just fired
      for (const clickAudio of this.clickAudioPool) {
        if (!clickAudio.paused && clickAudio.currentTime < 0.2) {
          clickAudio.pause();
          clickAudio.currentTime = 0;
        }
      }

      if (!this.isInitialized && this.completionAudioPool.length === 0) {
        this.initPools();
      }
      if (this.completionAudioPool.length === 0) return;

      const audio = this.completionAudioPool[this.completionIndex];
      this.completionIndex = (this.completionIndex + 1) % this.completionAudioPool.length;

      audio.pause();
      audio.currentTime = 0;
      audio.volume = Math.min(1, Math.max(0, volume));
      
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Auto-play was prevented before user interaction
        });
      }
    } catch {
      // Ignore playback errors
    }
  }

  /**
   * Play tactile mouse click sound (mouse-click-single.mp3)
   * Used for buttons, switches, tabs, and interactive clickable elements.
   * Will NOT play if a completion event triggered recently.
   */
  public playClick(volume = 0.45) {
    try {
      const now = performance.now();

      // If a completion happened in the last 220ms, do NOT play click sound
      if (now - this.lastCompletionTime < 220) return;

      // Debounce rapid duplicate events within 35ms
      if (now - this.lastClickTime < 35) return;
      this.lastClickTime = now;

      if (!this.isInitialized && this.clickAudioPool.length === 0) {
        this.initPools();
      }
      if (this.clickAudioPool.length === 0) return;

      const audio = this.clickAudioPool[this.clickIndex];
      this.clickIndex = (this.clickIndex + 1) % this.clickAudioPool.length;

      audio.pause();
      audio.currentTime = 0;
      audio.volume = Math.min(1, Math.max(0, volume));

      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Auto-play prevented
        });
      }
    } catch {
      // Ignore playback errors
    }
  }
}

export const soundEffects = new SoundEffectsManager();

/**
 * Helper shortcuts
 */
export const playCompletionSound = (volume?: number) => soundEffects.playCompletion(volume);
export const playClickSound = (volume?: number) => soundEffects.playClick(volume);

/**
 * Global handler to attach to window/document to automatically play click sound
 * on any button, role="button", clickable tab, or interactive elements.
 * Skips elements with data-completion-trigger or data-no-click-sound.
 */
export const setupGlobalClickSoundListener = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  const handleClick = (e: MouseEvent) => {
    try {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element or its ancestors is an interactive button or clickable
      const interactiveEl = target.closest<HTMLElement>(
        'button, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], ' +
        'input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], ' +
        'select, a, [data-clickable="true"], .cursor-pointer'
      );

      if (!interactiveEl) return;

      // If marked as completion trigger or explicitly disabled click sound, ignore
      if (
        interactiveEl.getAttribute('data-no-click-sound') === 'true' ||
        interactiveEl.getAttribute('data-completion-trigger') === 'true' ||
        interactiveEl.closest('[data-completion-trigger="true"]') ||
        interactiveEl.closest('[data-no-click-sound="true"]')
      ) {
        return;
      }

      // If element is disabled, skip
      if (interactiveEl.hasAttribute('disabled') || interactiveEl.getAttribute('aria-disabled') === 'true') {
        return;
      }

      soundEffects.playClick();
    } catch {
      // Safe fallback
    }
  };

  document.addEventListener('click', handleClick, { capture: true, passive: true });

  return () => {
    document.removeEventListener('click', handleClick, { capture: true });
  };
};
