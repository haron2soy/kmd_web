import { useEffect, useRef } from "react";

export function useScrollToHeaderArc(navbarHeight: number = 80) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scrollToHeader = () => {
      if (!headerRef.current) return;

      const elementTop =
        headerRef.current.getBoundingClientRect().top + window.scrollY;

      const targetScroll = elementTop - navbarHeight;

      window.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    };

    // wait for DOM paint
    const timer = setTimeout(scrollToHeader, 100);

    return () => clearTimeout(timer);
  }, []); // ✅ runs only once on mount

  return { headerRef };
}