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

const COVERED_FILL = "#059669";   // gain — flat green for months solar covers
const UNCOVERED_FILL = "#EAB308"; // yellow — months that fall short of usage
const USAGE_LINE = "#0A0A0A";     // ink — solid charcoal so it stays visible over both green and yellow bars

export function ProductionChart({ data }: { data: SystemMonthRow[] }) {
  const fullyCovered = data.length > 0 && data.every((m) => m.production >= m.usage);
  const shortMonths = data.filter((m) => m.production < m.usage).length;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-7 shadow-card">
      {fullyCovered ? (
        <CoverageBanner tone="full" />
      ) : (
        <CoverageBanner tone="partial" shortMonths={shortMonths} />
      )}

      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
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
            {/* Usage line: always solid charcoal, always visible — sits on top of
                both green and yellow bars regardless of whether production has
                cleared it. No conditional dash/glow tricks; just a clear reference. */}
            <Line
              type="linear"
              dataKey="usage"
              name="Your daily usage"
              stroke={USAGE_LINE}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              strokeLinecap="round"
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
        <Legend lineColor={USAGE_LINE} dashed label="Your daily usage" />
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
