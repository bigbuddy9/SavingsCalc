import { describe, expect, it } from "vitest";
import { calculateLoanPayment } from "@/hooks/useCashflowCalc";
import { calculateSolarProduction, derateFor } from "@/lib/solar";
import { isValidPostcodeFormat, lookupLocation } from "@/lib/location";
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
  // 100 panels × 440W = 44 kW. Validates against Resinc's published outputs.
  function dailyKwhFor(orientation: "N" | "NE" | "E" | "SE" | "S", tiltDeg = 30) {
    const panelsBy = { N: 0, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 } as const;
    const tilts = { N: 30, NE: 30, E: 30, SE: 30, S: 30, SW: 30, W: 30, NW: 30 };
    tilts[orientation] = tiltDeg;
    const result = calculateSolarProduction({
      panelsByOrientation: { ...panelsBy, [orientation]: 100 },
      tiltByOrientation: { ...tilts },
      panelWattage: 440,
      shadingDeratePct: 0,
    });
    return Math.round(result.dailyProductionKwh);
  }

  // North — full curve validated across 6 datapoints
  it("matches Resinc N at  0° (168 kWh/day)", () => expect(dailyKwhFor("N", 0)).toBe(168));
  it("matches Resinc N at 10° (180 kWh/day)", () => expect(dailyKwhFor("N", 10)).toBe(180));
  it("matches Resinc N at 20° (188 kWh/day)", () => expect(dailyKwhFor("N", 20)).toBe(188));
  it("matches Resinc N at 30° (191 kWh/day)", () => expect(dailyKwhFor("N", 30)).toBe(191));
  it("matches Resinc N at 40° (186 kWh/day)", () => expect(dailyKwhFor("N", 40)).toBe(186));
  it("matches Resinc N at 50° (177 kWh/day)", () => expect(dailyKwhFor("N", 50)).toBe(177));

  // South — full curve validated across 5 datapoints (10°-50°), plus 0° rule
  it("matches Resinc S at 10° (157 kWh/day)", () => expect(dailyKwhFor("S", 10)).toBe(157));
  it("matches Resinc S at 20° (141 kWh/day)", () => expect(dailyKwhFor("S", 20)).toBe(141));
  it("matches Resinc S at 30° (121 kWh/day)", () => expect(dailyKwhFor("S", 30)).toBe(121));
  it("matches Resinc S at 40° ( 99 kWh/day)", () => expect(dailyKwhFor("S", 40)).toBe(99));
  it("matches Resinc S at 50° ( 81 kWh/day)", () => expect(dailyKwhFor("S", 50)).toBe(81));

  // East — full curve validated across 5 datapoints (10°-50°), plus 0° rule
  it("matches Resinc E at 10° (171 kWh/day)", () => expect(dailyKwhFor("E", 10)).toBe(171));
  it("matches Resinc E at 20° (166 kWh/day)", () => expect(dailyKwhFor("E", 20)).toBe(166));
  it("matches Resinc E at 30° (162 kWh/day)", () => expect(dailyKwhFor("E", 30)).toBe(162));
  it("matches Resinc E at 40° (153 kWh/day)", () => expect(dailyKwhFor("E", 40)).toBe(153));
  it("matches Resinc E at 50° (144 kWh/day)", () => expect(dailyKwhFor("E", 50)).toBe(144));

  // NE — full curve validated across 5 datapoints (10°-50°), plus 0° rule
  it("matches Resinc NE at 10° (180 kWh/day)", () => expect(dailyKwhFor("NE", 10)).toBe(180));
  it("matches Resinc NE at 20° (184 kWh/day)", () => expect(dailyKwhFor("NE", 20)).toBe(184));
  it("matches Resinc NE at 30° (184 kWh/day)", () => expect(dailyKwhFor("NE", 30)).toBe(184));
  it("matches Resinc NE at 40° (180 kWh/day)", () => expect(dailyKwhFor("NE", 40)).toBe(180));
  it("matches Resinc NE at 50° (173 kWh/day)", () => expect(dailyKwhFor("NE", 50)).toBe(173));

  // SE — full curve validated across 5 datapoints (10°-50°), plus 0° rule
  it("matches Resinc SE at 10° (162 kWh/day)", () => expect(dailyKwhFor("SE", 10)).toBe(162));
  it("matches Resinc SE at 20° (150 kWh/day)", () => expect(dailyKwhFor("SE", 20)).toBe(150));
  it("matches Resinc SE at 30° (137 kWh/day)", () => expect(dailyKwhFor("SE", 30)).toBe(137));
  it("matches Resinc SE at 40° (123 kWh/day)", () => expect(dailyKwhFor("SE", 40)).toBe(123));
  it("matches Resinc SE at 50° (108 kWh/day)", () => expect(dailyKwhFor("SE", 50)).toBe(108));

  it("preserves the published 30° derates exactly", () => {
    expect(derateFor("N", 30)).toBeCloseTo(0.15, 5);
    expect(derateFor("NE", 30)).toBeCloseTo(0.18, 5);
    expect(derateFor("E", 30)).toBeCloseTo(0.28, 5);
    expect(derateFor("SE", 30)).toBeCloseTo(0.39, 5);
    expect(derateFor("S", 30)).toBeCloseTo(0.46, 5);
  });

  it("0° tilt = 25% derate for N/NE/E/SE/S (flat-panel rule)", () => {
    for (const o of ["N", "NE", "E", "SE", "S"] as const) {
      expect(derateFor(o, 0)).toBeCloseTo(0.25, 5);
    }
  });

  it("Resinc W/NW/SW flat curves — derate is constant across all tilts", () => {
    // Western orientations: tilt-independent in Resinc. Anchored at 30°.
    for (const tilt of [0, 10, 20, 30, 40, 50]) {
      expect(derateFor("W", tilt)).toBeCloseTo(0.30, 5);
      expect(derateFor("NW", tilt)).toBeCloseTo(0.19, 5);
      expect(derateFor("SW", tilt)).toBeCloseTo(0.40, 5);
    }
  });

  it("south at 0° tilt is better than south at 30° tilt", () => {
    expect(derateFor("S", 0)).toBeLessThan(derateFor("S", 30));
  });

  it("north at 30° tilt is better than north at 0° tilt", () => {
    expect(derateFor("N", 30)).toBeLessThan(derateFor("N", 0));
  });
});

