import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCalculator } from "@/state/CalculatorContext";
import type { CashflowYearRow } from "@/hooks/useCashflowCalc";

export function SavingsChart({ years }: { years: CashflowYearRow[] }) {
  const { formatMoney, inputs, cashflow } = useCalculator();
  const loanTerm = cashflow.hasLoan ? Math.floor(inputs.loanTerm) : 0;

  // Stop the green payments area at the end of the loan term — once the loan
  // is paid off, the area would otherwise sit flat across the rest of the
  // chart, which is misleading (suggests ongoing repayments) and visually
  // noisy. Setting payments to null past loanTerm makes Recharts not render
  // the area beyond that x-coord.
  const data = years.map((y) => ({
    year: y.year,
    savings: Math.round(y.cumSavings),
    payments: loanTerm > 0 && y.year <= loanTerm ? Math.round(y.cumPayments) : null,
  }));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-7 shadow-card">
      <div className="h-[420px] w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.18} />
              </linearGradient>
              <linearGradient id="paymentsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F0EE" vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#525252", fontSize: 12 }}
              tickFormatter={(v: number) => `Y${v}`}
              dy={6}
              interval={1}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#737373", fontSize: 12 }}
              tickFormatter={(v: number) => `$${Math.round(v / 1000)}K`}
              width={64}
            />
            <Tooltip
              cursor={{ stroke: "#A3A3A3", strokeDasharray: "4 4" }}
              contentStyle={{
                background: "#0A0A0A",
                border: "none",
                borderRadius: 10,
                color: "white",
                fontSize: 13,
                padding: "10px 12px",
                boxShadow: "0 8px 24px rgba(10,10,10,0.18)",
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
              labelFormatter={(label) => `Year ${label}`}
              formatter={(value, name) => [formatMoney(Number(value)), name as string]}
            />
            <Area
              type="monotone"
              dataKey="savings"
              name="Total solar savings"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#savingsFill)"
              isAnimationActive
              animationDuration={900}
            />
            <Area
              type="monotone"
              dataKey="payments"
              name="All finance payments"
              stroke="#059669"
              strokeWidth={2.5}
              fill="url(#paymentsFill)"
              connectNulls={false}
              isAnimationActive
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-muted">
        <Legend swatch="bg-accent" label="Total solar savings" />
        <Legend swatch="bg-gain" label="All finance payments" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${swatch}`} />
      <span>{label}</span>
    </span>
  );
}
