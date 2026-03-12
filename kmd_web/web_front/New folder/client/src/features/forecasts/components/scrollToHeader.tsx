import { useState, useRef, useEffect, useLayoutEffect } from "react";
//import type {RefObject} from 'react';
/**
 * Custom hook to manage image state and scroll to a header just below the navbar
 * @param navbarHeight height of the fixed navbar (in px)
 * @returns { image, setImage, headerRef } 
 */
export function useScrollToHeader(navbarHeight: number = 80) {
  const [image, setImage] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const scrollToHeader = () => {
    if (!headerRef.current) return;

    const elementTop =
      headerRef.current.getBoundingClientRect().top + window.scrollY;
    const targetScroll = elementTop - navbarHeight;

    window.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "instant",
    });
  };

  // Run after layout
  useLayoutEffect(() => {
    scrollToHeader();

    const timer = setTimeout(scrollToHeader, 50); // extra check
    return () => clearTimeout(timer);
  }, []);

  // Scroll when image changes (in case layout shifts)
  useEffect(() => {
    if (image) {
      const timer = setTimeout(scrollToHeader, 150);
      return () => clearTimeout(timer);
    }
  }, [image]);

  return { image, setImage, headerRef };
}