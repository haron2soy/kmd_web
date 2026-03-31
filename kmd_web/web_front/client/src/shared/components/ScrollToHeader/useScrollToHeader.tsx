import { useLayoutEffect, useRef } from "react";

/**
 * Hook: useScrollToHeader
 *
 * Scrolls the viewport to a referenced header element,
 * offsetting for a fixed navbar height.
 *
 * Supports:
 *  - useScrollToHeader(height)
 *  - useScrollToHeader(deps, height)
 */

type UseScrollToHeaderReturn<T extends HTMLElement> = {
  headerRef: React.RefObject<T | null>;
};

// Overload signatures
export function useScrollToHeader<T extends HTMLElement>(
  navbarHeight?: number
): UseScrollToHeaderReturn<T>;

export function useScrollToHeader<T extends HTMLElement>(
  deps: unknown[],
  navbarHeight?: number
): UseScrollToHeaderReturn<T>;

// Implementation
export function useScrollToHeader<T extends HTMLElement>(
  depsOrHeight?: unknown[] | number,
  maybeHeight?: number
): UseScrollToHeaderReturn<T> {
  const headerRef = useRef<T | null>(null);

  // Normalize arguments
  const deps: unknown[] = Array.isArray(depsOrHeight) ? depsOrHeight : [];
  const navbarHeight: number =
    typeof depsOrHeight === "number"
      ? depsOrHeight
      : maybeHeight ?? 80;

  useLayoutEffect(() => {
    const element = headerRef.current;
    if (!element) return;

    const scrollToHeader = () => {
      const { top } = element.getBoundingClientRect();
      const absoluteTop = top + window.scrollY;
      const targetPosition = Math.max(0, absoluteTop - navbarHeight);

      window.scrollTo({
        top: targetPosition,
        behavior: "auto", // deterministic for initial load
      });
    };

    // Delay ensures layout stabilization (fonts, images, hydration)
    const timer = window.setTimeout(scrollToHeader, 50);

    return () => window.clearTimeout(timer);
  }, [...deps, navbarHeight]);

  return { headerRef };
}