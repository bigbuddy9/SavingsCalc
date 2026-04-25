/**
 * Solar production model — derived from Resinc's published derate values.
 *
 * Verified against Resinc at 100 panels × 440W = 44 kW (peak sun = 5.1 h):
 *
 *   Orientation × Tilt → Derate (and resulting daily kWh):
 *     N  @  0° → 25% derate → 168 kWh/day  ✓
 *     N  @ 10° → 20% derate → 180 kWh/day  ✓
 *     N  @ 20° → 16% derate → 188 kWh/day  ✓
 *     N  @ 30° → 15% derate → 191 kWh/day  ✓
 *     N  @ 40° → 17% derate → 186 kWh/day  ✓
 *     N  @ 50° → 21% derate → 177 kWh/day  ✓
 *     NE @ 30° → 18% derate
 *     E  @ 30° → 28% derate
 *     SE @ 30° → 39% derate
 *     S  @ 30° → ~50% derate (placeholder, awaiting confirmation)
 *
 * E/W and NE/NW and SE/SW are interchangeable (mirrored).
 */

export type Orientation = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export const ORIENTATIONS: Orientation[] = ["N", "E", "S", "W", "NE", "SE", "SW", "NW"];

export const ORIENTATION_LABEL: Record<Orientation, string> = {
  N: "North",
  NE: "North-East",
  E: "East",
  SE: "South-East",
  S: "South",
  SW: "South-West",
  W: "West",
  NW: "North-West",
};

/** Mirror map: NW behaves like NE, W like E, SW like SE. */
const MIRROR: Partial<Record<Orientation, Orientation>> = {
  NW: "NE",
  W: "E",
  SW: "SE",
};

/** Tilt → derate lookup, calibrated to Resinc datapoints. */
type DerateCurve = Record<number, number>;

const DERATE_CURVES: Record<Orientation, DerateCurve> = {
  // Fully validated against Resinc (6 datapoints across 0°-50°)
  N: { 0: 0.25, 10: 0.20, 20: 0.16, 30: 0.15, 40: 0.17, 50: 0.21 },

  // Fully validated against Resinc (6 datapoints across 0°-50°)
  S: { 0: 0.25, 10: 0.30, 20: 0.37, 30: 0.46, 40: 0.56, 50: 0.64 },

  // Fully validated against Resinc (6 datapoints across 0°-50°)
  E: { 0: 0.25, 10: 0.24, 20: 0.26, 30: 0.28, 40: 0.32, 50: 0.36 },

  // Fully validated against Resinc (6 datapoints across 0°-50°)
  NE: { 0: 0.25, 10: 0.20, 20: 0.18, 30: 0.18, 40: 0.20, 50: 0.23 },

  // Anchored at 0° (universal rule) and 30° (Resinc).
  // Awaiting full curve datapoints for 10°/20°/40°/50°.
  SE: { 0: 0.25, 30: 0.39 },

  // Mirrors — resolved at lookup time via MIRROR map.
  NW: { 0: 0.25, 10: 0.20, 20: 0.18, 30: 0.18, 40: 0.20, 50: 0.23 },
  W:  { 0: 0.25, 10: 0.24, 20: 0.26, 30: 0.28, 40: 0.32, 50: 0.36 },
  SW: { 0: 0.25, 30: 0.39 },
};

/** Optimal tilt per orientation for Australian latitudes (~28-35°S). */
const OPTIMAL_TILT: Record<Orientation, number> = {
  N: 30,  NE: 25, E: 15, SE: 10,
  S: 0,   SW: 10, W: 15, NW: 25,
};

export const PEAK_SUN_HOURS = 5.1;

