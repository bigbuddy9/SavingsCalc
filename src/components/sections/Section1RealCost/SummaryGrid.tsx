import { formatMoney } from "@/lib/format";

type Props = {
  tenYearPower: number;
  tenYearEarnings: number;
  fifteenYearPower: number;
  fifteenYearEarnings: number;
  twentyFiveYearPower: number;
  twentyFiveYearEarnings: number;
};

export function SummaryGrid({
  tenYearPower,
  tenYearEarnings,
  fifteenYearPower,
  fifteenYearEarnings,
  twentyFiveYearPower,
  twentyFiveYearEarnings,
}: Props) {
  const rows: { years: number; power: number; earnings: number }[] = [
    { years: 10, power: tenYearPower, earnings: tenYearEarnings },
    { years: 15, power: fifteenYearPower, earnings: fifteenYearEarnings },
    { years: 25, power: twentyFiveYearPower, earnings: twentyFiveYearEarnings },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {rows.map((r) => (
        <div
          key={r.years}
          className="rounded-xl border border-line bg-surface p-6 shadow-card"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            {r.years}-year horizon
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-ink-muted">Power cost</div>
              <div className="mt-1 text-xl font-semibold text-pain tabular-nums">
                {formatMoney(r.power)}
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Pre-tax earnings</div>
              <div className="mt-1 text-xl font-semibold text-pain tabular-nums">
                {formatMoney(r.earnings)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
