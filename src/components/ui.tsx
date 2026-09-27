import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* --------------------------------- buttons -------------------------------- */

type Variant = "primary" | "outline" | "ghost" | "subtle";
type Size = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-display font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-55";

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-[0.9375rem]",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast shadow-soft hover:brightness-110 hover:shadow-lift",
  outline:
    "border border-line-strong bg-surface text-ink hover:border-accent hover:text-accent-ink",
  ghost: "text-ink-body hover:bg-surface-2 hover:text-ink",
  subtle:
    "border border-line bg-white/5 text-ink backdrop-blur hover:bg-white/10 hover:border-line-strong",
};

function classes(variant: Variant, size: Size, extra = "") {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${extra}`;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
}) {
  const cls = classes(variant, size, className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

/* -------------------------------- sections -------------------------------- */

export function Section({
  children,
  className = "",
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "subtle" | "navy";
  id?: string;
}) {
  const tones = {
    default: "bg-bg",
    subtle: "bg-bg-subtle",
    navy: "bg-bg-deep",
  };

  return (
    <section id={id} className={`${tones[tone]} py-20 md:py-28 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl ${className}`}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-[1.75rem] leading-[1.15] md:text-[2.5rem]">
        {title}
      </h2>
      {body && (
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-body">
          {body}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------- cards --------------------------------- */

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-6 ${
        hover
          ? "transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Large number + caption, used for specs and projections. */
export function Stat({
  value,
  unit,
  label,
  note,
}: {
  value: string;
  unit?: string;
  label: string;
  note?: string;
}) {
  return (
    <div>
      <p
        className={`font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] md:text-[2.5rem]`}
      >
        {value}
        {unit && (
          <span
            className={`ml-1 align-top text-[0.5em] font-medium`}
          >
            {unit}
          </span>
        )}
      </p>
      <p
        className={`mt-2.5 text-sm font-medium`}
      >
        {label}
      </p>
      {note && (
        <p
          className={`mt-0.5 text-xs`}
        >
          {note}
        </p>
      )}
    </div>
  );
}

/** Small pill, e.g. "In testing" / "Draft". */
export function Badge({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "neutral" | "muted";
}) {
  const tones = {
    accent: "bg-accent-soft text-accent-ink",
    neutral: "bg-surface-2 text-ink-body border border-line",
    muted: "bg-surface-2 text-ink-muted border border-line",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