describe("Hemisphere flip", () => {
  // In the northern hemisphere the sun is in the southern sky, so picking
  // "South" should produce identical numbers to picking "North" in the south.
  it("S-facing in N hemisphere = N-facing in S hemisphere (every tilt)", () => {
    for (const tilt of [0, 10, 20, 30, 40, 50]) {
      expect(derateFor("S", tilt, "N")).toBeCloseTo(derateFor("N", tilt, "S"), 5);
    }
  });

  it("SE-facing in N hemisphere = NE-facing in S hemisphere", () => {
    for (const tilt of [0, 10, 20, 30, 40, 50]) {
      expect(derateFor("SE", tilt, "N")).toBeCloseTo(derateFor("NE", tilt, "S"), 5);
    }
  });

  it("E and W are unchanged across hemispheres (symmetrical about N-S axis)", () => {
    for (const tilt of [10, 30, 50]) {
      expect(derateFor("E", tilt, "N")).toBeCloseTo(derateFor("E", tilt, "S"), 5);
      expect(derateFor("W", tilt, "N")).toBeCloseTo(derateFor("W", tilt, "S"), 5);
    }
  });
});

describe("Location lookup", () => {
  it("resolves Brisbane (4155) to QLD with 5.1 sun-hours", () => {
    const r = lookupLocation("AU", "4155");
    expect(r).not.toBeNull();
    expect(r?.city).toBe("Brisbane");
    expect(r?.state).toBe("QLD");
    expect(r?.hemisphere).toBe("S");
    expect(r?.peakSunHours).toBe(5.1);
  });

  it("resolves Beverly Hills (90210) to LA with N-hemisphere", () => {
    const r = lookupLocation("US", "90210");
    expect(r).not.toBeNull();
    expect(r?.city).toBe("Los Angeles");
    expect(r?.hemisphere).toBe("N");
    expect(r?.peakSunHours).toBeGreaterThan(5);
  });

  it("rejects wrong-format postcodes (4-digit US, 5-digit Aus)", () => {
    expect(isValidPostcodeFormat("US", "4155")).toBe(false);
    expect(isValidPostcodeFormat("AU", "90210")).toBe(false);
    expect(isValidPostcodeFormat("AU", "4155")).toBe(true);
    expect(isValidPostcodeFormat("US", "90210")).toBe(true);
  });

  it("rejects non-numeric postcodes", () => {
    expect(isValidPostcodeFormat("AU", "abcd")).toBe(false);
    expect(isValidPostcodeFormat("US", "9021a")).toBe(false);
  });
});

describe("Production scales with peak sun hours", () => {
  // Brisbane (5.1) → Phoenix (6.5) should produce ~27% more on the same array.
  it("100×440W panels at N/30° produce more in higher-irradiance regions", () => {
    const panelsBy = { N: 100, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 };
    const tilts = { N: 30, NE: 30, E: 30, SE: 30, S: 30, SW: 30, W: 30, NW: 30 };
    const brisbane = calculateSolarProduction({
      panelsByOrientation: panelsBy,
      tiltByOrientation: tilts,
      panelWattage: 440,
      shadingDeratePct: 0,
      peakSunHours: 5.1,
      hemisphere: "S",
    });
    const phoenix = calculateSolarProduction({
      panelsByOrientation: { ...panelsBy, N: 0, S: 100 }, // S-facing in N hemi = optimal
      tiltByOrientation: tilts,
      panelWattage: 440,
      shadingDeratePct: 0,
      peakSunHours: 6.5,
      hemisphere: "N",
    });
    // Phoenix should be ~6.5/5.1 = 27% more, since both pick their optimal orientation.
    expect(phoenix.dailyProductionKwh / brisbane.dailyProductionKwh).toBeCloseTo(6.5 / 5.1, 2);
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
