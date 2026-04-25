import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { formatMoney } from "@/lib/format";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ClosingCallout } from "@/components/sections/Section1RealCost/ClosingCallout";
import { SpecsGrid } from "./SpecsGrid";
import { ProductionChart } from "./ProductionChart";

export function Section2System() {
  const { system } = useCalculator();
  const copy = theme.copy.section2;

  return (
    <section id="section-2" className="container-narrow scroll-mt-20">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={
          <>
            Your <span className="text-gain">custom</span> solar system.
          </>
        }
      />

      <div className="mt-10">
        <SpecsGrid />
      </div>

      <div className="mt-12">
        <div className="mb-5">
          <h3 className="text-xl md:text-2xl font-semibold text-ink tracking-tight">
            {copy.chartTitle}
          </h3>
          <p className="mt-2 text-[14px] text-ink-muted max-w-3xl">{copy.chartSubtitle}</p>
        </div>
        <ProductionChart data={system.monthly} />
      </div>

      <div className="mt-12">
        <ClosingCallout
          variant="gain"
          headline={
            <>
              This system will save you approximately{" "}
              <span className="font-bold text-gain tabular-nums">
                {formatMoney(system.year1Savings)} in your first year alone
              </span>
              .
            </>
          }
          tagline="And that number grows every year as power prices rise."
        />
      </div>
    </section>
  );
}
