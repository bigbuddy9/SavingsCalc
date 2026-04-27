import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LocationPicker } from "./LocationPicker";
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
        <LocationPicker />
      </div>

      <div className="mt-5">
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
    </section>
  );
}
