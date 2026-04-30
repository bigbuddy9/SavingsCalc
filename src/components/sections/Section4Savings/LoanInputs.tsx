import { useCalculator } from "@/state/CalculatorContext";
import { NumberInput } from "@/components/inputs/NumberInput";
import { InfoTooltip } from "@/components/inputs/InfoTooltip";

export function LoanInputs() {
  const { inputs, setInput, currencySymbol } = useCalculator();
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        Finance terms
      </h4>
      <div className="mt-5 grid md:grid-cols-2 gap-x-8 gap-y-5">
        <Field
          label="Deposit"
          hint="Cash paid upfront — reduces the loan principal."
          tooltip="Amount the customer pays upfront in cash. The loan principal is calculated on the balance after this deposit."
        >
          <NumberInput
            value={inputs.deposit}
            onChange={(n) => setInput("deposit", Math.max(0, n))}
            prefix={currencySymbol}
            ariaLabel="Deposit"
          />
        </Field>
        <Field
          label="Setup fee"
          hint="One-off fee charged in year 1."
          tooltip="Establishment / origination fee charged once at the start of the loan. Skipped automatically if the customer pays cash."
        >
          <NumberInput
            value={inputs.setupFee}
            onChange={(n) => setInput("setupFee", Math.max(0, n))}
            prefix={currencySymbol}
            ariaLabel="Setup fee"
          />
        </Field>
        <Field
          label="Loan term"
          hint="Years to fully repay the loan."
          tooltip="Number of years over which the loan is amortised. Set to 0 for a cash purchase — annual payments and loan fees disappear from the cashflow."
        >
          <NumberInput
            value={inputs.loanTerm}
            onChange={(n) => setInput("loanTerm", n)}
            suffix="yrs"
            min={0}
            max={25}
            ariaLabel="Loan term in years"
          />
        </Field>
        <Field
          label="Monthly loan fee"
          hint="Ongoing monthly fee on the loan."
          tooltip="Recurring monthly account-keeping or service fee charged for the duration of the loan. Skipped automatically for cash purchases."
        >
          <NumberInput
            value={inputs.monthlyFee}
            onChange={(n) => setInput("monthlyFee", Math.max(0, n))}
            prefix={currencySymbol}
            decimals={2}
            step={0.01}
            ariaLabel="Monthly loan fee"
          />
        </Field>
        <Field
          label="Interest rate"
          hint="Annual percentage rate on the loan."
          tooltip="The annual interest rate (APR) on the loan. Standard amortisation: monthly compounding over the term."
        >
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
  tooltip,
  children,
}: {
  label: string;
  hint?: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col">
      <span className="flex items-center text-[13px] font-semibold text-ink mb-0.5">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      {hint && <span className="block text-[11.5px] text-ink-muted mb-2">{hint}</span>}
      <div className="mt-auto">{children}</div>
    </label>
  );
}
