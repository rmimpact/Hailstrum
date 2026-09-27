"use client";

import { useEffect, type ElementType, type ReactNode } from "react";

import { useInView } from "@/lib/use-in-view";

/**
 * Fades content up as it scrolls into view.
 *
 * The hidden starting state lives in CSS behind a
 * `prefers-reduced-motion: no-preference` query, so if the visitor has asked
 * for less motion — or JavaScript never runs — the content is simply visible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (inView || reduced) {
      node.setAttribute("data-revealed", "true");
    }
  }, [inView, ref]);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
