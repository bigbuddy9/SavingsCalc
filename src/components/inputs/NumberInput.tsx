import { useEffect, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
  /** Decimals to allow. Defaults to integer. */
  decimals?: number;
  size?: "sm" | "md" | "lg";
};

export function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  step,
  min,
  max,
  className,
  inputClassName,
  ariaLabel,
  decimals = 0,
  size = "md",
}: Props) {
  const [draft, setDraft] = useState<string>(formatDraft(value, decimals));

  useEffect(() => {
    setDraft(formatDraft(value, decimals));
  }, [value, decimals]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDraft(raw);
    if (raw === "" || raw === "-") {
      onChange(0);
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(n);
  }

  const sizeStyles =
    size === "lg"
      ? "px-4 py-3 text-lg"
      : size === "sm"
      ? "px-2.5 py-1.5 text-sm"
      : "px-3 py-2.5 text-base";

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 rounded-lg bg-edit/50 hover:bg-edit border border-line",
        "transition-all focus-within:bg-edit focus-within:border-edit-ring focus-within:ring-4 focus-within:ring-edit-ring/30",
        sizeStyles.includes("py-1.5") ? "py-0.5" : sizeStyles.includes("py-3") ? "py-1" : "py-0.5",
        "px-3",
        className
      )}
    >
      {prefix && <span className="text-ink-muted font-medium">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        step={step}
        min={min}
        max={max}
        aria-label={ariaLabel}
        onChange={handleChange}
        className={cn(
          "num bg-transparent w-full text-ink font-semibold tabular-nums",
          "focus:outline-none placeholder:text-ink-faint",
          sizeStyles,
          "px-0",
          inputClassName
        )}
      />
      {suffix && <span className="text-ink-muted font-medium">{suffix}</span>}
    </div>
  );
}

function formatDraft(n: number, decimals: number): string {
  if (!Number.isFinite(n)) return "";
  if (decimals === 0) return String(Math.round(n));
  return String(+n.toFixed(decimals));
}
