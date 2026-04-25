import { theme } from "@/config/theme";

export function BreakEvenStat({ breakEvenYear }: { breakEvenYear: number | null }) {
  const copy = theme.copy.section4;
  const display = breakEvenYear ? `Year ${breakEvenYear}` : "Year 1";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink text-white p-8 md:p-10">
      <div className="relative z-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          {copy.heroLabel}
        </p>
        <p className="mt-3 text-5xl md:text-6xl font-bold tracking-tighter text-gain leading-none">
          {display}
        </p>
        <p className="mt-4 text-[15px] text-white/70 leading-relaxed">
          {copy.heroSublabel}
        </p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gain/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      />
    </div>
  );
}
