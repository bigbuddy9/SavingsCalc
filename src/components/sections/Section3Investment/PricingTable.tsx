import { useCalculator } from "@/state/CalculatorContext";
import { NumberInput } from "@/components/inputs/NumberInput";
import type { CalculatorInputs } from "@/state/CalculatorContext";

export function PricingTable() {
  const {
    inputs,
    setInput,
    pricing,
    addPriceLineItem,
    removePriceLineItem,
    updatePriceLineItem,
    formatMoney,
    currencySymbol,
  } = useCalculator();

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
      <div className="divide-y divide-line/70">
        {inputs.priceLineItems.map((item) => (
          <EditableRow
            key={item.id}
            label={item.label}
            amount={item.amount}
            onLabelChange={(label) => updatePriceLineItem(item.id, { label })}
            onAmountChange={(amount) => updatePriceLineItem(item.id, { amount })}
            onRemove={() => removePriceLineItem(item.id)}
          />
        ))}

        <div className="px-6 md:px-8 py-3">
          <button
            type="button"
            onClick={addPriceLineItem}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink transition-colors"
          >
            <span aria-hidden className="text-base leading-none">+</span>
            Add line item
          </button>
        </div>

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
                prefix={currencySymbol}
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

function EditableRow({
  label,
  amount,
  onLabelChange,
  onAmountChange,
  onRemove,
}: {
  label: string;
  amount: number;
  onLabelChange: (label: string) => void;
  onAmountChange: (amount: number) => void;
  onRemove: () => void;
}) {
  const { currencySymbol } = useCalculator();
  return (
    <div className="group flex items-center gap-3 px-6 md:px-8 py-3">
      <input
        type="text"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        onBlur={(e) => {
          // auto-remove blank rows so we don't leave ghosts behind
          if (e.target.value.trim() === "") onRemove();
        }}
        placeholder="Line item name"
        aria-label="Line item label"
        className="flex-1 min-w-0 bg-transparent border border-transparent rounded-md px-2 py-1.5 -ml-2 text-[15px] text-ink-soft hover:border-line focus:border-edit-ring focus:bg-edit/40 focus:outline-none focus:ring-2 focus:ring-edit-ring/30 transition-colors placeholder:text-ink-faint placeholder:italic"
      />
      <div className="w-40 shrink-0">
        <NumberInput
          value={amount}
          onChange={onAmountChange}
          prefix={currencySymbol}
          size="sm"
          ariaLabel={`${label || "Line item"} amount`}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label || "line item"}`}
        className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:text-pain hover:bg-pain/10 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>
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
  const { inputs, setInput, formatMoney, currencySymbol } = useCalculator();
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
            prefix={currencySymbol}
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
