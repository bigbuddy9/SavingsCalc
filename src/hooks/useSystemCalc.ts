import { useMemo } from "react";
import { MONTH_LABELS, MONTH_WEIGHTS } from "@/lib/constants";

export type SystemMonthRow = {
  month: string;
  production: number;
  usage: number;
};

export type SystemResult = {
  dailyProduction: number;
  monthly: SystemMonthRow[];
};

export function useSystemCalc(annualProduction: number, dailyUsage: number): SystemResult {
  return useMemo(() => {
    const dailyProduction = (Number.isFinite(annualProduction) ? annualProduction : 0) / 365;
    const usage = Number.isFinite(dailyUsage) ? dailyUsage : 0;

    const monthly: SystemMonthRow[] = MONTH_WEIGHTS.map((w, i) => ({
      month: MONTH_LABELS[i],
      production: +(dailyProduction * w).toFixed(1),
      usage,
    }));

    return { dailyProduction, monthly };
  }, [annualProduction, dailyUsage]);
}
