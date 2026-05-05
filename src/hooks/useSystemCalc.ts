import { useMemo } from "react";
import { MONTH_LABELS, MONTH_WEIGHTS } from "@/lib/constants";
import {
  calculateSolarProduction,
  type Orientation,
  type OrientationPanelCount,
  type OrientationTilt,
} from "@/lib/solar";
import type { Hemisphere } from "@/lib/location";

export type SystemMonthRow = {
  month: string;
  production: number;
  usage: number;
};

export type SystemResult = {
  systemSizeKw: number;
  totalPanels: number;
  weightedDeratePct: number;
  dailyProductionKwh: number;
  annualProductionKwh: number;
  monthly: SystemMonthRow[];
  year1Savings: number;
  /** Year-1 savings split: bill offset from self-consumed solar.
   *  Inflates at electricity-price growth × panel degradation in later years. */
  year1SelfUseSavings: number;
  /** Year-1 savings split: feed-in earnings from exported solar.
   *  Stays FLAT in later years — Resinc convention; FIT does not inflate. */
  year1ExportEarnings: number;
  selfUseDailyKwh: number;
  excessExportDailyKwh: number;
  solarCoveragePct: number; // self-use / daily-usage × 100
};

export function useSystemCalc(args: {
  panelsByOrientation: OrientationPanelCount;
  tiltByOrientation: OrientationTilt;
  panelWattage: number;
  shadingDeratePct: number;   // 0..1
  dailyUsageKwh: number;
  selfUseKwh: number;
  peakRatePerKwh: number;
  fitRatePerKwh: number;
  peakSunHours: number;
  hemisphere: Hemisphere;
}): SystemResult {
  return useMemo(() => {
    const prod = calculateSolarProduction({
      panelsByOrientation: args.panelsByOrientation,
      tiltByOrientation: args.tiltByOrientation,
      panelWattage: args.panelWattage,
      shadingDeratePct: args.shadingDeratePct,
      peakSunHours: args.peakSunHours,
      hemisphere: args.hemisphere,
    });

    const monthly: SystemMonthRow[] = MONTH_WEIGHTS.map((w, i) => ({
      month: MONTH_LABELS[i],
      production: +(prod.dailyProductionKwh * w).toFixed(1),
      usage: args.dailyUsageKwh,
    }));

    const safeSelfUse = Math.max(0, args.selfUseKwh);
    const excessExportDaily = Math.max(0, prod.dailyProductionKwh - safeSelfUse);

    const gridOffsetSavings = safeSelfUse * 365 * args.peakRatePerKwh;
    const exportEarnings = excessExportDaily * 365 * args.fitRatePerKwh;
    const year1Savings = gridOffsetSavings + exportEarnings;

    const solarCoveragePct =
      args.dailyUsageKwh > 0 ? (safeSelfUse / args.dailyUsageKwh) * 100 : 0;

    return {
      ...prod,
      monthly,
      year1Savings,
      year1SelfUseSavings: gridOffsetSavings,
      year1ExportEarnings: exportEarnings,
      selfUseDailyKwh: safeSelfUse,
      excessExportDailyKwh: excessExportDaily,
      solarCoveragePct,
    };
  }, [
    args.panelsByOrientation,
    args.tiltByOrientation,
    args.panelWattage,
    args.shadingDeratePct,
    args.dailyUsageKwh,
    args.selfUseKwh,
    args.peakRatePerKwh,
    args.fitRatePerKwh,
    args.peakSunHours,
    args.hemisphere,
  ]);
}

export type { Orientation };
