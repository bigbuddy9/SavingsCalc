import { useCalculator } from "@/state/CalculatorContext";
import { NumberInput } from "@/components/inputs/NumberInput";
import { formatKwh } from "@/lib/format";

export function SpecsGrid() {
  const { inputs, setInput, system } = useCalculator();

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Block title="System hardware">
        <Spec label="System size">
          <div className="w-32">
            <NumberInput
              value={inputs.systemSize}
              onChange={(n) => setInput("systemSize", n)}
              suffix="kW"
              decimals={2}
              step={0.01}
              size="sm"
              ariaLabel="System size in kilowatts"
            />
          </div>
        </Spec>
        <Spec label="Number of panels">
          <div className="w-24">
            <NumberInput
              value={inputs.panelCount}
              onChange={(n) => setInput("panelCount", n)}
              size="sm"
              ariaLabel="Number of panels"
            />
          </div>
        </Spec>
        <Spec label="Panel wattage">
          <div className="w-32">
            <NumberInput
              value={inputs.panelWatt}
              onChange={(n) => setInput("panelWatt", n)}
              suffix="W"
              size="sm"
              ariaLabel="Panel wattage"
            />
          </div>
        </Spec>
        <Spec label="Battery size">
          <div className="w-32">
            <NumberInput
              value={inputs.batterySize}
              onChange={(n) => setInput("batterySize", n)}
              suffix="kWh"
              size="sm"
              ariaLabel="Battery size"
            />
          </div>
        </Spec>
      </Block>

      <Block title="Production & usage">
        <Spec label="Annual production">
          <div className="w-36">
            <NumberInput
              value={inputs.annualProduction}
              onChange={(n) => setInput("annualProduction", n)}
              suffix="kWh"
              size="sm"
              ariaLabel="Annual production"
            />
          </div>
        </Spec>
        <Spec label="Average daily production">
          <span className="text-[15px] font-semibold text-ink num">
            {formatKwh(system.dailyProduction)}
          </span>
        </Spec>
        <Spec label="Average daily usage">
          <div className="w-32">
            <NumberInput
              value={inputs.dailyUsage}
              onChange={(n) => setInput("dailyUsage", n)}
              suffix="kWh"
              size="sm"
              ariaLabel="Daily usage"
            />
          </div>
        </Spec>
        <Spec label="Year-1 estimated savings">
          <div className="w-36">
            <NumberInput
              value={inputs.annualSavings}
              onChange={(n) => setInput("annualSavings", n)}
              prefix="$"
              size="sm"
              ariaLabel="Year 1 savings"
            />
          </div>
        </Spec>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        {title}
      </h4>
      <div className="mt-4 divide-y divide-line/70">{children}</div>
    </div>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
