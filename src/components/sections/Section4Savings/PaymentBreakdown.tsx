import { useCalculator } from "@/state/CalculatorContext";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const FREQUENCIES: { label: string; divisor: number }[] = [
  { label: "Monthly",    divisor: 12 },
  { label: "Fortnightly", divisor: 26 },
  { label: "Weekly",     divisor: 52 },
];

/**
 * Resinc-style breakdown: Payment vs Savings at monthly / fortnightly / weekly cadence,
 * with a Net column that turns green when savings cover the payment.
 *
 * Uses Year-1 figures: payment = annual loan repayment + monthly fees × 12 (+ setup if it
 * weren't a one-off — but we keep the breakdown ongoing-only so the cadence numbers are
 * representative of every year of the loan, not just year 1).
 */
export function PaymentBreakdown() {
  const { cashflow } = useCalculator();
  const annualPayment = cashflow.annualPayment;
  const annualSavings = cashflow.years[0]?.savings ?? 0;

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
      <div className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] bg-surface-alt px-6 md:px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
        <span className="text-left">Estimated</span>
        <span className="text-right">Payment</span>
        <span className="text-right">Savings</span>
        <span className="text-right">Net</span>
      </div>
      <div className="divide-y divide-line/70">
        {FREQUENCIES.map(({ label, divisor }) => {
          const payment = annualPayment / divisor;
          const savings = annualSavings / divisor;
          const net = savings - payment;
          const positive = net >= 0;
          return (
            <div
              key={label}
              className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] items-center px-6 md:px-8 py-3.5 text-[15px] num"
            >
              <span className="text-ink font-semibold">{label}</span>
              <span className="text-right text-ink-soft tabular-nums">
                {payment > 0 ? `−${formatMoney(payment)}` : "$0"}
              </span>
              <span className="text-right text-gain tabular-nums font-semibold">
                {formatMoney(savings)}
              </span>
              <span
                className={cn(
                  "text-right tabular-nums font-bold",
                  positive ? "text-gain" : "text-pain"
                )}
              >
                {positive ? formatMoney(net) : `−${formatMoney(Math.abs(net))}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
