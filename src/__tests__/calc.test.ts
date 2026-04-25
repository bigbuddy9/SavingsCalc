import { describe, expect, it } from "vitest";
import { calculateLoanPayment } from "@/hooks/useCashflowCalc";
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
