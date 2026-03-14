import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      const el = containerRef.current;
      if (!el) return;

      // Exit animation
      gsap.to(el, {
        opacity: 0,
        y: 8,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          prevPath.current = location.pathname;
          // Enter animation
          gsap.fromTo(
            el,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
          );
        },
      });
    }
  }, [location.pathname]);

  return (
    <div ref={containerRef} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
