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

const COVERED_FILL = "#059669";   // gain-DEFAULT — flat green for months solar covers
const UNCOVERED_FILL = "#EAB308"; // matches USAGE_LINE — months that fall short read as "the yellow line you can't reach"
const USAGE_LINE = "#EAB308";     // yellow-500

export function ProductionChart({
  data,
  cashflowPositiveDay1 = false,
}: {
  data: SystemMonthRow[];
  cashflowPositiveDay1?: boolean;
}) {
  const fullyCovered = data.length > 0 && data.every((m) => m.production >= m.usage);
  const shortMonths = data.filter((m) => m.production < m.usage).length;

  // Three banner states (in priority order):
  //   1. fully covered + cashflow positive day 1 → "$0 out of pocket"
  //   2. fully covered only                       → "covered every month"
  //   3. partial coverage                         → "X months fall short"
  let banner: React.ReactNode;
  if (fullyCovered && cashflowPositiveDay1) {
    banner = <CoverageBanner tone="day1" />;
  } else if (fullyCovered) {
    banner = <CoverageBanner tone="full" />;
  } else {
    banner = <CoverageBanner tone="partial" shortMonths={shortMonths} />;
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-7 shadow-card">
      {banner}

      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
            <defs>
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
              strokeWidth={fullyCovered ? 4 : 3.25}
              strokeDasharray={fullyCovered ? undefined : "7 5"}
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
        <Legend swatchColor={COVERED_FILL} label="Covers your usage" />
        <Legend swatchColor={UNCOVERED_FILL} label="Falls short" />
        <Legend lineColor={USAGE_LINE} dashed={!fullyCovered} label="Your daily usage" />
      </div>
    </div>
  );
}

function CoverageBanner({
  tone,
  shortMonths,
}: {
  tone: "full" | "partial" | "day1";
  shortMonths?: number;
}) {
  if (tone === "day1") {
    return (
      <div className="mb-4 rounded-lg bg-gain/10 border border-gain/30 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gain shadow-[0_0_10px_2px_rgba(5,150,105,0.55)]" />
          <span className="text-[14px] font-bold text-gain-ink">
            Cashflow positive from day one — this system costs you $0 out of pocket.
          </span>
        </div>
        <p className="mt-1 ml-5 text-[12.5px] text-ink-soft">
          Solar covers every month of usage and your year-1 savings already beat the loan repayments.
        </p>
      </div>
    );
  }
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
  swatchColor,
  lineColor,
  label,
  dashed = false,
}: {
  swatchColor?: string;
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
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: swatchColor }}
        />
      )}
      <span>{label}</span>
    </span>
  );
}
