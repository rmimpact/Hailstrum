import Link from "next/link";

import { Logo } from "./logo";
import { company, nav } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy text-on-navy">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo onNavy />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-on-navy-muted">
              {company.shortDescription}
            </p>
            <p className="mt-4 font-display text-xs uppercase tracking-[0.12em] text-on-navy-muted">
              {company.location}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.12em] !text-on-navy">
              Site
            </h2>
            <ul className="mt-4 space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-on-navy-muted transition-colors hover:text-on-navy"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.12em] !text-on-navy">
              Connect
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={company.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-on-navy-muted transition-colors hover:text-on-navy"
                >
                  <InstagramIcon />
                  {company.instagramHandle}
                </a>
              </li>
              {company.email && (
                <li>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm text-on-navy-muted transition-colors hover:text-on-navy"
                  >
                    {company.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-navy-line pt-6 text-xs text-on-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}. Built at{" "}
            {company.university}.
          </p>
          <Link
            href="/admin"
            className="transition-colors hover:text-on-navy"
          >
            Team login
          </Link>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
