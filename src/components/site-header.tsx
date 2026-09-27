"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "./logo";
import { ButtonLink } from "./ui";
import { nav } from "@/lib/content";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile menu whenever the route changes. Adjusting state during
  // render (rather than in an effect) is React's documented way to reset state
  // when a value changes — it avoids the extra commit an effect would cause.
  const [menuRoute, setMenuRoute] = useState(pathname);
  if (menuRoute !== pathname) {
    setMenuRoute(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    // Deferred a frame so the first measurement doesn't re-render mid-effect.
    // It still runs before paint matters, and it catches a page restored at a
    // scrolled position.
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Stop the page scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200 ${
        scrolled || open
          ? "border-b border-line bg-bg/85 backdrop-blur-lg"
          : "border-b border-transparent bg-bg/0"
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <Link href="/" className="rounded-md" aria-label="Hailstrum, home">
            <Logo />
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-[0.875rem] font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-accent-ink"
                    : "text-ink-body hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">

            {/* Wrapped rather than given `hidden sm:inline-flex` directly: the
                button's own `inline-flex` is the same CSS property, so which
                one wins depends on stylesheet order, not class order. */}
            <span className="hidden sm:flex">
              <ButtonLink href="/contact" size="sm">
                Get in touch
              </ButtonLink>
            </span>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink md:hidden"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-line bg-bg md:hidden"
        >
          <nav className="container-page flex flex-col py-3" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-base font-medium ${
                  isActive(item.href)
                    ? "bg-accent-soft text-accent-ink"
                    : "text-ink-body"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href="/contact" className="mt-3 w-full">
              Get in touch
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
