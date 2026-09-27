"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reports when an element is at (or near) the viewport.
 *
 * Deliberately does not rely on IntersectionObserver alone. Some browsers and
 * embedded webviews never deliver the initial callback for an element that is
 * already on screen when observation starts, which would leave anything gated
 * on it stuck forever — invisible content, or a list that never loads.
 *
 * So: measure the element directly on mount, and only fall back to an observer
 * (plus scroll/resize listeners) if it starts off screen.
 */
export function useInView<T extends HTMLElement>(margin = 0) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      // Nothing to measure — fail open rather than hide content.
      setInView(true);
      return;
    }

    const isNear = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      return (
        rect.top < vh + margin &&
        rect.bottom > -margin &&
        rect.left < vw + margin &&
        rect.right > -margin
      );
    };

    if (isNear()) {
      setInView(true);
      return;
    }

    let settled = false;
    let observer: IntersectionObserver | undefined;

    const cleanup = () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };

    const mark = () => {
      if (settled) return;
      settled = true;
      setInView(true);
      cleanup();
    };

    function onMove() {
      if (isNear()) mark();
    }

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) mark();
        },
        { rootMargin: `${margin}px` }
      );
      observer.observe(node);
    }

    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);

    return cleanup;
  }, [margin]);

  return { ref, inView };
}
