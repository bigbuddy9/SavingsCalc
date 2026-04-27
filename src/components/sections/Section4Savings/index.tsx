import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LoanInputs } from "./LoanInputs";
import { PaymentBreakdown } from "./PaymentBreakdown";
import { CashflowTable } from "./CashflowTable";
import { SavingsChart } from "./SavingsChart";
import { BreakEvenStat } from "./BreakEvenStat";

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
        <LoanInputs />
      </div>

      <div className="mt-6">
        <PaymentBreakdown />
      </div>

      {day1 && (
        <div className="mt-6 rounded-2xl border border-gain/30 bg-gain/10 px-6 md:px-8 py-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-gain shadow-[0_0_10px_2px_rgba(5,150,105,0.55)]"
            />
            <div>
              <div className="text-[15px] font-bold text-gain-ink">
                Cashflow positive from day one — this system costs you $0 out of pocket.
              </div>
              <p className="mt-1 text-[13px] text-ink-soft">
                Your year-1 solar savings already exceed the loan repayments, fees included.
              </p>
            </div>
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

        {day1 && (
          <div className="mt-6 rounded-2xl bg-ink text-white px-6 md:px-8 py-6">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gain">
              No-brainer
            </div>
            <p className="mt-2 text-lg md:text-xl font-semibold leading-snug">
              This system doesn't cost you anything. You're one of the few that are
              very lucky — this is a no-brainer.
            </p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <BreakEvenStat breakEvenYear={cashflow.breakEvenYear} />
      </div>
    </section>
  );
}
