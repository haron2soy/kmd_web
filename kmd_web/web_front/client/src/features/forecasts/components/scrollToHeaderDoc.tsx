import { useEffect ,useRef } from "react";

export function useScrollToHeaderDoc(navbarHeight: number = 80, trigger?: any) {
  const headerRef = useRef<HTMLElement>(null);

  const scrollToHeader = () => {
    if (!headerRef.current) return;

    const elementTop =
      headerRef.current.getBoundingClientRect().top + window.scrollY;

    const targetScroll = elementTop - navbarHeight;

    window.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth", // ✅ fixed
    });
  };

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(scrollToHeader, 50); // wait for DOM paint
    return () => clearTimeout(timer);
  }, [trigger]);

  return { headerRef };
}