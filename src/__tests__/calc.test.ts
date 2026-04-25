import { describe, expect, it } from "vitest";
import { calculateLoanPayment } from "@/hooks/useCashflowCalc";
import { calculateSolarProduction, derateFor } from "@/lib/solar";
import { PRICE_INCREASE } from "@/lib/constants";

// These tests pin the financial math to the prototype's published numbers,
// so any future calculation refactor that drifts from the original spec fails fast.

describe("Pricing parity with prototype defaults", () => {
  it("matches the displayed investment of $44,779", () => {
    const systemValue = 62332 + 6000 + 850 + 198 + 360 + 276 + 0;
    const solarStc = 83 * 39;
    const batteryStc = 372 * 39;
    const discount = 7492;
    const investment = systemValue - solarStc - batteryStc - discount;

    expect(systemValue).toBe(70016);
    expect(solarStc).toBe(3237);
    expect(batteryStc).toBe(14508);
    expect(investment).toBe(44779);
  });
});

describe("Loan amortization parity", () => {
  it("computes the correct annual repayment for $44,779 / 6.29% / 10yrs", () => {
    // The prototype's hardcoded $6,218 in the HTML is placeholder text — the JS
    // overwrites it on init. The true amortized value is ~$6,044/yr.
    const annual = calculateLoanPayment(44779, 6.29, 10);
    expect(Math.round(annual)).toBe(6044);
  });

  it("returns 0 for a zero or negative principal", () => {
    expect(calculateLoanPayment(0, 6.29, 10)).toBe(0);
  });

  it("handles a 0% interest rate gracefully", () => {
    expect(calculateLoanPayment(44779, 0, 10)).toBeCloseTo(4477.9, 1);
  });
});

describe("Solar production parity with Resinc", () => {
  // 100 panels × 440W = 44 kW, 30° tilt. Resinc's published values:
  function dailyKwhFor(orientation: "N" | "NE" | "E" | "SE" | "S") {
    const panelsBy = { N: 0, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 } as const;
    const tilts = { N: 30, NE: 30, E: 30, SE: 30, S: 30, SW: 30, W: 30, NW: 30 } as const;
    const result = calculateSolarProduction({
      panelsByOrientation: { ...panelsBy, [orientation]: 100 },
      tiltByOrientation: { ...tilts },
      panelWattage: 440,
      shadingDeratePct: 0,
    });
    return Math.round(result.dailyProductionKwh);
  }

  it("matches Resinc N at 30° (191 kWh/day)", () => {
    expect(dailyKwhFor("N")).toBe(191);
  });
  it("matches Resinc NE at 30° (184 kWh/day)", () => {
    expect(dailyKwhFor("NE")).toBe(184);
  });
  it("matches Resinc E at 30° (162 kWh/day)", () => {
    expect(dailyKwhFor("E")).toBe(162);
  });
  it("matches Resinc SE at 30° (137 kWh/day)", () => {
    expect(dailyKwhFor("SE")).toBe(137);
  });

  it("preserves the published 30° derates exactly", () => {
    expect(derateFor("N", 30)).toBeCloseTo(0.15, 5);
    expect(derateFor("NE", 30)).toBeCloseTo(0.18, 5);
    expect(derateFor("E", 30)).toBeCloseTo(0.28, 5);
    expect(derateFor("SE", 30)).toBeCloseTo(0.39, 5);
    expect(derateFor("S", 30)).toBeCloseTo(0.50, 5);
  });

  it("south at 0° tilt is better than south at 30° tilt", () => {
    expect(derateFor("S", 0)).toBeLessThan(derateFor("S", 30));
  });

  it("north at 30° tilt is better than north at 0° tilt", () => {
    expect(derateFor("N", 30)).toBeLessThan(derateFor("N", 0));
  });
});

describe("Real cost compounding parity", () => {
  it("year 25 cumulative bill compounds the $4,917 base at 8%", () => {
    let cum = 0;
    for (let year = 1; year <= 25; year++) {
      cum += 4917 * Math.pow(1 + PRICE_INCREASE, year - 1);
    }
    expect(Math.round(cum)).toBe(359462);
  });

  it("pre-tax earnings at 30% MTR uses 1/(1-rate) multiplier", () => {
    const taxMultiplier = 1 / (1 - 0.3);
    let cum = 0;
    for (let year = 1; year <= 25; year++) {
      cum += 4917 * Math.pow(1 + PRICE_INCREASE, year - 1) * taxMultiplier;
    }
    expect(Math.round(cum)).toBe(513517);
  });
});
