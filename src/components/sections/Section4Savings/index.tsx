import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LoanInputs } from "./LoanInputs";
import { CashflowTable } from "./CashflowTable";
import { SavingsChart } from "./SavingsChart";
import { BreakEvenStat } from "./BreakEvenStat";

export function Section4Savings() {
  const { cashflow } = useCalculator();
  const copy = theme.copy.section4;

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

      <div className="mt-12">
        <h3 className="text-xl md:text-2xl font-semibold text-ink tracking-tight mb-5">
          Year-by-year cashflow
        </h3>
        <CashflowTable years={cashflow.years} />
      </div>

      <div className="mt-12">
        <div className="mb-5">
          <h3 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">
            {copy.chartTitle}
          </h3>
          <p className="mt-2 text-[14px] text-ink-muted max-w-3xl">{copy.chartSubtitle}</p>
        </div>
        <SavingsChart years={cashflow.years} />
      </div>

      <div className="mt-12">
        <BreakEvenStat breakEvenYear={cashflow.breakEvenYear} />
      </div>
    </section>
  );
}
