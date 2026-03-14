import { useRef, useEffect, useCallback } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultOnSwipe?: boolean;
}

export function useSwipeGesture(
  ref: React.RefObject<HTMLElement | null>,
  options: SwipeOptions
) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const threshold = options.threshold ?? 50;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      const dt = Date.now() - startTime.current;

      // Only count quick swipes (under 500ms)
      if (dt > 500) return;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Horizontal swipe
      if (absDx > absDy && absDx > threshold) {
        if (dx > 0) {
          options.onSwipeRight?.();
        } else {
          options.onSwipeLeft?.();
        }
      }

      // Vertical swipe
      if (absDy > absDx && absDy > threshold) {
        if (dy > 0) {
          options.onSwipeDown?.();
        } else {
          options.onSwipeUp?.();
        }
      }
    },
    [options, threshold]
  );

  useEffect(() => {
    const el = ref.current ?? document;
    el.addEventListener("touchstart", handleTouchStart as EventListener, { passive: true });
    el.addEventListener("touchend", handleTouchEnd as EventListener, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart as EventListener);
      el.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [ref, handleTouchStart, handleTouchEnd]);
}
