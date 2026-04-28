import { useCalculator } from "@/state/CalculatorContext";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CashflowYearRow } from "@/hooks/useCashflowCalc";

export function CashflowTable({ years }: { years: CashflowYearRow[] }) {
  const { pricing } = useCalculator();
  const investment = Math.max(1, pricing.investment); // avoid div-by-zero in ROI
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
              <Th>ROI</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((y) => {
              const netPositive = y.netAnnual >= 0;
              const cumPositive = y.cumNet >= 0;
              // ROI = annual savings / upfront investment. Always positive
              // (savings can't go negative); represents the year's return on
              // the upfront cost, independent of whether the loan repayments
              // are still chewing through the cashflow.
              const roi = (y.savings / investment) * 100;

              // Subtle row tint that follows the cumulative net — gives the
              // table a top-to-bottom red→green flow as years roll over.
              const rowTint = cumPositive
                ? "bg-gain/[0.04] hover:bg-gain/[0.08]"
                : "bg-pain/[0.03] hover:bg-pain/[0.06]";

              return (
                <tr
                  key={y.year}
                  className={cn("border-t border-line/70 transition-colors", rowTint)}
                >
                  <td className="relative px-5 py-3 text-[13px] font-semibold text-ink-muted">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-sm",
                        cumPositive ? "bg-gain" : "bg-pain"
                      )}
                    />
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
                  <Td className="font-semibold text-gain">{roi.toFixed(1)}%</Td>
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
