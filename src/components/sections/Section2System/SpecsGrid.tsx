import { useCalculator } from "@/state/CalculatorContext";
import { NumberInput } from "@/components/inputs/NumberInput";
import { formatKwh } from "@/lib/format";
import { ORIENTATION_LABEL, ORIENTATIONS, type Orientation } from "@/lib/solar";

export function SpecsGrid() {
  const {
    inputs,
    setInput,
    setPanelsForOrientation,
    setTiltForOrientation,
    system,
  } = useCalculator();

  return (
    <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5">
      {/* LEFT: panel + orientation inputs */}
      <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Panels & orientation
        </h4>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Field label="Total panels" hint="Sum of every roof orientation">
            <div className="flex items-center justify-center rounded-lg bg-surface-sunken border border-line px-3 py-2.5 text-base font-bold tabular-nums text-ink">
              {system.totalPanels}
            </div>
          </Field>
          <Field label="Panel wattage" hint="Watts per panel (e.g. 440W)">
            <NumberInput
              value={inputs.panelWatt}
              onChange={(n) => setInput("panelWatt", n)}
              suffix="W"
              ariaLabel="Panel wattage"
            />
          </Field>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Field label="System size" hint="Auto: panels × wattage / 1000">
            <div className="flex items-center justify-center rounded-lg bg-surface-sunken border border-line px-3 py-2.5 text-base font-bold tabular-nums text-ink">
              {system.systemSizeKw.toFixed(2)} kW
            </div>
          </Field>
          <Field label="Shading derate" hint="Trees, chimneys, neighbour blocks, etc.">
            <NumberInput
              value={Math.round(inputs.shadingDeratePct * 100)}
              onChange={(n) => setInput("shadingDeratePct", Math.max(0, Math.min(100, n)) / 100)}
              suffix="%"
              ariaLabel="Shading derate"
            />
          </Field>
        </div>

        <div className="mt-7">
          <div className="grid grid-cols-[1fr_minmax(80px,90px)_minmax(80px,90px)] gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle pb-2 border-b border-line/70">
            <span>Orientation</span>
            <span className="text-center">Tilt</span>
            <span className="text-center">Panels</span>
          </div>

          <div className="divide-y divide-line/60">
            {ORIENTATIONS.map((o) => (
              <OrientationRow
                key={o}
                orientation={o}
                panels={inputs.panelsByOrientation[o] || 0}
                tilt={inputs.tiltByOrientation[o] ?? 30}
                onPanelsChange={(n) => setPanelsForOrientation(o, n)}
                onTiltChange={(n) => setTiltForOrientation(o, n)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: usage + rates + derived outputs */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Daily usage & self-use
          </h4>
          <div className="mt-5 grid grid-cols-2 gap-5">
            <Field label="Daily usage" hint="What the home consumes per day">
              <NumberInput
                value={inputs.dailyUsage}
                onChange={(n) => setInput("dailyUsage", n)}
                suffix="kWh"
                ariaLabel="Daily usage"
              />
            </Field>
            <Field label="Self-use" hint="Daily kWh covered by solar (incl. battery)">
              <NumberInput
                value={inputs.selfUseKwh}
                onChange={(n) => setInput("selfUseKwh", n)}
                suffix="kWh"
                ariaLabel="Self-use"
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-card">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Rates
          </h4>
          <div className="mt-5 grid grid-cols-2 gap-5">
            <Field label="Average rate" hint="Average electricity rate ($/kWh)">
              <NumberInput
                value={inputs.peakRate}
                onChange={(n) => setInput("peakRate", n)}
                prefix="$"
                decimals={2}
                step={0.01}
                ariaLabel="Average rate"
              />
            </Field>
            <Field label="Feed-in tariff" hint="$/kWh credited for export">
              <NumberInput
                value={inputs.fitRate}
                onChange={(n) => setInput("fitRate", n)}
                prefix="$"
                decimals={2}
                step={0.01}
                ariaLabel="Feed-in tariff"
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-ink text-white p-6 md:p-7">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            Calculated production
          </h4>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
            <Stat label="Daily production" value={formatKwh(system.dailyProductionKwh)} />
            <Stat label="Annual production" value={formatKwh(system.annualProductionKwh)} />
            <Stat label="Weighted derate" value={`${Math.round(system.weightedDeratePct * 100)}%`} />
            <Stat
              label="Solar coverage"
              value={`${Math.round(system.solarCoveragePct)}%`}
              accent
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrientationRow({
  orientation,
  panels,
  tilt,
  onPanelsChange,
  onTiltChange,
}: {
  orientation: Orientation;
  panels: number;
  tilt: number;
  onPanelsChange: (n: number) => void;
  onTiltChange: (n: number) => void;
}) {
  const active = panels > 0;
  return (
    <div className="grid grid-cols-[1fr_minmax(80px,90px)_minmax(80px,90px)] gap-x-3 items-center py-2.5">
      <div className="flex items-center gap-2.5">
        <DirIcon orientation={orientation} active={active} />
        <span className={"text-[14px] " + (active ? "text-ink font-semibold" : "text-ink-muted")}>
          {ORIENTATION_LABEL[orientation]}
        </span>
      </div>
      <NumberInput
        value={tilt}
        onChange={onTiltChange}
        suffix="°"
        size="sm"
        ariaLabel={`${ORIENTATION_LABEL[orientation]} tilt`}
        min={0}
        max={60}
      />
      <NumberInput
        value={panels}
        onChange={onPanelsChange}
        size="sm"
        ariaLabel={`${ORIENTATION_LABEL[orientation]} panels`}
        min={0}
      />
    </div>
  );
}

const ORIENTATION_DEG: Record<Orientation, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
};

function DirIcon({ orientation, active }: { orientation: Orientation; active: boolean }) {
  const deg = ORIENTATION_DEG[orientation];
  return (
    <span
      className={
        "inline-flex h-7 w-7 items-center justify-center rounded-full border " +
        (active
          ? "border-ink bg-ink text-white"
          : "border-line bg-surface-sunken text-ink-muted")
      }
      aria-hidden
    >
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: `rotate(${deg}deg)` }}>
        <path d="M6 1.5 L9 7 L6 5.5 L3 7 Z" fill="currentColor" />
      </svg>
    </span>
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
    <label className="block">
      <span className="block text-[13px] font-semibold text-ink mb-0.5">{label}</span>
      {hint && <span className="block text-[11.5px] text-ink-muted mb-2">{hint}</span>}
      {children}
    </label>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
        {label}
      </div>
      <div
        className={
          "mt-1 text-2xl font-bold tracking-tight tabular-nums " +
          (accent ? "text-gain" : "text-white")
        }
      >
        {value}
      </div>
    </div>
  );
}
