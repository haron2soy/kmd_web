import { useEffect, useRef } from "react";

export function ScrolltoHeader<T extends HTMLElement>(offset = 0) {
  const headerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;

    const y =
      headerRef.current.getBoundingClientRect().top +
      window.pageYOffset -
      offset;

    window.scrollTo({ top: y, behavior: "smooth" });
  }, [offset]);

  return { headerRef };
}