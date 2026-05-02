import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCalculator } from "@/state/CalculatorContext";
import { theme } from "@/config/theme";

export function FinalComparison() {
  const { realCost, cashflow, formatMoneyK, formatMoneyKUnsigned } = useCalculator();
  const copy = theme.copy.final;

  // Two diverging lines from $0 — bills you'd pay vs savings you'd keep.
  //   Without solar: −cumulative power bills (red, dives below zero).
  //   With solar:    +cumulative solar savings (green, climbs above zero).
  // The vertical span between them is the total contrast solar creates.
  const data = realCost.years.map((rc, i) => {
    const cf = cashflow.years[i];
    const withoutSolar = -rc.cumulativeBill;
    const withSolar = cf?.cumSavings ?? 0;
    return {
      year: rc.year,
      withoutSolar: Math.round(withoutSolar),
      withSolar: Math.round(withSolar),
      gap: Math.round(withSolar - withoutSolar),
    };
  });

  const without = -realCost.twentyFiveYearPower;
  const withSolar = cashflow.cumSavings25;
  const swing = cashflow.cumSavings25;

  return (
    <section className="container-narrow">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-[#141414] to-[#1f1f1f] text-white p-8 md:p-12">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            The bottom line
          </p>
          <h2 className="mt-3 text-h2 font-bold tracking-tighter">{copy.title}</h2>

          {/* Hero swing — the headline number. */}
          <div className="mt-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-7 md:p-8 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              {copy.swingLabel}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-5xl md:text-7xl font-bold tracking-tightest text-accent tabular-nums">
                {formatMoneyKUnsigned(swing)}
              </span>
              <span className="text-[15px] text-white/70 italic">{copy.swingDesc}</span>
            </div>
          </div>

          {/* Comparison chart — visualises the divergence year over year. */}
          <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 md:p-7 backdrop-blur-sm">
            <h3 className="text-[14px] md:text-[15px] font-semibold text-white/85">
              25-year contrast: bills vs savings
            </h3>
            <p className="mt-1 text-[12.5px] text-white/55">
              Red below zero: every dollar you'd hand the utility. Green above zero: every dollar solar puts back in your pocket. The shaded area between them is your lifetime contrast.
            </p>
            <div className="mt-4 h-[320px] w-full">
              <ResponsiveContainer>
                <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                  <defs>
                    <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                    tickFormatter={(v: number) => `Y${v}`}
                    interval={1}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                    tickFormatter={(v: number) => formatMoneyK(v)}
                    width={72}
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.3)", strokeDasharray: "4 4" }}
                    contentStyle={{
                      background: "#0A0A0A",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      color: "white",
                      fontSize: 13,
                      padding: "10px 12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 6,
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                    formatter={(value, name) => [formatMoneyK(Number(value)), name as string]}
                  />
                  {/* Amber-shaded gap from the without-solar line up to the
                      with-solar line. Stacked on top of withoutSolar so its
                      visible height = the actual gap between the two lines. */}
                  <Area
                    type="monotone"
                    dataKey="withoutSolar"
                    stackId="hidden"
                    stroke="transparent"
                    fill="transparent"
                    isAnimationActive={false}
                    legendType="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="gap"
                    name="Lifetime benefit"
                    stackId="hidden"
                    stroke="transparent"
                    fill="url(#gapFill)"
                    isAnimationActive
                    animationDuration={900}
                  />
                  <Line
                    type="monotone"
                    dataKey="withoutSolar"
                    name={copy.withoutLabel}
                    stroke="#F87171"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive
                    animationDuration={900}
                  />
                  <Line
                    type="monotone"
                    dataKey="withSolar"
                    name={copy.withLabel}
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive
                    animationDuration={900}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-white/65">
              <Legend color="#F87171" label={copy.withoutLabel} />
              <Legend color="#10B981" label={copy.withLabel} />
              <Legend color="#F59E0B" label="Lifetime benefit (the gap)" />
            </div>
          </div>

          {/* Year-25 endpoints summarised. */}
          <div className="mt-6 grid md:grid-cols-2 gap-4 md:gap-5">
            <Card label={copy.withoutLabel} value={formatMoneyK(without)} accent="pain" />
            <Card label={copy.withLabel} value={formatMoneyK(withSolar)} accent="gain" />
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -bottom-32 h-[360px] w-[360px] rounded-full bg-gain/10 blur-3xl"
        />
      </div>
    </section>
  );
}

function Card({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "pain" | "gain";
}) {
  const color = accent === "pain" ? "text-pain" : "text-gain";
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 md:p-7 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
        {label}
      </p>
      <div className={`mt-3 text-3xl md:text-4xl font-bold tracking-tighter tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}
