import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { formatMoney } from "@/lib/format";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { NumberInput } from "@/components/inputs/NumberInput";
import { CostTable } from "./CostTable";
import { SummaryGrid } from "./SummaryGrid";
import { ClosingCallout } from "./ClosingCallout";

export function Section1RealCost() {
  const { inputs, setInput, realCost } = useCalculator();
  const copy = theme.copy.section1;

  return (
    <section id="section-1" className="container-narrow scroll-mt-20">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={
          <>
            The <span className="text-pain">real</span> cost of your power.
          </>
        }
        intro="Even before going solar, here's what 25 years of doing nothing actually costs you — at industry-forecast price increases."
      />

      <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-2xl">
        <Field label="Annual electricity bill">
          <NumberInput
            value={inputs.annualBill}
            onChange={(n) => setInput("annualBill", n)}
            prefix="$"
            ariaLabel="Annual electricity bill"
            step={50}
          />
        </Field>
        <Field label="Marginal tax rate">
          <NumberInput
            value={inputs.taxRate}
            onChange={(n) => setInput("taxRate", n)}
            suffix="%"
            ariaLabel="Marginal tax rate"
            step={0.5}
            decimals={1}
          />
        </Field>
      </div>

      <div className="mt-12">
        <CostTable years={realCost.years} />
        <p className="mt-3 text-[13px] text-ink-subtle italic max-w-2xl">
          {copy.tableNote}
        </p>
      </div>

      <div className="mt-12">
        <SummaryGrid
          tenYearPower={realCost.tenYearPower}
          tenYearEarnings={realCost.tenYearEarnings}
          fifteenYearPower={realCost.fifteenYearPower}
          fifteenYearEarnings={realCost.fifteenYearEarnings}
          twentyFiveYearPower={realCost.twentyFiveYearPower}
          twentyFiveYearEarnings={realCost.twentyFiveYearEarnings}
        />
      </div>

      <div className="mt-12">
        <ClosingCallout
          headline={
            <>
              Over the next 25 years, you'll need to earn
            </>
          }
          emphasis={`${formatMoney(realCost.closingEarnings)} before tax`}
          tagline={
            <>
              <span className="font-medium text-ink-soft">— just to pay your power bill.</span>
              <span className="block mt-1 italic">{copy.closingTagline}</span>
            </>
          }
        />
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-ink-soft mb-2">{label}</span>
      {children}
    </label>
  );
}
