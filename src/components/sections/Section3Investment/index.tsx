import { theme } from "@/config/theme";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PricingTable } from "./PricingTable";

export function Section3Investment() {
  const copy = theme.copy.section3;

  return (
    <section id="section-3" className="container-narrow scroll-mt-20">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={
          <>
            Your <span className="text-ink">investment</span> breakdown.
          </>
        }
        intro="Every line item, including the federal STC rebate. No hidden costs, no surprises at install."
      />

      <div className="mt-10 max-w-3xl">
        <PricingTable />
        <p className="mt-4 text-[13px] text-ink-subtle italic">{copy.stcNote}</p>
      </div>
    </section>
  );
}
