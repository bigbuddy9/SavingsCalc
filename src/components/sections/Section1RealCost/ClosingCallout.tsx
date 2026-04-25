import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "pain" | "gain" | "dark";

type Props = {
  variant?: Variant;
  headline: ReactNode;
  emphasis?: ReactNode;
  tagline?: ReactNode;
};

export function ClosingCallout({ variant = "pain", headline, emphasis, tagline }: Props) {
  const accent =
    variant === "gain"
      ? "before:bg-gain text-ink"
      : variant === "dark"
      ? "before:bg-accent text-white"
      : "before:bg-pain text-ink";

  const surface =
    variant === "dark"
      ? "bg-ink text-white"
      : "bg-surface-alt border border-line/80 text-ink";

  const emphasisColor =
    variant === "gain" ? "text-gain" : variant === "dark" ? "text-accent" : "text-pain";

  return (
    <div
      className={cn(
        "relative rounded-2xl p-8 md:p-10 overflow-hidden",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5",
        surface,
        accent
      )}
    >
      <p className={cn(
        "text-[19px] md:text-[22px] font-semibold leading-snug tracking-tight max-w-[60ch]",
        variant === "dark" ? "text-white" : "text-ink"
      )}>
        {headline}
        {emphasis && (
          <>
            {" "}
            <span className={cn("font-bold tabular-nums", emphasisColor)}>{emphasis}</span>
          </>
        )}
      </p>
      {tagline && (
        <p
          className={cn(
            "mt-3 text-sm",
            variant === "dark" ? "text-white/70" : "text-ink-muted"
          )}
        >
          {tagline}
        </p>
      )}
    </div>
  );
}
