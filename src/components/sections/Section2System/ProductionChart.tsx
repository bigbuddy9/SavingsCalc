import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SystemMonthRow } from "@/hooks/useSystemCalc";

const COVERED_FILL = "url(#prodFillCovered)";
const UNCOVERED_FILL = "url(#prodFillShort)";
const USAGE_LINE = "#EAB308"; // yellow-500

export function ProductionChart({ data }: { data: SystemMonthRow[] }) {
  const fullyCovered = data.length > 0 && data.every((m) => m.production >= m.usage);
  const shortMonths = data.filter((m) => m.production < m.usage).length;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-7 shadow-card">
      {fullyCovered ? <CoverageBanner tone="full" /> : <CoverageBanner tone="partial" shortMonths={shortMonths} />}

      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="prodFillCovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="prodFillShort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={0.85} />
              </linearGradient>
              <filter id="usageGlow" x="-30%" y="-50%" width="160%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
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
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              isAnimationActive
              animationDuration={800}
            >
              {data.map((m, i) => (
                <Cell
                  key={i}
                  fill={m.production >= m.usage ? COVERED_FILL : UNCOVERED_FILL}
                />
              ))}
            </Bar>
            <Line
              type="linear"
              dataKey="usage"
              name="Your daily usage"
              stroke={USAGE_LINE}
              strokeWidth={fullyCovered ? 3 : 2.25}
              strokeDasharray={fullyCovered ? undefined : "6 5"}
              strokeLinecap="round"
              filter={fullyCovered ? "url(#usageGlow)" : undefined}
              dot={false}
              isAnimationActive
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-muted">
        <Legend swatchClass="bg-gain" label="Covers your usage" />
        <Legend swatchClass="bg-accent" label="Falls short" />
        <Legend lineColor={USAGE_LINE} dashed={!fullyCovered} label="Your daily usage" />
      </div>
    </div>
  );
}

function CoverageBanner({
  tone,
  shortMonths,
}: {
  tone: "full" | "partial";
  shortMonths?: number;
}) {
  if (tone === "full") {
    return (
      <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-gain/10 border border-gain/30 px-4 py-2.5">
        <span className="inline-block h-2 w-2 rounded-full bg-gain shadow-[0_0_8px_2px_rgba(5,150,105,0.5)]" />
        <span className="text-[13.5px] font-semibold text-gain-ink">
          Your solar covers your usage every month of the year.
        </span>
      </div>
    );
  }
  return (
    <div className="mb-4 text-[13px] text-ink-muted">
      <span className="font-semibold text-ink">{shortMonths}</span>{" "}
      {shortMonths === 1 ? "month" : "months"} fall short of your daily usage — the rest is covered by solar.
    </div>
  );
}

function Legend({
  swatchClass,
  lineColor,
  label,
  dashed = false,
}: {
  swatchClass?: string;
  lineColor?: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {lineColor ? (
        <span
          className="inline-block h-[2px] w-5"
          style={{
            borderTop: `${dashed ? "2px dashed" : "2px solid"} ${lineColor}`,
          }}
        />
      ) : (
        <span className={`inline-block h-2.5 w-2.5 rounded-sm ${swatchClass}`} />
      )}
      <span>{label}</span>
    </span>
  );
}
