/**
 * The Hailstrum Robotics lockup: "HAILSTRUM_" with "ROBOTICS" letterspaced
 * beneath it, set in type rather than shipped as an image so it stays crisp at
 * any size and picks up the accent token for the underscore.
 */
export function Logo({
  className = "",
  showSubmark = true,
}: {
  className?: string;
  showSubmark?: boolean;
}) {
  return (
    <span className={`inline-flex flex-col gap-[3px] leading-none ${className}`}>
      <span className="font-display text-[1.1875rem] font-bold tracking-[0.03em] text-ink">
        HAILSTRUM
        <span className="text-accent">_</span>
      </span>
      {showSubmark && (
        <span className="font-display text-[0.5625rem] font-medium uppercase tracking-[0.42em] text-ink-muted">
          Robotics
        </span>
      )}
      <span className="sr-only">Hailstrum Robotics</span>
    </span>
  );
}
