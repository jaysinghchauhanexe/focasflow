import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

interface SmoothAutoHeightProps {
  children: React.ReactNode;
  className?: string;
  duration?: number; // milliseconds
  easing?: string;
  overflowOnSettle?: 'visible' | 'hidden';
}

/**
 * SmoothAutoHeight
 * An ultra-smooth container that observes internal DOM height mutations (via ResizeObserver)
 * and smoothly animates height expansions and collapses with cubic-bezier physics.
 * Switches overflow to 'visible' on settle so dropdown menus and tooltips never get clipped.
 */
export const SmoothAutoHeight: React.FC<SmoothAutoHeightProps> = ({
  children,
  className = '',
  duration = 360,
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)', // iOS / macOS natural spring deceleration
  overflowOnSettle = 'visible',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useLayoutEffect(() => {
    if (!contentRef.current) return;

    const handleResize = () => {
      if (contentRef.current) {
        const nextHeight = contentRef.current.offsetHeight;
        setHeight((prev) => {
          if (prev !== undefined && prev !== nextHeight) {
            setIsAnimating(true);
            if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
            animTimeoutRef.current = setTimeout(() => {
              setIsAnimating(false);
            }, duration + 40);
          }
          return nextHeight;
        });
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, [duration]);

  useEffect(() => {
    if (height !== undefined && !isReady) {
      const raf = requestAnimationFrame(() => setIsReady(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [height, isReady]);

  return (
    <div
      ref={containerRef}
      style={{
        height: height !== undefined ? `${height}px` : 'auto',
        transition: isReady ? `height ${duration}ms ${easing}` : 'none',
        overflow: isAnimating ? 'hidden' : overflowOnSettle,
        willChange: 'height',
      }}
      className={className}
    >
      <div ref={contentRef} className="w-full">
        {children}
      </div>
    </div>
  );
};