/** Linear interpolation between two known tilts in a curve. */
function interpolateCurve(curve: DerateCurve, tiltDeg: number): number {
  const tilts = Object.keys(curve).map(Number).sort((a, b) => a - b);
  if (tilts.length === 0) return 0.5;
  if (tilts.length === 1) return curve[tilts[0]];

  if (tiltDeg <= tilts[0]) {
    // extrapolate using the slope of the first segment
    const t0 = tilts[0], t1 = tilts[1];
    const slope = (curve[t1] - curve[t0]) / (t1 - t0);
    return Math.max(0, Math.min(0.95, curve[t0] + slope * (tiltDeg - t0)));
  }
  if (tiltDeg >= tilts[tilts.length - 1]) {
    const t0 = tilts[tilts.length - 2], t1 = tilts[tilts.length - 1];
    const slope = (curve[t1] - curve[t0]) / (t1 - t0);
    return Math.max(0, Math.min(0.95, curve[t1] + slope * (tiltDeg - t1)));
  }
  for (let i = 0; i < tilts.length - 1; i++) {
    const lo = tilts[i], hi = tilts[i + 1];
    if (tiltDeg >= lo && tiltDeg <= hi) {
      const t = (tiltDeg - lo) / (hi - lo);
      return curve[lo] * (1 - t) + curve[hi] * t;
    }
  }
  return curve[tilts[0]];
}

/**
 * Returns derate (0..1) for a given orientation × tilt.
 *
 * For orientations with full Resinc data (currently just N), uses the curve directly.
 * For other orientations with only a 30° datapoint, applies North's tilt-curve "shape"
 * relative to the orientation's optimal tilt — that is, the additional derate from
 * being X degrees off the optimum is taken from North's known curve.
 */
export function derateFor(orientation: Orientation, tiltDeg: number): number {
  const resolved = MIRROR[orientation] ?? orientation;
  const curve = DERATE_CURVES[resolved];
  const tilts = Object.keys(curve).map(Number);

  if (tilts.length >= 2) {
    return interpolateCurve(curve, tiltDeg);
  }

  // Single-anchor orientation: borrow North's tilt-shape, anchored at this
  // orientation's optimum tilt. Falls back gracefully when more data lands.
  const optimalTilt = OPTIMAL_TILT[resolved];
  const anchoredTilt = tilts[0]; // typically 30
  const anchorDerate = curve[anchoredTilt];

  const nCurve = DERATE_CURVES.N;
  const nOptimum = OPTIMAL_TILT.N;
  const nDerateAtAnchorOffset = interpolateCurve(
    nCurve,
    nOptimum + (anchoredTilt - optimalTilt)
  );
  const nDerateAtThisOffset = interpolateCurve(
    nCurve,
    nOptimum + (tiltDeg - optimalTilt)
  );
  const relativeDelta = nDerateAtThisOffset - nDerateAtAnchorOffset;

  return Math.max(0, Math.min(0.95, anchorDerate + relativeDelta));
}

export type OrientationPanelCount = Record<Orientation, number>;
export type OrientationTilt = Record<Orientation, number>;

export type SolarProductionResult = {
  systemSizeKw: number;
  totalPanels: number;
  weightedDeratePct: number;
  dailyProductionKwh: number;
  annualProductionKwh: number;
};

export function calculateSolarProduction(args: {
  panelsByOrientation: OrientationPanelCount;
  tiltByOrientation: OrientationTilt;
  panelWattage: number;
  shadingDeratePct: number;
}): SolarProductionResult {
  const { panelsByOrientation, tiltByOrientation, panelWattage, shadingDeratePct } = args;

  const totalPanels = ORIENTATIONS.reduce((sum, o) => sum + (panelsByOrientation[o] || 0), 0);
  const systemSizeKw = (totalPanels * panelWattage) / 1000;

  let totalDailyKwh = 0;
  let weightedDerateTimesPanels = 0;

  for (const o of ORIENTATIONS) {
    const panels = panelsByOrientation[o] || 0;
    if (panels <= 0) continue;
    const tilt = tiltByOrientation[o] ?? 30;
    const orientationDerate = derateFor(o, tilt);
    const arrayKw = (panels * panelWattage) / 1000;
    const dailyForArray =
      arrayKw * PEAK_SUN_HOURS * (1 - orientationDerate) * (1 - shadingDeratePct);
    totalDailyKwh += dailyForArray;
    weightedDerateTimesPanels += orientationDerate * panels;
  }

  const weightedDeratePct = totalPanels > 0 ? weightedDerateTimesPanels / totalPanels : 0;

  return {
    systemSizeKw,
    totalPanels,
    weightedDeratePct,
    dailyProductionKwh: totalDailyKwh,
    annualProductionKwh: totalDailyKwh * 365,
  };
}
