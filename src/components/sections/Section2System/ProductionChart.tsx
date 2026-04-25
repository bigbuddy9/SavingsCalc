import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SystemMonthRow } from "@/hooks/useSystemCalc";

export function ProductionChart({ data }: { data: SystemMonthRow[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-7 shadow-card">
      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="prodFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F0EE" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#525252", fontSize: 12, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#737373", fontSize: 12 }}
              tickFormatter={(v: number) => `${v} kWh`}
              width={64}
            />
            <Tooltip
              cursor={{ fill: "rgba(10,10,10,0.04)" }}
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
              itemStyle={{ color: "white" }}
              formatter={(value, name) => [`${value} kWh`, name as string]}
            />
            <Bar
              dataKey="production"
              name="Daily solar production"
              fill="url(#prodFill)"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              isAnimationActive
              animationDuration={800}
            />
            <Line
              type="linear"
              dataKey="usage"
              name="Your daily usage"
              stroke="#E11D48"
              strokeWidth={2.25}
              strokeDasharray="6 5"
              dot={false}
              isAnimationActive
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-muted">
        <Legend swatch="bg-gain" label="Daily solar production" />
        <Legend swatch="bg-pain" dashed label="Your daily usage" />
      </div>
    </div>
  );
}

function Legend({ swatch, label, dashed = false }: { swatch: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {dashed ? (
        <span className="inline-block h-[2px] w-5 border-t-2 border-dashed border-pain" />
      ) : (
        <span className={`inline-block h-2.5 w-2.5 rounded-sm ${swatch}`} />
      )}
      <span>{label}</span>
    </span>
  );
}
