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
          className="rounded-2xl border border-line bg-surface p-7 shadow-card"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            {r.years} years
          </div>

          <div className="mt-5">
            <div className="text-3xl font-bold text-pain tabular-nums tracking-tight">
              {formatMoney(r.power)}
            </div>
            <div className="mt-1 text-[13px] text-ink-muted">
              in power bills
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-line/70">
            <div className="text-3xl font-bold text-pain tabular-nums tracking-tight">
              {formatMoney(r.earnings)}
            </div>
            <div className="mt-1 text-[13px] text-ink-muted">
              you'd need to earn (pre-tax) to cover it
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
