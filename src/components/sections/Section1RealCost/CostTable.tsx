import { formatMoney } from "@/lib/format";
import type { CostYearRow } from "@/hooks/useRealCostCalc";

export function CostTable({ years }: { years: CostYearRow[] }) {
  const first10 = years.slice(0, 10);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full num">
          <thead>
            <tr className="bg-surface-alt">
              <Th className="text-left">Year</Th>
              <Th>Annual power cost</Th>
              <Th>Cumulative cost</Th>
              <Th>Pre-tax earnings</Th>
              <Th>Cumulative earnings</Th>
            </tr>
          </thead>
          <tbody>
            {first10.map((y, i) => (
              <tr
                key={y.year}
                className={
                  "border-t border-line/70 hover:bg-surface-alt/60 transition-colors " +
                  (i === first10.length - 1 ? "" : "")
                }
              >
                <td className="px-5 py-3 text-[13px] font-semibold text-ink-muted">
                  Year {y.year}
                </td>
                <Td>{formatMoney(y.annualCost)}</Td>
                <Td className="text-pain font-semibold">{formatMoney(y.cumulativeBill)}</Td>
                <Td>{formatMoney(y.preTaxEarnings)}</Td>
                <Td className="text-pain font-semibold">{formatMoney(y.cumulativeEarnings)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={
        "px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle " +
        (className || "text-right")
      }
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={"px-5 py-3 text-right text-[15px] text-ink tabular-nums " + className}>
      {children}
    </td>
  );
}
