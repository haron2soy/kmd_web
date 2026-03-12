import { useEffect, useRef } from "react";

export function useScrollToHeader(navbarHeight: number = 80) {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;

    const scrollToHeader = () => {
      const el = headerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      // ✅ Only scroll if header is not already visible
      if (rect.top >= navbarHeight && rect.top <= window.innerHeight) return;

      const elementTop = rect.top + window.scrollY;
      const target = Math.max(0, elementTop - navbarHeight);

      window.scrollTo({
        top: target,
        behavior: "smooth",
      });
    };

    // ✅ Run after layout stabilizes (better than setTimeout)
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToHeader);
    });

  }, []);

  return { headerRef };
}