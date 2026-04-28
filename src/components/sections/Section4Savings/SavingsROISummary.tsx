import { useCalculator } from "@/state/CalculatorContext";
import { formatMoney } from "@/lib/format";

const MILESTONES = [
  { label: "1st year",  yearIndex: 0  },
  { label: "10 years",  yearIndex: 9  },
  { label: "25 years",  yearIndex: 24 },
];

/**
 * Resinc-style headline: cumulative solar savings and total ROI at the
 * 1-year / 10-year / 25-year marks. ROI is always positive — it's
 * (cumulative savings ÷ upfront investment), not net cashflow.
 */
export function SavingsROISummary() {
  const { cashflow, pricing } = useCalculator();
  const investment = Math.max(1, pricing.investment);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="grid grid-cols-[1fr_minmax(0,1.2fr)_minmax(0,1fr)] bg-ink text-white px-6 md:px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
        <span />
        <span className="text-center text-white/75">Solar savings</span>
        <span className="text-right text-white/75">Total ROI</span>
      </div>
      <div className="divide-y divide-line/70">
        {MILESTONES.map(({ label, yearIndex }) => {
          const row = cashflow.years[yearIndex];
          if (!row) return null;
          const cumSavings = row.cumSavings;
          const roi = (cumSavings / investment) * 100;
          return (
            <div
              key={label}
              className="grid grid-cols-[1fr_minmax(0,1.2fr)_minmax(0,1fr)] items-center px-6 md:px-8 py-4"
            >
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                {label}
              </span>
              <span className="text-center text-2xl md:text-[28px] font-bold tracking-tight tabular-nums text-ink">
                {formatMoney(cumSavings)}
              </span>
              <span className="text-right text-2xl md:text-[28px] font-bold tracking-tight tabular-nums text-gain">
                {roi.toFixed(roi >= 100 ? 0 : 1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
