/**
 * Solar production model derived from Resinc's published derate values.
 *
 * Verified against Resinc's tool at 30° tilt, 100 panels, 440W:
 *   System size: 44 kW
 *   Hardcoded peak sun hours: 5.1
 *
 *   N  (0°  azimuth) → 15% derate → 191 kWh/day  ✓
 *   NE (45° azimuth) → 18% derate → 184 kWh/day  ✓
 *   E  (90° azimuth) → 28% derate → 162 kWh/day  ✓
 *   SE (135° azimuth) → 39% derate → 137 kWh/day  ✓
 *   S  (180° azimuth) → ~50% derate (estimate, awaiting confirmation)
 *
 * E/W and NE/NW and SE/SW are interchangeable (mirrored).
 */

export type Orientation = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export const ORIENTATIONS: Orientation[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

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

/** Derate factor at the optimal tilt for that orientation. */
const DERATE_AT_OPTIMAL_TILT: Record<Orientation, number> = {
  N: 0.15,
  NE: 0.18,
  E: 0.28,
  SE: 0.39,
  S: 0.50,
  SW: 0.39,
  W: 0.28,
  NW: 0.18,
};

/** Optimal tilt per orientation for Australian latitudes (~28-35°S). */
const OPTIMAL_TILT: Record<Orientation, number> = {
  N: 30,
  NE: 25,
  E: 15,
  SE: 10,
  S: 0,
  SW: 10,
  W: 15,
  NW: 25,
};

/**
 * The user-supplied datapoints all use 30° tilt, so we calibrate so that
 * orientation_factor(O, 30°) returns the published Resinc derate exactly,
 * and tilts away from optimal lose ~0.4% per degree (capped at +15%).
 */
const TILT_PENALTY_PER_DEG = 0.004;
const MAX_EXTRA_DERATE = 0.15;

export const PEAK_SUN_HOURS = 5.1;

export function derateFor(orientation: Orientation, tiltDeg: number): number {
  const optimalTilt = OPTIMAL_TILT[orientation];
  const baseDerate = DERATE_AT_OPTIMAL_TILT[orientation];
  const tiltOffset = Math.abs(tiltDeg - optimalTilt);
  const extra = Math.min(tiltOffset * TILT_PENALTY_PER_DEG, MAX_EXTRA_DERATE);
  // The published 30° datapoints are calibrated so optimalTilt → exact derate
  // and 30° tilt for non-optimal orientations folds the small deviation in.
  // To preserve the 30° datapoints exactly:
  const calibration =
    Math.abs(30 - optimalTilt) * TILT_PENALTY_PER_DEG;
  return Math.max(0, Math.min(0.95, baseDerate + extra - calibration));
}

export type OrientationPanelCount = Record<Orientation, number>;

export type OrientationTilt = Record<Orientation, number>;

export type SolarProductionResult = {
  systemSizeKw: number;
  totalPanels: number;
  weightedDeratePct: number;        // 0..1
  dailyProductionKwh: number;
  annualProductionKwh: number;
};

export function calculateSolarProduction(args: {
  panelsByOrientation: OrientationPanelCount;
  tiltByOrientation: OrientationTilt;
  panelWattage: number;
  shadingDeratePct: number;       // 0..1
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
