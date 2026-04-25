import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CashflowYearRow } from "@/hooks/useCashflowCalc";

export function CashflowTable({ years }: { years: CashflowYearRow[] }) {
  const rows = years.slice(0, 15);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full num">
          <thead>
            <tr className="bg-surface-alt">
              <Th className="text-left">Year</Th>
              <Th>Annual payment</Th>
              <Th>Annual savings</Th>
              <Th>Net cashflow</Th>
              <Th>Cumulative net</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((y) => {
              const netPositive = y.netAnnual >= 0;
              const cumPositive = y.cumNet >= 0;
              return (
                <tr key={y.year} className="border-t border-line/70 hover:bg-surface-alt/60 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-semibold text-ink-muted">
                    Year {y.year}
                  </td>
                  <Td>
                    {y.payment > 0 ? `−${formatMoney(y.payment)}` : "$0"}
                  </Td>
                  <Td>{formatMoney(y.savings)}</Td>
                  <Td className={cn("font-semibold", netPositive ? "text-gain" : "text-pain")}>
                    {netPositive ? formatMoney(y.netAnnual) : `−${formatMoney(Math.abs(y.netAnnual))}`}
                  </Td>
                  <Td className={cn("italic font-semibold", cumPositive ? "text-gain" : "text-pain")}>
                    {cumPositive ? formatMoney(y.cumNet) : `−${formatMoney(Math.abs(y.cumNet))}`}
                  </Td>
                </tr>
              );
            })}
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
