import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { NumberInput } from "@/components/inputs/NumberInput";
import { CostTable } from "./CostTable";
import { SummaryGrid } from "./SummaryGrid";
import { ClosingCallout } from "./ClosingCallout";

export function Section1RealCost() {
  const { inputs, setInput, realCost, formatMoney, currencySymbol } = useCalculator();
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
      />

      <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-2xl">
        <Field
          label="Annual electricity bill"
          hint="What you've spent on power in the last 12 months"
        >
          <NumberInput
            value={inputs.annualBill}
            onChange={(n) => setInput("annualBill", n)}
            prefix={currencySymbol}
            ariaLabel="Annual electricity bill"
            step={50}
          />
        </Field>
        <Field
          label="Marginal tax rate"
          hint="The percentage you're taxed at on your top dollar"
        >
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
              Over the next 25 years, you'll need to earn{" "}
              <span className="font-bold text-pain tabular-nums">
                {formatMoney(realCost.closingEarnings)} before tax
              </span>{" "}
              — just to pay your power bill.
            </>
          }
        />
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[14px] font-semibold text-ink mb-1">{label}</span>
      {hint && <span className="block text-[12.5px] text-ink-muted mb-2.5">{hint}</span>}
      {children}
    </label>
  );
}
