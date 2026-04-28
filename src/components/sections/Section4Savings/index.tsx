import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LoanInputs } from "./LoanInputs";
import { PaymentBreakdown } from "./PaymentBreakdown";
import { CashflowTable } from "./CashflowTable";
import { SavingsChart } from "./SavingsChart";
import { BreakEvenStat } from "./BreakEvenStat";
import { SavingsROISummary } from "./SavingsROISummary";

export function Section4Savings() {
  const { cashflow } = useCalculator();
  const copy = theme.copy.section4;
  const day1 = cashflow.cashflowPositiveDay1;

  return (
    <section id="section-4" className="container-narrow scroll-mt-20">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={
          <>
            Your <span className="text-accent">25-year</span> savings story.
          </>
        }
        intro={copy.intro}
      />

      <div className="mt-10">
        <SavingsROISummary />
      </div>

      <div className="mt-6">
        <LoanInputs />
      </div>

      <div className="mt-6">
        <PaymentBreakdown />
      </div>

      {day1 && (
        <div className="mt-6 rounded-2xl border border-gain/25 bg-gain/[0.06] px-6 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-gain"
            />
            <p className="text-[14px] text-ink-soft">
              <span className="font-semibold text-gain-ink">From year one, net cashflow is positive.</span>{" "}
              Projected savings cover every loan repayment and fee — this system costs $0 out of pocket.
            </p>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h3 className="text-xl md:text-2xl font-semibold text-ink tracking-tight mb-5">
          Year-by-year cashflow
        </h3>
        <CashflowTable years={cashflow.years} />
      </div>

      <div className="mt-12">
        <h3 className="mb-5 text-xl md:text-2xl font-semibold text-ink tracking-tight">
          {copy.chartTitle}
        </h3>
        <SavingsChart years={cashflow.years} />

      </div>

      <div className="mt-12">
        <BreakEvenStat breakEvenYear={cashflow.breakEvenYear} />
      </div>
    </section>
  );
}
