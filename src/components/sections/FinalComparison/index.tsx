import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { formatMoneyK, formatMoneyKUnsigned } from "@/lib/format";

export function FinalComparison() {
  const { realCost, cashflow } = useCalculator();
  const copy = theme.copy.final;

  const without = -realCost.twentyFiveYearPower;
  // With solar, you still pay residual bills + loan payments; cashflow.totalCumNet
  // is (savings − payments), which is the *delta* the solar system creates against
  // the no-solar baseline. So: with = without + delta.
  const withSolar = without + cashflow.totalCumNet;
  const swing = cashflow.totalCumNet;

  return (
    <section className="container-narrow">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-[#141414] to-[#1f1f1f] text-white p-8 md:p-14">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            The bottom line
          </p>
          <h2 className="mt-3 text-h2 font-bold tracking-tighter">{copy.title}</h2>

          <div className="mt-10 grid md:grid-cols-2 gap-4 md:gap-5">
            <Card label={copy.withoutLabel} value={formatMoneyK(without)} accent="pain" />
            <Card label={copy.withLabel} value={formatMoneyK(withSolar)} accent="gain" />
          </div>

          <div className="mt-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 md:p-8 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              {copy.swingLabel}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-5xl md:text-7xl font-bold tracking-tightest text-accent tabular-nums">
                {formatMoneyKUnsigned(swing)}
              </span>
              <span className="text-[15px] text-white/70 italic">{copy.swingDesc}</span>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -bottom-32 h-[360px] w-[360px] rounded-full bg-gain/10 blur-3xl"
        />
      </div>
    </section>
  );
}

function Card({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "pain" | "gain";
}) {
  const color = accent === "pain" ? "text-pain" : "text-gain";
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 md:p-8 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
        {label}
      </p>
      <div className={`mt-3 text-4xl md:text-5xl font-bold tracking-tighter tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}
