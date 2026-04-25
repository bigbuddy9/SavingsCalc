import { useCalculator } from "@/state/CalculatorContext";
import { NumberInput } from "@/components/inputs/NumberInput";
import { formatMoney } from "@/lib/format";
import type { CalculatorInputs } from "@/state/CalculatorContext";

type LineItem = { key: keyof CalculatorInputs; label: string };

const LINE_ITEMS: LineItem[] = [
  { key: "priceSystem", label: "System cost (panels + install)" },
  { key: "priceInverter", label: "Inverter" },
  { key: "priceMetering", label: "Metering" },
  { key: "priceSiteInspection", label: "Site inspection" },
  { key: "priceSplitArray", label: "Split array" },
  { key: "priceRoofHeight", label: "Roof height" },
  { key: "priceOther", label: "Other" },
];

export function PricingTable() {
  const { inputs, setInput, pricing } = useCalculator();

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
      <div className="divide-y divide-line/70">
        {LINE_ITEMS.map((item) => (
          <Row key={item.key} label={item.label}>
            <div className="w-40">
              <NumberInput
                value={inputs[item.key] as number}
                onChange={(n) => setInput(item.key, n as never)}
                prefix="$"
                size="sm"
                ariaLabel={item.label}
              />
            </div>
          </Row>
        ))}

        <Row label="System value (inc GST)" emphasis>
          <span className="text-lg font-semibold text-ink num">
            {formatMoney(pricing.systemValue)}
          </span>
        </Row>

        <DeductionRow
          label="Solar STCs"
          value={pricing.solarStcDeduction}
          countKey="solarStcs"
          priceKey="solarStcPrice"
        />
        <DeductionRow
          label="Battery STCs"
          value={pricing.batteryStcDeduction}
          countKey="batteryStcs"
          priceKey="batteryStcPrice"
        />

        <Row label="Discount">
          <div className="flex items-center gap-2">
            <span className="text-pain font-semibold">−</span>
            <div className="w-40">
              <NumberInput
                value={inputs.discount}
                onChange={(n) => setInput("discount", n)}
                prefix="$"
                size="sm"
                ariaLabel="Discount"
              />
            </div>
          </div>
        </Row>
      </div>

      <div className="bg-ink text-white px-6 md:px-8 py-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            Your investment (inc GST)
          </div>
          <div className="mt-1 text-[13px] text-white/70">
            Final, all-in price after rebates and discount
          </div>
        </div>
        <div className="text-3xl md:text-4xl font-bold tabular-nums tracking-tight">
          {formatMoney(pricing.investment)}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  emphasis = false,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center justify-between gap-4 px-6 md:px-8 py-4 " +
        (emphasis ? "bg-surface-alt" : "")
      }
    >
      <div className={emphasis ? "text-[15px] font-semibold text-ink" : "text-[15px] text-ink-soft"}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function DeductionRow({
  label,
  value,
  countKey,
  priceKey,
}: {
  label: string;
  value: number;
  countKey: keyof CalculatorInputs;
  priceKey: keyof CalculatorInputs;
}) {
  const { inputs, setInput } = useCalculator();
  return (
    <div className="px-6 md:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-[15px] text-ink-soft">{label}</span>
        <span className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-ink-subtle">
          <Mini
            value={inputs[countKey] as number}
            onChange={(n) => setInput(countKey, n as never)}
            ariaLabel={`${label} count`}
          />
          <span>×</span>
          <Mini
            value={inputs[priceKey] as number}
            onChange={(n) => setInput(priceKey, n as never)}
            prefix="$"
            ariaLabel={`${label} unit price`}
          />
        </span>
      </div>
      <span className="text-pain font-semibold tabular-nums">
        −{formatMoney(value)}
      </span>
    </div>
  );
}

function Mini({
  value,
  onChange,
  prefix,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  ariaLabel: string;
}) {
  return (
    <span className="inline-block w-20">
      <NumberInput value={value} onChange={onChange} prefix={prefix} size="sm" ariaLabel={ariaLabel} />
    </span>
  );
}
