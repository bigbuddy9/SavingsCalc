import { useCalculator } from "@/state/CalculatorContext";
import { NumberInput } from "@/components/inputs/NumberInput";

export function LoanInputs() {
  const { inputs, setInput } = useCalculator();
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        Finance terms
      </h4>
      <div className="mt-5 grid md:grid-cols-2 gap-x-8 gap-y-5">
        <Field label="Deposit" hint="Cash paid upfront — reduces the loan principal.">
          <NumberInput
            value={inputs.deposit}
            onChange={(n) => setInput("deposit", Math.max(0, n))}
            prefix="$"
            ariaLabel="Deposit"
          />
        </Field>
        <Field label="Setup fee" hint="One-off fee charged in year 1.">
          <NumberInput
            value={inputs.setupFee}
            onChange={(n) => setInput("setupFee", Math.max(0, n))}
            prefix="$"
            ariaLabel="Setup fee"
          />
        </Field>
        <Field label="Loan term" hint="Years to fully repay the loan.">
          <NumberInput
            value={inputs.loanTerm}
            onChange={(n) => setInput("loanTerm", n)}
            suffix="yrs"
            min={1}
            max={25}
            ariaLabel="Loan term in years"
          />
        </Field>
        <Field label="Monthly loan fee" hint="Ongoing monthly fee on the loan.">
          <NumberInput
            value={inputs.monthlyFee}
            onChange={(n) => setInput("monthlyFee", Math.max(0, n))}
            prefix="$"
            decimals={2}
            step={0.01}
            ariaLabel="Monthly loan fee"
          />
        </Field>
        <Field label="Interest rate" hint="Annual percentage rate on the loan.">
          <NumberInput
            value={inputs.interestRate}
            onChange={(n) => setInput("interestRate", n)}
            suffix="%"
            decimals={2}
            step={0.01}
            ariaLabel="Interest rate"
          />
        </Field>
      </div>
    </div>
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
    <label className="flex flex-col">
      <span className="block text-[13px] font-semibold text-ink mb-0.5">{label}</span>
      {hint && <span className="block text-[11.5px] text-ink-muted mb-2">{hint}</span>}
      <div className="mt-auto">{children}</div>
    </label>
  );
}
