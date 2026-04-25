import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, intro, align = "left" }: Props) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : ""
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-h2 font-bold text-ink tracking-tighter">{title}</h2>
      {intro && (
        <p className="mt-4 text-base md:text-lg text-ink-muted leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  );
}
