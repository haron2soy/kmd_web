import { useEffect, useRef } from "react";

// Overloads
export function useScrollToHeader<T extends HTMLElement>(
  navbarHeight?: number
): {
  headerRef: React.RefObject<T | null>;
};

export function useScrollToHeader<T extends HTMLElement>(
  deps: any[],
  navbarHeight?: number
): {
  headerRef: React.RefObject<T | null>;
};

// Implementation
export function useScrollToHeader<T extends HTMLElement>(
  depsOrHeight?: any[] | number,
  maybeHeight?: number
) {
  const headerRef = useRef<T | null>(null);

  // ✅ Normalize arguments safely
  const deps: any[] = Array.isArray(depsOrHeight) ? depsOrHeight : [];
  const height: number =
    typeof depsOrHeight === "number"
      ? depsOrHeight
      : maybeHeight ?? 80; // fallback default

  useEffect(() => {
    if (!headerRef.current) return;

    const scrollToHeader = () => {
      const el = headerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      if (
        rect.top >= height &&
        rect.bottom <= window.innerHeight
      ) return;

      const elementTop = rect.top + window.scrollY;
      const target = Math.max(0, elementTop - height);

      window.scrollTo({
        top: target,
        behavior: "smooth",
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(scrollToHeader, 0);
      });
    });

  }, [...deps, height]); // ✅ always safe

  return { headerRef };
}