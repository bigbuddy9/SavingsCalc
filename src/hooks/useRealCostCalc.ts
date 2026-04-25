import { useMemo } from "react";
import { PRICE_INCREASE } from "@/lib/constants";

export type CostYearRow = {
  year: number;
  annualCost: number;
  cumulativeBill: number;
  preTaxEarnings: number;
  cumulativeEarnings: number;
};

export type RealCostResult = {
  years: CostYearRow[];
  tenYearPower: number;
  tenYearEarnings: number;
  fifteenYearPower: number;
  fifteenYearEarnings: number;
  twentyFiveYearPower: number;
  twentyFiveYearEarnings: number;
  closingEarnings: number;
};

export function useRealCostCalc(annualBill: number, taxRatePercent: number): RealCostResult {
  return useMemo(() => {
    const baseBill = Number.isFinite(annualBill) ? annualBill : 0;
    const taxRate = Number.isFinite(taxRatePercent) ? taxRatePercent / 100 : 0;
    const taxMultiplier = taxRate >= 1 ? 1 : 1 / (1 - taxRate);

    const years: CostYearRow[] = [];
    let cumulativeBill = 0;
    let cumulativeEarnings = 0;

    for (let year = 1; year <= 25; year++) {
      const annualCost = baseBill * Math.pow(1 + PRICE_INCREASE, year - 1);
      const preTaxEarnings = annualCost * taxMultiplier;
      cumulativeBill += annualCost;
      cumulativeEarnings += preTaxEarnings;
      years.push({ year, annualCost, cumulativeBill, preTaxEarnings, cumulativeEarnings });
    }

    return {
      years,
      tenYearPower: years[9].cumulativeBill,
      tenYearEarnings: years[9].cumulativeEarnings,
      fifteenYearPower: years[14].cumulativeBill,
      fifteenYearEarnings: years[14].cumulativeEarnings,
      twentyFiveYearPower: years[24].cumulativeBill,
      twentyFiveYearEarnings: years[24].cumulativeEarnings,
      closingEarnings: years[24].cumulativeEarnings,
    };
  }, [annualBill, taxRatePercent]);
}
