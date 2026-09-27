"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "dark" | "auto";

const STORAGE_KEY = "hailstrum-theme";
const CHANGE_EVENT = "hailstrum:themechange";

/**
 * Runs before the page paints, so the correct theme is on <html> from the very
 * first frame and there's no white flash on a dark-mode device.
 *
 * Kept as a string because it has to be injected synchronously into <head>.
 */
export const themeBootstrapScript = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Writes the resolved theme onto <html>. Touches the DOM, not React state. */
function applyTheme(choice: ThemeChoice) {
  const resolved = choice === "auto" ? systemTheme() : choice;
  document.documentElement.setAttribute("data-theme", resolved);
}

/* --------------------------- the stored preference ------------------------ */

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "auto";
  } catch {
    // Private browsing, or storage blocked.
    return "auto";
  }
}

function subscribe(onChange: () => void) {
  // CHANGE_EVENT covers this tab; "storage" covers the preference being changed
  // in another tab.
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const serverChoice = (): ThemeChoice => "auto";

export function useTheme() {
  // localStorage is an external store, so it is read through the API meant for
  // one. During prerender and hydration this is "auto"; React re-renders with
  // the real preference immediately after, with no mismatch and no effect.
  const choice = useSyncExternalStore(subscribe, readChoice, serverChoice);

  // While the visitor hasn't chosen, keep following the operating system live —
  // flipping the OS to dark flips the site with it, without a reload.
  useEffect(() => {
    if (choice !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme("auto");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [choice]);

  const setTheme = useCallback((next: ThemeChoice) => {
    try {
      if (next === "auto") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not fatal — the theme still applies for this page view.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { choice, setTheme };
}

/* --------------------------------- toggle --------------------------------- */

const ORDER: ThemeChoice[] = ["light", "dark", "auto"];

const LABEL: Record<ThemeChoice, string> = {
  light: "Light",
  dark: "Dark",
  auto: "Match device",
};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { choice, setTheme } = useTheme();
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Theme: ${LABEL[choice]} — click for ${LABEL[next].toLowerCase()}`}
      aria-label={`Theme: ${LABEL[choice]}. Switch to ${LABEL[next].toLowerCase()}.`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink ${className}`}
    >
      <span aria-hidden="true">
        {choice === "light" ? (
          <SunIcon />
        ) : choice === "dark" ? (
          <MoonIcon />
        ) : (
          <AutoIcon />
        )}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function AutoIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8 20.5h8" />
    </svg>
  );
}
