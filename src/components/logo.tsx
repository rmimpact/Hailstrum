import Image from "next/image";

import { asset } from "@/lib/asset";

export function Logo({
  className = "",
  showWordmark = true,
  onNavy = false,
}: {
  className?: string;
  showWordmark?: boolean;
  onNavy?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={asset("/brand/mark.png")}
        alt=""
        width={110}
        height={110}
        priority
        className="h-8 w-8 shrink-0"
      />
      {showWordmark && (
        <span
          className={`font-display text-[1.0625rem] font-semibold tracking-[0.02em] ${
            onNavy ? "text-on-navy" : "text-ink"
          }`}
        >
          HAILSTRUM
          <span className="text-accent">_</span>
        </span>
      )}
      <span className="sr-only">Hailstrum</span>
    </span>
  );
}
