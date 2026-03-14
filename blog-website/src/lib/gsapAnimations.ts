import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP scroll-triggered reveal for a container of elements.
 * Attaches once, auto-cleans up.
 */
export function useGsapReveal(
  containerRef: React.RefObject<HTMLElement>,
  selector: string = "[data-gsap]",
  options?: {
    y?: number;
    duration?: number;
    stagger?: number;
    start?: string;
  }
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targets = el.querySelectorAll(selector);
    if (targets.length === 0) return;

    // Set initial state
    gsap.set(targets, {
      opacity: 0,
      y: options?.y ?? 30,
      willChange: "transform, opacity",
    });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: options?.duration ?? 0.8,
        stagger: options?.stagger ?? 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: options?.start ?? "top 85%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [containerRef, selector]);
}

/**
 * Parallax scroll effect for an element.
 */
export function useGsapParallax(
  ref: React.RefObject<HTMLElement>,
  speed: number = 0.3
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [ref, speed]);
}

/**
 * Smooth counter animation triggered on scroll.
 */
export function useGsapCounter(
  ref: React.RefObject<HTMLElement>,
  target: number,
  duration: number = 1.5
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: target,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          el.textContent = Math.floor(obj.val).toString();
        },
      });
    });

    return () => ctx.revert();
  }, [ref, target, duration]);
}

/**
 * Magnetic hover effect for buttons/cards.
 */
export function useMagneticHover(ref: React.RefObject<HTMLElement>, strength: number = 0.3) {
  const handleMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [ref, strength]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [ref, handleMove, handleLeave]);
}

/**
 * Stagger children reveal from a parent ref
 */
export function gsapStaggerReveal(
  parentEl: HTMLElement | null,
  childSelector: string,
  opts?: { y?: number; delay?: number; stagger?: number }
) {
  if (!parentEl) return;
  const children = parentEl.querySelectorAll(childSelector);
  if (children.length === 0) return;

  gsap.fromTo(
    children,
    { opacity: 0, y: opts?.y ?? 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: opts?.stagger ?? 0.06,
      delay: opts?.delay ?? 0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: parentEl,
        start: "top 80%",
        once: true,
      },
    }
  );
}

/**
 * Smooth text split reveal.
 */
export function useGsapTextReveal(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const text = el.textContent || "";
    const words = text.split(" ");
    el.innerHTML = words
      .map((w) => `<span class="inline-block overflow-hidden"><span class="inline-block gsap-word" style="transform: translateY(100%)">${w}</span></span>`)
      .join(" ");

    const wordEls = el.querySelectorAll(".gsap-word");
    const ctx = gsap.context(() => {
      gsap.to(wordEls, {
        y: 0,
        duration: 0.7,
        stagger: 0.03,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [ref]);
}

/**
 * Scale reveal for cards / images.
 */
export function useGsapScaleReveal(ref: React.RefObject<HTMLElement>, delay: number = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, scale: 0.92 });
    const ctx = gsap.context(() => {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [ref, delay]);
}
