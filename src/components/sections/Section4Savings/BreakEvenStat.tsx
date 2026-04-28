/**
 * Headline "when does this pay off?" stat at the bottom of Section 4.
 *
 * Two narratives depending on finance:
 *  - Loan: "Cashflow positive from Year X" — when annual savings overtake annual payments+fees.
 *  - Cash: "Payback in Year X" — when cumulative savings have repaid the upfront cost.
 *
 * If the user hasn't entered a system / bill yet, both years are null and we show a quiet
 * placeholder rather than a misleading "Year 1".
 */
export function BreakEvenStat({
  paybackYear,
  breakEvenYear,
  hasLoan,
}: {
  paybackYear: number | null;
  breakEvenYear: number | null;
  hasLoan: boolean;
}) {
  const headlineYear = hasLoan ? breakEvenYear : paybackYear;
  const label = hasLoan ? "Cashflow positive from" : "Solar pays itself off in";
  const sublabel = hasLoan
    ? "From this year onwards, your annual solar savings exceed your loan repayments and fees."
    : "From this year onwards, every dollar of solar savings is pure return on the upfront cost.";

  const display = headlineYear ? `Year ${headlineYear}` : "—";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink text-white p-8 md:p-10">
      <div className="relative z-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          {label}
        </p>
        <p className="mt-3 text-5xl md:text-6xl font-bold tracking-tighter text-gain leading-none">
          {display}
        </p>
        <p className="mt-4 text-[15px] text-white/70 leading-relaxed">{sublabel}</p>
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
