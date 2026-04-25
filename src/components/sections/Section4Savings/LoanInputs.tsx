import { useCalculator } from "@/state/CalculatorContext";
import { NumberInput } from "@/components/inputs/NumberInput";
import { formatMoney } from "@/lib/format";

export function LoanInputs() {
  const { inputs, setInput, cashflow } = useCalculator();
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        Finance terms
      </h4>
      <div className="mt-5 grid md:grid-cols-3 gap-5">
        <Field label="Loan term">
          <NumberInput
            value={inputs.loanTerm}
            onChange={(n) => setInput("loanTerm", n)}
            suffix="yrs"
            min={1}
            max={25}
            ariaLabel="Loan term in years"
          />
        </Field>
        <Field label="Interest rate">
          <NumberInput
            value={inputs.interestRate}
            onChange={(n) => setInput("interestRate", n)}
            suffix="%"
            decimals={2}
            step={0.01}
            ariaLabel="Interest rate"
          />
        </Field>
        <Field label="Annual repayment">
          <div className="flex items-center justify-center rounded-lg bg-surface-sunken border border-line px-3 py-2.5 text-base font-bold tabular-nums text-ink">
            {formatMoney(cashflow.annualPayment)}
          </div>
        </Field>
      </div>
    </div>
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
